'use client';

import { useEffect, useState, useRef, useContext, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Box, CircularProgress, Typography } from '@mui/material';

import UploadForm from './components/UploadForm';
import DocumentList from './components/DocumentList';
import { AuthContext } from '@/components/AuthContextProvider';

export default function DocumentUpload() {
  const fileInputRef = useRef(null);
  const { profile, loading: authLoading } = useContext(AuthContext);
  const { token } = useSelector((state) => state.auth);

  // --- STATE ---
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ text: '', type: '' });

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_LIMIT = 6; 

  // --- 1. Load Documents ---
  const loadDocuments = useCallback(async (currentPage = 1) => {
    if (!token) return;
    setLoading(true);
    
    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/docs?page=${currentPage}&limit=${PAGE_LIMIT}`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Handle response format (New Object vs Old Array)
      let fetchedDocs = [];
      let fetchedTotalPages = 1;

      if (res.data && res.data.documents) {
        fetchedDocs = res.data.documents;
        fetchedTotalPages = res.data.pagination?.totalPages || 1;
      } else if (Array.isArray(res.data)) {
        fetchedDocs = res.data;
      }

      setDocuments(fetchedDocs);
      setTotalPages(fetchedTotalPages);

      // If page is empty (after deletion), go back one page
      if (currentPage > 1 && fetchedDocs.length === 0) {
        setPage(prev => Math.max(prev - 1, 1));
      }

    } catch (error) {
      console.error('Load docs error:', error);
      setDocuments([]); // Safety fallback
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial Load
  useEffect(() => {
    if (!authLoading && token) {
      loadDocuments(page);
    }
  }, [authLoading, token, loadDocuments, page]);

  // --- 2. Delete Document ---
  const handleDelete = async (docId) => {
    if (!confirm('Delete this document?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/docs/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUploadStatus({ text: 'Document deleted!', type: 'success' });
      
      // Refresh current page
      loadDocuments(page);

    } catch (err) {
      console.error(err);
      setUploadStatus({ text: 'Delete failed', type: 'error' });
    } finally {
      setTimeout(() => setUploadStatus({ text: '', type: '' }), 5000);
    }
  };

  // --- 3. Upload Document ---
  const handleUpload = async (values, { setSubmitting, resetForm }) => {
    const formData = new FormData();
    formData.append('file', values.file);
    formData.append('context', values.context || '');
    formData.append('important', values.important || '');
    formData.append('instructions', values.instructions || '');

    try {
      await axios.post('http://localhost:5000/api/admin/docs', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });

      setUploadStatus({ text: 'Success! Document uploaded.', type: 'success' });
      resetForm();
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Go to page 1 to see new upload
      setPage(1);
      loadDocuments(1);

    } catch (err) {
      setUploadStatus({ text: err.response?.data?.message || 'Upload failed', type: 'error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setUploadStatus({ text: '', type: '' }), 6000);
    }
  };

  // --- Render ---
  if (authLoading) return <Box p={4}><CircularProgress /></Box>;

  return (
    <div className="max-w-6xl mx-auto p-8 text-gray-800">
      <h1 className="text-4xl font-extrabold mb-8">Document Management</h1>
      
      <UploadForm 
        onSubmit={handleUpload} 
        uploadStatus={uploadStatus} 
        fileInputRef={fileInputRef} 
      />
      
      <DocumentList 
        documents={documents || []} // Pass array
        loading={loading} 
        onRefresh={() => loadDocuments(page)} 
        onDelete={handleDelete}
        // Pagination Props
        page={page}
        totalPages={totalPages}
        onPageChange={(e, val) => setPage(val)}
      />
    </div>
  );
}