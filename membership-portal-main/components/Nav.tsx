import Link from "next/link";

export default function Nav() {
  return (
    <header className="bg-white border-b sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 min-h-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          href="/"
          className="font-bold text-base sm:text-lg text-green-700 leading-tight"
        >
          ಸಂಸ್ಥೆ ಸದಸ್ಯತ್ವ ಪೋರ್ಟಲ್
        </Link>

        <nav className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
          <Link href="/" className="hover:text-green-700 px-2 py-1">
            ಮುಖಪುಟ
          </Link>
          <Link href="/register" className="hover:text-green-700 px-2 py-1">
            ನೋಂದಣಿ
          </Link>
          <Link
            href="/admin/login"
            className="bg-slate-900 text-white px-4 py-2 rounded-lg"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
