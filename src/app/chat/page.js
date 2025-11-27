'use client';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('profiles').select('company_id').eq('id', user?.id).single();
      setCompanyId(data.company_id);
    })();
  }, []);

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
  };

  return (
    <div className="max-w-4xl mx-auto p-8 min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Your Company AI Chat</h1>
      <div className="bg-gray-50 rounded-xl shadow-lg h-96 overflow-y-auto p-6 mb-6">
        {messages.map((m, i) => (
          <div key={i} className={`mb-4 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-4 rounded-2xl max-w-xl ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
              {m.content}
            </span>
          </div>
        ))}
        {loading && <div className="text-gray-500 italic">AI is typing...</div>}
      </div>
      <div className="flex gap-4">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask anything about your documents..."
          className="flex-1 border-2 border-gray-300 rounded-xl px-6 py-4 text-lg"
        />
        <button onClick={send} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl text-xl font-bold">
          Send
        </button>
      </div>
    </div>
  );
}