"use client";

import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

type PageData = {
  id?: string;
  member_id: string;

  title: string;
  description: string;

  logo_url: string;
  image_url: string;
  cover_image_url: string;

  image_2_url: string;
  image_3_url: string;
  image_4_url: string;

  section_title_1: string;
  section_text_1: string;

  section_title_2: string;
  section_text_2: string;

  section_title_3: string;
  section_text_3: string;

  phone: string;
  address: string;
  website: string;

  is_active: boolean;
};

const emptyPage: PageData = {
  member_id: "",

  title: "ರೈತರಿಗಾಗಿ ಕೃಷಿ ಮಾಹಿತಿ ಕೇಂದ್ರ",
  description:
    "ರೈತರಿಗೆ ಉಪಯುಕ್ತವಾದ ಕೃಷಿ ಮಾಹಿತಿ, ಬೆಳೆ ಸಲಹೆಗಳು, ಸರ್ಕಾರದ ಯೋಜನೆಗಳು ಮತ್ತು ಕೃಷಿ ಸಂಬಂಧಿತ ಮಾಹಿತಿಯನ್ನು ಇಲ್ಲಿ ಪಡೆಯಿರಿ.",

  logo_url: "",
  image_url: "",
  cover_image_url: "",

  image_2_url: "",
  image_3_url: "",
  image_4_url: "",

  section_title_1: "🌱 ರೈತರಿಗೆ ಉಪಯುಕ್ತ ಮಾಹಿತಿ",
  section_text_1: "",

  section_title_2: "🚜 ಕೃಷಿ ಮತ್ತು ಯಂತ್ರೋಪಕರಣ ಮಾಹಿತಿ",
  section_text_2: "",

  section_title_3: "🌾 ಬೆಳೆ ಮತ್ತು ಕೃಷಿ ಸಲಹೆಗಳು",
  section_text_3: "",

  phone: "",
  address: "",
  website: "",

  is_active: true,
};

function PublicPageEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const memberId = searchParams.get("id");

  const [page, setPage] = useState<PageData>(emptyPage);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        router.replace("/admin/login");
        return;
      }

      if (!memberId) {
        setMessage("Member ID ಸಿಗಲಿಲ್ಲ.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
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

          logo_url: data.logo_url || "",
          image_url: data.image_url || "",
          cover_image_url: data.cover_image_url || "",

          image_2_url: data.image_2_url || "",
          image_3_url: data.image_3_url || "",
          image_4_url: data.image_4_url || "",

          section_title_1: data.section_title_1 || "",
          section_text_1: data.section_text_1 || "",

          section_title_2: data.section_title_2 || "",
          section_text_2: data.section_text_2 || "",

          section_title_3: data.section_title_3 || "",
          section_text_3: data.section_text_3 || "",

          phone: data.phone || "",
          address: data.address || "",
          website: data.website || "",

          is_active: data.is_active ?? true,
        });
      } else {
        setPage({
          ...emptyPage,
          member_id: memberId,
        });
      }

      setLoading(false);
    }

    load();
  }, [memberId, router]);

  async function uploadImage(
    file: File,
    field:
      | "logo_url"
      | "image_url"
      | "cover_image_url"
      | "image_2_url"
      | "image_3_url"
      | "image_4_url"
  ) {
    if (!memberId) return;

    try {
      setUploading(true);
      setMessage("");

      const extension = file.name.split(".").pop() || "jpg";

      const fileName =
        `farmer-page-${memberId}-${field}-${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("member-photos")
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("member-photos")
        .getPublicUrl(fileName);

      setPage((old) => ({
        ...old,
        [field]: data.publicUrl,
      }));

      setMessage("✅ Image uploaded successfully.");
    } catch (error: any) {
      console.error(error);

      setMessage(
        "❌ Image upload failed: " +
          (error?.message || "Unknown error")
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

        logo_url: page.logo_url,
        image_url: page.image_url,
        cover_image_url: page.cover_image_url,

        image_2_url: page.image_2_url,
        image_3_url: page.image_3_url,
        image_4_url: page.image_4_url,

        section_title_1: page.section_title_1,
        section_text_1: page.section_text_1,

        section_title_2: page.section_title_2,
        section_text_2: page.section_text_2,

        section_title_3: page.section_title_3,
        section_text_3: page.section_text_3,

        phone: page.phone,
        address: page.address,
        website: page.website,

        is_active: page.is_active,
      };

      const { data, error } = await supabase
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

        logo_url: data.logo_url || "",
        image_url: data.image_url || "",
        cover_image_url: data.cover_image_url || "",

        image_2_url: data.image_2_url || "",
        image_3_url: data.image_3_url || "",
        image_4_url: data.image_4_url || "",

        section_title_1: data.section_title_1 || "",
        section_text_1: data.section_text_1 || "",

        section_title_2: data.section_title_2 || "",
        section_text_2: data.section_text_2 || "",

        section_title_3: data.section_title_3 || "",
        section_text_3: data.section_text_3 || "",

        phone: data.phone || "",
        address: data.address || "",
        website: data.website || "",

        is_active: data.is_active ?? true,
      });

      setMessage("✅ Farmer Information Page saved successfully.");
    } catch (error: any) {
      console.error(error);

      setMessage(
        "❌ Save failed: " +
          (error?.message || "Unknown error")
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

    const { error } = await supabase
      .from("member_info_page")
      .upsert(
        {
          member_id: page.member_id,

          title: page.title,
          description: page.description,

          logo_url: page.logo_url,
          image_url: page.image_url,
          cover_image_url: page.cover_image_url,

          image_2_url: page.image_2_url,
          image_3_url: page.image_3_url,
          image_4_url: page.image_4_url,

          section_title_1: page.section_title_1,
          section_text_1: page.section_text_1,

          section_title_2: page.section_title_2,
          section_text_2: page.section_text_2,

          section_title_3: page.section_title_3,
          section_text_3: page.section_text_3,

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
        ? "✅ Farmer Information Page Published."
        : "⏸️ Farmer Information Page Unpublished."
    );
  }

  function publicUrl() {
    if (typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/public-page/view?id=${page.member_id}`;
  }

  async function copyUrl() {
    const url = publicUrl();

    if (!url) return;

    await navigator.clipboard.writeText(url);

    setMessage("✅ Public Page link copied.");
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

  function shareWhatsApp() {
    const url = publicUrl();

    if (!url) return;

    const text =
      "🌾 ರೈತರಿಗೆ ಉಪಯುಕ್ತ ಕೃಷಿ ಮಾಹಿತಿಗಾಗಿ ಈ Public Page ನೋಡಿ:\n\n" +
      url;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function ImageUploader({
    label,
    field,
    value,
  }: {
    label: string;
    field:
      | "logo_url"
      | "image_url"
      | "cover_image_url"
      | "image_2_url"
      | "image_3_url"
      | "image_4_url";
    value: string;
  }) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-2xl p-4">
        <label className="font-bold text-green-900">
          {label}
        </label>

        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              uploadImage(file, field);
            }
          }}
          className="w-full bg-white border rounded-xl p-3 mt-2"
        />

        {value && (
          <div className="mt-4">
            <img
              src={value}
              alt={label}
              className="w-full max-h-52 object-contain rounded-2xl bg-white border"
            />

            <button
              type="button"
              onClick={() =>
                setPage((old) => ({
                  ...old,
                  [field]: "",
                }))
              }
              className="text-red-600 text-sm font-semibold mt-2"
            >
              Remove Image
            </button>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-5xl mb-3">🌾</div>
          <div className="font-bold text-green-800">
            Loading Farmer Information...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f8ef]">

      {/* HEADER */}
      <header className="bg-green-950 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>
              <div className="text-2xl font-black">
                🌾 ರೈತರ ಮಾಹಿತಿ ಕೇಂದ್ರ
              </div>

              <div className="text-green-200 text-sm mt-1">
                Farmer Information Public Website
              </div>
            </div>

            <div className="flex flex-wrap gap-2">

              <button
                onClick={copyUrl}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl font-semibold"
              >
                📋 Copy Link
              </button>

              <button
                onClick={shareWhatsApp}
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-xl font-bold"
              >
                💬 WhatsApp
              </button>

              <button
                onClick={openPublicPage}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-bold"
              >
                👁️ Preview
              </button>

              <button
                onClick={save}
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-xl font-bold disabled:opacity-50"
              >
                {saving ? "Saving..." : "💾 Save"}
              </button>

            </div>
          </div>

        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-6">

        {/* MESSAGE */}
        {message && (
          <div className="bg-white border border-green-200 rounded-2xl shadow-sm p-4 mb-6 font-semibold text-green-800">
            {message}
          </div>
        )}

        <div className="grid xl:grid-cols-2 gap-6">

          {/* ================= EDITOR ================= */}

          <section className="bg-white rounded-3xl shadow-lg border border-green-100 overflow-hidden">

            <div className="bg-gradient-to-r from-green-800 to-green-600 text-white p-6">

              <h2 className="text-2xl font-black">
                ✏️ Website Editor
              </h2>

              <p className="text-green-100 text-sm mt-1">
                ರೈತರಿಗೆ ಬೇಕಾದ text, photos ಮತ್ತು information ಇಲ್ಲಿ edit ಮಾಡಿ.
              </p>

            </div>

            <div className="p-5 space-y-7">

              {/* MAIN TITLE */}

              <div>
                <label className="font-bold text-green-900">
                  🌾 Main Website Title
                </label>

                <input
                  value={page.title}
                  onChange={(e) =>
                    setPage({
                      ...page,
                      title: e.target.value,
                    })
                  }
                  className="w-full border-2 border-green-100 focus:border-green-500 outline-none rounded-xl p-3 mt-2"
                  placeholder="ರೈತರಿಗಾಗಿ ಕೃಷಿ ಮಾಹಿತಿ ಕೇಂದ್ರ"
                />
              </div>

              {/* MAIN DESCRIPTION */}

              <div>
                <label className="font-bold text-green-900">
                  📢 Main Information
                </label>

                <textarea
                  value={page.description}
                  onChange={(e) =>
                    setPage({
                      ...page,
                      description: e.target.value,
                    })
                  }
                  rows={6}
                  className="w-full border-2 border-green-100 focus:border-green-500 outline-none rounded-xl p-3 mt-2 resize-y"
                  placeholder="ರೈತರಿಗೆ ಬೇಕಾದ ಮುಖ್ಯ ಮಾಹಿತಿ..."
                />
              </div>

              {/* IMAGES */}

              <div>

                <h3 className="text-xl font-black text-green-900 mb-4">
                  🖼️ Website Images
                </h3>

                <div className="space-y-4">

                  <ImageUploader
                    label="🌾 Logo"
                    field="logo_url"
                    value={page.logo_url}
                  />

                  <ImageUploader
                    label="🚜 Main Farmer / Tractor Cover Image"
                    field="cover_image_url"
                    value={page.cover_image_url}
                  />

                  <ImageUploader
                    label="📸 Main Information Image"
                    field="image_url"
                    value={page.image_url}
                  />

                  <ImageUploader
                    label="📸 Additional Image 2"
                    field="image_2_url"
                    value={page.image_2_url}
                  />

                  <ImageUploader
                    label="📸 Additional Image 3"
                    field="image_3_url"
                    value={page.image_3_url}
                  />

                  <ImageUploader
                    label="📸 Additional Image 4"
                    field="image_4_url"
                    value={page.image_4_url}
                  />

                </div>
              </div>

              {/* SECTION 1 */}

              <div className="border-2 border-green-100 rounded-2xl p-4">

                <h3 className="font-black text-lg text-green-900">
                  🌱 Information Section 1
                </h3>

                <input
                  value={page.section_title_1}
                  onChange={(e) =>
                    setPage({
                      ...page,
                      section_title_1: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl p-3 mt-3"
                  placeholder="Section Title"
                />

                <textarea
                  value={page.section_text_1}
                  onChange={(e) =>
                    setPage({
                      ...page,
                      section_text_1: e.target.value,
                    })
                  }
                  rows={6}
                  className="w-full border rounded-xl p-3 mt-3 resize-y"
                  placeholder="ಈ sectionನಲ್ಲಿ ರೈತರಿಗೆ ಬೇಕಾದ ಮಾಹಿತಿ ಬರೆಯಿರಿ..."
                />

              </div>

              {/* SECTION 2 */}

              <div className="border-2 border-green-100 rounded-2xl p-4">

                <h3 className="font-black text-lg text-green-900">
                  🚜 Information Section 2
                </h3>

                <input
                  value={page.section_title_2}
                  onChange={(e) =>
                    setPage({
                      ...page,
                      section_title_2: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl p-3 mt-3"
                  placeholder="Section Title"
                />

                <textarea
                  value={page.section_text_2}
                  onChange={(e) =>
                    setPage({
                      ...page,
                      section_text_2: e.target.value,
                    })
                  }
                  rows={6}
                  className="w-full border rounded-xl p-3 mt-3 resize-y"
                  placeholder="ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ, ಟ್ರ್ಯಾಕ್ಟರ್ ಅಥವಾ ಬೇರೆ ಮಾಹಿತಿ..."
                />

              </div>

              {/* SECTION 3 */}

              <div className="border-2 border-green-100 rounded-2xl p-4">

                <h3 className="font-black text-lg text-green-900">
                  🌾 Information Section 3
                </h3>

                <input
                  value={page.section_title_3}
                  onChange={(e) =>
                    setPage({
                      ...page,
                      section_title_3: e.target.value,
                    })
                  }
                  className="w-full border rounded-xl p-3 mt-3"
                  placeholder="Section Title"
                />

                <textarea
                  value={page.section_text_3}
                  onChange={(e) =>
                    setPage({
                      ...page,
                      section_text_3: e.target.value,
                    })
                  }
                  rows={6}
                  className="w-full border rounded-xl p-3 mt-3 resize-y"
                  placeholder="ಬೆಳೆ, ಕೃಷಿ ಸಲಹೆ ಅಥವಾ ಯೋಜನೆಗಳ ಮಾಹಿತಿ..."
                />

              </div>

              {/* CONTACT */}

              <div>

                <h3 className="text-xl font-black text-green-900 mb-4">
                  📞 Contact Information
                </h3>

                <div className="space-y-4">

                  <input
                    value={page.phone}
                    onChange={(e) =>
                      setPage({
                        ...page,
                        phone: e.target.value,
                      })
                    }
                    className="w-full border rounded-xl p-3"
                    placeholder="📞 Mobile Number"
                  />

                  <textarea
                    value={page.address}
                    onChange={(e) =>
                      setPage({
                        ...page,
                        address: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full border rounded-xl p-3 resize-y"
                    placeholder="📍 Address"
                  />

                  <input
                    value={page.website}
                    onChange={(e) =>
                      setPage({
                        ...page,
                        website: e.target.value,
                      })
                    }
                    className="w-full border rounded-xl p-3"
                    placeholder="🌐 Website URL"
                  />

                </div>

              </div>

              {/* PUBLISH */}

              <div className="bg-green-50 border border-green-200 rounded-2xl p-5">

                <div className="flex items-center justify-between gap-4">

                  <div>
                    <h3 className="font-black text-green-900">
                      🌐 Website Status
                    </h3>

                    <p className="text-sm text-green-700 mt-1">
                      Publicಗೆ website ಕಾಣಬೇಕಾದರೆ Published ಇರಬೇಕು.
                    </p>
                  </div>

                  <button
                    onClick={togglePublish}
                    className={`px-5 py-3 rounded-xl text-white font-black ${
                      page.is_active
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-500 hover:bg-gray-600"
                    }`}
                  >
                    {page.is_active
                      ? "✓ Published"
                      : "⏸ Unpublished"}
                  </button>

                </div>

              </div>

            </div>

          </section>

          {/* ================= LIVE PREVIEW ================= */}

          <section className="bg-white rounded-3xl shadow-lg border border-green-100 overflow-hidden">

            <div className="p-5 border-b bg-white">

              <div className="flex justify-between items-center">

                <div>
                  <h2 className="text-2xl font-black text-green-900">
                    👁️ Live Preview
                  </h2>

                  <p className="text-sm text-gray-500">
                    ರೈತರಿಗೆ Publicನಲ್ಲಿ ಕಾಣುವ website.
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    page.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {page.is_active ? "PUBLISHED" : "DRAFT"}
                </span>

              </div>

            </div>

            {/* PUBLIC WEBSITE PREVIEW */}

            <div className="bg-[#eef6e8] p-3 md:p-5">

              <div className="max-w-xl mx-auto bg-white rounded-[28px] overflow-hidden shadow-2xl">

                {/* HERO */}

                <div
                  className="relative min-h-[330px] bg-gradient-to-br from-green-950 via-green-800 to-green-600"
                  style={
                    page.cover_image_url
                      ? {
                          backgroundImage: `linear-gradient(rgba(0,50,20,.65), rgba(0,70,30,.7)), url(${page.cover_image_url})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                >

                  <div className="absolute inset-0 opacity-20 text-8xl flex items-center justify-center">
                    🚜
                  </div>

                  <div className="relative z-10 p-7 text-center text-white">

                    {page.logo_url && (
                      <img
                        src={page.logo_url}
                        alt="Logo"
                        className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-white shadow-xl bg-white"
                      />
                    )}

                    {!page.logo_url && (
                      <div className="w-24 h-24 mx-auto rounded-full bg-white flex items-center justify-center text-5xl shadow-xl">
                        🌾
                      </div>
                    )}

                    <div className="mt-5 text-sm font-bold text-green-100">
                      🌾 FARMER INFORMATION CENTER
                    </div>

                    <h1 className="text-3xl font-black mt-2 leading-tight">
                      {page.title ||
                        "ರೈತರಿಗಾಗಿ ಕೃಷಿ ಮಾಹಿತಿ ಕೇಂದ್ರ"}
                    </h1>

                    <div className="mt-4 flex justify-center gap-2 text-3xl">
                      🌱 🚜 🌾
                    </div>

                  </div>

                </div>

                {/* MAIN DESCRIPTION */}

                {page.description && (
                  <div className="p-6">

                    <div className="bg-green-50 border border-green-100 rounded-2xl p-5">

                      <h2 className="text-xl font-black text-green-900">
                        📢 ಪ್ರಮುಖ ಮಾಹಿತಿ
                      </h2>

                      <p className="mt-3 text-gray-700 leading-7 whitespace-pre-line">
                        {page.description}
                      </p>

                    </div>

                  </div>
                )}

                {/* MAIN IMAGE */}

                {page.image_url && (
                  <div className="px-6 pb-6">

                    <img
                      src={page.image_url}
                      alt="Agriculture"
                      className="w-full max-h-80 object-cover rounded-2xl shadow"
                    />

                  </div>
                )}

                {/* SECTION 1 */}

                {(page.section_title_1 ||
                  page.section_text_1) && (

                  <div className="px-6 pb-6">

                    <div className="border border-green-100 rounded-2xl overflow-hidden">

                      <div className="bg-green-700 text-white p-4">

                        <h2 className="text-xl font-black">
                          {page.section_title_1}
                        </h2>

                      </div>

                      {page.section_text_1 && (
                        <div className="p-5 text-gray-700 leading-7 whitespace-pre-line">
                          {page.section_text_1}
                        </div>
                      )}

                    </div>

                  </div>
                )}

                {/* IMAGE 2 */}

                {page.image_2_url && (
                  <div className="px-6 pb-6">

                    <img
                      src={page.image_2_url}
                      alt="Agriculture information"
                      className="w-full max-h-72 object-cover rounded-2xl"
                    />

                  </div>
                )}

                {/* SECTION 2 */}

                {(page.section_title_2 ||
                  page.section_text_2) && (

                  <div className="px-6 pb-6">

                    <div className="border border-orange-100 rounded-2xl overflow-hidden">

                      <div className="bg-orange-500 text-white p-4">

                        <h2 className="text-xl font-black">
                          {page.section_title_2}
                        </h2>

                      </div>

                      {page.section_text_2 && (
                        <div className="p-5 text-gray-700 leading-7 whitespace-pre-line">
                          {page.section_text_2}
                        </div>
                      )}

                    </div>

                  </div>
                )}

                {/* IMAGE 3 */}

                {page.image_3_url && (
                  <div className="px-6 pb-6">

                    <img
                      src={page.image_3_url}
                      alt="Farmer"
                      className="w-full max-h-72 object-cover rounded-2xl"
                    />

                  </div>
                )}

                {/* SECTION 3 */}

                {(page.section_title_3 ||
                  page.section_text_3) && (

                  <div className="px-6 pb-6">

                    <div className="border border-blue-100 rounded-2xl overflow-hidden">

                      <div className="bg-blue-700 text-white p-4">

                        <h2 className="text-xl font-black">
                          {page.section_title_3}
                        </h2>

                      </div>

                      {page.section_text_3 && (
                        <div className="p-5 text-gray-700 leading-7 whitespace-pre-line">
                          {page.section_text_3}
                        </div>
                      )}

                    </div>

                  </div>
                )}

                {/* IMAGE 4 */}

                {page.image_4_url && (
                  <div className="px-6 pb-6">

                    <img
                      src={page.image_4_url}
                      alt="Farm"
                      className="w-full max-h-72 object-cover rounded-2xl"
                    />

                  </div>
                )}

                {/* CONTACT */}

                {(page.phone ||
                  page.address ||
                  page.website) && (

                  <div className="p-6 bg-green-50">

                    <h2 className="text-xl font-black text-green-900 mb-4">
                      📞 ಸಂಪರ್ಕ
                    </h2>

                    <div className="space-y-3">

                      {page.phone && (
                        <a
                          href={`tel:${page.phone}`}
                          className="block bg-white border border-green-200 rounded-xl p-4 font-bold text-green-800"
                        >
                          📞 Call Now
                          <div className="text-sm text-gray-500 mt-1">
                            {page.phone}
                          </div>
                        </a>
                      )}

                      {page.address && (
                        <div className="bg-white border border-green-200 rounded-xl p-4">
                          <div className="font-bold text-green-800">
                            📍 Address
                          </div>

                          <div className="text-gray-600 mt-1 whitespace-pre-line">
                            {page.address}
                          </div>
                        </div>
                      )}

                      {page.website && (
                        <a
                          href={
                            page.website.startsWith("http")
                              ? page.website
                              : `https://${page.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-white border border-green-200 rounded-xl p-4 font-bold text-blue-700 break-all"
                        >
                          🌐 Website
                          <div className="text-sm text-gray-500 mt-1">
                            {page.website}
                          </div>
                        </a>
                      )}

                    </div>

                  </div>
                )}

                {/* WHATSAPP */}

                <div className="p-6 bg-white">

                  <button
                    onClick={shareWhatsApp}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg"
                  >
                    💬 WhatsAppನಲ್ಲಿ Share ಮಾಡಿ
                  </button>

                </div>

                {/* FOOTER */}

                <div className="bg-green-950 text-white text-center p-6">

                  <div className="text-3xl mb-2">
                    🌾 🚜 🌱
                  </div>

                  <div className="font-black">
                    ರೈತರಿಗಾಗಿ • ಕೃಷಿಗಾಗಿ • ನಮ್ಮ ನಾಡಿಗಾಗಿ
                  </div>

                  <div className="text-green-300 text-xs mt-2">
                    Farmer Information Public Website
                  </div>

                </div>

              </div>

            </div>

          </section>

        </div>

        {/* PUBLIC URL */}

        <div className="mt-6 bg-green-50 border border-green-200 rounded-3xl p-5">

          <h3 className="font-black text-green-900 text-lg">
            🔗 Public Website Link
          </h3>

          <div className="mt-3 bg-white border rounded-xl p-4 break-all text-sm">
            {publicUrl()}
          </div>

          <div className="flex flex-wrap gap-3 mt-4">

            <button
              onClick={copyUrl}
              className="bg-green-700 text-white px-5 py-3 rounded-xl font-bold"
            >
              📋 Copy Link
            </button>

            <button
              onClick={shareWhatsApp}
              className="bg-green-500 text-white px-5 py-3 rounded-xl font-bold"
            >
              💬 WhatsApp Share
            </button>

            <button
              onClick={openPublicPage}
              className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold"
            >
              👁️ Open Website
            </button>

          </div>

          <p className="text-sm text-green-700 mt-3">
            ಈ link ಅನ್ನು QR Codeನಲ್ಲಿ ಬಳಸಬಹುದು.
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
        <main className="min-h-screen bg-green-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            🌾 Loading...
          </div>
        </main>
      }
    >
      <PublicPageEditor />
    </Suspense>
  );
}
