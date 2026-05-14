import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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
     
    
    } = body;

    if (!pickup_address || pickup_address.trim() === "") {
      return new Response(
        JSON.stringify({ success: false, error: "pickup_address is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // normalize distance_km (float8 in DB)
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

    // normalize transport_type
    const normalizedTransportType =
      typeof transport_type === "string" ? transport_type.trim() : transport_type;

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

    // 1) Find available riders/drivers
    let query = supabase
      .from("rider_profile")
      .select("user_id, transport_type, motor_category, current_address, is_available")
      .eq("current_address", pickup_address);

    query = query.eq("is_available", true);

    if (transport_type && transport_type.trim() !== "") {
      query = query.eq("transport_type", transport_type.trim());
    }
    if (motor_category && motor_category.trim() !== "") {
      query = query.eq("motor_category", motor_category.trim());
    }

    const { data: drivers, error: driversError } = await query;

    if (driversError) {
      return new Response(
        JSON.stringify({ success: false, error: driversError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

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

    // 1b) Fetch cost rates from billing_metadata
    let cost_of_start: any = null;
    let cost_of_km: any = null;
    let cost_of_delay: any = null;

    const tag =
      typeof normalizedTransportType === "string"
        ? normalizedTransportType.trim()
        : normalizedTransportType;

    if (tag === "car" || tag === "motorcycle") {
      const itemStart = "start".trim();
      const itemKm = "km".trim();
      const itemDelay = "delay".trim();

      // Fetch cost of start
      const { data: cos, error: cosError } = await supabase
        .from("billing_metadata")
        .select("cost")
        .eq("tag", tag)
        .eq("item", itemStart)
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
        .eq("item", itemKm)
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
        .eq("item", itemDelay)
        .maybeSingle();

      if (codError) {
        return new Response(
          JSON.stringify({ success: false, error: `billing_metadata(delay): ${codError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      cost_of_delay = cod;
    }

//generate estimated fare
//estimated fare = cost_of_start + (cost_of_km * distance_km)
let estimatedFare: any = null;
estimatedFare = (cost_of_start?.cost ?? 0) + (cost_of_km?.cost ?? 0)* (distanceKmNumber ?? 0);


    // 2) Insert into ride
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
       
      })
      .select()
      .maybeSingle();

//loop drivers to insert into ride_request
    // for (const driver of drivers) {
    //   await supabase.from("ride_request").insert({
    //     ride_id: rideData?.id,
    //     driver_id: driver.user_id,
    //     passenger_id:rideData?.passenger_id,
    //     motor_type: driver.motor_category ?? null,
    //     passenger_address: pickup_address,
    //     driver_address: driver.current_address ?? null,
    //     destination_address: rideData?.destination_address ?? null,
    //     distance_km: distanceKmNumber,
    //   });
    // }


    if (rideError) {
      return new Response(
        JSON.stringify({ success: false, error: rideError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!rideData?.id) {
      return new Response(
        JSON.stringify({ success: false, error: "Ride was not created properly" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3) Bulk insert into ride_request
    const riderRequests = drivers.map((driver: any) => ({
      ride_id: rideData.id,
      driver_id: driver.user_id,
      passenger_id,
      motor_type: driver.motor_category ?? null,
      passenger_address: pickup_address,
      driver_address: driver.current_address ?? null,
      destination_address: rideData.destination_address ?? null,
      estimated_fare: estimatedFare,
      // set it (instead of forcing null)
      distance_km: distanceKmNumber,
    }));

    const { error: requestError } = await supabase
      .from("ride_request")
      .insert(riderRequests);

    if (requestError) {
      return new Response(
        JSON.stringify({ success: false, error: requestError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

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
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});