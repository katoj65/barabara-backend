import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { email, password, data, riderProfile, nextOfKin } = body ?? {};

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

    // Step 1: Login (user must already exist)
    const { data: sessionData, error: loginError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (loginError || !sessionData?.user?.id) {
      return new Response(
        JSON.stringify({
          step: "auth.login",
          error: loginError?.message ?? "Missing session user id",
        }),
        { status: 401 }
      );
    }

    const authUserIdUuid = sessionData.user.id;

    // Step 2: Upsert into public.user
    const payload = data ?? {};
    const { id: _ignoredId, user_id: _ignoredUserId, ...safeData } = payload;

    const { data: userProfileRows, error: dbUserError } = await supabase
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

    const userRow = userProfileRows?.[0];

    if (!userRow) {
      return new Response(
        JSON.stringify({
          step: "db.userUpsert",
          error: "User upsert returned no row.",
        }),
        { status: 500 }
      );
    }

    if (!userRow.id) {
      return new Response(
        JSON.stringify({
          step: "db.userUpsert",
          error: "public.user.id is missing (cannot insert next_of_kin).",
          debug: { authUserIdUuid, email },
        }),
        { status: 500 }
      );
    }

    // Step 2.5: Insert next_of_kin using body.nextOfKin only
    let insertedNextOfKin = null;

    if (nextOfKin) {
      const nok = nextOfKin ?? {};
      const {
        id: _ignoredNokId,
        user_id: _ignoredNokUserId,
        created_at: _ignoredCreatedAt,
        created_by: _ignoredCreatedBy,
        updated_by: _ignoredUpdatedBy,
        ...safeNok
      } = nok;

      const { data: nextOfKinRows, error: nextOfKinError } = await supabase
        .from("next_of_kin")
        .insert([
          {
            user_id: userRow.id, // bigint FK to public.user.id
            full_name: safeNok.full_name ?? null,
            gender: safeNok.gender ?? null,
            relationship: safeNok.relationship ?? null,
            phone_number: safeNok.phone_number ?? null,
            email: safeNok.email ?? null,
            address: safeNok.address ?? null,
            id_photo_url: safeNok.id_photo_url ?? null,
            is_emergency_contact:
              safeNok.is_emergency_contact ?? null,
            created_by: safeNok.created_by ?? null,
            updated_by: safeNok.updated_by ?? null,
          },
        ])
        .select("*");

      if (nextOfKinError) {
        return new Response(
          JSON.stringify({
            step: "db.nextOfKinInsert",
            error: nextOfKinError.message,
          }),
          { status: 500 }
        );
      }

      insertedNextOfKin = nextOfKinRows?.[0] ?? null;
    }

    // Step 3: Optional — upsert rider_profile
    let insertedRiderProfile = null;

    if (riderProfile) {
      const riderPayload = riderProfile ?? {};
      const { id: _ignoredRiderId, user_id: _ignoredRiderUserId, ...safeRider } = riderPayload;

      const { data: riderDbData, error: riderDbError } = await supabase
        .from("rider_profile")
        .upsert(
          [{ user_id: userRow.id, ...safeRider }],
          { onConflict: "user_id" }
        )
        .select("*");

      if (riderDbError) {
        return new Response(
          JSON.stringify({
            step: "db.riderProfileUpsert",
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
        userAuthentication: {
          email,
          name: userRow.first_name ?? null,
          telephone: userRow.telephone ?? null,
          user_id: userRow.user_id,
        },
        userBio: userRow,
        nextOfKin: insertedNextOfKin,
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