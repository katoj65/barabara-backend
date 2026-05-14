import { createClient } from "npm:@supabase/supabase-js@2";


// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};



type VerifyBody = {
  email: string;
  code: string;
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { email, code } = (await req.json()) as Partial<VerifyBody>;

  if (!email || !code) {
    return new Response(JSON.stringify({ error: "Missing email or code" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 🔎 Fetch OTP row INCLUDING time fields
  const { data: otpRows, error } = await supabase
    .from("user_otp")
    .select("id, email, code, status, created_date, created_time")
    .eq("email", email)
    .eq("code", code)
    .eq("status", "pending")
    .limit(1);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  if (!otpRows || otpRows.length === 0) {
    return new Response(JSON.stringify({ valid: false, message: "Invalid code" }), {
      status: 400,
    });
  }

  const otp = otpRows[0];

  // 🕒 STEP 1: reconstruct created timestamp
  const createdAt = new Date(`${otp.created_date}T${otp.created_time}`);

  // 🕒 STEP 2: current time
  const now = new Date();

  // ⏱ STEP 3: check expiry (30 minutes)
  const diffMs = now.getTime() - createdAt.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  if (diffMinutes > 30) {
    return new Response(
      JSON.stringify({
        valid: false,
        message: "OTP expired. Request a new code.",
        expired: true,
        ageMinutes: diffMinutes,
      }),
      { status: 400 }
    );
  }

  // Optional: mark as used (recommended)
  await supabase
    .from("user_otp")
    .update({ status: "used" })
    .eq("id", otp.id);

  return new Response(
    JSON.stringify({
      valid: true,
      message: "OTP verified successfully",
      otp,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});