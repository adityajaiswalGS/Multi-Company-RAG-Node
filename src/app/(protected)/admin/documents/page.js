'use client';

import { useEffect, useState, useRef, useContext } from 'react';
import { useSelector } from 'react-redux'; //
import axios from 'axios'; //
import UploadForm from './components/UploadForm';
import DocumentList from './components/DocumentList';
import { AuthContext } from '@/components/AuthContextProvider';

export default function DocumentUpload() {
  const fileInputRef = useRef(null);
  const { profile, loading: authLoading } = useContext(AuthContext);
  const { token } = useSelector((state) => state.auth); // Get JWT from Redux

  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ text: '', type: '' });

  // 1. Load Documents from Node.js API 
  const loadDocuments = async () => {
    if (!token) return;
    setDocsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/docs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(res.data);
    } catch (error) {
      console.error('Load docs error:', error);
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && token) loadDocuments();
  }, [authLoading, token]);

  // 2. Delete Document via Node.js API 
  const handleDelete = async (docId) => {
    if (!confirm('Delete this document?')) return;
    setDocsLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/admin/docs/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUploadStatus({ text: 'Document deleted!', type: 'success' });
      loadDocuments();
    } catch (err) {
      setUploadStatus({ text: 'Delete failed', type: 'error' });
    } finally {
      setDocsLoading(false);
      setTimeout(() => setUploadStatus({ text: '', type: '' }), 5000);
    }
  };

  // 3. Upload Document to Node.js (which forwards to AWS S3) 
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

      setUploadStatus({ text: 'Success! Document uploaded and processing...', type: 'success' });
      resetForm();
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadDocuments();
    } catch (err) {
      setUploadStatus({ text: err.response?.data?.message || 'Upload failed', type: 'error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setUploadStatus({ text: '', type: '' }), 6000);
    }
  };

  if (authLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8 text-gray-800">
      <h1 className="text-4xl font-extrabold mb-8">Document Management</h1>
      <UploadForm onSubmit={handleUpload} uploadStatus={uploadStatus} fileInputRef={fileInputRef} />
      <DocumentList documents={documents} loading={docsLoading} onRefresh={loadDocuments} onDelete={handleDelete} />
    </div>
  );
}