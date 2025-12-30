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
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default open is usually better

  const messagesEndRef = useRef(null);

  // Auto-scroll effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch only 'processed' documents
  const refreshDocs = async () => {
    if (!token) return;
    setRefreshLoading(true);
    try {
      // FIX 1: Add limit=100 so we get all docs for the chat context (not just page 1)
      const res = await axios.get('http://localhost:5000/api/admin/docs?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // FIX 2: Handle the new response structure { documents: [], pagination: {} }
      let fetchedDocs = [];
      if (res.data && res.data.documents) {
        fetchedDocs = res.data.documents;
      } else if (Array.isArray(res.data)) {
        fetchedDocs = res.data;
      }

      // Filter for valid statuses
      const readyDocs = fetchedDocs.filter(d => d.status === 'processed' || d.status === 'processing');
      setDocuments(readyDocs);
      
      // Select all by default if none selected
      if (readyDocs.length > 0 && selectedDocs.length === 0) {
        setSelectedDocs(readyDocs.map(d => d.id));
      }
    } catch (err) {
      console.error("Doc Refresh Error", err);
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

    // Add assistant loading state
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
        const lastIndex = updated.length - 1;
        updated[lastIndex].content = response.data.answer || "I don't have information about that in the selected documents.";
        return updated;
      });
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content = 'The assistant is currently offline or encountered an error.';
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