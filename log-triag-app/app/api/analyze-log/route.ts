// import { NextRequest, NextResponse } from 'next/server';
// import { streamObject } from 'ai';
// import { google } from '@ai-sdk/google';
// import { z } from 'zod';
// import { sanitizeLog } from '@/lib/sanitize';
// import { supabase } from '@/lib/supabase';

// export const maxDuration = 30;

// // Flexible schema with fallbacks to prevent AI stream validation crashes
// const logAnalysisSchema = z.object({
//   summary: z.string().optional().default('Log Analysis Summary'),
//   severity: z.string().optional().default('INFO'),
//   rootCause: z.object({
//     primaryEventId: z.any().optional(),
//     source: z.string().optional().default('System'),
//     explanation: z.string().optional().default(''),
//   }).optional(),
//   remediation: z.object({
//     powerShellScript: z.string().optional().default(''),
//   }).optional(),
//   verificationCommand: z.string().optional().default(''),
// });

// export async function POST(req: NextRequest) {
//   console.log('\n========================================');
//   console.log('🚀 [SERVER] 1. New Log Triage Request Received');

//   try {
//     const body = await req.json();
//     const rawLog = typeof body === 'string' ? body : body?.log || body?.prompt || body?.input || '';

//     if (!rawLog || !rawLog.trim()) {
//       console.error('❌ [SERVER] ERROR: Empty log content provided.');
//       return NextResponse.json({ error: 'No log content provided' }, { status: 400 });
//     }

//     const cleanLog = sanitizeLog(rawLog);
//     console.log('🧹 [SERVER] 2. Log PII Sanitized successfully.');

//     const result = streamObject({
//       model: google('gemini-3.6-flash'), // <--- Updated model parameter
//       schema: logAnalysisSchema,
//       prompt: `Analyze this Windows Event Log and return structured triage details:\n\n${cleanLog}`,
//       onFinish: async ({ object, error }) => {
//         console.log('\n----------------------------------------');
//         console.log('🏁 [SERVER] 3. AI Streaming Finished');

//         if (error) {
//           console.error('❌ [SERVER] AI SDK Stream Error:', error.message);
//           return;
//         }

//         if (!object) {
//           console.error('❌ [SERVER] AI stream ended but output object was undefined.');
//           return;
//         }

//         console.log('💾 [SERVER] 4. Inserting report into Supabase...');

//         // Safely parse event ID regardless of string/number format
//         const rawEventId = object.rootCause?.primaryEventId;
//         const parsedEventId = typeof rawEventId === 'number' 
//           ? rawEventId 
//           : (rawEventId ? parseInt(String(rawEventId), 10) || null : null);

//         const payload = {
//           summary: object.summary || 'Log Analysis Report',
//           severity: object.severity || 'INFO',
//           event_id: parsedEventId,
//           source: object.rootCause?.source || 'System',
//           explanation: object.rootCause?.explanation || '',
//           powershell_script: object.remediation?.powerShellScript || '',
//           verification_command: object.verificationCommand || '',
//           raw_log_snippet: cleanLog.substring(0, 500),
//         };

//         const { data, error: dbError } = await supabase
//           .from('log_reports')
//           .insert(payload)
//           .select();

//         if (dbError) {
//           console.error('❌ [SERVER] SUPABASE SAVE ERROR:', dbError.message, dbError.details);
//         } else {
//           console.log('✅ [SERVER] SUCCESS! Saved to Supabase DB. ID:', data?.[0]?.id);
//         }
//         console.log('----------------------------------------\n');
//       },
//     });

//     return result.toTextStreamResponse();
//   } catch (err: any) {
//     console.error('❌ [SERVER] CRITICAL ROUTE EXCEPTION:', err.message);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { streamObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { sanitizeLog } from '@/lib/sanitize';
import { supabase } from '@/lib/supabase';

export const maxDuration = 30;

const logAnalysisSchema = z.object({
  summary: z.string().optional().default('Log Analysis Summary'),
  severity: z.string().optional().default('INFO'),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('LOW'),
  rootCause: z.object({
    primaryEventId: z.any().optional(),
    source: z.string().optional().default('System'),
    explanation: z.string().optional().default(''),
  }).optional(),
  remediation: z.object({
    powerShellScript: z.string().optional().default(''),
    rollbackScript: z.string().optional().default(''),
  }).optional(),
  verificationCommand: z.string().optional().default(''),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawLog = body?.log || '';
    const mode = body?.mode || 'senior'; // 'helpdesk' or 'senior'

    if (!rawLog.trim()) {
      return NextResponse.json({ error: 'No log content provided' }, { status: 400 });
    }

    const { sanitized: cleanLog } = sanitizeLog(rawLog);

    const personaInstructions = mode === 'helpdesk'
      ? 'Target audience: Tier-1 Helpdesk Technician. Use simple terminology, step-by-step guidance, and safe low-risk remedies.'
      : 'Target audience: Senior Systems Administrator. Provide deep kernel/registry/DCOM root-cause analysis and exact PowerShell commands.';

    const result = streamObject({
      model: google('gemini-3.6-flash'),
      schema: logAnalysisSchema,
      prompt: `Analyze this Windows Event Log.
${personaInstructions}

Required Outputs:
1. Summary & Severity
2. Root Cause Explanation
3. Execution Risk Level (LOW, MEDIUM, HIGH)
4. Primary Remediation PowerShell Script (Include -WhatIf support where applicable)
5. Rollback PowerShell Script (To revert changes if needed)
6. Verification Command

Log Content:
${cleanLog}`,
      onFinish: async ({ object, error }) => {
        if (error || !object) return;

        const rawEventId = object.rootCause?.primaryEventId;
        const parsedEventId = typeof rawEventId === 'number' 
          ? rawEventId 
          : (rawEventId ? parseInt(String(rawEventId), 10) || null : null);

        await supabase.from('log_reports').insert({
          summary: object.summary || 'Log Analysis Report',
          severity: object.severity || 'INFO',
          event_id: parsedEventId,
          source: object.rootCause?.source || 'System',
          explanation: object.rootCause?.explanation || '',
          powershell_script: object.remediation?.powerShellScript || '',
          verification_command: object.verificationCommand || '',
          raw_log_snippet: cleanLog.substring(0, 500),
        });
      },
    });

    return result.toTextStreamResponse();
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}