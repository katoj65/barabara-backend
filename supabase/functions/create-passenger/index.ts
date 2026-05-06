import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { email, password, data, passengerProfile } = body ?? {};

    if (!email || !password || !data) {
      return new Response(
        JSON.stringify({ error: "Email, password, or data missing" }),
        { status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Step 1: Sign in (user must already exist)
    const { data: sessionData, error: loginError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (loginError || !sessionData?.user?.id) {
      return new Response(
        JSON.stringify({
          step: "auth.signInWithPassword",
          error: loginError?.message ?? "Missing authenticated user id",
        }),
        { status: 401 }
      );
    }

    const authUserIdUuid = sessionData.user.id;

    // Step 2: Insert into public.user (or upsert if you prefer)
    const payload = data ?? {};
    const { id: _ignoredId, user_id: _ignoredUserId, ...safeData } = payload;

    const { data: userProfile, error: dbUserError } = await supabase
      .from("user")
      .upsert(
        [
          {
            user_id: authUserIdUuid,
            email,
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
        ],
        { onConflict: "user_id" }
      )
      .select("*");

    if (dbUserError) {
      return new Response(
        JSON.stringify({ step: "db.userUpsert", error: dbUserError.message }),
        { status: 500 }
      );
    }

    const userRow = userProfile?.[0];

    if (!userRow) {
      return new Response(
        JSON.stringify({ step: "db.userUpsert", error: "No user row returned." }),
        { status: 500 }
      );
    }

    const userAuthentication = {
      email: email,
      name: userRow.first_name ?? null,
      telephone: userRow.telephone ?? null,
      user_id: userRow.user_id,
    };

    // Step 3: Insert passenger_profile
    let insertedPassengerProfile = null;

    if (passengerProfile) {
      const passengerPayload = passengerProfile ?? {};
      const {
        id: _ignoredPassengerId,
        user_id: _ignoredPassengerUserId,
        ...safePassenger
      } = passengerPayload;

      const { data: passengerDbData, error: passengerDbError } = await supabase
        .from("passenger_profile")
        .upsert(
          [
            {
              user_id: userRow.id,
              ...safePassenger,
            },
          ],
          { onConflict: "user_id" }
        )
        .select("*");

      if (passengerDbError) {
        return new Response(
          JSON.stringify({
            step: "db.passengerProfileUpsert",
            error: passengerDbError.message,
          }),
          { status: 500 }
        );
      }

      insertedPassengerProfile = passengerDbData?.[0] ?? null;
    }

    return new Response(
      JSON.stringify({
        success: true,
        userAuthentication,
        userBio: userRow,
        passengerProfile: insertedPassengerProfile,
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
