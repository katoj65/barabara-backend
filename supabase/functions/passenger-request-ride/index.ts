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
      waypoints,
      payment_method,
      distance_km,
      estimated_duration_minutes,
      request_type,
      coupon_id,
      coupon_code,
      number_of_seats,
      pet,
      category

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





//get category of service from motor_category and transport_type
    const { data: riderProfile, error: riderProfileError } = await supabase
      .from("rider_profile")
      .select("*")
      .eq("service_category", category)
      .limit(1)
      .maybeSingle();

    if (riderProfileError) {
      return new Response(
        JSON.stringify({ success: false, error: riderProfileError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!riderProfile) {
      return new Response(
        JSON.stringify({ success: false, error: "No rider found for the selected category" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }


const riderData = riderProfile as any; // Type assertion to access motor field

    // Compute price based on distance and service category
    const { data: billingData, error: billingError } = await supabase
      .from("billing_metadata")
      .select("cost")
      .eq("item", riderData.service_category)
      .eq("tag", "service")
      .maybeSingle();

    if (billingError) {
      return new Response(
        JSON.stringify({ success: false, error: billingError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

// Calculate estimated cost based on distance and cost per km from billing metadata

const costPerKm = billingData?.cost ?? 0;
const estimatedCost = distanceKmNumber !== null ? distanceKmNumber * costPerKm : null;

    // Validate coupon and apply discount if coupon_code is provided
    let resolvedCouponId = coupon_id ?? null;
    let finalCost = estimatedCost;
    let couponResult = null;

    const couponCodeStr = coupon_code != null ? String(coupon_code).trim() : "";

    if (couponCodeStr !== "") {
      const { data: coupon, error: couponError } = await supabase
        .from("coupon")
        .select("id, discount")
        .eq("code", couponCodeStr)
        .eq("status", "active")
        .maybeSingle();

      if (couponError) {
        return new Response(
          JSON.stringify({ success: false, error: couponError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Coupon code provided but no matching active coupon found — stop here
      if (!coupon) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid or expired coupon code" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Apply discount to the estimated cost
      resolvedCouponId = coupon.id;
      finalCost = estimatedCost !== null ? estimatedCost - (estimatedCost * coupon.discount / 100) : null;
      couponResult = coupon;
    }


    // Guard: if coupon_code was provided but no valid coupon was found, stop here
    if (couponCodeStr !== "" && !couponResult) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or expired coupon code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a ride record with all passenger-provided details and computed cost
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
        waypoints,
        payment_method,
        distance_km: distanceKmNumber,
        estimated_duration_minutes,
        request_type,
        coupon_id: resolvedCouponId,
        pet,
        transport_type: riderData.transport_type,
        estimated_fare: estimatedCost,
        service_category: riderData.service_category,
        status: "pending",
        discount: couponResult ? couponResult.discount : null,
        motor_category: riderData.motor_category,
      })
      .select("*")
      .single();

    if (rideError) {
      return new Response(
        JSON.stringify({ success: false, error: rideError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }


    // Insert into ride_queue for matching with available drivers
    const { error: queueError } = await supabase
      .from("ride_request")
      .insert({
        ride_id: rideData.id,
        passenger_id,
        passenger_address: pickup_address,
        destination_address,
        ride_category: riderData.service_category,
        status: "pending",
        estimated_fare: estimatedCost,
        distance_km: distanceKmNumber,
        motor_type: riderData.transport_type,
      });

    if (queueError) {
      return new Response(
        JSON.stringify({ success: false, error: queueError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }



    // Step 17: Return success response with ride and matched drivers
    return new Response(
      JSON.stringify({
        success: true,
        message: "Successfully",
        data: rideData,
    
      
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
