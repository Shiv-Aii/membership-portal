import Link from "next/link";

export default function Nav() {
  return <header className="bg-white border-b sticky top-0 z-20">
    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <Link href="/" className="font-bold text-lg text-green-700">ಸಂಸ್ಥೆ ಸದಸ್ಯತ್ವ ಪೋರ್ಟಲ್</Link>
      <nav className="flex gap-4 text-sm">
        <Link href="/" className="hover:text-green-700">ಮುಖಪುಟ</Link>
        <Link href="/register" className="hover:text-green-700">ನೋಂದಣಿ</Link>
        <Link href="/admin/login" className="bg-slate-900 text-white px-4 py-2 rounded-lg">Admin</Link>
      </nav>
    </div>
  </header>;
}