import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405 }
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "File is required" }),
        { status: 400 }
      );
    }

    // 📏 SIZE VALIDATION (2MB max)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB

    if (file.size > MAX_SIZE) {
      return new Response(
        JSON.stringify({
          error: "File too large. Maximum allowed size is 2MB.",
        }),
        { status: 400 }
      );
    }

    // 📄 TYPE VALIDATION (PDF + images only)
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/heic",
    ];

    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid file type. Only PDF and image files are allowed.",
        }),
        { status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const bucket = "documents";

    // 🧠 Safe filename
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);

    const path = `documents/${timestamp}-${random}-${originalName}`;

    // 📤 Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return new Response(
        JSON.stringify({ step: "upload", error: error.message }),
        { status: 500 }
      );
    }

    // 🌍 Public URL
    const publicUrl = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path).data.publicUrl;

    return new Response(
      JSON.stringify({
        success: true,
        path: data.path,
        url: publicUrl,
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
      { status: 500 }
    );
  }
});