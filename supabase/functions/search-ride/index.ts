import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};


async function helperPrice(supabase: ReturnType<typeof createClient>, category: string, distance: number): Promise<{ range: string } | null> {
  const { data, error } = await supabase
    .from("billing_metadata")
    .select("cost, unit")
    .eq("item", category)
    .eq("tag", "service")
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const cost = Number(data.cost);
  const unit = Number(data.unit);
  const minPrice = distance * cost;
  const maxPrice = distance * cost * unit;

  return { min: minPrice, max: maxPrice };
}




serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    // Parse request body — guard against empty or malformed JSON
    let pickup: string, dropoff: string, distance: number;
    try {
      ({ pickup, dropoff, distance } = await req.json());
    } catch (_) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or empty request body. Expected JSON with pickup, dropoff, and distance fields." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate required inputs
    if (!pickup || pickup.trim() === "") {
      return new Response(
        JSON.stringify({ success: false, error: "pickup is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!dropoff || dropoff.trim() === "") {
      return new Response(
        JSON.stringify({ success: false, error: "dropoff is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!distance || distance <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "distance is required and must be a positive number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client using the caller's auth token so RLS policies are enforced
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: {
            Authorization: req.headers.get("Authorization") || "",
          },
        },
      }
    );

    // Search for available drivers whose current location matches the pickup address
    const { data: availableDrivers, error } = await supabase
      .from("rider_profile")
      .select("*,motor(*)")
      .eq("current_address", pickup)
      .eq("is_available", true);

    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // No drivers found at the pickup location
    if (!availableDrivers || availableDrivers.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No rides found", count: 0, data: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Derive distinct service categories from the fetched drivers
    const { data: categoryData, error: categoryError } = await supabase
      .from("rider_profile")
      .select("service_category")
      .eq("current_address", pickup)
      .eq("is_available", true);

    if (categoryError) throw categoryError;

    const distinctCategories = [...new Set((categoryData ?? []).map((r) => r.service_category))];






    // Group drivers by service category with availability count and billing price
    const formattedDrivers = await Promise.all(
      distinctCategories.map(async (category) => ({
        category,
        drivers_available: availableDrivers.filter((driver) => driver.service_category === category).length,
        pickup,
        dropoff,
        distance,
        cost: await helperPrice(supabase, category, distance),
      }))
    );

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        data: formattedDrivers,
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
      JSON.stringify({ success: false, error: err.message }),
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
