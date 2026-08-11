"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    designation: "",
    village: "",
    taluk: "",
    district: "",
    mobile: "",
    aadhaar: "",
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  function change(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function selectPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setMessage("");

    if (
      !form.name ||
      !form.designation ||
      !form.village ||
      !form.taluk ||
      !form.district ||
      !form.mobile ||
      !form.aadhaar ||
      !photo
    ) {
      setMessage("ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಮಾಹಿತಿಯನ್ನು ತುಂಬಿ.");
      return;
    }

    if (form.aadhaar.length !== 12) {
      setMessage("ಆಧಾರ್ ಸಂಖ್ಯೆ 12 ಅಂಕೆಗಳಿರಬೇಕು.");
      return;
    }

    if (form.mobile.length !== 10) {
      setMessage("ಮೊಬೈಲ್ ಸಂಖ್ಯೆ 10 ಅಂಕೆಗಳಿರಬೇಕು.");
      return;
    }

    setLoading(true);

    try {
      /*
       * 1. Photo upload
       */

      const extension = photo.name.split(".").pop();

      const fileName = `${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("member-photos")
        .upload(fileName, photo);

      if (uploadError) {
        throw uploadError;
      }

      /*
       * 2. Get public photo URL
       */

      const { data: publicData } = supabase.storage
        .from("member-photos")
        .getPublicUrl(fileName);

      const photo_url = publicData.publicUrl;

      /*
       * 3. Save application
       */

      const { error: insertError } = await supabase
        .from("applications")
        .insert({
          name: form.name,
          designation: form.designation,
          village: form.village,
          taluk: form.taluk,
          district: form.district,
          mobile: form.mobile,
          aadhaar: form.aadhaar,
          photo_url: photo_url,
          status: "pending",
        });

      if (insertError) {
        throw insertError;
      }

      setMessage(
        "✅ ಅರ್ಜಿ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ. Admin Approval ಗಾಗಿ Pendingನಲ್ಲಿ ಇದೆ."
      );

      setForm({
        name: "",
        designation: "",
        village: "",
        taluk: "",
        district: "",
        mobile: "",
        aadhaar: "",
      });

      setPhoto(null);
      setPreview("");

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    } catch (error: any) {
      console.error(error);

      setMessage(
        "Registration failed: " +
          (error?.message || "Unknown error")
      );
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-7">

        <h1 className="text-3xl font-bold text-center">
          Membership Registration
        </h1>

        <p className="text-center text-slate-500 mt-2">
          ಸದಸ್ಯತ್ವ ನೋಂದಣಿ ಅರ್ಜಿ
        </p>

        <form onSubmit={submit} className="grid gap-4 mt-7">

          <input
            name="name"
            placeholder="ಪೂರ್ಣ ಹೆಸರು / Full Name"
            value={form.name}
            onChange={change}
            className="border rounded-xl p-3"
          />

          <input
            name="designation"
            placeholder="ಹುದ್ದೆ / Designation"
            value={form.designation}
            onChange={change}
            className="border rounded-xl p-3"
          />

          <input
            name="village"
            placeholder="ಗ್ರಾಮ / Village"
            value={form.village}
            onChange={change}
            className="border rounded-xl p-3"
          />

          <input
            name="taluk"
            placeholder="ತಾಲೂಕು / Taluk"
            value={form.taluk}
            onChange={change}
            className="border rounded-xl p-3"
          />

          <input
            name="district"
            placeholder="ಜಿಲ್ಲೆ / District"
            value={form.district}
            onChange={change}
            className="border rounded-xl p-3"
          />

          <input
            name="mobile"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="ಮೊಬೈಲ್ ಸಂಖ್ಯೆ / Mobile Number"
            value={form.mobile}
            onChange={change}
            className="border rounded-xl p-3"
          />

          <input
            name="aadhaar"
            type="text"
            inputMode="numeric"
            maxLength={12}
            placeholder="ಆಧಾರ್ ಸಂಖ್ಯೆ / Aadhaar Number"
            value={form.aadhaar}
            onChange={change}
            className="border rounded-xl p-3"
          />

          <div className="border-2 border-dashed rounded-2xl p-5 text-center">

            <p className="font-semibold mb-3">
              ಫೋಟೋ / Member Photo
            </p>

            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-40 object-cover rounded-xl mx-auto mb-4"
              />
            ) : (
              <div className="w-32 h-40 bg-slate-200 rounded-xl mx-auto mb-4 grid place-items-center text-slate-500">
                Photo
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={selectPhoto}
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-bold disabled:opacity-50"
          >
            {loading
              ? "Submitting..."
              : "Submit Application / ಅರ್ಜಿ ಸಲ್ಲಿಸಿ"}
          </button>

        </form>

        {message && (
          <div className="mt-5 p-4 rounded-xl bg-slate-100 text-center font-semibold">
            {message}
          </div>
        )}

      </div>
    </main>
  );
}
