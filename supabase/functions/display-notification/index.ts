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
    const { user_id, notification_id } = await req.json();

    // Validate inputs
    if (!user_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "user_id is required",
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

    if (!notification_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "notification_id is required",
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

    // Get notification
    const { data: notification, error } = await supabase
      .from("notification")
      .select("*")
      .eq("id", notification_id)
      .eq("user_id", user_id)
      .maybeSingle();

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

    // Notification not found
    if (!notification) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Notification not found",
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

    // Update status to seen if pending
    if (notification.status === "pending") {
      const { error: updateError } = await supabase
        .from("notification")
        .update({
          status: "seen",
        })
        .eq("id", notification_id)
        .eq("user_id", user_id);

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

      // Update local object response
      notification.status = "seen";
    }

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        data: notification,
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