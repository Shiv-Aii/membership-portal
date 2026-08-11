"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MemberPage({
  params,
}: {
  params: { id: string };
}) {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      const { data, error } = await supabase
        .from("member_info_page")
        .select("*")
        .eq("member_id", params.id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error(error);
      }

      setPage(data);
      setLoading(false);
    }

    loadPage();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg font-semibold">
          Loading...
        </div>
      </main>
    );
  }

  if (!page) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-3">
            ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ
          </h1>

          <p className="text-gray-600">
            ಈ Public Page ಇನ್ನೂ ಸಿದ್ಧವಾಗಿಲ್ಲ.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8 px-4">

      <div className="max-w-3xl mx-auto">

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Image */}
          {page.image_url && (
            <div className="w-full">
              <img
                src={page.image_url}
                alt={page.title || "Public Page"}
                className="w-full max-h-[450px] object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-10">

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
              {page.title}
            </h1>

            {/* Description */}
            {page.description && (
              <div className="text-gray-700 text-lg leading-8 whitespace-pre-line">
                {page.description}
              </div>
            )}

            {/* Contact Section */}
            {(page.phone ||
              page.address ||
              page.website) && (
              <div className="mt-8 border-t pt-6 space-y-4">

                {page.phone && (
                  <div>
                    <b>📞 Phone:</b>{" "}
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
                    <b>📍 Address:</b>
                    <div className="mt-1 text-gray-600 whitespace-pre-line">
                      {page.address}
                    </div>
                  </div>
                )}

                {page.website && (
                  <div>
                    <b>🌐 Website:</b>{" "}
                    <a
                      href={page.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {page.website}
                    </a>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>

      </div>
    </main>
  );
}
