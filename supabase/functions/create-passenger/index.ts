import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const body = await req.json();

    const { email, password, data, passengerProfile } = body ?? {};
    const nextOfKinInputRaw = body?.nextOfKin ?? null;

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

    // 1) Sign in
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

    // 2) Upsert into public.user and return the bigint "id"
    const payload = data ?? {};
    const {
      id: _ignoredId,
      user_id: _ignoredUserId,
      ...safeData
    } = payload;

    const { data: userProfile, error: dbUserError } = await supabase
      .from("user")
      .upsert(
        [
          {
            user_id: authUserIdUuid, // uuid
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
      // IMPORTANT: explicitly request "id" (bigint) + "user_id" (uuid)
      .select("id, user_id, email, first_name, last_name, telephone");

    if (dbUserError) {
      return new Response(
        JSON.stringify({ step: "db.userUpsert", error: dbUserError.message }),
        { status: 500 }
      );
    }

    const userRow = userProfile?.[0];
    if (!userRow) {
      return new Response(
        JSON.stringify({ step: "db.userUpsert", error: "No user row returned" }),
        { status: 500 }
      );
    }

    // optional: passenger profile (left mostly as-is)
    let insertedPassengerProfile = null;
    if (passengerProfile) {
      const passengerPayload = passengerProfile ?? {};
      const { id: _pid, user_id: _puuid, ...safePassenger } = passengerPayload;

      const { data: passengerDbData, error: passengerDbError } = await supabase
        .from("passenger_profile")
        .upsert([{ user_id: userRow.id, ...safePassenger }], { onConflict: "user_id" })
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

    // 3) Insert next_of_kin from body.nextOfKin
    let insertedNextOfKeen = null;

    const nextOfKinNormalized =
      Array.isArray(nextOfKinInputRaw) ? nextOfKinInputRaw[0] : nextOfKinInputRaw;

    const shouldInsertNextOfKin =
      nextOfKinNormalized && typeof nextOfKinNormalized === "object";

    // Default debug
    let nextOfKinInsertError: string | null = null;

    if (shouldInsertNextOfKin) {
      const nok = nextOfKinNormalized ?? {};

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
            // FK target is public.user.id (bigint)
            user_id: userRow.id,

            full_name: safeNok.full_name ?? null,
            gender: safeNok.gender ?? null,
            relationship: safeNok.relationship ?? null,
            phone_number: safeNok.phone_number ?? null,
            email: safeNok.email ?? null,
            address: safeNok.address ?? null,
            id_photo_url: safeNok.id_photo_url ?? null,
            is_emergency_contact: safeNok.is_emergency_contact ?? null,
          },
        ])
        .select("*");

      if (nextOfKinError) {
        nextOfKinInsertError = nextOfKinError.message;
      } else {
        insertedNextOfKeen = nextOfKinRows?.[0] ?? null;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        userRow: {
          id: userRow.id,
          user_id: userRow.user_id,
        },
        passengerProfile: insertedPassengerProfile,

        nextOfKeen: insertedNextOfKeen,
       
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