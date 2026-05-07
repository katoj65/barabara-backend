import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const form = await req.formData();

    const file = form.get("file");
    const pathFromClient = form.get("path");

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Missing file" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!file.name) {
      return new Response(JSON.stringify({ error: "File name missing" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const bucket = "documents";

    // Filename sanitization
    const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const defaultPath = `uploads/${Date.now()}-${filename}`;

    const objectPath =
      typeof pathFromClient === "string" && pathFromClient.trim().length > 0
        ? pathFromClient.trim()
        : defaultPath;

    // Derive "format" (best-effort): from extension if present, else from mime
    const ext = filename.includes(".") ? filename.split(".").pop() : "";
    const format =
      ext
        ? ext.toLowerCase()
        : (file.type || "").split("/").pop()?.toLowerCase() || "unknown";

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(objectPath, file, {
        contentType: file.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      return new Response(JSON.stringify({ error: uploadError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(uploadData.path);

    const publicUrl = urlData.publicUrl;

    return new Response(
      JSON.stringify({
        ok: true,

        // Requested fields
        path: uploadData.path,
        public_url: publicUrl,
        size: file.size,          // bytes
        format,                   // extension or mime subtype fallback

        // Useful extras
        bucket,
        file_name: file.name,
        mime_type: file.type || null,
        storage_id: uploadData.id, // may be null/undefined depending on storage adapter
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