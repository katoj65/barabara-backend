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
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    // Parse request body — expects user_id, ride_id, and an optional cancellation reason
    const { user_id, ride_id, reason } = await req.json();

    // ride_id is required to identify which ride to cancel
    if (!ride_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "ride_id is required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Use the caller's auth token so RLS policies are enforced
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

    // Fetch the user's role to determine which cancellation path to take
    const { data: userData, error: userError } = await supabase
      .from("user")
      .select("role")
      .eq("id", user_id)
      .maybeSingle();

    if (userError || !userData) {
      return new Response(
        JSON.stringify({ success: false, error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userRole = userData.role;

    // Only drivers and passengers are allowed to cancel rides
    if (userRole !== "driver" && userRole !== "passenger") {
      return new Response(
        JSON.stringify({ success: false, error: "User must be a driver or passenger" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the ride exists and is in accepted status before attempting cancellation
    const { data: ride, error: rideError } = await supabase
      .from("ride")
      .select("status, transport_type")
      .eq("id", ride_id)
      .maybeSingle();

    if (rideError || !ride) {
      return new Response(
        JSON.stringify({ success: false, error: "Ride not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (ride.status !== "accepted") {
      return new Response(
        JSON.stringify({ success: false, error: `Ride cannot be cancelled because its status is '${ride.status}'. Only accepted rides can be cancelled.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let rideData = null;
    let cancellationCost = null;

    if (userRole === "driver") {
      // Driver can only cancel rides they own and that are currently accepted
      const { error: updateError, data } = await supabase
        .from("ride")
        .update({ status: "cancelled", cancellation_reason: reason, cancelled_by: "driver" })
        .eq("id", ride_id)
        .eq("driver_id", user_id)
        .eq("status", "accepted")
        .select("*");

      if (updateError) {
        return new Response(
          JSON.stringify({ success: false, error: updateError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      rideData = data;

      // Notify the passenger that the driver has cancelled the ride
      if (rideData && rideData.length > 0) {
        await supabase.from("notification").insert({
          user_id: rideData[0].passenger_id,
          title: "Ride Cancelled",
          message: "Driver has cancelled the ride, " + reason + ".",
        });
      }
    } else if (userRole === "passenger") {
      // Passenger can only cancel rides they booked and that are currently accepted
      const { error: updateError, data } = await supabase
        .from("ride")
        .update({ status: "cancelled", cancellation_reason: reason, cancelled_by: "passenger" })
        .eq("id", ride_id)
        .eq("passenger_id", user_id)
        .eq("status", "accepted")
        .select("*");


      if (updateError) {
        return new Response(
          JSON.stringify({ success: false, error: updateError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      rideData = data;

      // Notify the driver that the passenger has cancelled the ride
      if (rideData && rideData.length > 0) {
        await supabase.from("notification").insert({
          user_id: rideData[0].driver_id,
          title: "Ride Cancelled",
          message: "A passenger has cancelled the ride. Reason: " + reason + ".",
        });
      }

      // Fetch cancellation billing metadata for this ride's transport type
      const { data: billingMetadata, error: billingError } = await supabase
        .from("billing_metadata")
        .select("cost")
        .eq("tag", ride.transport_type)
        .eq("item", "cancellation")
        .maybeSingle();

      if (billingError) {
        return new Response(
          JSON.stringify({ success: false, error: billingError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      cancellationCost = billingMetadata?.cost ?? 0;

      // Charge the passenger a cancellation fine based on the billing metadata
      const { error: fineError } = await supabase.from("cancellation_fine").insert({
        user_id: user_id,
        ride_id: ride_id,
        amount: cancellationCost,
      });

      if (fineError) {
        return new Response(
          JSON.stringify({ success: false, error: fineError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }




      
    }



    return new Response(
      JSON.stringify({
        success: true,
        message: "Ride has been cancelled",
        data: rideData,
       
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
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
