// src/app/admin/documents/page.js
'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DocumentUpload() {
  const [file, setFile] = useState(null);
  const [context, setContext] = useState('');
  const [important, setImportant] = useState('');
  const [instructions, setInstructions] = useState('');
  const [uploading, setUploading] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace('/login');

      const { data } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (data?.company_id) setCompanyId(data.company_id);
    };
    load();
  }, [router]);

  const handleUpload = async () => {
    if (!file || !companyId) return alert('File or company not ready');

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${companyId}/${fileName}`;

      // 1. Upload file
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // 3. Insert row — NOW WORKS (file_url column exists!)
      const { data: doc, error: dbError } = await supabase
        .from('documents')
        .insert({
          company_id: companyId,
          file_name: file.name,
          storage_path: filePath,
          file_url: publicUrl,                    // ← this column now exists
          admin_context: context || null,
          important_points: important || null,
          custom_instructions: instructions || null,
          status: 'uploaded',
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 4. CALL YOUR REAL N8N WEBHOOK (replace with your actual URL)
      const n8nResponse = await fetch('https://adityags15.app.n8n.cloud/webhook-test/document-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: doc.id,
          fileUrl: publicUrl,
          fileName: file.name,
          companyId: companyId,
          adminContext: context || '',
          importantPoints: important || '',
          customInstructions: instructions || '',
        }),
      });

      if (!n8nResponse.ok) throw new Error('n8n webhook failed');

      alert('Success! AI is now reading your document...');
      router.push('/admin/documents');
    } catch (err) {
      console.error(err);
      alert('Failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!companyId) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Upload Document</h1>
      <div className="bg-white rounded-2xl shadow-xl p-10">
        <input type="file" accept=".pdf,.docx,.txt" onChange={e => setFile(e.target.files?.[0])} className="mb-6 block w-full..." />
        {/* your textareas */}
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-xl font-bold text-xl disabled:opacity-50"
        >
          {uploading ? 'Processing...' : 'Upload & Let AI Read It'}
        </button>
      </div>
    </div>
  );
}