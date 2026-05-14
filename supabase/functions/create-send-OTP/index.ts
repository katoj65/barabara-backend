import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};


Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing RESEND_API_KEY secret" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Your original input fields
    const { email, category } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 🎯 Generate 4-digit OTP
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const code = (array[0] % 9000) + 1000;

    // 🕒 DO NOT CHANGE YOUR FIELD NAMES (as requested)
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toTimeString().split(" ")[0];

    // 💾 Insert into user_otp
    const { data: otpRow, error: dbError } = await supabase
      .from("user_otp")
      .insert([
        {
          email,
          code,
          category: category ?? "registration",
          created_date: date,
          created_time: time,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (dbError) {
      return new Response(
        JSON.stringify({
          step: "db.insert",
          error: dbError.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 📧 Send Email (Resend) — uses `email` + fixed subject
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev", // <-- change to a real allowed sender in Resend
        to: [email],
        subject: "Your OTP Code",
        text: `${code}`,
        // html: `<strong>Your OTP is: ${code}</strong>`, // optional
      }),
    });

    const emailResult = await emailResponse
      .json()
      .catch(() => ({ raw: null }));

    if (!emailResponse.ok) {
      return new Response(
        JSON.stringify({
          step: "email.send",
          status: emailResponse.status,
          error: emailResult,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP sent successfully",
        otp_id: otpRow.id,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        step: "catch",
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});