"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!name || !mobile || !email || !password) {
      setMessage("ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಮಾಹಿತಿಯನ್ನು ತುಂಬಿ.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("applications").insert({
      name: name,
      mobile: mobile,
      email: email,
      status: "pending",
    });

    setLoading(false);

    if (error) {
      console.error(error);
      setMessage("Registration failed: " + error.message);
      return;
    }

    setName("");
    setMobile("");
    setEmail("");
    setPassword("");

    setMessage(
      "Registration ಯಶಸ್ವಿಯಾಗಿದೆ! ನಿಮ್ಮ ಅರ್ಜಿ Admin Approval ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ."
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Membership Registration
        </h1>

        <p className="text-center text-gray-500 mb-6">
          ಸದಸ್ಯತ್ವಕ್ಕಾಗಿ ಕೆಳಗಿನ ಮಾಹಿತಿಯನ್ನು ತುಂಬಿ
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="ಪೂರ್ಣ ಹೆಸರು"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="tel"
            placeholder="ಮೊಬೈಲ್ ಸಂಖ್ಯೆ"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg p-3"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {message && (
          <p className="mt-5 text-center font-semibold">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}
