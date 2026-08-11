"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type MemberInfo = {
  id: string;
  member_id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  is_active: boolean;
};

function PublicPageContent() {
  const params = useSearchParams();
  const id = params.get("id");

  const [info, setInfo] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    async function loadPage() {
      if (!id) {
        setErrorText("Invalid public page link.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("member_info_page")
        .select("*")
        .eq("member_id", id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error(error);
        setErrorText(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorText(
          "ಈ ಸದಸ್ಯರಿಗೆ Public Page ಇನ್ನೂ ಸಿದ್ಧವಾಗಿಲ್ಲ."
        );
        setLoading(false);
        return;
      }

      setInfo(data as MemberInfo);
      setLoading(false);
    }

    loadPage();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <div className="text-xl font-bold">
            Loading...
          </div>

          <p className="text-slate-500 mt-2">
            Public Page ತೆರೆಯಲಾಗುತ್ತಿದೆ
          </p>
        </div>
      </main>
    );
  }

  if (errorText || !info) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center">

          <div className="text-5xl mb-4">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Public Page
          </h1>

          <p className="text-slate-500 mt-4">
            {errorText}
          </p>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 py-8 px-4">

      <div className="max-w-2xl mx-auto">

        {/* HEADER */}
        <div className="bg-slate-950 text-white rounded-t-3xl p-6 text-center">

          <h1 className="text-2xl font-bold">
            {info.title || "Member Public Page"}
          </h1>

        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-b-3xl shadow-lg overflow-hidden">

          {/* IMAGE */}
          {info.image_url && (
            <div className="w-full bg-slate-100">

              <img
                src={info.image_url}
                alt={info.title || "Member"}
                className="w-full max-h-[420px] object-cover"
              />

            </div>
          )}

          <div className="p-6">

            {/* TITLE */}
            {info.title && (
              <h2 className="text-2xl font-bold text-slate-900">
                {info.title}
              </h2>
            )}

            {/* DESCRIPTION */}
            {info.description && (
              <div className="mt-5">

                <h3 className="font-semibold text-slate-900 mb-2">
                  ಮಾಹಿತಿ
                </h3>

                <p className="text-slate-600 whitespace-pre-wrap leading-7">
                  {info.description}
                </p>

              </div>
            )}

            {/* CONTACT */}
            <div className="mt-6 space-y-3">

              {info.phone && (
                <a
                  href={`tel:${info.phone}`}
                  className="block border rounded-xl p-4 hover:bg-slate-50"
                >
                  <span className="font-semibold">
                    📞 Phone
                  </span>

                  <span className="block text-slate-600 mt-1">
                    {info.phone}
                  </span>
                </a>
              )}

              {info.address && (
                <div className="border rounded-xl p-4">

                  <div className="font-semibold">
                    📍 Address
                  </div>

                  <div className="text-slate-600 mt-1 whitespace-pre-wrap">
                    {info.address}
                  </div>

                </div>
              )}

              {info.website && (
                <a
                  href={
                    info.website.startsWith("http")
                      ? info.website
                      : `https://${info.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border rounded-xl p-4 hover:bg-slate-50"
                >
                  <span className="font-semibold">
                    🌐 Website
                  </span>

                  <span className="block text-blue-600 mt-1 break-all">
                    {info.website}
                  </span>
                </a>
              )}

            </div>

            {/* FOOTER */}
            <div className="border-t mt-8 pt-5 text-center">

              <p className="text-xs text-slate-400">
                Official Public Information Page
              </p>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}

export default function PublicPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-slate-100">
          <p>Loading Public Page...</p>
        </main>
      }
    >
      <PublicPageContent />
    </Suspense>
  );
}
