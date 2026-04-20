"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Navbar() {
  const [resellerName, setResellerName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Ambil nama toko dari memori browser (LocalStorage)
    const session = localStorage.getItem("reseller_session");
    if (session) setResellerName(session);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("reseller_session");
    toast.success("Berhasil keluar dari mode mitra.");
    setResellerName(null);
    router.push("/");
    setTimeout(() => window.location.reload(), 500); // Refresh agar harga kembali normal
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-xl font-extrabold text-[#00a651] tracking-tight">
          Berkah<span className="text-orange-500">OlehOleh.</span>
        </Link>

        {/* Menu Kanan */}
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition hidden md:block">
            ⚙️ Dashboard Admin
          </Link>

          {resellerName ? (
            <div className="flex items-center gap-3 bg-green-50 px-2 py-1 rounded-full border border-green-100">
              <span className="text-xs font-bold text-green-700 pl-2">🏪 {resellerName}</span>
              <button onClick={handleLogout} className="bg-white text-red-500 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hover:bg-red-50 transition">
                Keluar
              </button>
            </div>
          ) : (
            <Link href="/reseller/login" className="text-sm font-bold bg-[#00a651] text-white px-5 py-2 rounded-full shadow-md shadow-green-500/20 hover:bg-[#008f45] transition active:scale-95">
              Masuk Mitra
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}