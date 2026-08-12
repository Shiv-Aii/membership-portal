"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type MemberPage = {
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

export default function MemberPublicPage() {
  const params = useParams();
  const id = params?.id as string;

  const [page, setPage] =
    useState<MemberPage | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadPage() {
      if (!id) return;

      const { data, error } =
        await supabase
          .from("member_info_page")
          .select(
            "id, member_id, title, description, image_url, phone, address, website, is_active"
          )
          .eq("member_id", id)
          .eq("is_active", true)
          .maybeSingle();

      if (error) {
        console.error(error);
      }

      setPage(data);
      setLoading(false);
    }

    loadPage();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-5">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="text-3xl mb-3">
            ⏳
          </div>

          <h1 className="text-xl font-bold">
            Loading...
          </h1>

          <p className="text-slate-500 mt-2">
            Member Public Page ತೆರೆಯಲಾಗುತ್ತಿದೆ
          </p>
        </div>
      </main>
    );
  }

  if (!page) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-5">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md w-full">

          <div className="text-6xl mb-5">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold">
            Public Page
          </h1>

          <p className="mt-3 text-slate-500">
            ಈ ಸದಸ್ಯರಿಗೆ Public Page ಇನ್ನೂ publish ಆಗಿಲ್ಲ.
          </p>

          <div className="mt-5 bg-slate-50 rounded-xl p-4 text-sm">
            Member ID
            <div className="font-bold mt-1">
              {id || "-"}
            </div>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 py-8 px-4">

      <div className="max-w-3xl mx-auto">

        {/* Header */}

        <div className="bg-slate-950 text-white rounded-t-3xl p-6 text-center">

          <div className="text-sm text-white/60">
            OFFICIAL MEMBER PAGE
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mt-2">
            {page.title || "ನಮ್ಮ ಸಂಸ್ಥೆ"}
          </h1>

        </div>

        {/* Main Card */}

        <div className="bg-white rounded-b-3xl shadow-xl overflow-hidden">

          {/* Image */}

          {page.image_url && (
            <div className="bg-slate-100 p-6 flex justify-center">

              <img
                src={page.image_url}
                alt={
                  page.title ||
                  "Member"
                }
                className="max-h-[450px] max-w-full object-contain rounded-2xl"
              />

            </div>
          )}

          {/* Content */}

          <div className="p-7 md:p-10">

            {page.description && (
              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  ಮಾಹಿತಿ
                </h2>

                <p className="mt-3 text-slate-600 text-lg leading-8 whitespace-pre-line">
                  {page.description}
                </p>

              </div>
            )}

            {/* Contact */}

            {(page.phone ||
              page.address ||
              page.website) && (

              <div className="mt-8 border-t pt-6">

                <h2 className="font-bold text-lg mb-4">
                  ಸಂಪರ್ಕ ಮಾಹಿತಿ
                </h2>

                <div className="grid gap-3">

                  {page.phone && (
                    <a
                      href={`tel:${page.phone}`}
                      className="border rounded-2xl p-4 hover:bg-slate-50 transition"
                    >

                      <div className="text-sm text-slate-500">
                        📞 ಮೊಬೈಲ್
                      </div>

                      <div className="font-semibold text-lg text-blue-600 mt-1">
                        {page.phone}
                      </div>

                    </a>
                  )}

                  {page.address && (
                    <div className="border rounded-2xl p-4">

                      <div className="text-sm text-slate-500">
                        📍 ವಿಳಾಸ
                      </div>

                      <div className="font-semibold text-lg mt-1">
                        {page.address}
                      </div>

                    </div>
                  )}

                  {page.website && (
                    <a
                      href={
                        page.website.startsWith(
                          "http"
                        )
                          ? page.website
                          : `https://${page.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border rounded-2xl p-4 hover:bg-slate-50 transition"
                    >

                      <div className="text-sm text-slate-500">
                        🌐 Website
                      </div>

                      <div className="font-semibold text-blue-600 break-all mt-1">
                        {page.website}
                      </div>

                    </a>
                  )}

                </div>

              </div>
            )}

            {/* Member ID */}

            <div className="mt-8 bg-slate-950 text-white rounded-2xl p-6 text-center">

              <div className="text-sm text-white/60">
                MEMBER ID
              </div>

              <div className="text-2xl font-extrabold mt-2 break-all">
                {page.member_id}
              </div>

            </div>

          </div>

        </div>

        {/* Footer */}

        <p className="text-center text-sm text-slate-400 mt-5">
          Official Member Public Page
        </p>

      </div>

    </main>
  );
}
