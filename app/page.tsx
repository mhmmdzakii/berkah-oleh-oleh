"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface Product { 
  id: string; 
  nama_produk: string; 
  kategori: string; 
  harga_retail: number; 
  harga_reseller: number; 
  foto_url: string; 
  target_pasar: string; 
}
interface CartItem { id: string; nama_produk: string; harga: number; qty: number; }

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [namaTokoReseller, setNamaTokoReseller] = useState<string | null>(null);
  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [alamat, setAlamat] = useState("");

  // Kategori "Souvenir" diganti menjadi "Tape"
  const daftarKategori = ["Semua", "Makanan", "Minuman", "Tape"];

  useEffect(() => {
    const savedSession = localStorage.getItem("reseller_session");
    if (savedSession) setNamaTokoReseller(savedSession);
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from("products").select("*").order('created_at', { ascending: false });
    setProducts(data || []);
  }

  const addToCart = (p: Product) => {
    const hargaAktif = namaTokoReseller ? p.harga_reseller : p.harga_retail;
    
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === p.id);
      if (existing) return prevCart.map((item) => item.id === p.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prevCart, { id: p.id, nama_produk: p.nama_produk, harga: hargaAktif, qty: 1 }];
    });
    toast.success(`${p.nama_produk} ditambahkan ke keranjang 🛒`);
  };

  const checkoutWA = () => {
    if (cart.length === 0) return;
    if (!alamat.trim()) {
      toast.error("Mohon isi alamat pengiriman terlebih dahulu.");
      return;
    }

    let text = `Halo *Berkah Oleh-Oleh*! 👋\nSaya ingin memesan pesanan berikut:\n\n`;
    if (namaTokoReseller) text += `🏪 *KEMITRAAN: ${namaTokoReseller}*\n`;
    text += `📍 *ALAMAT KIRIM:* ${alamat}\n\n`;
    
    let totalSemua = 0;
    cart.forEach((item, index) => {
      const subtotal = item.harga * item.qty;
      totalSemua += subtotal;
      text += `${index + 1}. ${item.nama_produk} (${item.qty}x) = Rp ${subtotal.toLocaleString()}\n`;
    });
    
    text += `\n📦 *TOTAL BELANJA: Rp ${totalSemua.toLocaleString()}*`;
    window.open(`https://wa.me/6289509800161?text=${encodeURIComponent(text)}`, "_blank");
  };

  const produkSesuaiTarget = products.filter(p => {
    if (namaTokoReseller) {
      return p.target_pasar === 'Semua' || p.target_pasar === 'Mitra';
    } 
    else {
      return p.target_pasar === 'Semua' || p.target_pasar === 'Retail';
    }
  });

  const produkTampil = kategoriAktif === "Semua" 
    ? produkSesuaiTarget 
    : produkSesuaiTarget.filter(p => p.kategori === kategoriAktif);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
      
      {/* Banner Khusus Kalau Login Sebagai Reseller */}
      {namaTokoReseller && (
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-center py-2.5 text-[11px] sm:text-xs font-bold tracking-widest uppercase shadow-md relative z-20">
          ✨ Akses Kemitraan Aktif: <span className="text-emerald-100">{namaTokoReseller}</span>
        </div>
      )}

      {/* Hero Section dengan desain modern & transisi background */}
      <div className="bg-white border-b border-slate-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50 via-white to-white opacity-70"></div>
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 text-center relative z-10">
          <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase mb-6 inline-block border border-emerald-100">
            Katalog Premium
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-5 leading-tight">
            Etalase Oleh-Oleh <br className="hidden md:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Khas Kuningan</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base leading-relaxed font-medium">
            Jelajahi ragam cita rasa otentik dengan kualitas terbaik. Nikmati kemudahan berbelanja langsung dari pusatnya.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Filter Kategori dengan gaya Pill modern */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-8 snap-x">
          {daftarKategori.map((kat) => (
            <button key={kat} onClick={() => setKategoriAktif(kat)}
              className={`snap-center whitespace-nowrap px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 border ${
                kategoriAktif === kat 
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25" 
                  : "bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50"
              }`}>
              {kat}
            </button>
          ))}
        </div>

        {/* Grid Produk */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {produkTampil.map((p) => (
            <div key={p.id} className="bg-white rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,166,81,0.08)] hover:-translate-y-1.5 transition-all duration-500 border border-slate-100 overflow-hidden flex flex-col group">
              <div className="relative aspect-square overflow-hidden bg-slate-50">
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 font-bold text-[10px] px-3 py-1.5 rounded-xl shadow-sm z-10 uppercase tracking-widest border border-white/50">
                  {p.kategori}
                </span>
                <img src={p.foto_url} alt={p.nama_produk} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-slate-900 text-sm md:text-base leading-snug mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">{p.nama_produk}</h3>
                
                <div className="mt-auto mb-5">
                  {namaTokoReseller ? (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1 bg-emerald-50 w-fit px-2 py-0.5 rounded-md">Harga Mitra</span>
                      <div className="flex items-end gap-2.5">
                        <p className="text-xl font-black text-emerald-600 leading-none">Rp {p.harga_reseller.toLocaleString()}</p>
                        <p className="text-xs text-slate-400 line-through mb-0.5 font-medium">Rp {p.harga_retail.toLocaleString()}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Harga Spesial</span>
                      <p className="text-xl font-black text-slate-900 leading-none">Rp {p.harga_retail.toLocaleString()}</p>
                    </div>
                  )}
                </div>
                
                <button onClick={() => addToCart(p)}
                  className="w-full bg-slate-50 text-slate-700 py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-500 hover:text-white transition-all duration-300 active:scale-95 border border-slate-100 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20">
                  + Tambah
                </button>
              </div>
            </div>
          ))}
          
          {/* Tampilan jika produk kosong */}
          {produkTampil.length === 0 && (
            <div className="col-span-full text-center py-20">
              <span className="text-4xl mb-4 block">🍃</span>
              <h3 className="text-lg font-bold text-slate-700 mb-1">Produk Belum Tersedia</h3>
              <p className="text-sm text-slate-500">Belum ada produk untuk kategori ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button onClick={() => setIsCartOpen(!isCartOpen)}
          className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white px-6 py-4 rounded-full shadow-[0_8px_30px_rgb(0,166,81,0.3)] flex items-center gap-3 hover:scale-105 hover:bg-emerald-600 transition-all duration-300 animate-bounce-short">
          <span className="text-xl">🛍️</span>
          <span className="font-bold tracking-wide">{cart.reduce((total, item) => total + item.qty, 0)} Item</span>
        </button>
      )}

      {/* Cart Sidebar (Popup) */}
      {isCartOpen && cart.length > 0 && (
        <div className="fixed bottom-24 right-6 w-[90vw] sm:w-80 md:w-96 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[2rem] shadow-[0_20px_60px_rgb(0,0,0,0.1)] p-6 z-50 transform origin-bottom-right transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              Keranjang Belanja
            </h3>
            <button onClick={() => setCart([])} className="text-[11px] uppercase tracking-wider font-bold text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 px-3 py-1.5 rounded-lg">Kosongkan</button>
          </div>
          
          <div className="max-h-[40vh] overflow-y-auto space-y-3 mb-6 scrollbar-hide pr-1">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 hover:border-emerald-100 transition-colors">
                <div>
                  <p className="font-bold text-slate-800 text-sm mb-1">{item.nama_produk}</p>
                  <p className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md inline-block shadow-sm">{item.qty}x @ Rp {item.harga.toLocaleString()}</p>
                </div>
                <p className="font-black text-emerald-600 text-sm">Rp {(item.qty * item.harga).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Form Input Alamat */}
          <div className="mb-6">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
              Alamat Pengiriman / Detail Lokasi
            </label>
            <textarea 
              placeholder="Contoh: Jl. Nusantara No. 12, Depan Masjid Al-Ikhlas"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white transition-all resize-none h-24"
            />
          </div>

          <div className="border-t border-slate-100 pt-5 mb-6 flex flex-col gap-1">
            <span className="font-bold text-slate-400 text-[11px] uppercase tracking-widest">Estimasi Total</span>
            <span className="text-2xl font-black text-slate-900">Rp {cart.reduce((total, item) => total + (item.qty * item.harga), 0).toLocaleString()}</span>
          </div>

          <button onClick={checkoutWA}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-[15px] hover:bg-emerald-500 hover:shadow-[0_8px_20px_rgb(0,166,81,0.25)] active:scale-[0.98] transition-all duration-300 flex justify-center items-center gap-2 group">
            Pesan via WhatsApp
            <span className="group-hover:translate-x-1 transition-transform">➔</span>
          </button>
        </div>
      )}

      {/* FOOTER SECTION */}
      <footer className="bg-white border-t border-slate-100 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h4 className="text-xl font-black text-slate-900 mb-4">Berkah Oleh-Oleh ✨</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-xl">📍</span>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Lokasi Toko</p>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Cikadu, Kec. Nusaherang, Kabupaten Kuningan, <br />
                    Jawa Barat
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xl">🕒</span>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Jam Operasional</p>
                  <p className="text-slate-500 text-sm">Setiap Hari: 08:00 - 16:00 WIB</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
            <p className="text-sm font-medium text-slate-600 mb-4">
              Ingin mengunjungi toko kami langsung? Klik tombol di bawah untuk navigasi Google Maps.
            </p>
            <a 
              href="https://www.google.com/maps/place/Toko+Berkah+Oleh+Oleh/@-7.0036306,108.4322393,693m/data=!3m2!1e3!4b1!4m6!3m5!1s0x2e6f158c1eddd565:0x5b31d23b11780510!8m2!3d-7.0036359!4d108.4348142!16s%2Fg%2F11cjh_xfl7?entry=ttu&g_ep=EgoyMDI2MDQxNS4wIKXMDSoASAFQAw%3D%3D" 
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-xl font-bold text-sm text-slate-800 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600 transition-all shadow-sm"
            >
              <span>🗺️</span> Lihat Rute di Google Maps
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-50 text-center flex flex-col items-center gap-2">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
            © 2024 Berkah Oleh-Oleh - Kualitas Khas Kuningan
          </p>
          {/* Tombol Rahasia Admin */}
          <a href="/admin" className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-300">
            <span className="text-xs">Admin</span>
          </a>
        </div>
      </footer>

    </div>
  );
}