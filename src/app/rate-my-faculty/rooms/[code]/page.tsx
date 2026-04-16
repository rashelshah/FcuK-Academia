'use client';

import React, { useEffect, useRef, useState, use } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GossipRoomChatPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params);
  const roomCode = resolvedParams.code;
  const router = useRouter();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [userHash, setUserHash] = useState('');
  const [loading, setLoading] = useState(true);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize a stable pseudo-hash on client-side so user's own messages can be identified
  useEffect(() => {
    let hash = localStorage.getItem('rmf_user_hash');
    if (!hash) {
      hash = Math.random().toString(36).substring(2, 10);
      localStorage.setItem('rmf_user_hash', hash);
    }
    setUserHash(hash);
  }, []);

  const [room, setRoom] = useState<{ name: string, roomCode: string, password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/rmf/rooms/${roomCode}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        setRoom(data.room);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000); // 2-second short polling
    return () => clearInterval(interval);
  }, [roomCode]);

  useEffect(() => {
    // Auto scroll to bottom when new messages arrive
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInvite = () => {
    if (!room) return;
    const text = `Room: ${room.name}\nCode: ${room.roomCode}\nPass: ${room.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !userHash) return;
    
    const pendingMsg = { id: 'temp-' + Date.now(), content: inputText.trim(), userHash, createdAt: new Date() };
    setMessages(prev => [...prev, pendingMsg]);
    setInputText('');

    try {
      await fetch(`/api/rmf/rooms/${roomCode}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: pendingMsg.content, userHash }),
      });
      // the polling will automatically resolve and fix the IDs shortly
    } catch(e) {
      console.error('Failed to send message:', e);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col pb-32 text-[var(--text)] font-[var(--font-body)]">
      {/* Global Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute inset-0 bg-[var(--background)]" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>
      
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 px-4 sm:px-6 py-6 flex items-center justify-between backdrop-blur-sm"
      >
        <button 
          onClick={() => router.back()} 
          className="group flex items-center gap-2 text-[var(--text-muted)] font-medium text-[9px] hover:text-[var(--text)] transition-all uppercase tracking-widest bg-[var(--surface-highlight)]/10 hover:bg-[var(--surface-highlight)]/20 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" /> <span>LEAVE</span>
        </button>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="font-serif font-bold tracking-tight text-xl text-[var(--text)] drop-shadow-lg leading-tight">
            {room?.name || 'Loading...'}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px] text-on-surface-variant/40 font-bold tracking-[0.2em] uppercase">
              {room?.roomCode} <span className="mx-1 opacity-20">•</span> ENCRYPTED
            </span>
          </div>
        </div>
        
        <button 
          onClick={handleInvite}
          className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg border transition-all ${
            copied 
              ? 'bg-green-500/20 border-green-500/50 text-green-400' 
              : 'bg-[var(--surface-highlight)]/10 border-white/5 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-highlight)]/20'
          }`}
        >
          {copied ? 'COPIED!' : 'INVITE'}
        </button>
      </motion.div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:px-6 flex flex-col gap-4 pb-32">
        {loading ? (
          <div className="flex flex-1 items-center justify-center text-xs tracking-widest uppercase text-on-surface-variant/50">
            CONNECTING...
          </div>
        ) : !Array.isArray(messages) ? (
          <div className="flex flex-1 items-center justify-center text-xs tracking-widest uppercase text-on-surface-variant/50">
            LOAD FAILED. RETRYING...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-xs tracking-widest uppercase text-on-surface-variant/50">
            No gossip here yet. Break the ice.
          </div>
        ) : (
          messages.map((msg: any, idx: number) => {
            const isMe = msg.userHash === userHash;
            const showIdentity = idx === 0 || messages[idx-1].userHash !== msg.userHash;

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {showIdentity && !isMe && (
                  <span className="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant/50 mb-1 ml-2">
                    Anon {msg.userHash.substring(0, 4)}
                  </span>
                )}
                <div 
                  className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                    isMe 
                      ? 'bg-[var(--primary)]/20 border border-[var(--primary)]/30 text-[var(--text)] rounded-br-sm' 
                      : 'bg-[var(--surface-highlight)]/20 border border-white/10 text-[var(--text-muted)] rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-[calc(80px+max(env(safe-area-inset-bottom),0px))] sm:bottom-[calc(100px+max(env(safe-area-inset-bottom),0px))] left-0 right-0 px-4 sm:px-6 pointer-events-none">
        <form 
          onSubmit={handleSend} 
          className="pointer-events-auto max-w-3xl mx-auto bg-[var(--surface-elevated)]/90 backdrop-blur-3xl border border-white/10 p-2 rounded-[2rem] shadow-2xl flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Spill the tea..."
            className="flex-1 bg-transparent px-4 py-3 text-sm text-[var(--text)] placeholder:text-on-surface-variant/50 outline-none"
            autoComplete="off"
          />
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="w-12 h-12 flex items-center justify-center bg-[var(--primary)] rounded-full text-[var(--accent-fg)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
          </button>
        </form>
      </div>

    </div>
  );
}
