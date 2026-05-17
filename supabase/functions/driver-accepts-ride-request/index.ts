import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {

  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {

    // Parse request body
    const body = await req.json();

    const {
      driver_id,
      id,
    } = body;

    // Validate inputs
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: "id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!driver_id) {
      return new Response(
        JSON.stringify({ success: false, error: "driver_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization:
              req.headers.get("Authorization") || "",
          },
        },
      }
    );






    // Fetch the driver's rider profile to verify they exist
    const { data: riderProfile, error: riderProfileError } = await supabase
      .from("rider_profile")
      .select("*,user(first_name, last_name, telephone),motor(*)")
      .eq("user_id", driver_id)
      .maybeSingle();

    if (riderProfileError) {
      return new Response(
        JSON.stringify({ success: false, error: riderProfileError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!riderProfile) {
      return new Response(
        JSON.stringify({ success: false, error: "Driver profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check the ride_request exists and is still pending — also fetch passenger_id for use below
    const { data: existing, error: fetchError } = await supabase
      .from("ride_request")
      .select("id, passenger_id")
      .eq("id", id)
      .eq("status", "pending")
      .maybeSingle();

    if (fetchError) {
      return new Response(
        JSON.stringify({ success: false, error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!existing) {
      return new Response(
        JSON.stringify({ success: false, error: "Ride request not found or already accepted" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }





        // Get passenger details from user table
    const { data: passenger, error: passengerError } = await supabase
      .from("user")
      .select("first_name, last_name, telephone")
      .eq("id", existing.passenger_id)
      .maybeSingle();

    if (passengerError) {
      return new Response(
        JSON.stringify({ success: false, error: passengerError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    
    // motor(*) returns an array when the FK is on the motor side — extract the first element
    const motor = Array.isArray(riderProfile.motor)
      ? riderProfile.motor[0] ?? null
      : riderProfile.motor ?? null;

    // Accept the ride request by updating status and assigning the driver
    const { data, error } = await supabase
      .from("ride_request")
      .update({
        status:                   "accepted",
        driver_id,
        driver_address:           riderProfile.current_address ?? null,
        driver_names:             `${riderProfile.user?.first_name ?? ""} ${riderProfile.user?.last_name ?? ""}`.trim(),
        driver_telephone:         riderProfile.user?.telephone ?? null,
        passenger_telephone:      passenger?.telephone ?? null,
        ride_color:               motor.color,
        ride_model:               motor.model,
        ride_make:                motor.make,
        ride_registration_number: motor.registration_number,
        status:                   "accepted",
      })
      .eq("id", id)
      .select("*")
      .single();

    // Handle DB error
    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }





    // Generate a 4-digit ride code for the passenger to confirm with the driver
    const ride_code = Math.floor(1000 + Math.random() * 9000);

    // Insert ride code into ride_code table
    const { data: codeData, error: codeInsertError } = await supabase
      .from("ride_code")
      .insert({
        ride_id: data.ride_id,
        code: ride_code,
        passenger_id: data.passenger_id,
        driver_id: driver_id,
        passenger_telephone: passenger?.telephone,
        driver_telephone: riderProfile.user?.telephone,
        driver_names: `${riderProfile.user?.first_name} ${riderProfile.user?.last_name}`,
      })
      .select("*")
      .single();

    if (codeInsertError) {
      return new Response(
        JSON.stringify({ success: false, error: codeInsertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update the ride table — done after code generation so ride_code can be stored on the ride
    const { data: rideData, error: rideUpdateError } = await supabase
      .from("ride")
      .update({ status: "accepted", driver_id, accepted_at: new Date().toISOString(), ride_code })
      .eq("id", data.ride_id)
      .select("*")
      .single();

    if (rideUpdateError) {
      return new Response(
        JSON.stringify({ success: false, error: rideUpdateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }


  // Send the ride code to the passenger as a notification so they can share it with the driver to confirm the ride
    const { error: notificationError } = await supabase
      .from("notification")
      .insert({
        user_id: data.passenger_id,
        title: "Your Ride Code",
        message: `Your driver has accepted the ride. Share this code with your driver to confirm: ${ride_code}`,
      });

    if (notificationError) {
      return new Response(
        JSON.stringify({ success: false, error: notificationError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }



    const response={
      passenger_address: data.passenger_address,
      pickup_address: data.pickup_address,
      pickup_latitude: rideData.pickup_latitude,
      pickup_longitude: rideData.pickup_longitude,
      destination_latitude: rideData.destination_latitude,
      destination_longitude: rideData.destination_longitude,
      destination_address: data.destination_address,
      passenger_telephone: data.passenger_telephone,
      estimated_fare: data.estimated_fare,
      estimated_distance: data.estimated_distance,
      estimated_duration: data.estimated_duration,
      distance_km: rideData.distance_km,
    };

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Ride request updated successfully",
        ride: response,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (err: any) {

    // Global error handler
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});