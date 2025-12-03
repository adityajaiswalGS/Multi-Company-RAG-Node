// src/app/chat/page.js
'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Divider,
  Chip,
  CircularProgress,
  IconButton
} from '@mui/material';

import { Send, CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material';
import RefreshIcon from '@mui/icons-material/Refresh';
import Description from '@mui/icons-material/Description';

export default function ChatPage() {
  const [user, setUser] = useState(null);
  const [companyId, setCompanyId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const messagesEndRef = useRef(null);
  const router = useRouter();

  // ────────────────────────────────────────────────
  // LOAD USER + DOCUMENTS
  // ────────────────────────────────────────────────
  useEffect(() => {
    loadUserAndDocs();
  }, []);

  const loadUserAndDocs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.replace('/login');

    setUser(user);

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) return;

    setCompanyId(profile.company_id);

    await fetchDocuments(profile.company_id);
  };

  // ────────────────────────────────────────────────
  // FETCH DOCUMENTS FUNCTION (USED BY REFRESH TOO)
  // ────────────────────────────────────────────────
  const fetchDocuments = async (cid = companyId) => {
    setRefreshing(true);

    const { data: docs } = await supabase
      .from('documents')
      .select('*')
      .eq('company_id', cid)
      .eq('status', 'ready')
      .order('created_at', { ascending: false });

    setDocuments(docs || []);
    setSelectedDocs(docs?.map(d => d.id) || []);

    setRefreshing(false);
  };

  // ────────────────────────────────────────────────
  // SCROLL TO BOTTOM
  // ────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ────────────────────────────────────────────────
  // SEND MESSAGE
  // ────────────────────────────────────────────────
  const handleSend = async () => {
    if (!question.trim() || !companyId) return;

    const userMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const selectedDocData = documents.filter(d => selectedDocs.includes(d.id));

      const docContext = selectedDocData.map(d => `
        DOCUMENT: ${d.file_name}
        SUMMARY: ${d.auto_summary || 'No summary available'}
        IMPORTANT: ${d.important_points || ''}
        CONTEXT: ${d.admin_context || ''}
        INSTRUCTIONS: ${d.custom_instructions || ''}
      `).join('\n\n---\n\n');

      const response = await fetch(
        'https://adityags15.app.n8n.cloud/webhook/chat',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: companyId,
            document_ids: selectedDocs,
            question,
            context: docContext
          }),
        }
      );

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer || 'No answer',
          citations: data.citations || []
        }
      ]);

    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong.' }
      ]);
    }

    setLoading(false);
  };

  // ────────────────────────────────────────────────
  // SIDEBAR DOC SELECT
  // ────────────────────────────────────────────────
  const toggleDoc = (id) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedDocs(documents.map(d => d.id));
  const clearAll = () => setSelectedDocs([]);

  if (!companyId) return <Box p={4}><CircularProgress /></Box>;

  // ────────────────────────────────────────────────
  // UI
  // ────────────────────────────────────────────────
  return (
    <Box display="flex" height="100vh" bgcolor="#f5f5f5">

      {/* ────────────── SIDEBAR ────────────── */}
      <Paper
        elevation={3}
        sx={{ width: 300, p: 2, borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Your Documents</Typography>

          <IconButton onClick={() => fetchDocuments()} disabled={refreshing}>
            {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
          </IconButton>
        </Box>

        <Typography variant="caption" color="textSecondary">
          ({documents.length} ready)
        </Typography>

        <Box mt={2} display="flex" gap={1}>
          <Button variant="outlined" size="small" onClick={selectAll} fullWidth>
            Select All
          </Button>
          <Button variant="outlined" size="small" onClick={clearAll} fullWidth>
            Clear
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Document List */}
        <List dense sx={{ overflowY: 'auto', flex: 1 }}>
          {documents.map(doc => (
            <ListItem
              key={doc.id}
              secondaryAction={
                <Checkbox
                  edge="end"
                  icon={<CheckBoxOutlineBlank />}
                  checkedIcon={<CheckBox />}
                  checked={selectedDocs.includes(doc.id)}
                  onChange={() => toggleDoc(doc.id)}
                />
              }
            >
              <ListItemIcon><Description /></ListItemIcon>

              <ListItemText
                primary={doc.file_name}
                secondary={
                  <Box>
                    <Typography variant="caption" display="block">
                      {doc.auto_summary?.substring(0, 80)}...
                    </Typography>
                    <Chip
                      label={doc.status}
                      size="small"
                      color="success"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* ────────────── CHAT PANEL ────────────── */}
      <Box flex={1} display="flex" flexDirection="column">

      <Box p={2} bgcolor="white" borderBottom={1} borderColor="#000000ff">
  <Typography variant="h6" color="black">
    AI Assistant
  </Typography>
  <Chip label={`Company: ${companyId.substring(0, 8)}...`} size="small" />
</Box>


        <Box flex={1} p={2} sx={{ overflowY: "auto" }}>
          {messages.map((msg, i) => (
            <Box
              key={i}
              mb={2}
              display="flex"
              flexDirection={msg.role === 'user' ? 'row-reverse' : 'row'}
            >
              <Paper
                elevation={1}
                sx={{
                  maxWidth: '70%',
                  p: 2,
                  bgcolor: msg.role === 'user' ? '#e3f2fd' : 'white'
                }}
              >
                <Typography>{msg.content}</Typography>

                {msg.citations?.length > 0 && (
                  <Box mt={1}>
                    {msg.citations.map((cit, j) => (
                      <Chip
                        key={j}
                        label={`From: ${cit.file_name} (Chunk ${cit.chunk_index})`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
              </Paper>
            </Box>
          ))}

          {loading && (
            <Box p={2}><CircularProgress size={24} /></Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        <Divider />

        {/* Input Box */}
        <Box p={2} display="flex" gap={1}>
          <TextField
            fullWidth
            placeholder="Ask something..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
          />
          <IconButton onClick={handleSend} disabled={loading || !question.trim()}>
            <Send />
          </IconButton>
        </Box>

      </Box>
    </Box>
  );
}
