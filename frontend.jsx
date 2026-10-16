import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  X, 
  ShieldCheck, 
  RotateCcw,
  Bot,
  User,
  HardHat,
  Menu,
  Wrench,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { marked } from 'marked';

const API_URL = "http://localhost:5000/chat"; 
const TOKEN = "AbangTechHensem123";

const ROLES = [
  { 
    id: 'Operator', 
    title: 'Operator', 
    badge: 'SOP & Quick Action', 
    desc: 'Langkah demi langkah, arahan jelas & praktikal' 
  },
  { 
    id: 'Technician', 
    title: 'Technician', 
    badge: 'Root Cause & Fix', 
    desc: 'Diagnosis teknikal, komponen & kaedah pembaikan' 
  },
  { 
    id: 'Engineer', 
    title: 'Engineer', 
    badge: 'Analysis & Logic', 
    desc: 'Analisis data, parameter mesin & tindakan pencegahan' 
  },
  { 
    id: 'Manager', 
    title: 'Manager', 
    badge: 'Downtime & Cost', 
    desc: 'Impak operasi, KPI, risiko keselamatan & kos' 
  }
];

export default function App() {
  const [role, setRole] = useState(() => sessionStorage.getItem('abang_role') || 'Operator');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('abang_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'init-1',
        sender: 'bot',
        text: 'Selamat datang! Saya **Abang Tech**, rakan teknikal pintar lantai produksi anda.\n\nPilih peranan anda untuk jawapan yang tepat, dan anda boleh kemukakan soalan atau **attach gambar** kerosakan komponen, alarm HMI, atau litar teknikal.',
        image: null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedMimeType, setSelectedMimeType] = useState('image/jpeg');
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    sessionStorage.setItem('abang_history', JSON.stringify(messages));
    sessionStorage.setItem('abang_role', role);
  }, [messages, role]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setMobileMenuOpen(false);
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'system',
        text: `Mod peranan aktif: **${newRole}**`,
        image: null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Sila pilih fail imej sahaja (JPEG, PNG, WEBP).');
      return;
    }

    setSelectedMimeType(file.type);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetChat = () => {
    if (window.confirm("Kosongkan ruang chat dan mulakan sesi baharu?")) {
      sessionStorage.removeItem('abang_history');
      setMessages([
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: 'Sesi baharu dimulakan. Sedia menerima sebarang pertanyaan teknikal atau imej.',
          image: null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setMobileMenuOpen(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if ((!inputMessage.trim() && !selectedImage) || isLoading) return;

    const currentMsg = inputMessage.trim();
    const currentImg = selectedImage;
    const currentMime = selectedMimeType;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setInputMessage('');
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: currentMsg,
      image: currentImg,
      timestamp: currentTime
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Token': TOKEN
        },
        body: JSON.stringify({
          message: currentMsg,
          role: role,
          image: currentImg,
          mime_type: currentMime
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: data.reply,
            image: null,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'error',
            text: `Ralat pelayan (Kod: ${response.status}). Sila semak sambungan backend.`,
            image: null,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'error',
          text: 'Tidak dapat berhubung dengan server. Sila pastikan backend Flask anda sedang berjalan.',
          image: null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex bg-slate-100 overflow-hidden text-slate-800">
      
      {/* ===================== SIDEBAR (LAPTOP & DESKTOP) ===================== */}
      <aside className="hidden lg:flex lg:w-80 xl:w-96 flex-col bg-white border-r border-slate-200 z-20">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg leading-tight">Abang Tech</h1>
              <p className="text-xs text-slate-500 font-medium">Smart Factory Advisor</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </span>
        </div>

        {/* Roles Selection */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 block">
              Pilih Profil Jawatan
            </label>
            <div className="space-y-2">
              {ROLES.map((r) => {
                const active = role === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleRoleChange(r.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex flex-col ${
                      active
                        ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`font-semibold text-sm ${active ? 'text-blue-700' : 'text-slate-900'}`}>
                        {r.title}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                        active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {r.badge}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 leading-relaxed">
                      {r.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Safety Reminder Card */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Standard Keselamatan Kilang</span>
            </div>
            <ul className="text-[11px] text-amber-900/80 space-y-1.5 pl-5 list-disc leading-tight">
              <li>Pastikan prosedur <b>LOTO</b> dipatuhi sebelum menyentuh litar atau mesin.</li>
              <li>Sentiasa gunakan <b>PPE</b> yang bersesuaian di lantai produksi.</li>
              <li>Laporkan sebarang anomali kritikal kepada penyelia bertugas.</li>
            </ul>
          </div>
        </div>

        {/* Reset / Footer Info */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleResetChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Mulakan Sesi Baru (Clear Chat)
          </button>
        </div>
      </aside>

      {/* ===================== MAIN CHAT SECTION (SEMUA DEVICE) ===================== */}
      <main className="flex-1 flex flex-col h-full bg-white relative">
        
        {/* Top Navbar untuk Tablet & Mobile */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <HardHat className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm leading-none">Abang Tech</h1>
              <span className="text-[10px] text-blue-600 font-medium">Mod: {role}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetChat}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              title="Reset Chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Pilih Peranan"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Mobile Horizontal Quick-Switch Role bar */}
        <div className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => handleRoleChange(r.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                role === r.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {r.title}
            </button>
          ))}
        </div>

        {/* Mobile Slide-Down Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-[57px] left-0 right-0 bg-white border-b border-slate-200 shadow-xl p-4 z-30 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-slate-400">Pilih Peranan Anda</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRoleChange(r.id)}
                  className={`p-2.5 rounded-xl text-left border ${
                    role === r.id
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{r.title}</div>
                  <div className="text-[10px] text-slate-500 truncate">{r.badge}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Header Desktop Indikator Ringkas */}
        <div className="hidden lg:flex items-center justify-between px-8 py-3.5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Peranan Semasa:</span>
            <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full border border-blue-200">
              {role}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
            <span>SOP & Safety-First Advisor Ready</span>
          </div>
        </div>

        {/* Conversation Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 max-w-5xl w-full mx-auto">
          {messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="flex justify-center my-3">
                  <span 
                    className="text-xs bg-slate-100 text-slate-500 px-3.5 py-1 rounded-full border border-slate-200"
                    dangerouslySetInnerHTML={{ __html: marked.parseInline(msg.text) }}
                  />
                </div>
              );
            }

            const isUser = msg.sender === 'user';
            const isError = msg.sender === 'error';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[92%] sm:max-w-[85%] lg:max-w-[78%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : isError
                      ? 'bg-rose-100 text-rose-600 border border-rose-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-600" />}
                </div>

                {/* Bubble Container */}
                <div className="flex flex-col gap-1">
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                        : isError
                        ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-tl-none'
                        : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-none markdown-body'
                    }`}
                  >
                    {/* Display Attached Image */}
                    {msg.image && (
                      <div className="mb-3 rounded-xl overflow-hidden border border-slate-200 max-w-md">
                        <img
                          src={msg.image}
                          alt="Lampiran kerosakan"
                          className="w-full max-h-72 object-cover"
                        />
                      </div>
                    )}

                    {/* Text Payload */}
                    {isUser ? (
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} />
                    )}
                  </div>

                  <span className={`text-[10px] text-slate-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-slate-500 bg-white border border-slate-200 px-4 py-3 rounded-2xl w-fit shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span>Abang Tech sedang menganalisa data & imej...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Floating Thumbnail Preview Sebelum Hantar */}
        {selectedImage && (
          <div className="max-w-5xl w-full mx-auto px-4 sm:px-6">
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-blue-200 bg-white">
                  <img src={selectedImage} alt="Pratonton" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">1 Imej Dilampirkan</p>
                  <p className="text-[11px] text-slate-500">Imej sedia dihantar untuk analisis teknikal</p>
                </div>
              </div>
              <button
                onClick={removeSelectedImage}
                className="p-1.5 rounded-lg hover:bg-blue-100 text-slate-500 hover:text-rose-600 transition-colors"
                title="Batal lampiran"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Input Bar Section */}
        <footer className="p-3 sm:p-4 lg:p-6 bg-white border-t border-slate-200">
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageSelect}
                className="hidden"
              />

              {/* Attach Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex-shrink-0"
                title="Attach Photo / Component / Error Screen"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Tanya diagnosis, SOP, kod error, atau ulas gambar yang dilampirkan..."
                className="flex-1 bg-slate-50 focus:bg-white text-slate-900 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
                className={`p-3 rounded-xl text-white transition-all flex-shrink-0 ${
                  (!inputMessage.trim() && !selectedImage) || isLoading
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-sm active:scale-95'
                }`}
                title="Hantar soalan"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </footer>

      </main>
    </div>
  );
}
