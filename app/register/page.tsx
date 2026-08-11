"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type FormData = {
  name: string;
  designation: string;
  village: string;
  taluk: string;
  district: string;
  mobile: string;
  aadhaar: string;
};

const initialForm: FormData = {
  name: "",
  designation: "",
  village: "",
  taluk: "",
  district: "",
  mobile: "",
  aadhaar: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [photo, setPhoto] = useState<string>("");
  const [photoName, setPhotoName] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setPhotoName(file.name);

    const reader = new FileReader();

    reader.onload = () => {
      setPhoto(String(reader.result));
    };

    reader.readAsDataURL(file);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setStatus("success");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetForm() {
    setForm(initialForm);
    setPhoto("");
    setPhotoName("");
    setStatus("idle");
  }

  if (status === "success") {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="bg-green-700 px-6 py-10 text-center text-white">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl text-green-700">
                ✓
              </div>

              <h1 className="text-3xl font-bold">
                ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ
              </h1>

              <p className="mt-2 text-green-100">
                Registration Submitted Successfully
              </p>
            </div>

            <div className="p-6 text-center sm:p-10">
              <div className="rounded-2xl bg-yellow-50 p-5">
                <p className="text-sm font-medium text-yellow-700">
                  ಅರ್ಜಿ ಸ್ಥಿತಿ / Application Status
                </p>

                <p className="mt-2 text-2xl font-bold text-yellow-800">
                  Pending Approval
                </p>

                <p className="mt-2 text-sm text-yellow-700">
                  ನಿಮ್ಮ ಅರ್ಜಿಯನ್ನು Admin ಪರಿಶೀಲಿಸಿದ ನಂತರ Membership ID
                  ನೀಡಲಾಗುತ್ತದೆ.
                </p>
              </div>

              <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">ಹೆಸರು / Name</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {form.name}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    ಹುದ್ದೆ / Designation
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {form.designation}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    ಗ್ರಾಮ / Village
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {form.village}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    ಜಿಲ್ಲೆ / District
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {form.district}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="mt-8 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
              >
                ಹೊಸ ಅರ್ಜಿ / New Application
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-700 text-2xl text-white">
              🪪
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                Organization Membership
              </h1>

              <p className="text-xs text-slate-500 sm:text-sm">
                ಸದಸ್ಯತ್ವ ನೋಂದಣಿ / Membership Registration
              </p>
            </div>
          </div>

          <div className="hidden rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-700 sm:block">
            Kannada / English
          </div>
        </div>
      </header>

      {/* Page */}
      <section className="px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-4xl">
          {/* Title */}
          <div className="mb-8 text-center">
            <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              ಸಾರ್ವಜನಿಕ ನೋಂದಣಿ / Public Registration
            </span>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              ಸದಸ್ಯತ್ವಕ್ಕಾಗಿ ನೋಂದಣಿ ಮಾಡಿ
            </h2>

            <p className="mt-3 text-slate-600">
              Register for Organization Membership
            </p>
          </div>

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"
          >
            {/* Form Header */}
            <div className="bg-green-700 px-5 py-6 text-white sm:px-8">
              <h3 className="text-xl font-bold">
                ಸದಸ್ಯರ ವಿವರಗಳು / Member Details
              </h3>

              <p className="mt-1 text-sm text-green-100">
                ಕೆಳಗಿನ ಎಲ್ಲಾ ಅಗತ್ಯ ಮಾಹಿತಿಯನ್ನು ನಮೂದಿಸಿ
              </p>
            </div>

            <div className="space-y-8 p-5 sm:p-8">
              {/* Personal Details */}
              <section>
                <h4 className="mb-5 border-b pb-3 text-lg font-bold text-slate-800">
                  ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ / Personal Information
                </h4>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      ಹೆಸರು / Name <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  {/* Designation */}
                  <div>
                    <label
                      htmlFor="designation"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      ಹುದ್ದೆ / Designation{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="designation"
                      name="designation"
                      value={form.designation}
                      onChange={handleChange}
                      required
                      placeholder="ಉದಾ: ಸದಸ್ಯ / Member"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  {/* Village */}
                  <div>
                    <label
                      htmlFor="village"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      ಗ್ರಾಮ / Village <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="village"
                      name="village"
                      value={form.village}
                      onChange={handleChange}
                      required
                      placeholder="ಗ್ರಾಮದ ಹೆಸರು"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  {/* Taluk */}
                  <div>
                    <label
                      htmlFor="taluk"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      ತಾಲೂಕು / Taluk <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="taluk"
                      name="taluk"
                      value={form.taluk}
                      onChange={handleChange}
                      required
                      placeholder="ತಾಲೂಕಿನ ಹೆಸರು"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  {/* District */}
                  <div>
                    <label
                      htmlFor="district"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      ಜಿಲ್ಲೆ / District{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="district"
                      name="district"
                      value={form.district}
                      onChange={handleChange}
                      required
                      placeholder="ಜಿಲ್ಲೆಯ ಹೆಸರು"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  {/* Mobile */}
                  <div>
                    <label
                      htmlFor="mobile"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      ಮೊಬೈಲ್ ಸಂಖ್ಯೆ / Mobile Number{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      inputMode="numeric"
                      value={form.mobile}
                      onChange={handleChange}
                      required
                      maxLength={10}
                      pattern="[0-9]{10}"
                      placeholder="10 digit mobile number"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  {/* Aadhaar */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="aadhaar"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      ಆಧಾರ್ ಸಂಖ್ಯೆ / Aadhaar Number{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      id="aadhaar"
                      name="aadhaar"
                      type="text"
                      inputMode="numeric"
                      value={form.aadhaar}
                      onChange={handleChange}
                      required
                      maxLength={12}
                      pattern="[0-9]{12}"
                      placeholder="12 digit Aadhaar number"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಮಾಹಿತಿಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ನಿರ್ವಹಿಸಿ.
                    </p>
                  </div>
                </div>
              </section>

              {/* Photo */}
              <section>
                <h4 className="mb-5 border-b pb-3 text-lg font-bold text-slate-800">
                  ಫೋಟೋ / Photo
                </h4>

                <div className="grid gap-6 sm:grid-cols-[180px_1fr]">
                  {/* Preview */}
                  <div className="flex justify-center">
                    <div className="flex h-44 w-36 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50">
                      {photo ? (
                        <img
                          src={photo}
                          alt="Uploaded member"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-slate-400">
                          <div className="text-4xl">📷</div>
                          <p className="mt-2 text-xs">
                            Photo Preview
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload */}
                  <div>
                    <label
                      htmlFor="photo"
                      className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-green-300 bg-green-50 p-6 text-center transition hover:bg-green-100"
                    >
                      <div className="text-4xl">⬆️</div>

                      <p className="mt-3 font-bold text-green-800">
                        ಫೋಟೋ Upload ಮಾಡಿ
                      </p>

                      <p className="mt-1 text-sm text-green-700">
                        Click to choose photo
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        JPG / PNG recommended
                      </p>

                      {photoName && (
                        <p className="mt-3 max-w-full truncate rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700">
                          {photoName}
                        </p>
                      )}

                      <input
                        id="photo"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handlePhoto}
                        required
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </section>

              {/* Declaration */}
              <section className="rounded-2xl bg-slate-50 p-5">
                <div className="flex gap-3">
                  <input
                    id="declaration"
                    type="checkbox"
                    required
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-green-700 focus:ring-green-600"
                  />

                  <label
                    htmlFor="declaration"
                    className="text-sm leading-6 text-slate-600"
                  >
                    ನಾನು ನೀಡಿರುವ ಮಾಹಿತಿಯು ನನ್ನ ತಿಳುವಳಿಕೆಯ ಪ್ರಕಾರ
                    ಸರಿಯಾಗಿದೆ ಎಂದು ದೃಢೀಕರಿಸುತ್ತೇನೆ.
                    <br />
                    I confirm that the information provided by me is
                    correct to the best of my knowledge.
                  </label>
                </div>
              </section>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-green-700 px-6 py-4 text-base font-bold text-white shadow-lg transition hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-200"
                >
                  ಅರ್ಜಿ ಸಲ್ಲಿಸಿ / Submit Application
                </button>

                <p className="mt-3 text-center text-xs text-slate-500">
                  Submit ಮಾಡಿದ ನಂತರ ನಿಮ್ಮ Application “Pending Approval”
                  ಆಗಿರುತ್ತದೆ.
                </p>
              </div>
            </div>
          </form>

          {/* Footer */}
          <footer className="py-8 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Organization Membership Portal
          </footer>
        </div>
      </section>
    </main>
  );
}
