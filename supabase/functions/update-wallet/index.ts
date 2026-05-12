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
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    // Parse request body
    const { user_id, amount } = await req.json();

    // Validate input
    if (!user_id || amount === undefined) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "user_id and amount are required",
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

    // Get wallet
    const { data: wallets, error: walletError } = await supabase
      .from("wallet")
      .select("id, balance")
      .eq("user_id", user_id);

    if (walletError) {
      return new Response(
        JSON.stringify({
          success: false,
          message: walletError.message,
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

    let wallet;

    // Create wallet if not found
    if (!wallets || wallets.length === 0) {
      const { data: createdWallet, error: createError } = await supabase
        .from("wallet")
        .insert({
          user_id: user_id,
          balance: 0,
        })
        .select()
        .single();

      if (createError) {
        return new Response(
          JSON.stringify({
            success: false,
            message: createError.message,
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

      wallet = createdWallet;
    } else {
      wallet = wallets[0];
    }

    // Calculate new balance
    const currentBalance = Number(wallet.balance || 0);
    const inputAmount = Number(amount);

    const newBalance = currentBalance + inputAmount;

    // Update wallet balance
    const { data: updatedWallet, error: updateError } = await supabase
      .from("wallet")
      .update({
        balance: newBalance,
      })
      .eq("user_id", user_id)
      .select()
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({
          success: false,
          message: updateError.message,
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

    return new Response(
      JSON.stringify({
        success: true,
        message: "Wallet updated successfully",
        data: updatedWallet,
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