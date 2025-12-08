// src/app/api/create-user/route.js
import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { email, password, fullName, companyId } = await request.json();

  if (!email || !password || !fullName || !companyId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    // Create user with admin API (server-side only)
    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (error) throw error;

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUser.user.id,
        full_name: fullName,
        role: 'user',
        company_id: companyId,
      });

    if (profileError) throw profileError;

    return NextResponse.json({ success: true, userId: newUser.user.id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}