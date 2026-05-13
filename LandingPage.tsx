import React from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowRight, AlertCircle, TrendingDown, LayoutDashboard, MessageSquare, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden font-sans selection:bg-brand-primary selection:text-white">
      {/* Background Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-secondary/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Shield className="text-brand-primary w-8 h-8" />
          <span className="font-bold text-xl uppercase tracking-tighter">SatGas <span className="text-brand-primary">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-bold opacity-60">
          <span>OJK Compliant</span>
          <span>Anonymous by Design</span>
          <span>Zero Logs</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 md:pt-24 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-primary text-[10px] font-bold uppercase tracking-widest mb-8"
            >
              <AlertCircle size={14} /> National Crisis Response Active
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-8xl font-bold leading-[0.9] tracking-tighter mb-8 uppercase"
            >
              Uang Bisa Dicari, <br />
              <span className="text-brand-primary">Waktu & Nyawa</span> <br />
              Tak Kembali.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed mb-12 font-medium"
            >
              SADIS (Sangat Diplomatis & Solutif). Kami hadir bukan untuk menghakimi, tapi untuk mengeksekusi jalan keluar dari lingkaran gelap judi online dan pinjaman predator.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-6"
            >
              <button 
                onClick={onStart}
                className="w-full sm:w-auto bg-brand-primary hover:bg-brand-secondary text-white px-10 py-5 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(13,148,136,0.3)] hover:scale-105"
              >
                MASUK COMMAND CENTER <ArrowRight size={20} />
              </button>
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] bg-slate-800 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                  </div>
                ))}
                <div className="px-3 flex items-center text-[10px] font-bold opacity-60 uppercase tracking-widest pl-8">
                  +12,400 Pejuang Pulih
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="lg:col-span-5 relative hidden lg:block">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="glass-card !bg-white/5 !border-white/10 p-8 rounded-[40px] relative z-20 backdrop-blur-2xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center shadow-lg">
                  <ShieldCheck className="text-white" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold opacity-40">Status Agent</div>
                  <div className="text-sm font-bold text-brand-primary">ARMY OF PROTECTION ACTIVE</div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="text-[10px] font-bold uppercase opacity-40 mb-2">Real Story: Bpk. S (Jakarta)</div>
                  <p className="text-sm italic leading-relaxed text-slate-300">
                    "Awalnya cuma 50 ribu, akhirnya jual motor buat nutup slot. SatGas AI bantu draf surat negosiasi ke 3 pinjol ilegal saya. Sekarang saya tenang."
                  </p>
                </div>
                
                <div className="flex items-center justify-between px-2">
                   <div className="text-center">
                      <div className="text-2xl font-bold">1.2M+</div>
                      <div className="text-[9px] uppercase opacity-40">Situs Judol Diblokir</div>
                   </div>
                   <div className="w-px h-8 bg-white/10" />
                   <div className="text-center">
                      <div className="text-2xl font-bold">4.8k</div>
                      <div className="text-[9px] uppercase opacity-40">Pinjol Ilegal Dilaporkan</div>
                   </div>
                   <div className="w-px h-8 bg-white/10" />
                   <div className="text-center">
                      <div className="text-2xl font-bold">24/7</div>
                      <div className="text-[9px] uppercase opacity-40">Monitoring Aktif</div>
                   </div>
                </div>
              </div>
            </motion.div>
            
            {/* Decorative Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:20px_20px] -z-10 translate-x-10 translate-y-10 rounded-[40px]" />
          </div>
        </div>
      </main>

      {/* Problem Highlights - Storytelling SADIS */}
      <section className="bg-white text-[#050505] py-24 relative z-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold leading-none tracking-tighter mb-8 uppercase">
                Ini Bukan Sekadar <br /> <span className="text-red-600">Angka di Layar.</span>
              </h2>
              <div className="space-y-8">
                <p className="text-lg leading-relaxed font-medium text-slate-600">
                  Bayangkan pulang ke rumah, tapi disambut teror DC ke tetangga. Bayangkan saldo ATM kosong tepat saat anak sakit, hanya karena satu klik "deposit". 
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { icon: AlertCircle, color: "text-red-600", title: "Teror Psikis", desc: "Kontak darurat diacak, nama baik dihancurkan berkeping-keping." },
                    { icon: TrendingDown, color: "text-red-600", title: "Lingkaran Setan", desc: "Gali lubang tutup lubang yang tak pernah ada dasarnya." },
                    { icon: Shield, color: "text-red-600", title: "Kesehatan Mental", desc: "Depresi berat hingga hilangnya harapan hidup." }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                       <item.icon className={item.color} size={24} />
                       <div>
                          <h4 className="font-bold text-sm uppercase">{item.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <motion.div whileHover={{ y: -10 }} className="aspect-square bg-slate-100 rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative">
                  <div className="text-6xl font-black opacity-10">01</div>
                  <h5 className="font-bold text-xl leading-tight">Rumah Tangga <br /> Hancur</h5>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-red-600/5 blur-3xl" />
               </motion.div>
               <motion.div whileHover={{ y: -10 }} className="aspect-square bg-[#050505] text-white rounded-3xl p-6 flex flex-col justify-between mt-12">
                  <div className="text-6xl font-black opacity-10">02</div>
                  <h5 className="font-bold text-xl leading-tight">Ancaman <br /> Pidana</h5>
               </motion.div>
               <motion.div whileHover={{ y: -10 }} className="aspect-square bg-brand-primary text-white rounded-3xl p-6 flex flex-col justify-between -mt-12">
                  <div className="text-6xl font-black opacity-10">03</div>
                  <h5 className="font-bold text-xl leading-tight">Hilangnya <br /> Pekerjaan</h5>
               </motion.div>
               <motion.div whileHover={{ y: -10 }} className="aspect-square bg-slate-100 rounded-3xl p-6 flex flex-col justify-between">
                  <div className="text-6xl font-black opacity-10">04</div>
                  <h5 className="font-bold text-xl leading-tight">Trauma <br /> Turun Temurun</h5>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase mb-6">Protokol Otonom Kami</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">Teknologi SADIS (Sangat Diplomatis & Solutif) untuk pemulihan finansial total.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            { icon: LayoutDashboard, title: "SADIS Intelligence", desc: "Agent otonom yang menganalisis mutasi dan bill untuk menentukan strategi negosiasi terbaik." },
            { icon: MessageSquare, title: "Negotiation Auto-Drafter", desc: "Buat draf hukum resmi yang berlandaskan POJK hanya dalam hitungan detik." },
            { icon: Shield, title: "Ghost Protocol", desc: "Deteksi entitas ilegal dan aktifkan protokol perlindungan diri secara instan." }
          ].map((item, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.02 }} className="p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-brand-primary/50 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-brand-primary mb-6">
                <item.icon size={28} />
              </div>
              <h4 className="text-xl font-bold mb-4 uppercase">{item.title}</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-24 text-center">
            <button 
              onClick={onStart}
              className="group relative inline-flex items-center gap-3 text-2xl font-bold uppercase tracking-tighter"
            >
              <span className="relative z-10">Sudah Cukup. Saya Mau Berhenti.</span>
              <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowRight />
              </div>
              <div className="absolute -bottom-2 left-0 w-full h-px bg-brand-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-[10px] text-slate-600 text-center uppercase tracking-[0.2em] font-bold">
        © 2026 SatGas AI Command Center • Berdasarkan Kasus Nyata di Indonesia
      </footer>
    </div>
  );
}
