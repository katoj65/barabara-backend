import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
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
    // Parse request payload
    const payload = await req.json();

    const { ride_id, passenger_id, driver_id } = payload;

    // Validate payload
    if (!ride_id || !passenger_id || !driver_id) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "ride_id, passenger_id and driver_id are required",
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

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get pending ride belonging to driver
    const { data: ride, error: rideFetchError } =
      await supabase
        .from("ride")
        .select("id, driver_id, passenger_id, status")
        .eq("id", ride_id)
        .eq("driver_id", driver_id)
        .eq("status", "pending")
        .single();

    if (rideFetchError || !ride) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Pending ride not found for this driver",
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

    // Verify passenger matches ride
    if (ride.passenger_id !== passenger_id) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Passenger does not match this ride",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Get passenger telephone
    const { data: passenger, error: passengerError } =
      await supabase
        .from("user")
        .select("telephone")
        .eq("id", passenger_id)
        .single();

    if (passengerError || !passenger) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Passenger not found",
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

    // Get driver telephone
    const { data: driver, error: driverError } =
      await supabase
        .from("user")
        .select("telephone")
        .eq("id", driver_id)
        .single();

    if (driverError || !driver) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Driver not found",
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

    // Generate random 4-digit confirmation code
    const confirmationCode = Math.floor(
      1000 + Math.random() * 9000
    );

    // Update ride status and accepted timestamp
    const { data: updatedRide, error: updateRideError } =
      await supabase
        .from("ride")
        .update({
          status: "confirmed",
          accepted_at: new Date().toISOString(),
        })
        .eq("id", ride_id)
        .select()
        .single();

    if (updateRideError) {
      return new Response(
        JSON.stringify({
          success: false,
          message: updateRideError.message,
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

    // Insert confirmation code into ride_code table
    const { data: rideCode, error: codeError } =
      await supabase
        .from("ride_code")
        .insert({
          ride_id: ride_id,
          passenger_id: passenger_id,
          driver_id: driver_id,
          passenger_telephone: passenger.telephone,
          driver_telephone: driver.telephone,
          code: confirmationCode,
        })
        .select()
        .single();

    if (codeError) {
      return new Response(
        JSON.stringify({
          success: false,
          message: codeError.message,
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

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Ride accepted",
        data: {
          ride: updatedRide,
          ride_code: rideCode,
        },
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
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