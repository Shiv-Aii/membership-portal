"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

type PageData = {
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

function PublicMemberPage() {
  const searchParams = useSearchParams();
  const memberId = searchParams.get("id");

  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      if (!memberId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("member_info_page")
        .select("*")
        .eq("member_id", memberId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error(error);
      }

      setPage(data);
      setLoading(false);
    }

    loadPage();
  }, [memberId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
          <div className="text-xl font-bold">
            Loading...
          </div>

          <p className="text-slate-500 mt-2">
            Public Page ತೆರೆಯುತ್ತಿದೆ
          </p>
        </div>
      </main>
    );
  }

  if (!memberId) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
          <h1 className="text-2xl font-bold text-red-600">
            Invalid Link
          </h1>

          <p className="mt-3 text-slate-600">
            Public Page ID ಕಂಡುಬಂದಿಲ್ಲ.
          </p>
        </div>
      </main>
    );
  }

  if (!page) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-10 text-center">

          <div className="text-5xl mb-5">
            📄
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Public Page
          </h1>

          <p className="mt-4 text-lg text-slate-500">
            ಈ ಸದಸ್ಯರಿಗೆ Public Page ಇನ್ನೂ publish ಆಗಿಲ್ಲ.
          </p>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">

      <div className="max-w-3xl mx-auto">

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {page.image_url && (
            <div className="w-full bg-slate-100">

              <img
                src={page.image_url}
                alt={page.title || "Public Page"}
                className="w-full max-h-[450px] object-cover"
              />

            </div>
          )}

          <div className="p-8 md:p-12">

            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              {page.title || "Public Page"}
            </h1>

            {page.description && (
              <div className="mt-6 text-lg leading-8 text-slate-600 whitespace-pre-line">
                {page.description}
              </div>
            )}

            <div className="mt-8 space-y-4">

              {page.phone && (
                <div className="p-4 rounded-2xl bg-slate-50">
                  <div className="text-sm text-slate-500">
                    ಸಂಪರ್ಕ ಸಂಖ್ಯೆ
                  </div>

                  <div className="font-semibold text-lg">
                    {page.phone}
                  </div>
                </div>
              )}

              {page.address && (
                <div className="p-4 rounded-2xl bg-slate-50">
                  <div className="text-sm text-slate-500">
                    ವಿಳಾಸ
                  </div>

                  <div className="font-semibold text-lg">
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
                  className="block p-4 rounded-2xl bg-blue-50 text-blue-700 font-semibold"
                >
                  🌐 Website
                </a>
              )}

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}

export default function MemberPage() {
  return <PublicMemberPage />;
}
