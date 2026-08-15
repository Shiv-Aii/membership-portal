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
  const [photoPreview, setPhotoPreview] = useState("");

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setPhoto(null);
      setPhotoPreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("ದಯವಿಟ್ಟು image/photo file ಮಾತ್ರ ಆಯ್ಕೆ ಮಾಡಿ.");
      setMessageType("error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("ಫೋಟೋ 5MB ಗಿಂತ ಕಡಿಮೆ ಇರಬೇಕು.");
      setMessageType("error");
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setMessage("");
    setMessageType("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    // Required fields
    if (
      !name.trim() ||
      !designation.trim() ||
      !village.trim() ||
      !taluk.trim() ||
      !district.trim() ||
      !mobile.trim() ||
      !aadhaar.trim() ||
      !photo
    ) {
      setMessage("ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಮಾಹಿತಿಯನ್ನು ತುಂಬಿ.");
      setMessageType("error");
      return;
    }

    // Mobile validation
    const cleanMobile = mobile.replace(/\D/g, "");

    if (cleanMobile.length !== 10) {
      setMessage("ದಯವಿಟ್ಟು ಸರಿಯಾದ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.");
      setMessageType("error");
      return;
    }

    // Aadhaar validation
    const cleanAadhaar = aadhaar.replace(/\D/g, "");

    if (cleanAadhaar.length !== 12) {
      setMessage("ದಯವಿಟ್ಟು ಸರಿಯಾದ 12 ಅಂಕಿಯ ಆಧಾರ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.");
      setMessageType("error");
      return;
    }

    try {
      setBusy(true);

      // 1. Upload photo
      const fileExt = photo.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("member-photos")
        .upload(fileName, photo);

      if (uploadError) {
        throw uploadError;
      }

      // 2. Get photo URL
      const { data: publicUrlData } = supabase.storage
        .from("member-photos")
        .getPublicUrl(fileName);

      const photoUrl = publicUrlData.publicUrl;

      // 3. Save application
      const { error: insertError } = await supabase
        .from("applications")
        .insert({
          name: name.trim(),
          designation: designation.trim(),
          village: village.trim(),
          taluk: taluk.trim(),
          district: district.trim(),
          mobile: cleanMobile,
          aadhaar: cleanAadhaar,
          photo_url: photoUrl,
          status: "pending",
        });

      if (insertError) {
        throw insertError;
      }

      // 4. Success
      setMessage(
        "ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ! ನಿಮ್ಮ ಅರ್ಜಿ ಪರಿಶೀಲನೆಗಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ."
      );
      setMessageType("success");

      // Reset form
      setName("");
      setDesignation("");
      setVillage("");
      setTaluk("");
      setDistrict("");
      setMobile("");
      setAadhaar("");
      setPhoto(null);
      setPhotoPreview("");

      // Reset file input
      const fileInput = document.getElementById(
        "photo"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error: any) {
      console.error(error);

      setMessage(
        error?.message
          ? `Registration failed: ${error.message}`
          : "ನೋಂದಣಿ ಮಾಡುವಾಗ ಸಮಸ್ಯೆ ಉಂಟಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
      );

      setMessageType("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-emerald-50 px-4 py-6 md:py-10">
      <div className="mx-auto w-full max-w-2xl">

        {/* Header */}
        <div className="mb-5 overflow-hidden rounded-3xl bg-gradient-to-r from-green-700 to-emerald-600 p-6 text-center text-white shadow-lg">
          <div className="text-5xl mb-3">🌾</div>

          <h1 className="text-2xl font-extrabold md:text-3xl">
            ರೈತ ಸದಸ್ಯತ್ವ ನೋಂದಣಿ
          </h1>

          <p className="mt-2 text-sm font-medium text-green-50 md:text-base">
            Farmer Membership Registration
          </p>

          <div className="mx-auto mt-4 max-w-md rounded-2xl bg-white/15 px-4 py-3 text-sm">
            ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ಸರಿಯಾಗಿ ಭರ್ತಿ ಮಾಡಿ
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-green-100 md:p-8">

          {/* Info */}
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4">
            <div className="flex gap-3">
              <div className="text-2xl">🧑‍🌾</div>

              <div>
                <h2 className="font-bold text-green-800">
                  ಸದಸ್ಯತ್ವಕ್ಕಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ
                </h2>

                <p className="mt-1 text-sm leading-6 text-green-700">
                  ಕೆಳಗಿನ ಎಲ್ಲಾ ಮಾಹಿತಿಯನ್ನು ಸರಿಯಾಗಿ ನಮೂದಿಸಿ. ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು
                  ಪರಿಶೀಲಿಸಿದ ನಂತರ ಸದಸ್ಯತ್ವವನ್ನು ಅನುಮೋದಿಸಲಾಗುತ್ತದೆ.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Personal Information */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
                👤 ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ
              </h3>

              <div className="space-y-4">

                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    ಹೆಸರು / Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-base outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />
                </div>

                {/* Designation */}
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    ಹುದ್ದೆ / Designation{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="ಉದಾ: ರೈತ / ಅಧ್ಯಕ್ಷ / ಸದಸ್ಯ"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-base outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
                📍 ವಿಳಾಸದ ಮಾಹಿತಿ
              </h3>

              <div className="space-y-4">

                {/* Village */}
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    ಗ್ರಾಮ / Village <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="ನಿಮ್ಮ ಗ್ರಾಮದ ಹೆಸರು"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-base outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />
                </div>

                {/* Taluk */}
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    ತಾಲೂಕು / Taluk <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="ನಿಮ್ಮ ತಾಲೂಕು"
                    value={taluk}
                    onChange={(e) => setTaluk(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-base outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    ಜಿಲ್ಲೆ / District <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="ನಿಮ್ಮ ಜಿಲ್ಲೆಯ ಹೆಸರು"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-base outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
                📱 ಸಂಪರ್ಕ ಮಾಹಿತಿ
              </h3>

              <div className="space-y-4">

                {/* Mobile */}
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    ಮೊಬೈಲ್ ಸಂಖ್ಯೆ / Mobile Number{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ"
                    value={mobile}
                    onChange={(e) =>
                      setMobile(
                        e.target.value.replace(/\D/g, "").slice(0, 10)
                      )
                    }
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-base tracking-wider outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />
                </div>

                {/* Aadhaar */}
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-slate-700">
                    ಆಧಾರ್ ಸಂಖ್ಯೆ / Aadhaar Number{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={12}
                    placeholder="12 ಅಂಕಿಯ ಆಧಾರ್ ಸಂಖ್ಯೆ"
                    value={aadhaar}
                    onChange={(e) =>
                      setAadhaar(
                        e.target.value.replace(/\D/g, "").slice(0, 12)
                      )
                    }
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-base tracking-wider outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    🔒 ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ನಿರ್ವಹಿಸಲಾಗುತ್ತದೆ.
                  </p>
                </div>
              </div>
            </div>

            {/* Photo */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
                📸 ಸದಸ್ಯರ ಫೋಟೋ
              </h3>

              <div className="rounded-2xl border-2 border-dashed border-green-300 bg-green-50 p-5 text-center">

                {photoPreview ? (
                  <div className="mb-4">
                    <img
                      src={photoPreview}
                      alt="Selected member"
                      className="mx-auto h-32 w-32 rounded-2xl object-cover shadow-md ring-4 ring-white"
                    />

                    <p className="mt-3 text-sm font-semibold text-green-700">
                      ✅ ಫೋಟೋ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ
                    </p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="text-5xl">📷</div>

                    <p className="mt-2 font-bold text-slate-700">
                      ನಿಮ್ಮ ಫೋಟೋ ಆಯ್ಕೆ ಮಾಡಿ
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      JPG, PNG — ಗರಿಷ್ಠ 5MB
                    </p>
                  </div>
                )}

                <label
                  htmlFor="photo"
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-green-700 px-6 py-3 font-bold text-white shadow-md transition hover:bg-green-800"
                >
                  📷 {photo ? "ಫೋಟೋ ಬದಲಿಸಿ" : "ಫೋಟೋ ಆಯ್ಕೆ ಮಾಡಿ"}
                </label>

                <input
                  id="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Required note */}
            <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              <span className="font-bold">*</span> ಗುರುತಿಸಿರುವ ಎಲ್ಲಾ ಮಾಹಿತಿಗಳು
              ಕಡ್ಡಾಯ.
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className={`w-full rounded-2xl py-4 text-lg font-extrabold text-white shadow-lg transition ${
                busy
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-green-700 hover:bg-green-800 active:scale-[0.99]"
              }`}
            >
              {busy ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ಅರ್ಜಿ ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...
                </span>
              ) : (
                "🌾 ಸದಸ್ಯತ್ವಕ್ಕಾಗಿ ನೋಂದಣಿ ಮಾಡಿ"
              )}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div
              className={`mt-5 rounded-2xl p-4 text-center font-bold ${
                messageType === "success"
                  ? "border border-green-200 bg-green-50 text-green-800"
                  : "border border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {messageType === "success" ? "✅ " : "⚠️ "}
              {message}
            </div>
          )}

          {/* Footer */}
          <div className="mt-7 border-t border-slate-100 pt-5 text-center">
            <p className="text-xs text-slate-400">
              🌾 Farmer Membership Portal
            </p>

            <p className="mt-1 text-xs text-slate-400">
              ಸದಸ್ಯತ್ವ ಅರ್ಜಿಯನ್ನು ಪರಿಶೀಲಿಸಿದ ನಂತರ ಅನುಮೋದಿಸಲಾಗುತ್ತದೆ.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
