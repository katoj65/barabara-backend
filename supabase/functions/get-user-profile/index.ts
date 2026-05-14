import { createClient } from "npm:@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json().catch(() => ({}));
  const { user_id } = body as { user_id?: string };

  const userUuid = `${user_id ?? ""}`.trim();
  if (!userUuid) {
    return new Response(JSON.stringify({ error: "Missing user_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Missing env vars" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 1) Query user by UUID (user.user_id)
  const { data: user, error: userErr } = await supabase
    .from("user")
    .select("*")
    .eq("user_id", userUuid)
    .maybeSingle();

  if (userErr) {
    return new Response(JSON.stringify({ error: userErr.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2) Use integer PK for profile lookup: user.id -> profiles.user_id
  const role = (user.role ?? "").toString().toLowerCase();
  const userIdFk = user.id; // integer/bigint

  let profile: any = null;

  if (role === "passenger") {
    const { data, error } = await supabase
      .from("passenger_profile")
      .select("*")
      .eq("user_id", userIdFk)
      .maybeSingle();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    profile = data;
  } else if (role === "rider") {
    const { data, error } = await supabase
      .from("rider_profile")
      .select("*")
      .eq("user_id", userIdFk)
      .maybeSingle();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    profile = data;
  } else {
    return new Response(
      JSON.stringify({ error: `Unsupported role: ${user.role}` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ ...user, profile }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});