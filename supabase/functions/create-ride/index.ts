import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Step 1: Parse request body
    const body = await req.json();

    const {
      passenger_id,
      pickup_address,
      pickup_latitude,
      pickup_longitude,
      destination_address,
      destination_latitude,
      destination_longitude,
      transport_type,
      motor_category,
      waypoints,
      payment_method,
      distance_km,
      estimated_duration_minutes,
      request_type,
      coupon_id,
      coupon_code,
      number_of_seats,
      pet

    } = body;

    // Step 2: Validate required fields
    if (!pickup_address || pickup_address.trim() === "") {
      return new Response(
        JSON.stringify({ success: false, error: "pickup_address is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Step 3: Normalize distance_km to a float (float8 in DB)
    const distanceKmNumber =
      distance_km === null || distance_km === undefined || distance_km === ""
        ? null
        : Number(distance_km);

    if (distanceKmNumber !== null && !Number.isFinite(distanceKmNumber)) {
      return new Response(
        JSON.stringify({ success: false, error: "distance_km must be a valid number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Step 4: Normalize transport_type by trimming whitespace
    const normalizedTransportType =
      typeof transport_type === "string" ? transport_type.trim() : transport_type;

    // Step 5: Initialize Supabase client with caller's auth token
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: req.headers.get("Authorization") || "",
          },
        },
      },
    );

    // Step 6: Query rider_profile for available drivers matching pickup location, transport type and motor category.
    // If number_of_seats is provided, join motor using an inner join and filter by motor.number_of_passengers.
    let query = supabase
      .from("rider_profile")
      .select(
        number_of_seats
          ? "user_id, transport_type, motor_category, current_address, is_available, motor!inner(number_of_passengers)"
          : "user_id, transport_type, motor_category, current_address, is_available",
      )
      .eq("current_address", pickup_address)
      .eq("is_available", true);

    if (transport_type && transport_type.trim() !== "") {
      query = query.eq("transport_type", transport_type.trim());
    }
    if (motor_category && motor_category.trim() !== "") {
      query = query.eq("motor_category", motor_category.trim());
    }
    if (number_of_seats) {
      query = query.eq("motor.number_of_passengers", number_of_seats)
    
    }

    const { data: drivers, error: driversError } = await query;



    
    // Step 7: Return error if driver query failed
    if (driversError) {
      return new Response(
        JSON.stringify({ success: false, error: driversError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Step 8: Return early if no drivers are available in the area
    if (!drivers || drivers.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No rider/driver available in this location",
          count: 0,
          data: [],
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Step 9: Fetch billing rates (cost_of_start, cost_of_km, cost_of_delay) from billing_metadata
    let cost_of_start: any = null;
    let cost_of_km: any = null;
    let cost_of_delay: any = null;

    const tag =
      typeof normalizedTransportType === "string"
        ? normalizedTransportType.trim()
        : normalizedTransportType;

    if (tag === "car" || tag === "motorcycle") {
      // Fetch cost of start
      const { data: cos, error: cosError } = await supabase
        .from("billing_metadata")
        .select("cost")
        .eq("tag", tag)
        .eq("item", "start")
        .maybeSingle();

      if (cosError) {
        return new Response(
          JSON.stringify({ success: false, error: `billing_metadata(start): ${cosError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      cost_of_start = cos;

      // Fetch cost per km
      const { data: cok, error: cokError } = await supabase
        .from("billing_metadata")
        .select("cost")
        .eq("tag", tag)
        .eq("item", "km")
        .maybeSingle();

      if (cokError) {
        return new Response(
          JSON.stringify({ success: false, error: `billing_metadata(km): ${cokError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      cost_of_km = cok;

      // Fetch cost of delay
      const { data: cod, error: codError } = await supabase
        .from("billing_metadata")
        .select("cost")
        .eq("tag", tag)
        .eq("item", "delay")
        .maybeSingle();

      if (codError) {
        return new Response(
          JSON.stringify({ success: false, error: `billing_metadata(delay): ${codError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      cost_of_delay = cod;
    }

    // Step 10: Calculate estimated fare = cost_of_start + (cost_of_km * distance_km)
    let estimatedFare: any = null;
    estimatedFare = (cost_of_start?.cost ?? 0) + (cost_of_km?.cost ?? 0) * (distanceKmNumber ?? 0);

    // Step 11: Validate coupon code if provided — must exist and be active
    let coupon: any = null;

    if (coupon_code) {
      const { data: couponData, error: couponError } = await supabase
        .from("coupon")
        .select("*")
        .eq("code", coupon_code)
        .eq("status", "active")
        .maybeSingle();

      if (couponError) {
        return new Response(
          JSON.stringify({ success: false, error: couponError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      coupon = couponData;

      // Block the ride if coupon code was supplied but is invalid or inactive
      if (!coupon) {
        return new Response(
          JSON.stringify({ success: false, error: "Coupon code is invalid or inactive" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // Step 12: Insert the ride record into the ride table
    const { data: rideData, error: rideError } = await supabase
      .from("ride")
      .insert({
        passenger_id,
        pickup_address,
        pickup_latitude,
        pickup_longitude,
        destination_address,
        destination_latitude,
        destination_longitude,
        transport_type: normalizedTransportType,
        motor_category,
        waypoints,
        payment_method,
        distance_km: distanceKmNumber,
        cost_of_start: cost_of_start?.cost ?? null,
        cost_of_km: cost_of_km?.cost ?? null,
        cost_of_delay: cost_of_delay?.cost ?? null,
        estimated_duration_minutes,
        estimated_fare: estimatedFare,
        request_type,
        coupon_id: coupon?.id ?? null,
        discount: coupon?.discount ?? null,
        number_of_seats,
        pet
      })
      .select()
      .maybeSingle();

    // Step 13: Return error if ride insert failed
    if (rideError) {
      return new Response(
        JSON.stringify({ success: false, error: rideError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Step 14: Guard against a missing ride ID after insert
    if (!rideData?.id) {
      return new Response(
        JSON.stringify({ success: false, error: "Ride was not created properly" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Step 15: Loop through available drivers and insert a ride_request for each
    const riderRequests = drivers.map((driver: any) => ({
      ride_id: rideData.id,
      driver_id: driver.user_id,
      passenger_id,
      motor_type: driver.motor_category ?? null,
      passenger_address: pickup_address,
      driver_address: driver.current_address ?? null,
      destination_address: rideData.destination_address ?? null,
      estimated_fare: estimatedFare,
      distance_km: distanceKmNumber,
      number_of_passengers: rideData.number_of_seats ?? null,
      pet: rideData.pet ?? null
    }));

    const { error: requestError } = await supabase
      .from("ride_request")
      .insert(riderRequests);

    // Step 16: Return error if ride_request bulk insert failed
    if (requestError) {
      return new Response(
        JSON.stringify({ success: false, error: requestError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }




    // Step 17: Return success response with ride and matched drivers
    return new Response(
      JSON.stringify({
        success: true,
        message: "Successfully",
        count: drivers.length,
        drivers,
        ride: rideData,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    // Catch-all for unexpected errors
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
