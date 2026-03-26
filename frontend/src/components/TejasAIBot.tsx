import { useState, useRef, useEffect } from 'react';
import { api } from '../lib/api';

type Message = { role: 'user' | 'assistant'; content: string };

export default function TejasAIBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I am Tejas AI. Ask me any questions about healthcare costs and hospitals in India!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  const handleSend = async (override?: string) => {
    const userMsg = override || input;
    if (!userMsg.trim()) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const { data } = await api.post('/ai/assistant', { question: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer || "I couldn't process that. Could you rephrase?" }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I am facing a connection issue right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end">
        {isOpen && (
          <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl w-80 sm:w-96 h-[500px] max-h-[80vh] flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-5">
            {/* Header */}
            <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="text-white font-bold text-sm">Tejas AI</h3>
                  <p className="text-emerald-400 text-[10px] font-semibold tracking-wider uppercase">Active & Ready</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-slate-800 border border-slate-700 rounded-tl-sm text-sm flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Area */}
            <div className="bg-slate-900 px-3 py-2 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide border-t border-slate-700/50">
              {['Most expensive city?', 'Hidden charges?', 'Cheapest city?', 'Blood test prices?', 'MRI / CT Scan costs?', 'Health checkup packages?'].map(q => (
                <button
                  key={q}
                  onClick={() => { handleSend(q); }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-full border border-slate-700 transition-colors flex-shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-3 bg-slate-800 border-t border-slate-700">
              <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask Tejas AI..."
                  className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" disabled={!input.trim() || isLoading} className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl px-4 py-2 transition-colors flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* FAB Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group relative ${isOpen ? 'w-12 h-12 bg-slate-700 text-white rounded-full' : 'w-16 h-16 bg-gradient-to-tr from-emerald-600 to-teal-400 text-white rounded-2xl border border-emerald-400/30'}`}
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
             <span className="text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform">✨</span>
          )}
          {!isOpen && (
            <span className="absolute right-full mr-3 whitespace-nowrap bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700">
              Ask AI Assistant
            </span>
          )}
        </button>
      </div>
    </>
  );
}
