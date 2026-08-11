"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function updatePassword() {
    setMessage("");

    if (!password || !confirmPassword) {
      setMessage("Please enter both passwords.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    alert("Password updated successfully.");

    await supabase.auth.signOut();

    router.replace("/admin/login");
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-white rounded-3xl p-7 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-800">
          Reset Admin Password
        </h1>

        <p className="text-slate-500 mt-2">
          ಹೊಸ Admin password ಅನ್ನು ಇಲ್ಲಿ set ಮಾಡಿ
        </p>

        {!ready && (
          <div className="mt-5 p-4 rounded-xl bg-blue-50 text-blue-700 text-sm">
            Password recovery session checking...
          </div>
        )}

        {ready && (
          <div className="grid gap-4 mt-6">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded-xl p-3"
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border rounded-xl p-3"
            />

            <button
              onClick={updatePassword}
              disabled={loading}
              className="bg-blue-600 text-white rounded-xl p-3 font-semibold disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}

        {message && (
          <div className="mt-5 p-4 rounded-xl bg-red-50 text-red-700 text-sm">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
