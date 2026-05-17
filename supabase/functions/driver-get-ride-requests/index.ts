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
      ride_category,
      request_id,
      user_id,
    } = body;

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




    // Fetch driver profile to verify the driver and get their details
    const { data: driverProfile, error: driverProfileError } = await supabase
      .from("rider_profile")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (driverProfileError) {
      return new Response(
        JSON.stringify({ success: false, error: driverProfileError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!driverProfile) {
      return new Response(
        JSON.stringify({ success: false, error: "Driver profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }



    // Query ride requests matching the driver's ride category
    const { data, error } = await supabase
      .from("ride_request")
      .select("*")
      .eq("ride_category", driverProfile.service_category)
      .eq("status", "pending")
      .order("created_at", { descending: false });

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Ride requests fetched successfully",
        count: data.length,
        data,
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