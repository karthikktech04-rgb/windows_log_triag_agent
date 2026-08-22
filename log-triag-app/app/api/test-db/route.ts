
// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase.from('log_reports').insert({
    summary: 'Test DB connection summary',
    severity: 'INFO',
    event_id: 1000,
    source: 'Test System',
    explanation: 'Testing connection from Next.js server.',
    powershell_script: 'Get-Process',
    verification_command: 'Get-Service',
    raw_log_snippet: 'Test raw log string',
  }).select();

  if (error) {
    return NextResponse.json({ success: false, error: error.message, details: error.details }, { status: 500 });
  }

  return NextResponse.json({ success: true, insertedRow: data });
}