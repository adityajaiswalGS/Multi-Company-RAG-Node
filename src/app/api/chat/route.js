// src/app/api/chat/route.js
const N8N_CHAT_WEBHOOK = 'https://adityags15.app.n8n.cloud/webhook-test/rag-chat';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const question = searchParams.get('question');
  const companyId = searchParams.get('companyId');

  if (!question || !companyId) {
    return new Response('Missing question or companyId', { status: 400 });
  }

  const n8nUrl = `${N8N_CHAT_WEBHOOK}?question=${encodeURIComponent(question)}&companyId=${companyId}`;

  const response = await fetch(n8nUrl);
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}