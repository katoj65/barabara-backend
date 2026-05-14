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
    const body = await req.json();
    const { email, password, data, riderProfile } = body ?? {};

    if (!email || !password || !data) {
      return new Response(
        JSON.stringify({ error: "Email or password or data missing" }),
        { status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );



    // 1) Create Auth user
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return new Response(
        JSON.stringify({
          step: "auth.createUser",
          error: authError.message,
        }),
        { status: 500 }
      );
    }



    // 2) MUST NOT be null
    const userIdUuid = authUser?.user?.id;
    if (!userIdUuid) {
      return new Response(
        JSON.stringify({
          step: "auth.createUser",
          error: "authUser.user.id is missing (cannot insert null user_id).",
        }),
        { status: 500 }
      );
    }



    // 3) Insert into public.user
    const payload = data ?? {};
    const { id: _ignoredId, user_id: _ignoredUserId, ...safeData } = payload;

    const { data: userProfile, error: dbUserError } = await supabase
      .from("user")
      .insert([
        {
          user_id: userIdUuid,
          email: email,
          first_name: safeData.first_name ?? null,
          last_name: safeData.last_name ?? null,
          other_names: safeData.other_names ?? null,
          gender: safeData.gender ?? null,
          date_of_birth: safeData.date_of_birth ?? null,
          telephone: safeData.telephone ?? null,
          profile_photo_url: safeData.profile_photo_url ?? null,
          city: safeData.city ?? null,
          country: safeData.country ?? null,
          nationality: safeData.nationality ?? null,
          preferred_language: safeData.preferred_language ?? null,
          role: safeData.role ?? null,
          online_status: safeData.online_status ?? null,
          last_seen_at: safeData.last_seen_at ?? null,
        },
      ])
      .select("*");

    if (dbUserError) {
      return new Response(
        JSON.stringify({
          step: "db.userInsert",
          error: dbUserError.message,
        }),
        { status: 500 }
      );
    }

    const userRow = userProfile?.[0];
    if (!userRow) {
      return new Response(
        JSON.stringify({
          step: "db.userInsert",
          error: "User insert returned no row.",
        }),
        { status: 500 }
      );
    }

    // 4) Fail fast if user_id still ended up null

    if (!userRow.user_id) {
      return new Response(
        JSON.stringify({
          step: "db.userInsert",
          error:
            "Inserted public.user row has user_id = NULL (unexpected). Check column name and triggers/defaults.",
          debug: { userIdUuid, email: userRow.email },
        }),
        { status: 500 }
      );
    }

    // Prepare authentication info to return to client (excluding sensitive info like password)
    const userAuthentication = {
      email: email,
      name: userRow.first_name ?? null,
      telephone: userRow.telephone ?? null,
      user_id: userRow.user_id,
    };



    // 5) Optional: insert rider_profile
    let insertedRiderProfile = null;

    if (riderProfile) {
      const riderPayload = riderProfile ?? {};
      const { id: _ignoredRiderId, user_id: _ignoredRiderUserId, ...safeRider } =
        riderPayload;

      const { data: riderDbData, error: riderDbError } = await supabase
        .from("rider_profile")
        .insert([
          {
            user_id: userRow.id,
            ...safeRider,
          },
        ])
        .select("*");

      if (riderDbError) {
        return new Response(
          JSON.stringify({
            step: "db.riderProfileInsert",
            error: riderDbError.message,
          }),
          { status: 500 }
        );
      }

      insertedRiderProfile = riderDbData?.[0] ?? null;
    }





    return new Response(
      JSON.stringify({
        success: true,
        userAuthentication,
        userBio: userRow,
        driverProfile: insertedRiderProfile,
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );



  } catch (err) {
    return new Response(
      JSON.stringify({
        step: "catch",
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      }),
      { status: 500 }
    );
  }
});