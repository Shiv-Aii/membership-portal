"use client";

import { Suspense, useEffect, useState } from "react";
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

function MemberPublicContent() {
  const searchParams = useSearchParams();

  const memberId = searchParams.get("id");

  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPublicPage() {
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
        console.error("Public page error:", error);
        setError("Public Page load ಆಗಲಿಲ್ಲ.");
      } else {
        setPage(data);
      }

      setLoading(false);
    }

    loadPublicPage();
  }, [memberId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
          <div className="text-3xl mb-4">⏳</div>

          <h1 className="text-2xl font-bold text-slate-900">
            Loading...
          </h1>

          <p className="text-slate-500 mt-2">
            Public Page ತೆರೆಯುತ್ತಿದೆ
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>

          <h1 className="text-2xl font-bold text-red-600">
            Error
          </h1>

          <p className="text-slate-600 mt-3">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!memberId) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md">
          <div className="text-4xl mb-4">🔗</div>

          <h1 className="text-2xl font-bold text-slate-900">
            Invalid Link
          </h1>

          <p className="text-slate-500 mt-3">
            Member ID ಕಂಡುಬಂದಿಲ್ಲ.
          </p>
        </div>
      </main>
    );
  }

  if (!page) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-2xl">

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

          {/* IMAGE */}

          {page.image_url && (
            <div className="w-full bg-slate-100">

              <img
                src={page.image_url}
                alt={page.title || "Public Page"}
                className="w-full max-h-[450px] object-cover"
              />

            </div>
          )}

          {/* CONTENT */}

          <div className="p-8 md:p-12">

            {/* TITLE */}

            {page.title && (
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                {page.title}
              </h1>
            )}

            {/* DESCRIPTION */}

            {page.description && (
              <div className="mt-6 text-lg leading-8 text-slate-600 whitespace-pre-line">
                {page.description}
              </div>
            )}

            {/* PHONE */}

            {page.phone && (
              <div className="mt-8 p-5 rounded-2xl bg-slate-50">

                <div className="text-sm text-slate-500">
                  ಸಂಪರ್ಕ ಸಂಖ್ಯೆ
                </div>

                <a
                  href={`tel:${page.phone}`}
                  className="font-semibold text-lg text-blue-600"
                >
                  📞 {page.phone}
                </a>

              </div>
            )}

            {/* ADDRESS */}

            {page.address && (
              <div className="mt-4 p-5 rounded-2xl bg-slate-50">

                <div className="text-sm text-slate-500">
                  ವಿಳಾಸ
                </div>

                <div className="font-semibold text-lg text-slate-800">
                  📍 {page.address}
                </div>

              </div>
            )}

            {/* WEBSITE */}

            {page.website && (
              <div className="mt-4">

                <a
                  href={
                    page.website.startsWith("http")
                      ? page.website
                      : `https://${page.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center p-4 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  🌐 Website Open ಮಾಡಿ
                </a>

              </div>
            )}

          </div>

        </div>

      </div>

    </main>
  );
}


/* IMPORTANT:
   useSearchParams ಇರುವ component
   Suspense ಒಳಗೆ ಇರಬೇಕು.
*/

export default function MemberPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-100 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
            <div className="text-3xl mb-3">
              ⏳
            </div>

            <h1 className="text-xl font-bold">
              Loading Public Page...
            </h1>

            <p className="text-slate-500 mt-2">
              ದಯವಿಟ್ಟು ಕಾಯಿರಿ
            </p>
          </div>
        </main>
      }
    >
      <MemberPublicContent />
    </Suspense>
  );
}
