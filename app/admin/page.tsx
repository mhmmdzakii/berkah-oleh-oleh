"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const PASSWORD_BOS = "BOS123"; 

  // Default menu langsung ke Etalase biar gampang lihat/hapus barang
  const [activeTab, setActiveTab] = useState("etalase");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [formProduk, setFormProduk] = useState({
    nama_produk: "", kategori: "Makanan", harga_retail: "", harga_reseller: "", target_pasar: "Semua"
  });
  const [fileFoto, setFileFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [mitras, setMitras] = useState<any[]>([]);
  const [labelPin, setLabelPin] = useState(""); 
  const [pinBaru, setPinBaru] = useState("");

  useEffect(() => {
    if (localStorage.getItem("admin_access") === "true") {
      setIsAdmin(true);
      fetchData();
    }
  }, []);

  const handleLoginAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === PASSWORD_BOS) {
      localStorage.setItem("admin_access", "true");
      setIsAdmin(true);
      toast.success("Selamat datang, Bos! 👑");
      fetchData();
    } else {
      toast.error("Password salah!");
    }
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem("admin_access");
    setIsAdmin(false);
    toast.success("Berhasil keluar.");
  };

  async function fetchData() {
    const { data: prod } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    const { data: mitr } = await supabase.from("reseller_access").select("*").order("created_at", { ascending: false });
    setProducts(prod || []);
    setMitras(mitr || []);
  }

  const handleUploadProduk = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let finalFotoUrl = "https://via.placeholder.com/300?text=Tanpa+Foto";

    if (fileFoto) {
      const fileName = `${Math.random()}-${fileFoto.name}`;
      const { error: upError } = await supabase.storage.from("gambar_produk").upload(fileName, fileFoto);
      if (upError) { toast.error("Gagal upload foto"); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from("gambar_produk").getPublicUrl(fileName);
      finalFotoUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from("products").insert([{
      nama_produk: formProduk.nama_produk,
      kategori: formProduk.kategori,
      target_pasar: formProduk.target_pasar,
      harga_retail: parseInt(formProduk.harga_retail),
      harga_reseller: parseInt(formProduk.harga_reseller),
      foto_url: finalFotoUrl
    }]);

    if (error) toast.error("Gagal menyimpan produk");
    else {
      toast.success("Produk berhasil diposting! 🎉");
      setFormProduk({ nama_produk: "", kategori: "Makanan", harga_retail: "", harga_reseller: "", target_pasar: "Semua" });
      setFileFoto(null); 
      setPreviewUrl(null); 
      fetchData();
      // OTOMATIS PINDAH KE MENU ETALASE SETELAH POSTING
      setActiveTab("etalase"); 
    }
    setLoading(false);
  };

  const hapusProduk = async (id: string, nama: string) => {
    if (!confirm(`Hapus produk ${nama}?`)) return;
    await supabase.from("products").delete().eq("id", id);
    toast.success(`${nama} dihapus.`); fetchData();
  };

  const handleTambahMitra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!labelPin || !pinBaru) return;
    setLoading(true);
    const { error } = await supabase.from("reseller_access").insert([{ 
      nama_toko: labelPin.toUpperCase().trim(), pin: pinBaru.trim()
    }]);
    if (error) toast.error("Gagal buat PIN!");
    else {
      toast.success("PIN Reseller berhasil dibuat!");
      setLabelPin(""); setPinBaru(""); fetchData();
    }
    setLoading(false);
  };

  const hapusMitra = async (id: string, pin: string) => {
    if (!confirm(`Hapus PIN ${pin} ini?`)) return;
    await supabase.from("reseller_access").delete().eq("id", id);
    toast.success(`PIN dihapus.`); fetchData();
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black p-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-10 rounded-[2rem] shadow-2xl w-full max-w-sm text-center transform transition-all hover:scale-[1.01] duration-300">
          <div className="bg-white/20 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg backdrop-blur-sm">
            <span className="text-4xl">👑</span>
          </div>
          <h1 className="text-2xl font-black text-white mb-6 tracking-wide">Akses Bos</h1>
          <form onSubmit={handleLoginAdmin} className="space-y-5">
            <input 
              type="password" 
              required 
              placeholder="Masukkan Sandi Rahasia" 
              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-center font-bold text-white placeholder-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300" 
              value={passwordInput} 
              onChange={(e) => setPasswordInput(e.target.value)} 
            />
            <button className="w-full bg-gradient-to-r from-emerald-400 to-emerald-500 text-gray-900 py-4 rounded-2xl font-black text-lg hover:from-emerald-300 hover:to-emerald-400 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              Buka Brankas
            </button>
          </form>
          <button onClick={() => router.push('/')} className="mt-6 text-sm font-semibold text-gray-400 hover:text-white transition-colors duration-200">
            &larr; Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 font-sans pb-24 text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER & TABS MENU */}
        <div className="flex flex-col mb-8 gap-6 bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2.5 rounded-2xl">
                <span className="text-xl">🎛️</span>
              </div>
              <h1 className="text-xl font-black text-slate-900">Ruang Kendali</h1>
            </div>
            <button 
              onClick={handleLogoutAdmin} 
              className="text-xs font-bold bg-rose-50 text-rose-600 px-4 py-2.5 rounded-xl hover:bg-rose-100 hover:text-rose-700 transition-all active:scale-95">
              Keluar
            </button>
          </div>
          
          {/* TAB YANG DIPISAH JADI 3 */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto scrollbar-hide snap-x">
            <button 
              onClick={() => setActiveTab("etalase")} 
              className={`snap-center whitespace-nowrap flex-1 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${activeTab === 'etalase' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              📦 Etalase
            </button>
            <button 
              onClick={() => setActiveTab("tambah")} 
              className={`snap-center whitespace-nowrap flex-1 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${activeTab === 'tambah' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              ➕ Tambah
            </button>
            <button 
              onClick={() => setActiveTab("mitra")} 
              className={`snap-center whitespace-nowrap flex-1 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${activeTab === 'mitra' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              🔑 Reseller
            </button>
          </div>
        </div>

        {/* TAB 1: DAFTAR ETALASE (KHUSUS LIHAT & HAPUS) */}
        {activeTab === "etalase" && (
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Daftar Barang</h2>
              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">{products.length} Item</span>
            </div>
            
            <div className="space-y-4">
              {products.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-medium flex flex-col items-center">
                  <span className="text-4xl mb-3">🍃</span>
                  Belum ada produk.<br/>Silakan ke tab "Tambah" untuk memposting.
                </div>
              ) : (
                products.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <img src={p.foto_url} className="w-16 h-16 rounded-xl object-cover shadow-sm border border-slate-100" />
                      <div>
                        <p className="text-sm font-bold text-slate-800 line-clamp-1">{p.nama_produk}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{p.kategori}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${p.target_pasar === 'Mitra' ? 'bg-orange-100 text-orange-700' : p.target_pasar === 'Retail' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {p.target_pasar === 'Mitra' ? 'MITRA' : p.target_pasar === 'Retail' ? 'UMUM' : 'SEMUA'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Tombol Hapus Sekarang Kelihatan Terus di HP */}
                    <button onClick={() => hapusProduk(p.id, p.nama_produk)} className="text-xs text-rose-500 font-bold bg-rose-50 px-3 py-2 rounded-xl hover:bg-rose-500 hover:text-white transition-all duration-300">
                      Hapus
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: FORM TAMBAH BARANG */}
        {activeTab === "tambah" && (
          <div className="max-w-2xl mx-auto bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-xl font-bold mb-6 text-slate-900 flex items-center gap-2">
              <span className="text-emerald-500">➕</span> Form Produk Baru
            </h2>
            <form onSubmit={handleUploadProduk} className="space-y-5">
              <div>
                <label className="text-[11px] font-bold text-slate-400 ml-1 mb-1 block">NAMA PRODUK</label>
                <input required placeholder="Contoh: Keripik Singkong" className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-semibold outline-none border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" value={formProduk.nama_produk} onChange={(e) => setFormProduk({...formProduk, nama_produk: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 ml-1 mb-1 block">KATEGORI</label>
                  <select className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-semibold outline-none border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer" value={formProduk.kategori} onChange={(e) => setFormProduk({...formProduk, kategori: e.target.value})}>
                    <option value="Makanan">Makanan</option><option value="Minuman">Minuman</option><option value="Tape">Tape</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-orange-500 ml-1 mb-1 block">VISIBILITAS</label>
                  <select className="w-full p-4 bg-orange-50 text-orange-700 rounded-2xl text-sm font-bold outline-none border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all appearance-none cursor-pointer" value={formProduk.target_pasar} onChange={(e) => setFormProduk({...formProduk, target_pasar: e.target.value})}>
                    <option value="Semua">Semua Orang</option>
                    <option value="Retail">Khusus Umum</option>
                    <option value="Mitra">Khusus Mitra</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 ml-1 mb-1 block">HARGA NORMAL (RP)</label>
                  <input required type="number" placeholder="0" className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-semibold outline-none border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" value={formProduk.harga_retail} onChange={(e) => setFormProduk({...formProduk, harga_retail: e.target.value})} />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-emerald-600 ml-1 mb-1 block">HARGA RESELLER (RP)</label>
                  <input required type="number" placeholder="0" className="w-full p-4 bg-emerald-50 rounded-2xl text-sm font-bold text-emerald-700 outline-none border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all" value={formProduk.harga_reseller} onChange={(e) => setFormProduk({...formProduk, harga_reseller: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 ml-1 mb-1 block">FOTO PRODUK</label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center relative h-32 flex items-center justify-center bg-slate-50 hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-300 cursor-pointer group">
                  <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) { setFileFoto(file); setPreviewUrl(URL.createObjectURL(file)); }
                  }} />
                  {previewUrl ? 
                    <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-sm" /> : 
                    <div className="flex flex-col items-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      <span className="text-xs font-bold">Pilih Foto di Sini</span>
                    </div>
                  }
                </div>
              </div>

              <button disabled={loading} className="w-full mt-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-emerald-500 active:scale-[0.98] transition-all duration-300 disabled:opacity-70">
                {loading ? "Menyimpan..." : "Posting Produk"}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: KUNCI RESELLER (SAMA SEPERTI SEBELUMNYA) */}
        {activeTab === "mitra" && (
          <div className="max-w-3xl mx-auto bg-white p-6 md:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
              <div className="bg-orange-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">🔑</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">Kunci (PIN) Reseller</h2>
            </div>

            <form onSubmit={handleTambahMitra} className="flex flex-col sm:flex-row gap-4 mb-10 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="flex-grow">
                <label className="text-[11px] font-bold text-slate-400 ml-1 mb-1 block">CATATAN PENGGUNA PIN</label>
                <input required placeholder="Cth: WA Reseller Jatim" className="w-full p-4 bg-white rounded-2xl text-sm font-bold outline-none border focus:border-orange-500 uppercase" value={labelPin} onChange={(e) => setLabelPin(e.target.value)} />
              </div>
              <div className="sm:w-40">
                <label className="text-[11px] font-bold text-slate-400 ml-1 mb-1 block">PIN (4 ANGKA)</label>
                <input required type="text" maxLength={4} placeholder="XXXX" className="w-full p-4 bg-white rounded-2xl text-sm font-black outline-none border focus:border-orange-500 text-center tracking-[0.5em]" value={pinBaru} onChange={(e) => setPinBaru(e.target.value.replace(/\D/g, ''))} />
              </div>
              <div className="flex items-end">
                <button disabled={loading} className="w-full sm:w-auto bg-orange-500 text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-orange-600 active:scale-95 transition-all">BUAT</button>
              </div>
            </form>

            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Daftar Kunci Aktif</h3>
              <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">{mitras.length} PIN</span>
            </div>

            <div className="space-y-4">
              {mitras.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-medium">Belum ada PIN.</div>
              ) : (
                mitras.map((m) => (
                  <div key={m.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-orange-200 transition-all">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{m.nama_toko}</p>
                      <p className="text-xl font-black text-orange-500 tracking-[0.3em] mt-1">{m.pin}</p>
                    </div>
                    <button onClick={() => hapusMitra(m.id, m.pin)} className="text-xs text-rose-500 font-bold bg-rose-50 px-4 py-2 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                      Hapus
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}