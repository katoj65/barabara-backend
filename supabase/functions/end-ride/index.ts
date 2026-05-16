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

    // Verify ride belongs to passenger
    const { data: ride, error: rideCheckError } =
      await supabase
        .from("ride")
        .select("*")
        .eq("id", ride_id)
        .eq("passenger_id", passenger_id)
        .eq("status", "started")
        .maybeSingle();

    if (rideCheckError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: rideCheckError.message,
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

    // Ride not found
    if (!ride) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Ride not found",
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Update ride status to completed
    const { data: updatedRide, error: updateError } =
      await supabase
        .from("ride")
        .update({
          status: "completed",
          arrived_at: new Date().toISOString(),
        })
        .eq("id", ride_id)
        .select()
        .maybeSingle();

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


//calculate fare based on distance and time





















    // Notify the passenger that the ride has been completed
    const { error: passengerNotificationError } = await supabase
      .from("notification")
      .insert({
        user_id: ride.passenger_id,
        title: "Ride Completed",
        message: `Your ride has ended.\nFrom: ${ride.pickup_address}\nTo: ${ride.destination_address}`,
      });

    if (passengerNotificationError) {
      return new Response(
        JSON.stringify({ success: false, error: passengerNotificationError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Notify the driver that the ride has been completed
    const { error: driverNotificationError } = await supabase
      .from("notification")
      .insert({
        user_id: ride.driver_id,
        title: "Ride Completed",
        message: `The ride has ended.\nFrom: ${ride.pickup_address}\nTo: ${ride.destination_address}`,
      });

    if (driverNotificationError) {
      return new Response(
        JSON.stringify({ success: false, error: driverNotificationError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }








    // Update related ride_request records
    const { error: requestError } = await supabase
      .from("ride_request")
      .update({
        status: "completed",
      })
      .eq("ride_id", ride_id);

    if (requestError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: requestError.message,
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

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Ride ended successfully",
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