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
    // Parse request body
    const { distance } = await req.json();

    // Validate input
    if (distance === undefined || distance === null) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "distance is required",
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

    const inputDistance = Number(distance);

    if (isNaN(inputDistance) || inputDistance < 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "distance must be a valid positive number",
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

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get ride cost per kilometre
    const { data: rideBilling, error: rideError } = await supabase
      .from("billing_metadata")
      .select("cost")
      .eq("item", "ride")
      .single();

    if (rideError) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Ride billing configuration not found",
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

    // Get ride start cost
    const { data: startBilling, error: startError } = await supabase
      .from("billing_metadata")
      .select("cost")
      .eq("item", "start")
      .single();

    if (startError) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Start billing configuration not found",
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

    // Convert values
    const costPerKilometre = Number(rideBilling.cost || 0);
    const startCost = Number(startBilling.cost || 0);

    // Calculate total ride cost
    const distanceCost = inputDistance * costPerKilometre;
    const totalCost = distanceCost + startCost;

    // Response
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          distance: inputDistance,
          cost_per_kilometre: costPerKilometre,
          start_cost: startCost,
          total_cost: totalCost,
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