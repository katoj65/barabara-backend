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
    const {
      passenger_id,
      code,
      ride_id,
    } = await req.json();

    // Validate inputs
    if (!passenger_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "passenger_id is required",
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

    if (!code) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "code is required",
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

    // Verify ride code
    const { data: rideCode, error: codeError } =
      await supabase
        .from("ride")
        .select("*")
        .eq("passenger_id", passenger_id)
        .eq("ride_code", code)
        .eq("id", ride_id)
        .eq("status", "accepted")
        .maybeSingle();

    if (codeError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: codeError.message,
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

    // Invalid code
    if (!rideCode) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid ride code",
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

    // Update ride status to in_progress now that the passenger has confirmed with the driver
    const { error: updateError, data: updatedRide } = await supabase
      .from("ride")
      .update({ status: "started", started_at: new Date().toISOString() })
      .eq("id", ride_id)
      .select("*");

    if (updateError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: updateError.message,
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

    // Notify the driver that the passenger has confirmed the code and the ride has started
    const { error: notificationError } = await supabase
      .from("notification")
      .insert({
        user_id: rideCode.driver_id,
        title: "Ride Started",
        message: `The passenger has confirmed the ride code. The ride is now in progress.\nFrom: ${rideCode.pickup_address}\nTo: ${rideCode.destination_address}`,
      });

    if (notificationError) {
      return new Response(
        JSON.stringify({ success: false, error: notificationError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Notify the passenger that the ride has started
    const { error: passengerNotificationError } = await supabase
      .from("notification")
      .insert({
        user_id: rideCode.passenger_id,
        title: "Ride Started",
        message: `Your ride is now in progress.\nFrom: ${rideCode.pickup_address}\nTo: ${rideCode.destination_address}`,
      });

    if (passengerNotificationError) {
      return new Response(
        JSON.stringify({ success: false, error: passengerNotificationError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }








    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Ride started successfully",
        data: updatedRide,
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