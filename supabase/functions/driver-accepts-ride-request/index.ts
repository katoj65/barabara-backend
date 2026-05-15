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
    const { driver_id, id} = await req.json();

    // Validate input
    if (!driver_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "driver_id is required",
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

    // Query ride_request by driver_id
    const { data, error } = await supabase
      .from("ride_request")
      .select("*,ride(*)")
      .eq("driver_id", driver_id)
      .eq("id", id)
      .eq("status", "pending")
      .eq("ride.status", "pending")
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ success: false, message: "No pending ride request found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data.ride) {
      return new Response(
        JSON.stringify({ success: false, message: "Ride is not pending or does not exist" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

// Update ride_request status to accepted
    if (data) {
      const { error: updateError } = await supabase
        .from("ride_request")
        .update({ status: "accepted", })
        .eq("id", data.id);

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
    }

// Update ride status to accepted
    if (data && data.ride) {
      const { error: rideUpdateError } = await supabase
        .from("ride")
        .update({ status: "accepted", driver_id: driver_id, accepted_at: new Date().toISOString() })
        .eq("id", data.ride.id);

      if (rideUpdateError) {
        return new Response(
          JSON.stringify({
            success: false,
            error: rideUpdateError.message,
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
    }




//get driver from user table
    const { data: driverData, error: driverError } = await supabase
      .from("user")
      .select("first_name, last_name, telephone")
      .eq("id", driver_id)
      .single();

   if (driverError || !driverData) {
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



// get passenger from user table
    const { data: passengerData, error: passengerError } = await supabase
      .from("user")
      .select("telephone")
      .eq("id", data.ride.passenger_id)
      .single();

   if (passengerError || !passengerData) {
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


// create ride code
const ride_code = Math.floor(1000 + Math.random() * 9000);
// insert code into ride_code table
    const { data: codeData, error: codeInsertError } = await supabase
      .from("ride_code")
      .insert({
        ride_id: data.ride.id,
        code: ride_code,
        passenger_id: data.ride.passenger_id,
        driver_id: driver_id,
        passenger_telephone: passengerData.telephone,
        driver_telephone: driverData.telephone,
        driver_names: `${driverData.first_name} ${driverData.last_name}`,
      })
      .select("*")
      .single();

    if (codeInsertError) {
      return new Response(
        JSON.stringify({ success: false, error: codeInsertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store the ride code on the ride record so it can be looked up directly from the ride
    const { error: rideCodeUpdateError } = await supabase
      .from("ride")
      .update({ ride_code: ride_code })
      .eq("id", data.ride.id);

    if (rideCodeUpdateError) {
      return new Response(
        JSON.stringify({ success: false, error: rideCodeUpdateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }








    
    // Send the ride code to the passenger as a notification so they can share it with the driver to confirm the ride
    const { error: notificationError } = await supabase
      .from("notification")
      .insert({
        user_id: data.ride.passenger_id,
        title: "Your Ride Code",
        message: `Your driver has accepted the ride. Share this code with your driver to confirm: ${ride_code}`,
      });

    if (notificationError) {
      return new Response(
        JSON.stringify({ success: false, error: notificationError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }





    

    // Handle query error
    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
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

    // No requests found
    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No rider requests found",
          count: 0,
          data: [],
        }),
        {
          status: 200,
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
        count: data.length,
        //data,
        //driver: driverData,
       // passenger_telephone: passengerData.telephone,
        confirmation_data: codeData,

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