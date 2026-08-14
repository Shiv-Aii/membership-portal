"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [village, setVillage] = useState("");
  const [taluk, setTaluk] = useState("");
  const [district, setDistrict] = useState("");
  const [mobile, setMobile] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !name ||
      !designation ||
      !village ||
      !taluk ||
      !district ||
      !mobile ||
      !aadhaar ||
      !photo
    ) {
      setMessage("ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಮಾಹಿತಿಯನ್ನು ತುಂಬಿ.");
      return;
    }

    try {
      setBusy(true);
      setMessage("");

      // 1. Upload photo
      const fileExt = photo.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from("member-photos")
        .upload(filePath, photo);

      if (uploadError) {
        throw uploadError;
      }

      // 2. Get public photo URL
      const { data: publicUrlData } = supabase.storage
        .from("member-photos")
        .getPublicUrl(filePath);

      const photoUrl = publicUrlData.publicUrl;

      // 3. Save application
      const { error: insertError } = await supabase
        .from("applications")
        .insert({
          name,
          designation,
          village,
          taluk,
          district,
          mobile,
          aadhaar,
          photo_url: photoUrl,
          status: "pending",
        });

      if (insertError) {
        throw insertError;
      }

      // 4. Success
      setMessage("Registration ಯಶಸ್ವಿಯಾಗಿದೆ! ನಿಮ್ಮ ಅರ್ಜಿ Pending Approval ನಲ್ಲಿ ಇದೆ.");

      setName("");
      setDesignation("");
      setVillage("");
      setTaluk("");
      setDistrict("");
      setMobile("");
      setAadhaar("");
      setPhoto(null);

    } catch (error: any) {
      console.error(error);
      setMessage(`Registration failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-6 md:p-8">

        <h1 className="text-3xl font-bold text-center">
          ಸದಸ್ಯತ್ವ ನೋಂದಣಿ
        </h1>

        <p className="text-center text-slate-500 mt-2 mb-7">
          Membership Registration
        </p>

        <form onSubmit={handleSubmit} className="grid gap-4">

          <input
            type="text"
            placeholder="ಹೆಸರು / Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-xl p-3"
          />

          <input
            type="text"
            placeholder="ಹುದ್ದೆ / Designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className="border rounded-xl p-3"
          />

          <input
            type="text"
            placeholder="ಗ್ರಾಮ / Village"
            value={village}
            onChange={(e) => setVillage(e.target.value)}
            className="border rounded-xl p-3"
          />

          <input
            type="text"
            placeholder="ತಾಲೂಕು / Taluk"
            value={taluk}
            onChange={(e) => setTaluk(e.target.value)}
            className="border rounded-xl p-3"
          />

          <input
            type="text"
            placeholder="ಜಿಲ್ಲೆ / District"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="border rounded-xl p-3"
          />

          <input
            type="tel"
            placeholder="ಮೊಬೈಲ್ ಸಂಖ್ಯೆ / Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="border rounded-xl p-3"
          />

          <input
            type="text"
            inputMode="numeric"
            maxLength={12}
            placeholder="ಆಧಾರ್ ಸಂಖ್ಯೆ / Aadhaar Number"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value)}
            className="border rounded-xl p-3"
          />

          <div>
            <label className="block font-semibold mb-2">
              ಫೋಟೋ / Photo
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setPhoto(e.target.files?.[0] || null)
              }
              className="w-full border rounded-xl p-3"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-bold"
          >
            {busy ? "Submitting..." : "ನೋಂದಣಿ ಮಾಡಿ / Register"}
          </button>

        </form>

        {message && (
          <div className="mt-5 text-center font-semibold">
            {message}
          </div>
        )}

      </div>
    </main>
  );
}
