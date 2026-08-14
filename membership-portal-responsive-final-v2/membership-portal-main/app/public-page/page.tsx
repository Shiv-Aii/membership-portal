"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type PublicPageData = {
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

export default function PublicPage() {
  const [data, setData] = useState<PublicPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPage() {
      try {
        const params = new URLSearchParams(
          window.location.search
        );

        const memberId = params.get("id");

        if (!memberId) {
          setError("Public Page ID ಸಿಗಲಿಲ್ಲ.");
          setLoading(false);
          return;
        }

        const { data: page, error: dbError } =
          await supabase
            .from("member_info_page")
            .select(
              "id, member_id, title, description, image_url, phone, address, website, is_active"
            )
            .eq("member_id", memberId)
            .eq("is_active", true)
            .maybeSingle();

        if (dbError) {
          console.error(dbError);
          setError("Public Page load ಆಗಲಿಲ್ಲ.");
        } else if (!page) {
          setError(
            "ಈ ಸದಸ್ಯರಿಗೆ Public Page ಇನ್ನೂ publish ಆಗಿಲ್ಲ."
          );
        } else {
          setData(page);
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-5">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
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

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-5">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-5">
            ⚠️
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Public Page
          </h1>

          <p className="text-slate-500 mt-4 text-lg">
            {error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="bg-slate-950 text-white rounded-t-3xl p-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold">
            {data.title || "Member Public Page"}
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-b-3xl shadow-xl overflow-hidden">

          {/* Image */}
          {data.image_url && (
            <div className="w-full bg-slate-100 flex justify-center p-6">
              <img
                src={data.image_url}
                alt={data.title || "Member"}
                className="max-h-80 max-w-full object-contain rounded-2xl"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-8">

            {data.description && (
              <div className="mb-7">
                <h2 className="text-lg font-bold text-slate-900 mb-2">
                  ಮಾಹಿತಿ
                </h2>

                <p className="text-slate-600 whitespace-pre-wrap leading-7">
                  {data.description}
                </p>
              </div>
            )}

            <div className="grid gap-4">

              {/* Phone */}
              {data.phone && (
                <a
                  href={`tel:${data.phone}`}
                  className="border rounded-2xl p-4 hover:bg-slate-50"
                >
                  <div className="text-sm text-slate-500">
                    ಮೊಬೈಲ್
                  </div>

                  <div className="font-semibold text-lg">
                    {data.phone}
                  </div>
                </a>
              )}

              {/* Address */}
              {data.address && (
                <div className="border rounded-2xl p-4">
                  <div className="text-sm text-slate-500">
                    ವಿಳಾಸ
                  </div>

                  <div className="font-semibold text-lg">
                    {data.address}
                  </div>
                </div>
              )}

              {/* Website */}
              {data.website && (
                <a
                  href={
                    data.website.startsWith("http")
                      ? data.website
                      : `https://${data.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border rounded-2xl p-4 hover:bg-slate-50"
                >
                  <div className="text-sm text-slate-500">
                    Website
                  </div>

                  <div className="font-semibold text-lg text-blue-600 break-all">
                    {data.website}
                  </div>
                </a>
              )}

            </div>

            {/* Member ID */}
            <div className="mt-8 bg-slate-50 rounded-2xl p-5 text-center">
              <div className="text-sm text-slate-500">
                Member ID
              </div>

              <div className="text-xl font-bold mt-1 break-all">
                {data.member_id}
              </div>
            </div>

          </div>
        </div>

        <p className="text-center text-sm text-slate-400 mt-5">
          Official Member Public Page
        </p>

      </div>
    </main>
  );
}
