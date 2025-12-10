// src/app/admin/documents/page.js
'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { z } from 'zod';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const uploadSchema = z.object({
  file: z.any().refine((file) => file && file.size > 0, 'Please select a file'),
  context: z.string().optional(),
  important: z.string().optional(),
  instructions: z.string().optional(),
});

export default function DocumentUpload() {
  const [companyId, setCompanyId] = useState('');
  const [uploadStatus, setUploadStatus] = useState({ text: '', type: '' });
  const fileInputRef = useRef(null);
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

  const showStatus = (text, type = 'success') => {
    setUploadStatus({ text, type });
    setTimeout(() => setUploadStatus({ text: '', type: '' }), 6000);
  };

  const handleUpload = async (values, { setSubmitting, resetForm }) => {
    const { file, context, important, instructions } = values;

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

      // 3. Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // 4. Insert document record
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          company_id: companyId,
          file_name: file.name,
          storage_path: filePath,
          file_url: publicUrl,
          admin_context: context || null,
          important_points: important || null,
          custom_instructions: instructions || null,
          status: 'uploaded',
          uploaded_by: user?.id,
        });

      if (dbError) throw dbError;

      // 5. Trigger n8n
      const n8nRes = await fetch('https://adityags15.app.n8n.cloud/webhook/document-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: publicUrl,
          fileName: file.name,
          companyId,
          adminContext: context || '',
          importantPoints: important || '',
          customInstructions: instructions || '',
        }),
      });

      if (!n8nRes.ok) throw new Error('AI processing failed');

      showStatus('Success! Document uploaded and AI is processing it...', 'success');
      resetForm();
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (err) {
      console.error(err);
      showStatus('Error: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!companyId) {
    return (
      <div className="flex h-screen items-center justify-center text-2xl text-gray-600">
        Loading company...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800">Upload New Document</h1>

      {uploadStatus.text && (
        <div className={`mb-6 p-5 rounded-xl text-center text-lg font-medium shadow-lg border-2 ${
          uploadStatus.type === 'success'
            ? 'bg-green-100 text-green-800 border-green-300'
            : 'bg-red-100 text-red-800 border-red-300'
        }`}>
          {uploadStatus.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl p-10 border border-gray-200">
        <Formik
          initialValues={{ file: null, context: '', important: '', instructions: '' }}
          validationSchema={toFormikValidationSchema(uploadSchema)}
          onSubmit={handleUpload}
        >
          {({ isSubmitting, setFieldValue, touched, errors }) => (
            <Form className="space-y-8">
              {/* FILE INPUT */}
              <div>
                <label className="block mb-3 text-lg font-medium text-gray-800">
                  Document File <span className="text-red-500">*</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setFieldValue('file', e.target.files?.[0] || null)}
                  className="w-full text-gray-800 cursor-pointer rounded-xl border-2 border-gray-300 bg-gray-50 p-4 file:mr-6 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-8 file:py-3 file:text-white hover:file:bg-indigo-700 transition"
                />
                <ErrorMessage name="file">
                  {(msg) => <p className="mt-2 text-sm text-red-600 font-medium">{msg}</p>}
                </ErrorMessage>
              </div>

              {/* CONTEXT & IMPORTANT POINTS */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block mb-3 text-lg font-medium text-gray-800">
                    Additional Context (optional)
                  </label>
                  <Field
                    as="textarea"
                    name="context"
                    rows={5}
                    placeholder="Any background info for the AI..."
                    className="w-full p-5 border-2 border-gray-300 rounded-xl resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition text-gray-800"
                  />
                </div>

                <div>
                  <label className="block mb-3 text-lg font-medium text-gray-800">
                    Important Points (optional)
                  </label>
                  <Field
                    as="textarea"
                    name="important"
                    rows={5}
                    placeholder="Key highlights to focus on..."
                    className="w-full p-5 border-2 border-gray-300 rounded-xl resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition text-gray-800"
                  />
                </div>
              </div>

              {/* CUSTOM INSTRUCTIONS */}
              <div>
                <label className="block mb-3 text-lg font-medium text-gray-800">
                  Custom Instructions for AI (optional)
                </label>
                <Field
                  as="textarea"
                  name="instructions"
                  rows={5}
                  placeholder="e.g., Summarize in bullet points, explain technical terms..."
                  className="w-full p-5 border-2 border-gray-300 rounded-xl resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition text-gray-800"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xl rounded-xl shadow-xl disabled:opacity-60 transition transform hover:scale-105"
              >
                {isSubmitting ? 'Uploading & Processing...' : 'Upload & Let AI Read It'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}