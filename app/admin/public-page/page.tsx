"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import {
  Suspense,
} from "react";

import { supabase } from "@/lib/supabase";

function PublicPageEditor() {

  const params =
    useSearchParams();

  const memberId =
    params.get("id");

  const [form, setForm] =
    useState({
      title: "",
      description: "",
      image_url: "",
      phone: "",
      address: "",
      website: "",
      is_active: true,
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  /* LOAD */

  useEffect(() => {

    async function load() {

      if (!memberId) {
        setLoading(false);
        return;
      }

      const { data } =
        await supabase
          .from(
            "member_info_page"
          )
          .select("*")
          .eq(
            "member_id",
            memberId
          )
          .maybeSingle();

      if (data) {

        setForm({
          title:
            data.title || "",

          description:
            data.description ||
            "",

          image_url:
            data.image_url ||
            "",

          phone:
            data.phone || "",

          address:
            data.address || "",

          website:
            data.website || "",

          is_active:
            data.is_active ??
            true,
        });

      }

      setLoading(false);
    }

    load();

  }, [memberId]);

  function update(
    key: string,
    value: any
  ) {

    setForm(
      (old) => ({
        ...old,
        [key]: value,
      })
    );
  }

  async function save() {

    if (!memberId) {

      setMessage(
        "Member ID missing."
      );

      return;
    }

    setSaving(true);
    setMessage("");

    const { error } =
      await supabase
        .from(
          "member_info_page"
        )
        .upsert(
          {
            member_id:
              memberId,

            title:
              form.title,

            description:
              form.description,

            image_url:
              form.image_url,

            phone:
              form.phone,

            address:
              form.address,

            website:
              form.website,

            is_active:
              form.is_active,

            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "member_id",
          }
        );

    setSaving(false);

    if (error) {

      console.error(error);

      setMessage(
        "Save failed: " +
        error.message
      );

      return;
    }

    setMessage(
      "Public Page Published Successfully ✅"
    );
  }

  if (loading) {

    return (
      <main className="p-10">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-5">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">

          <div>

            <h1 className="text-2xl font-bold">
              Public Page Editor
            </h1>

            <p className="text-slate-500">
              QR scan ಮಾಡಿದಾಗ ಕಾಣಿಸುವ separate page
            </p>

          </div>

          <button
            onClick={save}
            disabled={saving}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "🚀 Save & Publish"}
          </button>

        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-6">

          {/* PREVIEW */}

          <div className="bg-slate-200 rounded-3xl p-5">

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

              {form.image_url && (

                <img
                  src={
                    form.image_url
                  }
                  alt=""
                  className="w-full max-h-[400px] object-cover"
                />

              )}

              <div className="p-7">

                <h2 className="text-3xl font-bold text-center">

                  {form.title ||
                    "ನಿಮ್ಮ Page Title"}

                </h2>

                <div className="mt-6 text-gray-700 whitespace-pre-line leading-8">

                  {form.description ||
                    "ನಿಮ್ಮ information ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ."}

                </div>

                {form.phone && (
                  <p className="mt-6">
                    📞{" "}
                    {form.phone}
                  </p>
                )}

                {form.address && (
                  <p className="mt-3">
                    📍{" "}
                    {form.address}
                  </p>
                )}

                {form.website && (
                  <p className="mt-3">
                    🌐{" "}
                    {form.website}
                  </p>
                )}

              </div>

            </div>

          </div>

          {/* EDIT PANEL */}

          <div className="bg-white rounded-3xl shadow-xl">

            <div className="p-5 border-b">

              <h2 className="font-bold text-lg">
                Page Content
              </h2>

              <p className="text-sm text-slate-500">
                ಈ panel ಮಾತ್ರ scroll ಆಗುತ್ತದೆ.
              </p>

            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5">

              <div className="grid gap-4">

                <div>

                  <label className="font-semibold">
                    Page Title
                  </label>

                  <input
                    value={
                      form.title
                    }
                    onChange={(e) =>
                      update(
                        "title",
                        e.target.value
                      )
                    }
                    className="w-full border rounded-xl p-3 mt-2"
                    placeholder="ನಿಮ್ಮ ಸಂಸ್ಥೆಯ ಹೆಸರು"
                  />

                </div>

                <div>

                  <label className="font-semibold">
                    Text / Description
                  </label>

                  <textarea
                    value={
                      form.description
                    }
                    onChange={(e) =>
                      update(
                        "description",
                        e.target.value
                      )
                    }
                    className="w-full border rounded-xl p-3 mt-2 min-h-[180px]"
                    placeholder="ನಿಮಗೆ ಬೇಕಾದ information ಇಲ್ಲಿ ಬರೆಯಿರಿ..."
                  />

                </div>

                <div>

                  <label className="font-semibold">
                    Image URL
                  </label>

                  <input
                    value={
                      form.image_url
                    }
                    onChange={(e) =>
                      update(
                        "image_url",
                        e.target.value
                      )
                    }
                    className="w-full border rounded-xl p-3 mt-2"
                    placeholder="Image URL"
                  />

                </div>

                <div>

                  <label className="font-semibold">
                    Phone
                  </label>

                  <input
                    value={
                      form.phone
                    }
                    onChange={(e) =>
                      update(
                        "phone",
                        e.target.value
                      )
                    }
                    className="w-full border rounded-xl p-3 mt-2"
                  />

                </div>

                <div>

                  <label className="font-semibold">
                    Address
                  </label>

                  <textarea
                    value={
                      form.address
                    }
                    onChange={(e) =>
                      update(
                        "address",
                        e.target.value
                      )
                    }
                    className="w-full border rounded-xl p-3 mt-2"
                  />

                </div>

                <div>

                  <label className="font-semibold">
                    Website
                  </label>

                  <input
                    value={
                      form.website
                    }
                    onChange={(e) =>
                      update(
                        "website",
                        e.target.value
                      )
                    }
                    className="w-full border rounded-xl p-3 mt-2"
                    placeholder="https://..."
                  />

                </div>

                <label className="flex items-center gap-3 border rounded-xl p-3">

                  <input
                    type="checkbox"
                    checked={
                      form.is_active
                    }
                    onChange={(e) =>
                      update(
                        "is_active",
                        e.target.checked
                      )
                    }
                  />

                  Public Page Active

                </label>

                <button
                  onClick={save}
                  disabled={saving}
                  className="bg-green-600 text-white rounded-xl p-3 font-bold"
                >
                  {saving
                    ? "Saving..."
                    : "💾 Save & Publish"}
                </button>

                {message && (
                  <div className="bg-green-50 text-green-700 rounded-xl p-3">
                    {message}
                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}

export default function PublicPageAdmin() {

  return (
    <Suspense
      fallback={
        <main className="p-10">
          Loading...
        </main>
      }
    >
      <PublicPageEditor />
    </Suspense>
  );
}
