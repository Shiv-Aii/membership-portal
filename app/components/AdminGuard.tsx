"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      const { data, error } =
        await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !data.user) {
        router.replace("/admin/login");
        return;
      }

      setAllowed(true);
      setChecking(false);
    }

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <div className="text-4xl mb-3">
            🔐
          </div>

          <h1 className="text-xl font-bold">
            Checking Admin Access...
          </h1>

          <p className="text-slate-500 mt-2">
            ದಯವಿಟ್ಟು ಕಾಯಿರಿ...
          </p>
        </div>
      </main>
    );
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}
