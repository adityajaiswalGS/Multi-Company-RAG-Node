'use client';

import { useState, useEffect, useRef, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Box, CircularProgress } from '@mui/material';

// Components
import ChatHeader from './components/ChatHeader';
import ChatSidebar from './components/ChatSidebar';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';

import { AuthContext } from '@/components/AuthContextProvider';
import { setLogout } from '@/redux/authSlice';

// API Endpoints
const API_BASE_URL = 'http://localhost:5000/api/chat'; 
// NOTE: If standard users get a 403 error here, your backend blocks non-admins from this route.
const DOCS_API_URL = 'http://localhost:5000/api/admin/docs'; 

export default function ChatPage() {
  const { profile, loading: authLoading } = useContext(AuthContext);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  // State
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- 1. Fetch Documents ---
  const refreshDocs = async () => {
    if (!token) return;
    setRefreshLoading(true);
    
    try {
      // Fetch with limit=100 to get all context docs
      const res = await axios.get(`${DOCS_API_URL}?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("User Chat Docs API Response:", res.data);

      // --- HANDLE BOTH FORMATS ---
      let fetchedDocs = [];
      if (res.data && res.data.documents) {
        fetchedDocs = res.data.documents; // New Pagination Object
      } else if (Array.isArray(res.data)) {
        fetchedDocs = res.data;           // Old Array Format
      }

      // Filter: Show only processed or processing docs
      const readyDocs = fetchedDocs.filter(d => d.status === 'processed' || d.status === 'processing');
      setDocuments(readyDocs);
      
      // Auto-select all if none selected
      if (readyDocs.length > 0 && selectedDocs.length === 0) {
        setSelectedDocs(readyDocs.map(d => d.id));
      }

    } catch (err) {
      console.error("Failed to load docs:", err);
      // Specific check for Permission Error
      if (err.response && (err.response.status === 403 || err.response.status === 401)) {
        alert("Permission Error: Standard users cannot access '/api/admin/docs'. Please update your Backend Routes to allow this.");
      }
    } finally {
      setRefreshLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && token) refreshDocs();
  }, [authLoading, token]);

  // --- 2. Handlers ---
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
    
    // Add Assistant Placeholder
    setMessages((prev) => [...prev, { role: 'assistant', content: null }]);

    try {
      const response = await axios.post(`${API_BASE_URL}/query`, {
        question: currentQuestion,
        selected_doc_ids: selectedDocs,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessages((prev) => {
        const updated = [...prev];
        const rawAnswer = response.data.answer;
        
        // Handle Object vs String response
        const cleanContent = (typeof rawAnswer === 'object' && rawAnswer !== null)
          ? (rawAnswer.output || JSON.stringify(rawAnswer))
          : (rawAnswer || "I don't have information about that in the selected documents.");

        updated[updated.length - 1].content = cleanContent;
        return updated;
      });
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content = 'Sorry, the assistant is currently unavailable.';
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