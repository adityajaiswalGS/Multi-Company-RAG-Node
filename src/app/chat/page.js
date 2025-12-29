'use client';

import { useState, useEffect, useRef, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Box, CircularProgress } from '@mui/material';

import ChatHeader from './components/ChatHeader';
import ChatSidebar from './components/ChatSidebar';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';

import { AuthContext } from '@/components/AuthContextProvider';
import { setLogout } from '@/redux/authSlice';

const CHAT_API_URL = 'http://localhost:5000/api/chat/query';

export default function ChatPage() {
  const { profile, loading: authLoading } = useContext(AuthContext);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);

  // 1. Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 2. Fetch documents with 'processed' status
  const refreshDocs = async () => {
    if (!token) return;
    setRefreshLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/docs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter for 'processed' status from your n8n ingestion
      const readyDocs = res.data.filter(d => d.status === 'processed' || d.status === 'processing');
      setDocuments(readyDocs);
      
      if (readyDocs.length > 0 && selectedDocs.length === 0) {
        setSelectedDocs(readyDocs.map(d => d.id));
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    } finally {
      setRefreshLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && token) refreshDocs();
  }, [authLoading, token]);

  const handleLogout = () => {
    dispatch(setLogout());
    setMessages([]);
    router.replace('/login');
  };

  const handleSend = async () => {
    if (!question.trim() || selectedDocs.length === 0 || loading) return;

    const currentQuestion = question.trim();
    setMessages((prev) => [...prev, { role: 'user', content: currentQuestion }]);
    setQuestion('');
    setLoading(true);

    // Placeholder for assistant
    setMessages((prev) => [...prev, { role: 'assistant', content: null }]);

    try {
      const response = await axios.post(CHAT_API_URL, {
        question: currentQuestion,
        selected_doc_ids: selectedDocs,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages((prev) => {
        const updated = [...prev];
        const rawAnswer = response.data.answer;

        // ✅ DOUBLE SAFETY: Ensure content is always a string
        const cleanContent = (typeof rawAnswer === 'object' && rawAnswer !== null)
          ? (rawAnswer.output || JSON.stringify(rawAnswer))
          : (rawAnswer || "I don't have information about that in the selected documents.");

        updated[updated.length - 1].content = cleanContent;
        return updated;
      });
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content = 'Sorry, the assistant is unavailable.';
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !profile) {
    return (
      <Box display="flex" height="100vh" alignItems="center" justifyContent="center" bgcolor="#f8fafc">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box display="flex" height="100vh" bgcolor="#f8fafc">
      <ChatSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        documents={documents}
        selectedDocs={selectedDocs}
        onToggleDoc={(id) => setSelectedDocs(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])}
        refreshLoading={refreshLoading}
        onRefresh={refreshDocs}
        onLogout={handleLogout}
      />

      <Box flex={1} display="flex" flexDirection="column">
        <ChatHeader user={profile} companyId={profile.company_id} />
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
        <ChatInput
          question={question}
          setQuestion={setQuestion}
          onSend={handleSend}
          loading={loading}
          disabled={selectedDocs.length === 0}
        />
      </Box>
    </Box>
  );
}