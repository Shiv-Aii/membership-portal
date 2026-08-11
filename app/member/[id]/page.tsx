"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MemberPublicPage({
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
        .maybeSingle();

      if (!error && data) {
        setPage(data);
      }

      setLoading(false);
    }

    loadPage();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">

        {/* Main Image */}
        {page?.image_url && (
          <img
            src={page.image_url}
            alt="Page"
            className="w-full max-h-[400px] object-cover"
          />
        )}

        <div className="p-8">

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-4">
            {page?.title || "ನಮ್ಮ ಸಂಸ್ಥೆ"}
          </h1>

          {/* Text */}
          <div className="text-gray-700 text-lg leading-8 whitespace-pre-line">
            {page?.content ||
              "ನಮ್ಮ ಸಂಸ್ಥೆಯ ಬಗ್ಗೆ ಮಾಹಿತಿಯನ್ನು ಇಲ್ಲಿ ನೀಡಬಹುದು."}
          </div>

        </div>
      </div>
    </main>
  );
}
