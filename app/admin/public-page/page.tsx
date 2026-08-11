"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Application = {
  id: string;
  name: string | null;
  designation: string | null;
  mobile: string | null;
  village: string | null;
  taluk: string | null;
  district: string | null;
  photo_url: string | null;
};

type PublicPage = {
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
  const searchParams = useSearchParams();

  const applicationId = searchParams.get("id");

  const [member, setMember] = useState<Application | null>(null);
  const [page, setPage] = useState<PublicPage | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!applicationId) {
      setLoading(false);
      return;
    }

    loadData();
  }, [applicationId]);

  async function loadData() {
    if (!applicationId) return;

    setLoading(true);

    const { data: application, error: applicationError } =
      await supabase
        .from("applications")
        .select("*")
        .eq("id", applicationId)
        .single();

    if (applicationError) {
      console.error(applicationError);
      setMessage("Member ಮಾಹಿತಿ ಸಿಗಲಿಲ್ಲ.");
      setLoading(false);
      return;
    }

    setMember(application);

    const { data: publicPage } = await supabase
      .from("member_info_page")
      .select("*")
      .eq("member_id", applicationId)
      .maybeSingle();

    if (publicPage) {
      setPage(publicPage);

      setTitle(publicPage.title || "");
      setDescription(publicPage.description || "");
      setImageUrl(publicPage.image_url || "");
      setPhone(publicPage.phone || "");
      setAddress(publicPage.address || "");
      setWebsite(publicPage.website || "");
    } else {
      setTitle(`${application.name || ""} - Public Page`);
      setDescription(
        `${application.name || ""}\n${application.designation || ""}`
      );
      setImageUrl(application.photo_url || "");
      setPhone(application.mobile || "");

      setAddress(
        [
          application.village,
          application.taluk,
          application.district,
        ]
          .filter(Boolean)
          .join(", ")
      );
    }

    setLoading(false);
  }

  async function uploadImage() {
    if (!imageFile) return imageUrl;

    const extension =
      imageFile.name.split(".").pop() || "jpg";

    const fileName = `public-page/${applicationId}-${Date.now()}.${extension}`;

    const { error } = await supabase.storage
      .from("member-photos")
      .upload(fileName, imageFile, {
        upsert: true,
        contentType: imageFile.type,
      });

    if (error) {
      console.error(error);
      throw new Error("Image upload failed");
    }

    const { data } = supabase.storage
      .from("member-photos")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function savePage() {
    if (!applicationId) {
      setMessage("Member ID ಸಿಗಲಿಲ್ಲ.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const finalImageUrl = await uploadImage();

      const payload = {
        member_id: applicationId,
        title,
        description,
        image_url: finalImageUrl,
        phone,
        address,
        website,
        is_active: page?.is_active ?? true,
      };

      if (page?.id) {
        const { error } = await supabase
          .from("member_info_page")
          .update(payload)
          .eq("id", page.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("member_info_page")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;

        setPage(data);
      }

      setImageUrl(finalImageUrl);

      setMessage(
        "✅ Public Page successfully saved!"
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "❌ Save ಆಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
      );
    }

    setSaving(false);
  }

  async function togglePublish() {
    if (!page?.id) {
      setMessage(
        "ಮೊದಲು Save Public Page ಮಾಡಿ."
      );
      return;
    }

    const newStatus = !page.is_active;

    const { error } = await supabase
      .from("member_info_page")
      .update({
        is_active: newStatus,
      })
      .eq("id", page.id);

    if (error) {
      console.error(error);

      setMessage(
        "Publish status update ಆಗಲಿಲ್ಲ."
      );

      return;
    }

    setPage({
      ...page,
      is_active: newStatus,
    });

    setMessage(
      newStatus
        ? "🟢 Public Page Published!"
        : "🔴 Public Page Unpublished!"
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl">
          Loading...
        </div>
      </main>
    );
  }

  if (!applicationId || !member) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-xl mx-auto bg-white p-10 rounded-3xl shadow-xl text-center">

          <div className="text-5xl mb-4">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold">
            Member ಆಯ್ಕೆ ಆಗಿಲ್ಲ
          </h1>

          <p className="text-slate-500 mt-3">
            Dashboard ನಿಂದ member Public Page ತೆರೆಯಿರಿ.
          </p>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-5">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <h1 className="text-3xl font-bold">
                Public Page Editor
              </h1>

              <p className="text-slate-500 mt-1">
                ಸಾರ್ವಜನಿಕ ಸದಸ್ಯ ಪುಟ
              </p>

            </div>

            <div className="flex gap-2">

              <button
                onClick={savePage}
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "💾 Save Page"}
              </button>

              <button
                onClick={togglePublish}
                className={`px-6 py-3 rounded-xl text-white font-semibold ${
                  page?.is_active
                    ? "bg-red-600"
                    : "bg-green-600"
                }`}
              >
                {page?.is_active
                  ? "🔴 Unpublish"
                  : "🟢 Publish"}
              </button>

            </div>

          </div>

        </div>

        {/* MEMBER INFO */}

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-5">

          <h2 className="text-xl font-bold mb-4">
            Member
          </h2>

          <div className="flex items-center gap-4">

            {member.photo_url && (
              <img
                src={member.photo_url}
                alt={member.name || ""}
                className="w-20 h-20 rounded-2xl object-cover"
              />
            )}

            <div>

              <div className="text-xl font-bold">
                {member.name}
              </div>

              <div className="text-slate-500">
                {member.designation}
              </div>

              <div className="text-sm text-slate-400">
                {member.mobile}
              </div>

            </div>

          </div>

        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* EDITOR */}

          <div className="bg-white rounded-3xl shadow-lg p-6">

            <h2 className="text-xl font-bold mb-5">
              ✏️ Page Content
            </h2>

            <div className="space-y-5">

              {/* TITLE */}

              <div>

                <label className="block font-semibold mb-2">
                  Title / ಶೀರ್ಷಿಕೆ
                </label>

                <input
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="ಉದಾ: ನಮ್ಮ ಸಂಸ್ಥೆ"
                  className="w-full border rounded-xl p-3"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="block font-semibold mb-2">
                  Description / ವಿವರ
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  rows={7}
                  placeholder="ಇಲ್ಲಿ ನಿಮಗೆ ಬೇಕಾದ text ಹಾಕಿ..."
                  className="w-full border rounded-xl p-3 resize-none"
                />

              </div>

              {/* IMAGE */}

              <div>

                <label className="block font-semibold mb-2">
                  Image / Photo
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImageFile(
                      e.target.files?.[0] || null
                    )
                  }
                  className="w-full border rounded-xl p-3"
                />

              </div>

              {/* PHONE */}

              <div>

                <label className="block font-semibold mb-2">
                  Phone / ಮೊಬೈಲ್
                </label>

                <input
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="Mobile Number"
                  className="w-full border rounded-xl p-3"
                />

              </div>

              {/* ADDRESS */}

              <div>

                <label className="block font-semibold mb-2">
                  Address / ವಿಳಾಸ
                </label>

                <textarea
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  rows={3}
                  className="w-full border rounded-xl p-3 resize-none"
                />

              </div>

              {/* WEBSITE */}

              <div>

                <label className="block font-semibold mb-2">
                  Website
                </label>

                <input
                  value={website}
                  onChange={(e) =>
                    setWebsite(e.target.value)
                  }
                  placeholder="https://example.com"
                  className="w-full border rounded-xl p-3"
                />

              </div>

            </div>

          </div>

          {/* LIVE PREVIEW */}

          <div className="bg-white rounded-3xl shadow-lg p-6">

            <h2 className="text-xl font-bold mb-5">
              👁️ Live Preview
            </h2>

            <div className="border rounded-3xl overflow-hidden bg-white">

              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-56 object-cover"
                />
              )}

              <div className="p-6">

                <h1 className="text-2xl font-bold">
                  {title || "Page Title"}
                </h1>

                <p className="mt-4 text-slate-600 whitespace-pre-line">
                  {description ||
                    "ನಿಮ್ಮ description ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ."}
                </p>

                {phone && (
                  <div className="mt-5 p-3 bg-slate-50 rounded-xl">
                    📞 {phone}
                  </div>
                )}

                {address && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                    📍 {address}
                  </div>
                )}

                {website && (
                  <div className="mt-3 p-3 bg-blue-50 text-blue-700 rounded-xl">
                    🌐 {website}
                  </div>
                )}

              </div>

            </div>

            {/* STATUS */}

            <div className="mt-5 p-4 rounded-xl bg-slate-50">

              <div className="font-semibold">
                Public Page Status
              </div>

              <div
                className={`mt-2 font-bold ${
                  page?.is_active
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {page?.is_active
                  ? "🟢 Published"
                  : "🔴 Not Published"}
              </div>

            </div>

          </div>

        </div>

        {/* MESSAGE */}

        {message && (
          <div className="mt-5 bg-white rounded-2xl shadow p-4 text-center font-semibold">
            {message}
          </div>
        )}

      </div>

    </main>
  );
}

export default function PublicPageEditorPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          Loading...
        </main>
      }
    >
      <PublicPageEditor />
    </Suspense>
  );
}
