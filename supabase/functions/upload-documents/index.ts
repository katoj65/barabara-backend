import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const user_id = form.get("user_id");
    const document_type = form.get("document_type") ?? null;
    const document_number = form.get("document_number") ?? null;
    const date_of_issue = form.get("date_of_issue") ?? null;
    const date_of_expiry = form.get("date_of_expiry") ?? null;

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Missing file" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!user_id) {
      return new Response(JSON.stringify({ error: "Missing user_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const bucket = "documents";
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
    const safeExt = (ext ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");

    // Example storage path: <userId>/<document_type>/<timestamp>.<ext>
    const ts = Date.now();
    const docTypePart = document_type
      ? String(document_type).toLowerCase().replace(/[^a-z0-9_-]/g, "")
      : "other";

    const path = `${user_id}/${docTypePart}/${ts}.${safeExt || "bin"}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If you want a public URL, ensure the bucket is public OR generate a signed URL.
    const file_url = supabaseAdmin.storage.from(bucket).getPublicUrl(uploadData.path).data.publicUrl;

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("driver_document")
      .insert({
        user_id: Number(user_id),
        document_type,
        file_url,
        file_name: file.name,
        file_size_bytes: file.size,
        mime_type: file.type || null,
        document_number,
        date_of_issue,
        date_of_expiry,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        storage_path: uploadData.path,
        document: inserted,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});