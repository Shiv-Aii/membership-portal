"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function MemberPageContent() {
  const params = useSearchParams();
  const id = params.get("id");

  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      if (!id) {
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
        console.error("Public page error:", error);
      }

      setPage(data);
      setLoading(false);
    }

    loadPage();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8">
          Loading...
        </div>
      </main>
    );
  }

  if (!id) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold">
            Public Member Page
          </h1>

          <p className="mt-3 text-gray-500">
            Invalid member link.
          </p>
        </div>
      </main>
    );
  }

  if (!page) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold">
            Public Page
          </h1>

          <p className="mt-3 text-gray-500">
            ಈ ಸದಸ್ಯರಿಗೆ Public Page ಇನ್ನೂ publish ಆಗಿಲ್ಲ.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {page.image_url && (
            <img
              src={page.image_url}
              alt=""
              className="w-full max-h-[450px] object-cover"
            />
          )}

          <div className="p-7 md:p-10">

            <h1 className="text-3xl md:text-4xl font-bold text-center">
              {page.title || "ನಮ್ಮ ಸಂಸ್ಥೆ"}
            </h1>

            {page.description && (
              <div className="mt-7 text-gray-700 text-lg leading-8 whitespace-pre-line">
                {page.description}
              </div>
            )}

            <div className="mt-8 border-t pt-6 space-y-4">

              {page.phone && (
                <div>
                  📞{" "}
                  <a
                    href={`tel:${page.phone}`}
                    className="text-blue-600"
                  >
                    {page.phone}
                  </a>
                </div>
              )}

              {page.address && (
                <div>
                  📍 {page.address}
                </div>
              )}

              {page.website && (
                <div>
                  🌐{" "}
                  <a
                    href={page.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Website
                  </a>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

export default function MemberPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          Loading...
        </main>
      }
    >
      <MemberPageContent />
    </Suspense>
  );
}
