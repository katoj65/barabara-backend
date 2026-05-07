import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing Bearer token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const anonOrJwt = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", anonOrJwt, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  try {
    // Edge Functions can use the auth context from the Authorization header
    // to apply RLS, but signOut behavior still depends on how the client stores sessions.
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
