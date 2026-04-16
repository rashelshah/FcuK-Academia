'use client';

import React, { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RmfRoomsPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<'JOIN' | 'CREATE'>('JOIN');
  
  // Join State
  const [roomCode, setRoomCode] = useState('');
  const [password, setPassword] = useState('');
  
  // Create State
  const [roomName, setRoomName] = useState('');
  
  // App State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initializedRoom, setInitializedRoom] = useState<{ code: string, pass: string, name: string } | null>(null);

  const [copied, setCopied] = useState(false);

  const handleShareAccess = () => {
    if (!initializedRoom) return;
    const text = `Room: ${initializedRoom.name}\nCode: ${initializedRoom.code}\nPass: ${initializedRoom.pass}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'JOIN' && (roomCode.length !== 4 || password.length !== 4)) {
      setError('Code and password must be 4 characters');
      return;
    }
    if (tab === 'CREATE' && !roomName.trim()) {
      setError('Room name is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const payload = tab === 'JOIN' 
        ? { action: tab, roomCode, password }
        : { action: tab, roomName };

      const res = await fetch('/api/rmf/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      if (tab === 'CREATE') {
        // Show success screen
        setInitializedRoom({ code: data.roomCode, pass: data.password, name: data.name });
      } else {
        // Just join smoothly
        startTransition(() => {
          router.push(`/rate-my-faculty/rooms/${data.roomCode}`);
        });
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnterGeneratedRoom = () => {
    if (!initializedRoom) return;
    startTransition(() => {
      router.push(`/rate-my-faculty/rooms/${initializedRoom.code}`);
    });
  };

  return (
    <div className="min-h-screen relative pb-32 text-[var(--text)] font-[var(--font-body)] flex flex-col">
      {/* Global Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-[var(--background)]" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 px-4 sm:px-6 py-4 flex items-center justify-between"
      >
        <button onClick={() => router.back()} className="flex items-center gap-2 text-on-surface-variant font-medium text-[10px] hover:text-white transition-colors uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
          <ArrowLeft size={14} /> <span>Home</span>
        </button>
        
        <div className="absolute left-1/2 -translate-x-1/2">
          <span className="font-serif font-bold tracking-tight text-xl text-[var(--text)] drop-shadow-sm">
            Gossip <span className="italic text-[var(--primary)]">Rooms</span>
          </span>
        </div>
        
        <div className="w-10"></div>
      </motion.div>

      <div className="flex-1 flex items-center justify-center -mt-20">
        <div className="w-full max-sm px-6">
          
          <AnimatePresence mode="wait">
            {initializedRoom ? (
              <motion.div
                key="initialized"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full relative"
              >
                {/* Glow container */}
                <div className="absolute inset-0 rounded-lg bg-green-500/20 blur-xl opacity-30 pointer-events-none" />
                <div className="relative border border-green-500/50 rounded-lg p-8 pb-6 bg-[var(--surface-elevated)] backdrop-blur-md flex flex-col items-center shadow-2xl">
                  
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-full border border-green-500/50 flex items-center justify-center bg-green-500/10 mb-6 text-green-400">
                    <Check size={16} strokeWidth={3} />
                  </div>

                  <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-4 opacity-60">ROOM INITIALIZED</h3>
                  <h1 className="text-3xl font-serif font-bold text-[var(--text)] mb-8 tracking-tighter">{initializedRoom.name}</h1>

                  {/* Secret Block Container */}
                  <div className="w-[110%] grid grid-cols-2 gap-[1px] bg-black border border-white/10 mb-8 rounded-sm overflow-hidden">
                    <div className="bg-[var(--surface-highlight)]/10 p-5 flex flex-col items-center justify-center">
                      <span className="text-[8px] tracking-[0.2em] text-on-surface-variant font-bold uppercase mb-4">ROOM CODE</span>
                      <span className="text-xl font-serif text-[var(--text)] tracking-[0.3em] font-medium">{initializedRoom.code}</span>
                    </div>
                    <div className="bg-[var(--surface-highlight)]/10 p-5 flex flex-col items-center justify-center">
                      <span className="text-[8px] tracking-[0.2em] text-on-surface-variant font-bold uppercase mb-4">PASSWORD</span>
                      <span className="text-xl font-serif text-[var(--text)] tracking-[0.3em] font-medium">{initializedRoom.pass}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleEnterGeneratedRoom}
                    disabled={isPending}
                    className="w-[110%] py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--background)] bg-[var(--primary)] hover:opacity-90 transition-colors mb-3 rounded-sm disabled:opacity-50"
                  >
                    {isPending ? 'JOINING...' : 'ENTER ROOM'}
                  </button>
                  <button 
                    onClick={handleShareAccess}
                    className={`w-[110%] py-3.5 text-[10px] font-black uppercase tracking-[0.2em] border transition-all rounded-sm ${
                      copied 
                        ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                        : 'text-on-surface-variant border-white/5 hover:text-white bg-black/20 hover:bg-black/40'
                    }`}
                  >
                    {copied ? 'COPIED!' : 'SHARE ACCESS'}
                  </button>

                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                {/* Tabs */}
                <div className="flex justify-center border-b border-white/10 mb-8 w-fit mx-auto">
                  <button 
                    onClick={() => { setTab('JOIN'); setError('') }}
                    className={`px-4 py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all relative ${tab === 'JOIN' ? 'text-[var(--text)]' : 'text-on-surface-variant'}`}
                  >
                    JOIN ROOM
                    {tab === 'JOIN' && <motion.div layoutId="roomTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)]" />}
                  </button>
                  <button 
                    onClick={() => { setTab('CREATE'); setError('') }}
                    className={`px-4 py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all relative ${tab === 'CREATE' ? 'text-[var(--text)]' : 'text-on-surface-variant'}`}
                  >
                    CREATE NEW
                    {tab === 'CREATE' && <motion.div layoutId="roomTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--primary)]" />}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <form onSubmit={handleAccess} className="flex flex-col items-center">
                      
                      <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-6 opacity-60">
                        {tab === 'JOIN' ? 'ENTER CREDENTIALS' : 'SET IDENTIFIER'}
                      </h2>

                      {error && (
                        <div className="mb-4 text-[#D84C4C] text-[10px] font-bold uppercase tracking-widest bg-[#D84C4C]/10 py-2 px-4 rounded-full border border-[#D84C4C]/20">
                          {error}
                        </div>
                      )}

                      {tab === 'JOIN' ? (
                        <>
                          <div className="w-full text-center border-b border-white/5 pb-8 mb-8 relative">
                            <label className="block text-[8px] font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-4">ROOM CODE</label>
                            <input
                              type="password"
                              maxLength={4}
                              value={roomCode}
                              onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, ''))}
                              placeholder="0000"
                              className="w-full bg-transparent text-center font-serif text-4xl tracking-[1em] text-[var(--text)] outline-none focus:placeholder-transparent"
                              style={{ WebkitTextSecurity: 'none' } as any}
                            />
                          </div>
                          <div className="w-full text-center border-b border-white/5 pb-8 mb-12 relative">
                            <label className="block text-[8px] font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-4">PASSWORD</label>
                            <input
                              type="password"
                              maxLength={4}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••"
                              className="w-full bg-transparent text-center text-2xl tracking-[1.5em] text-on-surface-variant outline-none focus:placeholder-transparent"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="w-full text-center border-b border-white/5 pb-8 mb-12 mt-4 relative">
                          <label className="block text-[8px] font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-8">NAME YOUR ROOM</label>
                          <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Room name..."
                            className="w-[120%] -ml-[10%] bg-transparent text-center font-serif text-2xl tracking-[0.05em] text-[var(--text)] outline-none placeholder:text-on-surface-variant/40"
                          />
                        </div>
                      )}

                      <button 
                        type="submit"
                        disabled={loading || isPending || (tab === 'JOIN' && (roomCode.length !== 4 || password.length !== 4)) || (tab === 'CREATE' && !roomName.trim())}
                        className="w-full py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--background)] bg-[var(--primary)] hover:opacity-90 transition-colors disabled:opacity-20 flex items-center justify-center gap-2"
                      >
                        {loading || isPending ? 'PROCESSING...' : tab === 'JOIN' ? 'ACCESS ROOM' : 'CREATE ROOM'}
                      </button>
                    </form>
                  </motion.div>
                </AnimatePresence>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

    </div>
  );
}
