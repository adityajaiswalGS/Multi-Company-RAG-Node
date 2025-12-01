'use client';

import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DocumentUpload() {
  const [file, setFile] = useState(null);
  const [context, setContext] = useState('');
  const [important, setImportant] = useState('');
  const [instructions, setInstructions] = useState('');
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return alert('Choose a file');
    setUploading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `company-${(await supabase.auth.getUser()).data.user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    const { error: dbError } = await supabase.from('documents').insert([{
  company_id: companyId,
  file_name: fileName,
  storage_path: filePath,
  file_type: file.type,
  file_size: file.size,
  uploaded_by: user.id,
}]);

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const response = await fetch('https://your-n8n-webhook-url.com/webhook/document-process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileUrl: supabase.storage.from('documents').getPublicUrl(filePath).data.publicUrl,
        fileName: file.name,
        adminContext: context,
        importantPoints: important,
        customInstructions: instructions,
        companyId: (await supabase.from('profiles').select('company_id').single()).data.company_id,
      }),
    });

    if (response.ok) {
      alert('Document sent for processing! You will see it in chat soon.');
      router.push('/admin');
    } else {
      alert('Failed to trigger processing');
    }
    setUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* MAIN HEADING */}
      <h1 className="text-4xl font-extrabold text-black mb-8">Upload New Document</h1>

      {/* CARD */}
      <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-200">

        {/* FILE INPUT */}
        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Choose File</label>
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-700 
                       file:mr-4 file:rounded-lg file:border-0
                       file:bg-indigo-600 file:px-4 file:py-2 file:text-white
                       hover:file:bg-indigo-700 transition"
          />
        </div>

        {/* TEXTAREAS */}
        <textarea
          placeholder="Additional Context / Notes"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-xl mb-4 h-32 text-gray-800 placeholder-gray-500 
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 outline-none transition"
        />

        <textarea
          placeholder="Important Points"
          value={important}
          onChange={(e) => setImportant(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-xl mb-4 h-28 text-gray-800 placeholder-gray-500 
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 outline-none transition"
        />

        <textarea
          placeholder="Custom Instructions for better answers"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-xl mb-6 h-28 text-gray-800 placeholder-gray-500 
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 outline-none transition"
        />

        {/* BUTTON */}
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg
                     hover:bg-indigo-700 disabled:opacity-50 transition shadow-md"
        >
          {uploading ? 'Uploading & Processing...' : 'Upload Document'}
        </button>
      </div>
    </div>
  );
}
