"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ResellerLogin() {
  const [namaToko, setNamaToko] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Membersihkan input dari spasi yang tidak disengaja
    const pinKetik = pin.trim();
    const namaKetik = namaToko.trim();

    if (!pinKetik || !namaKetik) {
      toast.error("Mohon lengkapi Nama Toko dan PIN Anda.");
      setLoading(false);
      return;
    }

    // 2. Memeriksa kecocokan PIN di Database
    const { data, error } = await supabase
      .from("reseller_access")
      .select("pin")
      .eq("pin", pinKetik); 

    // 3. LOGIKA PEMERIKSAAN
    if (error) {
      toast.error("Mohon maaf, terjadi kendala koneksi pada sistem.");
      console.error(error);
    } 
    // JIKA PIN TIDAK DITEMUKAN
    else if (!data || data.length === 0) {
      toast.error("PIN tidak sesuai. Mohon periksa kembali.");
    } 
    // JIKA PIN SESUAI
    else {
      const namaAkun = namaKetik.toUpperCase();
      localStorage.setItem("reseller_session", namaAkun);
      toast.success(`Login berhasil. Selamat datang, Mitra ${namaAkun}! ✨`);
      router.push("/");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-orange-50 p-4 relative overflow-hidden font-sans">
      {/* Efek Latar Belakang (Blob) */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse transition-all duration-1000"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse transition-all duration-1000 delay-700"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white relative z-10 transform transition-all duration-500 hover:shadow-[0_8px_50px_rgb(0,166,81,0.08)]">
        
        {/* Bagian Header */}
        <div className="text-center mb-10">
          <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100/50">
            <span className="text-4xl">🤝</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Portal Mitra</h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">
            Silakan masuk untuk mengakses etalase produk dan penawaran khusus kemitraan.
          </p>
        </div>

        {/* Bagian Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 tracking-wide ml-1">
              NAMA TOKO TERDAFTAR
            </label>
            <input 
              required 
              type="text" 
              placeholder="Masukkan nama toko Anda" 
              value={namaToko} 
              onChange={(e) => setNamaToko(e.target.value)} 
              className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 focus:border-[#00a651] focus:ring-4 focus:ring-[#00a651]/10 focus:bg-white rounded-2xl outline-none transition-all duration-300 font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal uppercase" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 tracking-wide ml-1">
              PIN RAHASIA (4 ANGKA)
            </label>
            <input 
              required 
              type="password" 
              placeholder="••••" 
              maxLength={4} 
              value={pin} 
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} 
              className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200 focus:border-[#00a651] focus:ring-4 focus:ring-[#00a651]/10 focus:bg-white rounded-2xl outline-none transition-all duration-300 font-black text-slate-900 tracking-[0.5em] text-center text-xl placeholder:tracking-normal placeholder:text-slate-300 placeholder:font-normal" 
            />
          </div>
          
          <button 
            disabled={loading} 
            className="w-full mt-4 bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#00a651] hover:shadow-[0_8px_20px_rgb(0,166,81,0.25)] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed group flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Mencocokkan Data...</span>
            ) : (
              <>
                Akses Etalase Mitra
                <span className="group-hover:translate-x-1 transition-transform duration-300">➔</span>
              </>
            )}
          </button>
        </form>

        {/* Footer/Bantuan */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Belum memiliki PIN? Hubungi tim admin kami.
          </p>
        </div>
      </div>
    </div>
  );
}