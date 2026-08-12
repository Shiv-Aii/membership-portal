"use client";

import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

type PageData = {
  id?: string;
  member_id: string;
  title: string;
  description: string;
  image_url: string;
  phone: string;
  address: string;
  website: string;
  is_active: boolean;
};

function PublicPageEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const memberId = searchParams.get("id");

  const [page, setPage] = useState<PageData>({
    member_id: "",
    title: "ಸದಸ್ಯರ ಮಾಹಿತಿ",
    description: "",
    image_url: "",
    phone: "",
    address: "",
    website: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data: user } =
        await supabase.auth.getUser();

      if (!user.user) {
        router.replace("/admin/login");
        return;
      }

      if (!memberId) {
        setMessage("Member ID ಸಿಗಲಿಲ್ಲ.");
        setLoading(false);
        return;
      }

      const { data, error } =
        await supabase
          .from("member_info_page")
          .select("*")
          .eq("member_id", memberId)
          .maybeSingle();

      if (error) {
        console.error(error);
        setMessage(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        setPage({
          id: data.id,
          member_id: data.member_id,
          title: data.title || "",
          description: data.description || "",
          image_url: data.image_url || "",
          phone: data.phone || "",
          address: data.address || "",
          website: data.website || "",
          is_active: data.is_active ?? true,
        });
      } else {
        setPage((old) => ({
          ...old,
          member_id: memberId,
        }));
      }

      setLoading(false);
    }

    load();
  }, [memberId, router]);

  async function uploadImage(
    file: File
  ) {
    if (!memberId) return;

    try {
      setUploading(true);
      setMessage("");

      const extension =
        file.name.split(".").pop() || "jpg";

      const fileName =
        `public-page-${memberId}-${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("member-photos")
          .upload(fileName, file, {
            upsert: true,
          });

      if (uploadError) {
        throw uploadError;
      }

      const { data } =
        supabase.storage
          .from("member-photos")
          .getPublicUrl(fileName);

      setPage((old) => ({
        ...old,
        image_url: data.publicUrl,
      }));

      setMessage("✅ Image uploaded.");
    } catch (error: any) {
      console.error(error);

      setMessage(
        "❌ Image upload failed: " +
          error.message
      );
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!memberId) {
      setMessage("Member ID ಸಿಗಲಿಲ್ಲ.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const payload = {
        member_id: memberId,
        title: page.title,
        description: page.description,
        image_url: page.image_url,
        phone: page.phone,
        address: page.address,
        website: page.website,
        is_active: page.is_active,
      };

      const { data, error } =
        await supabase
          .from("member_info_page")
          .upsert(payload, {
            onConflict: "member_id",
          })
          .select()
          .single();

      if (error) {
        throw error;
      }

      setPage({
        id: data.id,
        member_id: data.member_id,
        title: data.title || "",
        description: data.description || "",
        image_url: data.image_url || "",
        phone: data.phone || "",
        address: data.address || "",
        website: data.website || "",
        is_active: data.is_active ?? true,
      });

      setMessage(
        "✅ Public Page saved successfully."
      );
    } catch (error: any) {
      console.error(error);

      setMessage(
        "❌ Save failed: " +
          error.message
      );
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish() {
    const newStatus = !page.is_active;

    setPage((old) => ({
      ...old,
      is_active: newStatus,
    }));

    const { error } =
      await supabase
        .from("member_info_page")
        .upsert(
          {
            member_id: page.member_id,
            title: page.title,
            description: page.description,
            image_url: page.image_url,
            phone: page.phone,
            address: page.address,
            website: page.website,
            is_active: newStatus,
          },
          {
            onConflict: "member_id",
          }
        );

    if (error) {
      setPage((old) => ({
        ...old,
        is_active: !newStatus,
      }));

      setMessage(
        "❌ Publish status change failed: " +
          error.message
      );

      return;
    }

    setMessage(
      newStatus
        ? "✅ Public Page Published."
        : "⏸️ Public Page Unpublished."
    );
  }

  function publicUrl() {
    if (typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/public-page?id=${page.member_id}`;
  }

  async function copyUrl() {
    const url = publicUrl();

    if (!url) return;

    await navigator.clipboard.writeText(url);

    setMessage(
      "✅ Public Page link copied."
    );
  }

  function openPublicPage() {
    const url = publicUrl();

    if (!url) return;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8">
          Loading Public Page Editor...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">

      {/* HEADER */}

      <header className="bg-slate-950 text-white">

        <div className="max-w-7xl mx-auto px-5 py-5 flex flex-wrap gap-4 justify-between items-center">

          <div>
            <h1 className="text-2xl font-bold">
              Public Page Editor
            </h1>

            <p className="text-sm text-slate-400 mt-1">
              Member ID: {page.member_id}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <button
              onClick={copyUrl}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl"
            >
              📋 Copy Link
            </button>

            <button
              onClick={openPublicPage}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl"
            >
              👁️ Preview
            </button>

            <button
              onClick={save}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-xl font-semibold disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "💾 Save"}
            </button>

          </div>

        </div>

      </header>

      <div className="max-w-7xl mx-auto p-5">

        {message && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-5 font-semibold">
            {message}
          </div>
        )}

        <div className="grid xl:grid-cols-2 gap-6">

          {/* ================= EDITOR ================= */}

          <section className="bg-white rounded-3xl shadow-sm p-6">

            <h2 className="text-xl font-bold">
              ✏️ Page Content
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Kannada ಅಥವಾ Englishನಲ್ಲಿ ಬೇಕಾದ content ಹಾಕಬಹುದು.
            </p>

            <div className="space-y-5 mt-6">

              {/* TITLE */}

              <div>
                <label className="font-semibold">
                  Page Title
                </label>

                <input
                  value={page.title}
                  onChange={(e) =>
                    setPage({
                      ...page,
                      title: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl p-3 mt-2"
                  placeholder="ಸದಸ್ಯರ ಮಾಹಿತಿ"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="font-semibold">
                  Text / Information
                </label>

                <textarea
                  value={page.description}
                  onChange={(e) =>
                    setPage({
                      ...page,
                      description:
                        e.target.value,
                    })
                  }
                  rows={10}
                  className="w-full border rounded-xl p-3 mt-2 resize-y"
                  placeholder="ನಿಮಗೆ ಬೇಕಾದ ಯಾವುದೇ information ಇಲ್ಲಿ ಬರೆಯಿರಿ..."
                />

                <p className="text-xs text-slate-400 mt-2">
                  ಇಲ್ಲಿ Kannada, English ಮತ್ತು multiple lines
                  text ಹಾಕಬಹುದು.
                </p>
              </div>

              {/* IMAGE */}

              <div>
                <label className="font-semibold">
                  Page Image / Logo
                </label>

                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={(e) => {
                    const file =
                      e.target.files?.[0];

                    if (file) {
                      uploadImage(file);
                    }
                  }}
                  className="w-full border rounded-xl p-3 mt-2"
                />

                {uploading && (
                  <p className="text-sm text-blue-600 mt-2">
                    Uploading image...
                  </p>
                )}

                {page.image_url && (
                  <div className="mt-4">

                    <img
                      src={page.image_url}
                      alt="Public page"
                      className="w-full max-h-56 object-contain bg-slate-100 rounded-2xl"
                    />

                    <button
                      onClick={() =>
                        setPage({
                          ...page,
                          image_url: "",
                        })
                      }
                      className="text-red-600 text-sm mt-2"
                    >
                      Remove Image
                    </button>

                  </div>
                )}
              </div>

              {/* PHONE */}

              <div>
                <label className="font-semibold">
                  Mobile
                </label>

                <input
                  value={page.phone}
                  onChange={(e) =>
                    setPage({
                      ...page,
                      phone: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl p-3 mt-2"
                  placeholder="Mobile Number"
                />
              </div>

              {/* ADDRESS */}

              <div>
                <label className="font-semibold">
                  Address
                </label>

                <textarea
                  value={page.address}
                  onChange={(e) =>
                    setPage({
                      ...page,
                      address: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full border rounded-xl p-3 mt-2"
                  placeholder="ವಿಳಾಸ"
                />
              </div>

              {/* WEBSITE */}

              <div>
                <label className="font-semibold">
                  Website
                </label>

                <input
                  value={page.website}
                  onChange={(e) =>
                    setPage({
                      ...page,
                      website: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl p-3 mt-2"
                  placeholder="https://example.com"
                />
              </div>

            </div>

            {/* PUBLISH */}

            <div className="mt-7 border rounded-2xl p-4">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <h3 className="font-bold">
                    Public Page Status
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    QR scan ಮಾಡಿದಾಗ page ಕಾಣಬೇಕಾದರೆ Publish ಇರಬೇಕು.
                  </p>
                </div>

                <button
                  onClick={togglePublish}
                  className={`px-4 py-2 rounded-xl text-white font-semibold ${
                    page.is_active
                      ? "bg-green-600"
                      : "bg-slate-500"
                  }`}
                >
                  {page.is_active
                    ? "Published"
                    : "Unpublished"}
                </button>

              </div>

            </div>

          </section>

          {/* ================= LIVE PREVIEW ================= */}

          <section className="bg-white rounded-3xl shadow-sm p-6">

            <div className="flex justify-between items-center mb-5">

              <div>
                <h2 className="text-xl font-bold">
                  👁️ Live Preview
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Publicಗೆ ಕಾಣುವ page preview.
                </p>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  page.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {page.is_active
                  ? "PUBLISHED"
                  : "DRAFT"}
              </span>

            </div>

            <div className="border rounded-3xl overflow-hidden bg-slate-100">

              {/* PUBLIC HEADER */}

              <div className="bg-slate-950 text-white p-6 text-center">

                <div className="text-xs text-white/60">
                  OFFICIAL MEMBER PAGE
                </div>

                <h1 className="text-2xl md:text-3xl font-bold mt-2">
                  {page.title ||
                    "ಸದಸ್ಯರ ಮಾಹಿತಿ"}
                </h1>

              </div>

              {/* IMAGE */}

              {page.image_url && (
                <div className="bg-slate-100 p-5 flex justify-center">

                  <img
                    src={page.image_url}
                    alt="Preview"
                    className="max-h-72 max-w-full object-contain rounded-2xl"
                  />

                </div>
              )}

              {/* TEXT */}

              <div className="bg-white p-6">

                {page.description && (
                  <div className="mb-6">

                    <h2 className="font-bold text-lg">
                      ಮಾಹಿತಿ
                    </h2>

                    <p className="mt-3 text-slate-600 leading-7 whitespace-pre-line">
                      {page.description}
                    </p>

                  </div>
                )}

                {/* CONTACT */}

                {(page.phone ||
                  page.address ||
                  page.website) && (

                  <div className="border-t pt-5 space-y-3">

                    {page.phone && (
                      <div className="border rounded-xl p-3">
                        📞 {page.phone}
                      </div>
                    )}

                    {page.address && (
                      <div className="border rounded-xl p-3">
                        📍 {page.address}
                      </div>
                    )}

                    {page.website && (
                      <div className="border rounded-xl p-3 break-all text-blue-600">
                        🌐 {page.website}
                      </div>
                    )}

                  </div>
                )}

                {/* MEMBER ID */}

                <div className="mt-6 bg-slate-950 text-white rounded-2xl p-5 text-center">

                  <div className="text-xs text-white/60">
                    MEMBER ID
                  </div>

                  <div className="font-bold text-xl mt-1">
                    {page.member_id}
                  </div>

                </div>

              </div>

            </div>

          </section>

        </div>

        {/* URL */}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-5">

          <h3 className="font-bold text-blue-800">
            🔗 Public Page URL
          </h3>

          <div className="mt-3 bg-white border rounded-xl p-3 break-all text-sm">
            {publicUrl()}
          </div>

          <p className="text-sm text-blue-700 mt-2">
            ಇದೇ URL ಅನ್ನು ನಿಮ್ಮ PVC QR Code ಬಳಸುತ್ತದೆ.
          </p>

        </div>

      </div>

    </main>
  );
}

export default function PublicPageEditorPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-100 flex items-center justify-center">
          Loading...
        </main>
      }
    >
      <PublicPageEditor />
    </Suspense>
  );
}
