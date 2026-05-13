/**
 * SatGas AI v2 - Main Interface
 * Version: 2.1.0-pwa
 */
import React, { useState, useEffect, useRef } from 'react';
import { Shield, LayoutDashboard, MessageSquare, AlertCircle, TrendingDown, Info, ChevronRight, CheckCircle2, Loader2, Send, Plus, Trash2, Camera, FileText, Gift, Heart, MapPin, Globe, PhoneCall, HelpCircle, Bell, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Message, FinancialData, AgentAction, UserState, Milestone, PinjolEntity } from './types';
import { analyzeSituation, chatStream } from './services/geminiService';
import { LandingPage } from './components/LandingPage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'milestones'>('dashboard');
  const [messages, setMessages] = useState<Message[]>([]);
  const [financialData, setFinancialData] = useState<FinancialData>({
    income: 0,
    expenses: 0,
    debts: 0,
    gamblingLosses: 0,
    savings: 0
  });
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [userState, setUserState] = useState<UserState>({
    financialHealthScore: 50,
    riskLevel: 'medium',
    anonymousId: 'user_' + Math.random().toString(36).substr(2, 9),
    daysClean: 3,
    isCrisisMode: false,
    sentinelSettings: {
      threshold: 1000000,
      alertDestinations: { whatsapp: true, email: false, emergency: true },
      emergencyContact: ''
    },
    milestones: [
      { id: '1', title: '7 Hari Bebas Judi', isUnlocked: false, reward: 'Medali Kedisiplinan' },
      { id: '2', title: 'Bayar Cicilan Pertama', isUnlocked: true, reward: 'E-Certificate Pejuang Finansial' },
      { id: '3', title: 'Input Data Lengkap', isUnlocked: true, reward: 'Badge Transparansi' }
    ]
  });
  const [pinjolValidation, setPinjolValidation] = useState<PinjolEntity[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState('');
  const [selectedDraft, setSelectedDraft] = useState<{title: string, content: string} | null>(null);
  const [searchPinjol, setSearchPinjol] = useState('');
  const [showSentinelInfo, setShowSentinelInfo] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: 'Halo, saya SatGas AI v2. Saya di sini untuk membantu Anda melawan jeratan pinjol dan judi online. Anda bisa upload screenshot tagihan untuk saya analisis secara otonom.',
        timestamp: new Date()
      }]);
    }
  }, []);

  const handleExecuteAction = (action: AgentAction) => {
    if (action.autonomousDraft) {
      setSelectedDraft({ title: action.title, content: action.autonomousDraft });
      return;
    }

    if (action.title.toLowerCase().includes('psikologis') || action.actionUrl === 'https://safeguard-hsil.vercel.app') {
      window.open('https://safeguard-hsil.vercel.app', '_blank');
      return;
    }

    if (action.type === 'counseling' || action.title.toLowerCase().includes('konseling')) {
      setActiveTab('chat');
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'user',
        content: `Saya ingin melakukan: ${action.title}`,
        timestamp: new Date()
      }]);
      handleSendMessage(`Tolong bantu saya dengan ${action.title}. ${action.description}`);
      return;
    }

    if (action.actionUrl) {
      window.open(action.actionUrl, '_blank');
      return;
    }

    setActions(prev => prev.map(a => a.id === action.id ? { ...a, status: 'completed' as const } : a));
    setActiveTab('chat');
    handleSendMessage(`Saya baru saja menjalankan tindakan "${action.title}". Apa langkah selanjutnya?`);
  };

  const processAnalysis = (result: any) => {
    setUserState(prev => ({
      ...prev,
      riskLevel: result.riskLevel,
      financialHealthScore: result.financialScore,
      isCrisisMode: result.isCrisisTriggered || result.riskLevel === 'critical'
    }));
    setAnalysisText(result.analysis);
    if (result.pinjolValidation) setPinjolValidation(result.pinjolValidation);
    
    if (result.suggestedActions) {
      const newActions: AgentAction[] = result.suggestedActions.map((a: any, index: number) => ({
        id: `action-${Date.now()}-${index}`,
        ...a,
        status: 'pending',
        timestamp: new Date()
      }));
      setActions(prev => [...newActions, ...prev]);
    }
  };

  const handleFinancialSubmit = async (data: FinancialData) => {
    setFinancialData(data);
    setIsAnalyzing(true);
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const result = await analyzeSituation(history, data);
      processAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualPinjolSearch = async () => {
    if (!searchPinjol.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeSituation([{ role: 'user', content: `Cek legalitas pinjol: ${searchPinjol}` }]);
      processAnalysis(result);
      toast.success(`Intel untuk "${searchPinjol}" telah diperbarui.`);
      setSearchPinjol('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      try {
        const history = messages.map(m => ({ role: m.role, content: m.content }));
        const result = await analyzeSituation(history, financialData, { data: base64Data, mimeType: file.type });
        processAnalysis(result);
        
        setActiveTab('dashboard');
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Saya telah menganalisis screenshot yang Anda berikan. Silakan cek pembaruan di Dashboard.',
          timestamp: new Date()
        }]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (content: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMsgId, role: 'assistant', content: '', timestamp: new Date() }]);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const stream = await chatStream(content, history);
      let fullContent = '';
      for await (const chunk of stream) {
        fullContent += chunk.text;
        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, content: fullContent } : m));
      }

      const result = await analyzeSituation([...history, { role: 'user', content }, { role: 'assistant', content: fullContent }]);
      processAnalysis(result);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showLanding ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LandingPage onStart={() => setShowLanding(false)} />
          </motion.div>
        ) : (
          <div className="min-h-screen agent-gradient flex flex-col">
      <AnimatePresence>
        {userState.isCrisisMode && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-600 text-white px-6 py-2 flex items-center justify-between z-[60]"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
               <AlertCircle size={16} className="animate-pulse" />
               Emergency Alert: Crisis Mode Active
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[10px] hidden md:inline opacity-80">Bicara dengan seseorang sekarang:</span>
               <a href="tel:119" className="bg-white text-red-600 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                 <PhoneCall size={12} /> HOTLINE 119
               </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-primary p-2 rounded-xl">
              <Shield className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-slate-900 uppercase">SatGas AI v2</h1>
              <p className="text-[10px] font-mono text-brand-primary font-bold -mt-1 tracking-widest uppercase truncate max-w-[150px] md:max-w-none">Hidup Terlalu Berharga untuk Slot & Pinjol</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Board' },
              { id: 'chat', icon: MessageSquare, label: 'Counsel' },
              { id: 'milestones', icon: Gift, label: 'Quest' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-sm font-medium transition-all flex items-center gap-1.5 md:gap-2",
                  activeTab === tab.id ? "bg-white text-brand-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <tab.icon size={14} className="md:w-4 md:h-4" />
                <span className="inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors text-slate-600 border border-slate-200"
               title="Upload Analyst Screenshot"
             >
                {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
             </button>
             <RiskBadge level={userState.riskLevel} />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' ? (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                <section className="glass-card p-6">
                   <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                          <TrendingDown className="text-brand-primary" />
                          Financial Intel
                        </h2>
                        <p className="text-xs text-slate-500">Agent menganalisis otonom berdasarkan data & screenshot Anda.</p>
                      </div>
                      <div className="text-right">
                         <div className="text-[10px] font-mono text-slate-400">STATUS: {isAnalyzing ? 'REASONING...' : 'ONLINE'}</div>
                         <div className="text-xs font-bold text-brand-primary">ID: {userState.anonymousId}</div>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FinancialForm initialData={financialData} onSubmit={handleFinancialSubmit} isAnalyzing={isAnalyzing} />
                      <div className="space-y-6">
                         <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                            <div>
                              <h3 className="text-xs uppercase font-bold text-slate-400 mb-1 tracking-wider">Health Score</h3>
                              <span className="text-4xl font-bold text-brand-primary">{userState.financialHealthScore}</span>
                            </div>
                            <div className="text-right">
                               <h3 className="text-xs uppercase font-bold text-slate-400 mb-1 tracking-wider">Clean Days</h3>
                               <span className="text-2xl font-bold text-brand-accent flex items-center gap-1 justify-end">
                                 <Heart size={20} className="fill-brand-accent" /> {userState.daysClean}
                               </span>
                            </div>
                         </div>

                         <div className="p-4 bg-white rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                               <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                                 <TrendingDown size={12} /> Debt-to-Income Ratio (DTI)
                               </h3>
                               <span className={cn(
                                 "text-[10px] font-bold px-2 py-0.5 rounded",
                                 (financialData.debts / (financialData.income || 1)) > 0.3 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                               )}>
                                 {Math.round((financialData.debts / (financialData.income || 1)) * 100)}%
                               </span>
                            </div>
                            <div className="h-16 w-full flex items-end gap-1">
                               {Array.from({ length: 20 }).map((_, i) => {
                                 const ratio = (financialData.debts / (financialData.income || 1));
                                 const isActive = i / 20 < ratio;
                                 return (
                                   <div 
                                     key={i} 
                                     className={cn(
                                       "flex-1 rounded-t-sm transition-all duration-500",
                                       isActive 
                                         ? (ratio > 0.3 ? "bg-red-500" : "bg-brand-primary") 
                                         : "bg-slate-100"
                                     )}
                                     style={{ height: isActive ? `${(i+1)*5}%` : '10%' }}
                                   />
                                 );
                               })}
                            </div>
                            <p className="text-[9px] text-slate-400 mt-2 italic">
                               { (financialData.debts / (financialData.income || 1)) > 0.3 
                                 ? "⚠️ RASIO KRITIS: Hutang melebihi 30% pendapatan. Agent menyarankan penghentian pinjaman baru." 
                                 : "Rasio hutang Anda berada dalam batas aman perbankan." }
                            </p>
                         </div>
                         
                         {analysisText && (
                           <div className="p-4 bg-brand-secondary text-white rounded-xl relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-2 opacity-10"><Shield size={40} /></div>
                              <h3 className="text-[10px] uppercase font-bold text-brand-primary mb-2 flex items-center gap-1">
                                <Info size={12} /> SADIS Agent Briefing
                              </h3>
                              <p className="text-sm font-medium leading-relaxed italic">
                                "{analysisText}"
                              </p>
                           </div>
                         )}

                         <PinjolReviewer list={pinjolValidation} />
                      </div>
                   </div>
                </section>
                
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="glass-card p-6">
                      <h3 className="text-sm font-bold flex items-center gap-2 mb-4 uppercase tracking-tighter">
                        <Globe className="text-brand-primary" size={16} />
                        Manual OJK Scanner
                      </h3>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={searchPinjol}
                          onChange={e => setSearchPinjol(e.target.value)}
                          placeholder="Masukkan nama aplikasi..."
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                        />
                        <button 
                          onClick={handleManualPinjolSearch}
                          disabled={isAnalyzing}
                          className="bg-brand-primary text-white p-2 rounded-xl hover:opacity-90 disabled:opacity-50"
                        >
                          {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 font-mono">Simulasi database Satgas Pasti OJK v2.0</p>
                   </div>

                   <div className="glass-card p-6 relative">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter">
                          <AlertCircle className="text-brand-accent" size={16} />
                          Sentinel Config
                        </h3>
                        <button 
                          onMouseEnter={() => setShowSentinelInfo(true)}
                          onMouseLeave={() => setShowSentinelInfo(false)}
                          onClick={() => setShowSentinelInfo(!showSentinelInfo)}
                          className="text-slate-400 hover:text-brand-primary transition-colors"
                        >
                          <HelpCircle size={14} />
                        </button>
                      </div>

                      <AnimatePresence>
                        {showSentinelInfo && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute z-20 top-12 right-6 bg-slate-900 text-white text-[10px] p-3 rounded-lg shadow-xl w-48 leading-relaxed border border-slate-700 font-mono"
                          >
                            <UserCheck size={12} className="text-brand-primary mb-1" />
                            <p>Fitur ini memindai pengeluaran Anda dan memberikan peringatan (toast) jika melewati batas aman tanpa menyimpan data pribadi di server.</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-3">
                         <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Alert Threshold</label>
                            <span className="text-xs font-mono font-bold">Rp {userState.sentinelSettings.threshold.toLocaleString()}</span>
                         </div>
                         <input 
                           type="range" 
                           min="500000" 
                           max="10000000" 
                           step="500000"
                           value={userState.sentinelSettings.threshold}
                           onChange={e => {
                             const val = Number(e.target.value);
                             setUserState(prev => ({ ...prev, sentinelSettings: { ...prev.sentinelSettings, threshold: val }}));
                             toast.success(`Threshold Sentinel diperbarui ke Rp ${val.toLocaleString()}`);
                           }}
                           className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-secondary"
                         />
                         
                         <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 mb-2">
                           <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                              <Bell size={10} className="text-brand-primary" />
                              PWA Notifications Only
                           </div>
                           <p className="text-[9px] text-slate-500 mt-1 leading-tight italic">Privasi diutamakan. SatGas AI hanya mengirim notifikasi ke browser perangkat ini (Toast) agar identitas Anda tetap anonim & aman.</p>
                         </div>

                         <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-bold text-slate-500">
                            {['Toast Alert', 'Push Notif', 'Safe Mode'].map((dest) => (
                              <button 
                                key={dest}
                                onClick={() => {
                                  toast.info(`${dest} diaktifkan secara otonom.`);
                                }}
                                className="px-2 py-1 rounded-md border transition-all bg-brand-primary/10 border-brand-primary text-brand-primary"
                              >
                                {dest.toUpperCase()}
                              </button>
                            ))}
                         </div>
                      </div>
                   </div>
                </section>
                
                <NewsTicker />
              </div>

              <div className="lg:col-span-4 space-y-6">
                <section className="glass-card p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-tighter">
                      <CheckCircle2 className="text-brand-primary" />
                      Protocol Actions
                    </h2>
                  </div>
                  <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                    <AnimatePresence>
                      {actions.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                          {isAnalyzing ? (
                            <Loader2 className="animate-spin mb-4 text-brand-primary" />
                          ) : (
                            <Info className="mb-4 text-slate-300" size={32} />
                          )}
                          <p className="text-xs font-mono">
                            {isAnalyzing 
                              ? "Agent sedang menganalisis intel finansial..." 
                              : "Silakan input data atau upload foto tagihan untuk memulai protokol otonom."}
                          </p>
                        </div>
                      ) : (
                        actions.map((action) => (
                          <ActionCard key={action.id} action={action} onExecute={handleExecuteAction} />
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </section>
              </div>
            </motion.div>
          ) : activeTab === 'chat' ? (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card max-w-4xl mx-auto h-[70vh] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-white/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-primary shadow-inner flex items-center justify-center">
                    <MessageSquare className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">SatGas Counseling Agent</h3>
                    <p className="text-[10px] text-brand-primary font-mono uppercase">Level Otonom: High</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   {userState.isCrisisMode && <span className="text-[10px] font-bold text-red-600 animate-pulse">CRISIS DETECTED</span>}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                {messages.map(m => (
                  <div key={m.id} className={cn("flex flex-col max-w-[85%]", m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                    <div className={cn("p-4 rounded-2xl text-sm leading-relaxed shadow-sm", m.role === 'user' ? "bg-brand-secondary text-white rounded-tr-none" : "bg-white border border-slate-100 text-slate-800 rounded-tl-none")}>
                      {m.content}
                      {m.content === '' && <Loader2 className="animate-spin" size={16} />}
                    </div>
                  </div>
                ))}
              </div>
              <ChatInput onSend={handleSendMessage} onUpload={() => fileInputRef.current?.click()} />
            </motion.div>
          ) : (
            <motion.div key="milestones" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {userState.milestones.map(m => (
                   <div key={m.id} className={cn("glass-card p-6 flex flex-col items-center text-center", !m.isUnlocked && "opacity-50 grayscale")}>
                      <div className={cn("w-16 h-16 rounded-full mb-4 flex items-center justify-center shadow-lg", m.isUnlocked ? "bg-brand-accent text-white" : "bg-slate-200 text-slate-400")}>
                        <Gift size={32} />
                      </div>
                      <h4 className="font-bold text-sm mb-1">{m.title}</h4>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{m.reward}</p>
                      {m.isUnlocked && <div className="mt-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">UNLOCKED</div>}
                   </div>
                 ))}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal: Document Draft */}
      <AnimatePresence>
        {selectedDraft && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2 uppercase tracking-tight"><FileText className="text-brand-primary" /> {selectedDraft.title}</h3>
                <button onClick={() => setSelectedDraft(null)} className="p-1 hover:bg-slate-100 rounded-lg"><Plus className="rotate-45" /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 bg-slate-50 font-mono text-xs leading-relaxed">
                 <pre className="whitespace-pre-wrap">{selectedDraft.content}</pre>
              </div>
              <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                 <button onClick={() => {
                   navigator.clipboard.writeText(selectedDraft.content);
                   alert('Draft berhasil disalin ke clipboard!');
                 }} className="bg-brand-primary text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all">SALIN DRAFT</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Disclaimer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="text-brand-primary h-6 w-6" />
                <h4 className="font-bold text-white uppercase tracking-wider text-lg">SatGas AI v2</h4>
              </div>
              <p className="text-sm leading-relaxed max-w-sm text-slate-500">
                Inisiatif nasional berbasis Kecerdasan Buatan (AI Agent) untuk melindungi masyarakat Indonesia dari jeratan ekosistem Judi Online dan Pinjaman Online Ilegal melalui tindakan preventif dan kuratif otonom.
              </p>
            </div>
            <div>
              <h5 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Resources</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="https://ojk.go.id" className="hover:text-brand-primary transition-colors">OJK Indonesia</a></li>
                <li><a href="https://kominfo.go.id" className="hover:text-brand-primary transition-colors">Kominfo</a></li>
                <li><a href="https://safeguard-hsil.vercel.app" className="hover:text-brand-primary transition-colors">Safeguard Mental Health</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Emergency</h5>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2 text-red-400 font-bold"><PhoneCall size={12} /> HOTLINE: 119</li>
                <li className="flex items-center gap-2"><Globe size={12} /> Bantuan Hukum: LBH Jakarta</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-600 font-mono uppercase tracking-widest">
            <p>© 2026 SatGas AI Command Center - Hackathon Entry</p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Agent v2.0.4-SADIS Deployment Active
            </p>
          </div>
        </div>
      </footer>
          </div>
        )}
      </AnimatePresence>
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

// v2 Sub-components

function RiskBadge({ level }: { level: UserState['riskLevel'] }) {
  const colors = {
    low: "bg-green-100 text-green-700 border-green-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    critical: "bg-red-600 text-white border-red-700 animate-pulse",
  };
  return <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider", colors[level])}>{level} Risk</div>;
}

function PinjolReviewer({ list }: { list: PinjolEntity[] }) {
  if (list.length === 0) return null;
  const hasIllegal = list.some(p => p.status === 'ilegal');
  
  return (
    <div className="space-y-2 mt-4">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
        <Globe size={12} /> OJK Entity Validation
      </h4>
      {hasIllegal && (
        <div className="bg-red-600 text-white p-2 rounded-lg text-[10px] font-bold flex items-center gap-2 animate-bounce">
          <AlertCircle size={14} /> GHOST PROTOCOL ACTIVATED: Pinjol Ilegal Terdeteksi!
        </div>
      )}
      {list.map((p, i) => (
        <div key={i} className={cn("p-2 rounded-lg flex items-center justify-between text-xs font-medium border", p.status === 'legal' ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700 shadow-[0_0_10px_rgba(239,68,68,0.2)]")}>
           <div className="flex items-center gap-2">
             {p.status === 'legal' ? <CheckCircle2 size={14} /> : <Trash2 size={14} />}
             <span>{p.name}</span>
           </div>
           <span className="text-[8px] uppercase font-bold opacity-60">Status: {p.status}</span>
        </div>
      ))}
    </div>
  );
}

function ActionCard({ action, onExecute }: { action: AgentAction; onExecute: (a: AgentAction) => void; [key: string]: any }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 border border-slate-100 bg-white shadow-sm rounded-xl relative overflow-hidden group">
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg", action.type === 'alert' ? "bg-red-50 text-red-500" : action.type === 'plan' ? "bg-blue-50 text-blue-500" : action.type === 'resource' ? "bg-amber-50 text-amber-500" : "bg-teal-50 text-teal-500")}>
          {action.type === 'alert' ? <AlertCircle size={18} /> : action.type === 'plan' ? <LayoutDashboard size={18} /> : action.type === 'resource' ? <Info size={18} /> : <MessageSquare size={18} />}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-800">{action.title}</h4>
          <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{action.description}</p>
          <button onClick={() => onExecute(action)} disabled={action.status === 'completed'} className={cn("mt-3 px-3 py-1.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 transition-all shadow-sm", action.status === 'completed' ? "bg-green-100 text-green-700" : "bg-brand-primary text-white hover:bg-brand-secondary")}>
            {action.status === 'completed' ? <><CheckCircle2 size={12} /> PROTOCOL COMPLETED</> : <>{action.autonomousDraft ? <FileText size={12} /> : <Plus size={12} />} RUN AUTONOMOUS ACTION</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function FinancialForm({ initialData, onSubmit, isAnalyzing }: { initialData: FinancialData, onSubmit: (d: FinancialData) => void, isAnalyzing: boolean }) {
  const [data, setData] = useState(initialData);
  return (
    <div className="space-y-4">
      {[
        { label: 'Pemasukan Bulanan', key: 'income', icon: 'Rp' },
        { label: 'Pengeluaran Pokok', key: 'expenses', icon: 'Rp' },
        { label: 'Estimasi Hutang', key: 'debts', icon: 'Rp' },
        { label: 'Loss Judi / Slot', key: 'gamblingLosses', icon: '🔥' }
      ].map((field) => (
        <div key={field.key} className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{field.label}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">{field.icon}</span>
            <input type="number" className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-8 pr-4 text-sm font-bold focus:ring-2 focus:ring-brand-primary outline-none transition-all" value={(data as any)[field.key] || ''} onChange={e => setData({...data, [field.key]: Number(e.target.value)})} placeholder="0" />
          </div>
        </div>
      ))}
      <button onClick={() => onSubmit(data)} disabled={isAnalyzing} className="w-full bg-brand-secondary text-white font-bold py-3 mt-4 rounded-xl hover:opacity-95 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
        {isAnalyzing ? <Loader2 className="animate-spin" size={20} /> : <TrendingDown size={20} />}
        {isAnalyzing ? 'RUNNING S.A.D.I.S ANALYSIS...' : 'EXECUTE INTEL ANALYSIS'}
      </button>
    </div>
  );
}

function ChatInput({ onSend, onUpload }: { onSend: (c: string) => void, onUpload: () => void }) {
  const [val, setVal] = useState('');
  const handleSend = () => { if (!val.trim()) return; onSend(val); setVal(''); };
  return (
    <div className="p-4 bg-white border-top border-slate-100 flex items-center gap-2">
      <button onClick={onUpload} className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors"><Camera size={20} /></button>
      <div className="relative flex-1">
        <input type="text" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Bicara dengan Agent..." className="w-full bg-slate-100 border-none rounded-2xl py-3 pl-4 pr-12 text-sm focus:ring-2 focus:ring-brand-primary outline-none" />
        <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-primary text-white rounded-xl hover:scale-105 transition-transform"><Send size={18} /></button>
      </div>
    </div>
  );
}

function NewsTicker() {
  const news = [
    "CYBER OPS: SatGas AI v2 mendeteksi 45 situs judi baru di server luar.",
    "OJK INFO: Satgas PASTI menutup 1.200 pinjol ilegal bulan ini.",
    "RECOVERY ALERT: Komunitas Pejuang Bebas Pinjol meningkat 40%.",
    "AGENT WARNING: Jangan upload KTP ke aplikasi tanpa logo OJK/AFPI."
  ];
  const [index, setIndex] = useState(0);
  useEffect(() => { const timer = setInterval(() => setIndex(i => (i + 1) % news.length), 6000); return () => clearInterval(timer); }, []);
  return (
    <div className="overflow-hidden glass-card p-3 bg-slate-900 border-none">
       <div className="flex items-center gap-4">
          <div className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded leading-none flex items-center gap-1"><MapPin size={8} /> LIVE INTEL</div>
          <motion.p key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-slate-300 font-mono truncate tracking-tight">{news[index]}</motion.p>
       </div>
    </div>
  );
}

