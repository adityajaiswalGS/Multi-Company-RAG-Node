'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const router = useRouter();

  // Load company_id
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      const { data } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      setCompanyId(data.company_id);
    })();
  }, [router]);

  // Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const send = async () => {
    if (!input.trim() || !companyId) return;
    const question = input;
    setMessages(m => [...m, { role: 'user', content: question }]);
    setInput('');
    setLoading(true);

    const evtSource = new EventSource(`/api/chat?question=${encodeURIComponent(question)}&companyId=${companyId}`);

    let answer = '';
    evtSource.onmessage = (e) => {
      if (e.data === '[DONE]') {
        evtSource.close();
        setLoading(false);
      } else {
        answer += e.data;
        setMessages(m => {
          const last = m[m.length - 1];
          if (last?.role === 'assistant') {
            last.content = answer;
            return [...m];
          } else {
            return [...m, { role: 'assistant', content: answer }];
          }
        });
      }
    };

    evtSource.onerror = () => {
      evtSource.close();
      setLoading(false);
      setMessages(m => [...m, { role: 'assistant', content: 'Error: Could not connect to AI.' }]);
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      {/* FIXED HEADER */}
      <header className="bg-white shadow-md border-b border-gray-200 px-8 py-5 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
        <h1 className="text-3xl font-bold text-gray-800">Your Company AI Chat</h1>
        <button
          onClick={handleLogout}
          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg hover:shadow-xl"
        >
          Logout
        </button>
      </header>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 pt-24 pb-10 max-w-5xl mx-auto w-full px-6">
        <div className="bg-white rounded-2xl shadow-2xl h-full flex flex-col" style={{ minHeight: 'calc(100vh - 220px)' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-20">
                <p className="text-2xl font-medium">Ask anything about your company documents</p>
                <p className="mt-2">Your data is private and secure</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-2xl px-6 py-4 rounded-2xl shadow-md ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-6 py-4 rounded-2xl shadow-md">
                  <span className="typing-indicator">AI is typing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex gap-4">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Type your message..."
                className="flex-1 text-gray-800 border-2 border-gray-300 rounded-xl px-6 py-4 text-lg focus:outline-none focus:border-indigo-500 transition"
                disabled={loading}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition shadow-lg disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}