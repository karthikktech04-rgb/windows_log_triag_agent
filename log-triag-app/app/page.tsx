// // 'use client';

// // import { useState, useEffect } from 'react';
// // import { experimental_useObject as useObject } from '@ai-sdk/react';
// // import { z } from 'zod';
// // import { supabase } from '@/lib/supabase';

// // const logAnalysisSchema = z.object({
// //   summary: z.string().default(''),
// //   severity: z.string().default('INFO'),
// //   rootCause: z.object({
// //     primaryEventId: z.coerce.number().nullable().optional(),
// //     source: z.string().default('Unknown'),
// //     explanation: z.string().default(''),
// //   }).optional(),
// //   remediation: z.object({
// //     powerShellScript: z.string().default(''),
// //   }).optional(),
// //   verificationCommand: z.string().default(''),
// // });

// // type LogReport = {
// //   id: string;
// //   created_at: string;
// //   summary: string;
// //   severity: string;
// //   event_id: number | null;
// //   source: string;
// //   explanation: string;
// //   powershell_script: string;
// //   verification_command: string;
// // };

// // export default function LogTriagePage() {
// //   const [logInput, setLogInput] = useState('');
// //   const [history, setHistory] = useState<LogReport[]>([]);
// //   const [showHistory, setShowHistory] = useState(false);
// //   const [copied, setCopied] = useState(false);
// //   const [saveStatus, setSaveStatus] = useState<string>('');

// //   const fetchHistory = async () => {
// //     const { data, error } = await supabase
// //       .from('log_reports')
// //       .select('*')
// //       .order('created_at', { ascending: false });

// //     if (error) {
// //       console.error('❌ [CLIENT] History Fetch Error:', error.message);
// //     } else if (data) {
// //       setHistory(data);
// //     }
// //   };

// //   const { object, submit, isLoading, error } = useObject({
// //     api: '/api/analyze-log',
// //     schema: logAnalysisSchema,
// //     onFinish: async ({ object }) => {
// //       console.log('🏁 [CLIENT] AI Streaming Complete. Final Object:', object);
      
// //       // Client-side auto-save backup if server execution was suspended
// //       if (object && object.summary) {
// //         setSaveStatus('Saving report to Supabase...');
// //         const { data, error: clientDbError } = await supabase.from('log_reports').insert({
// //           summary: object.summary || 'Log Analysis',
// //           severity: object.severity || 'INFO',
// //           event_id: object.rootCause?.primaryEventId ?? null,
// //           source: object.rootCause?.source || 'System',
// //           explanation: object.rootCause?.explanation || '',
// //           powershell_script: object.remediation?.powerShellScript || '',
// //           verification_command: object.verificationCommand || '',
// //           raw_log_snippet: logInput.substring(0, 500),
// //         }).select();

// //         if (clientDbError) {
// //           console.error('❌ [CLIENT] Supabase Client Save Error:', clientDbError.message);
// //           setSaveStatus(`Save Error: ${clientDbError.message}`);
// //         } else {
// //           console.log('✅ [CLIENT] Successfully Saved to Supabase from Client:', data);
// //           setSaveStatus('✅ Saved to Database');
// //           fetchHistory();
// //         }
// //       }
// //     },
// //   });

// //   useEffect(() => {
// //     if (showHistory) fetchHistory();
// //   }, [showHistory]);

// //   const handleAnalyze = () => {
// //     if (!logInput.trim()) {
// //       alert('Please paste a log before submitting.');
// //       return;
// //     }
// //     setSaveStatus('Analyzing and generating response...');
// //     console.log('🚀 [CLIENT] Submitting log to /api/analyze-log...');
// //     submit({ log: logInput });
// //   };

// //   return (
// //     <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
// //       <div className="max-w-6xl mx-auto space-y-8">
        
// //         {/* Header */}
// //         <header className="flex items-center justify-between border-b border-slate-800 pb-6">
// //           <div>
// //             <h1 className="text-3xl font-bold tracking-tight text-white">
// //               Windows Log Triage Agent
// //             </h1>
// //             <p className="text-slate-400 text-sm mt-1">
// //               Automated PII scrubbing, Gemini diagnosis, and PowerShell remediation.
// //             </p>
// //           </div>
// //           <button
// //             onClick={() => setShowHistory(!showHistory)}
// //             className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg border border-slate-700 transition"
// //           >
// //             {showHistory ? 'Hide History' : '📜 History'}
// //           </button>
// //         </header>

// //         {/* History Drawer */}
// //         {showHistory && (
// //           <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
// //             <h2 className="text-xl font-semibold mb-4 text-slate-200">Past Analysis Reports</h2>
// //             {history.length === 0 ? (
// //               <p className="text-slate-500 text-sm">No saved log reports found.</p>
// //             ) : (
// //               <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
// //                 {history.map((item) => (
// //                   <div key={item.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-sm">
// //                     <div className="flex justify-between text-xs text-slate-400 mb-1">
// //                       <span>Source: {item.source} | Event ID: {item.event_id ?? 'N/A'}</span>
// //                       <span>{new Date(item.created_at).toLocaleString()}</span>
// //                     </div>
// //                     <p className="font-semibold text-slate-200">{item.summary}</p>
// //                     <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.explanation}</p>
// //                   </div>
// //                 ))}
// //               </div>
// //             )}
// //           </section>
// //         )}

// //         {/* Input Area */}
// //         <section className="space-y-4">
// //           <label className="block text-sm font-medium text-slate-300">
// //             Paste Raw Windows Event Log:
// //           </label>
// //           <textarea
// //             rows={8}
// //             value={logInput}
// //             onChange={(e) => setLogInput(e.target.value)}
// //             placeholder="Paste event viewer logs here..."
// //             className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
// //           />
          
// //           <div className="flex justify-between items-center">
// //             <span className="text-xs text-slate-400 font-mono">{saveStatus}</span>
// //             <button
// //               onClick={handleAnalyze}
// //               disabled={isLoading}
// //               className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition"
// //             >
// //               {isLoading ? 'Analyzing Log...' : 'Analyze Log & Generate Fix'}
// //             </button>
// //           </div>
// //           {error && <p className="text-red-400 text-sm">Error: {error.message}</p>}
// //         </section>

// //         {/* Live Output Display */}
// //         {object && (
// //           <section className="space-y-6 border-t border-slate-800 pt-8">
// //             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
// //               <div className="flex justify-between items-center mb-3">
// //                 <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
// //                   Summary Diagnosis
// //                 </span>
// //                 {object.severity && (
// //                   <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
// //                     object.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
// //                     object.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
// //                     'bg-blue-500/20 text-blue-400 border border-blue-500/30'
// //                   }`}>
// //                     {object.severity}
// //                   </span>
// //                 )}
// //               </div>
// //               <h2 className="text-xl font-semibold text-slate-100">{object.summary}</h2>
// //               {object.rootCause?.explanation && (
// //                 <p className="mt-3 text-slate-300 text-sm leading-relaxed">
// //                   {object.rootCause.explanation}
// //                 </p>
// //               )}
// //             </div>

// //             {object.remediation?.powerShellScript && (
// //               <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
// //                 <div className="flex justify-between items-center mb-3">
// //                   <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
// //                     PowerShell Remediation Script
// //                   </span>
// //                   <button
// //                     onClick={() => {
// //                       navigator.clipboard.writeText(object.remediation?.powerShellScript || '');
// //                       setCopied(true);
// //                       setTimeout(() => setCopied(false), 2000);
// //                     }}
// //                     className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700 text-slate-300"
// //                   >
// //                     {copied ? 'Copied!' : '📋 Copy Script'}
// //                   </button>
// //                 </div>
// //                 <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-xs font-mono text-emerald-400 border border-slate-800">
// //                   <code>{object.remediation.powerShellScript}</code>
// //                 </pre>
// //               </div>
// //             )}
// //           </section>
// //         )}

// //       </div>
// //     </main>
// //   );
// // }

// 'use client';

// import { useState } from 'react';
// import { experimental_useObject as useObject } from '@ai-sdk/react';
// import { z } from 'zod';
// import { sanitizeLog } from '@/lib/sanitize';

// const logAnalysisSchema = z.object({
//   summary: z.string().optional().default(''),
//   severity: z.string().optional().default('INFO'),
//   riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('LOW'),
//   rootCause: z.object({
//     primaryEventId: z.any().optional(),
//     source: z.string().optional().default('System'),
//     explanation: z.string().optional().default(''),
//   }).optional(),
//   remediation: z.object({
//     powerShellScript: z.string().optional().default(''),
//     rollbackScript: z.string().optional().default(''),
//   }).optional(),
//   verificationCommand: z.string().optional().default(''),
// });

// export default function LogTriagePage() {
//   const [logInput, setLogInput] = useState('');
//   const [mode, setMode] = useState<'helpdesk' | 'senior'>('senior');
//   const [showSanitizedDiff, setShowSanitizedDiff] = useState(false);
//   const [activeTab, setActiveTab] = useState<'fix' | 'rollback'>('fix');
//   const [copied, setCopied] = useState(false);

//   const { sanitized, redactedCount } = sanitizeLog(logInput);

//   const { object, submit, isLoading } = useObject({
//     api: '/api/analyze-log',
//     schema: logAnalysisSchema,
//   });

//   const handleAnalyze = () => {
//     if (!logInput.trim()) return;
//     submit({ log: logInput, mode });
//   };

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   const exportMarkdown = () => {
//     if (!object) return;
//     const md = `# Log Incident Report: ${object.summary}
// **Severity:** ${object.severity} | **Risk Level:** ${object.riskLevel}
// **Source:** ${object.rootCause?.source} | **Event ID:** ${object.rootCause?.primaryEventId ?? 'N/A'}

// ## Explanation
// ${object.rootCause?.explanation}

// ## Remediation Script
// \`\`\`powershell
// ${object.remediation?.powerShellScript}
// \`\`\`

// ## Verification
// \`\`\`powershell
// ${object.verificationCommand}
// \`\`\``;
//     copyToClipboard(md);
//   };

//   return (
//     <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
//       <div className="max-w-6xl mx-auto space-y-8">
        
//         {/* Header */}
//         <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-white">Windows Log Triage Agent</h1>
//             <p className="text-slate-400 text-sm mt-1">Automated PII scrubbing, Gemini diagnosis, and PowerShell remediation.</p>
//           </div>

//           {/* Mode Switcher */}
//           <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
//             <button
//               onClick={() => setMode('helpdesk')}
//               className={`px-3 py-1.5 rounded-lg transition ${mode === 'helpdesk' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
//             >
//               🎧 Tier-1 Helpdesk
//             </button>
//             <button
//               onClick={() => setMode('senior')}
//               className={`px-3 py-1.5 rounded-lg transition ${mode === 'senior' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
//             >
//               ⚡ Senior Admin
//             </button>
//           </div>
//         </header>

//         {/* Input Area */}
//         <section className="space-y-4">
//           <div className="flex justify-between items-center text-sm">
//             <label className="font-medium text-slate-300">Paste Raw Windows Event Log:</label>
//             {redactedCount > 0 && (
//               <button
//                 onClick={() => setShowSanitizedDiff(!showSanitizedDiff)}
//                 className="text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2.5 py-1 rounded-md hover:bg-emerald-900/50 transition"
//               >
//                 🔒 {redactedCount} Sensitive item(s) masked ({showSanitizedDiff ? 'Hide Preview' : 'Preview Redaction'})
//               </button>
//             )}
//           </div>

//           <textarea
//             rows={7}
//             value={showSanitizedDiff ? sanitized : logInput}
//             onChange={(e) => setLogInput(e.target.value)}
//             readOnly={showSanitizedDiff}
//             placeholder="Paste Event Viewer logs here..."
//             className={`w-full bg-slate-900 border rounded-xl p-4 text-sm font-mono focus:outline-none focus:ring-2 transition ${
//               showSanitizedDiff ? 'border-emerald-700/50 text-emerald-300' : 'border-slate-800 text-slate-200 focus:ring-blue-500'
//             }`}
//           />

//           <div className="flex justify-end">
//             <button
//               onClick={handleAnalyze}
//               disabled={isLoading}
//               className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition"
//             >
//               {isLoading ? 'Analyzing Log...' : 'Analyze Log & Generate Fix'}
//             </button>
//           </div>
//         </section>

//         {/* Triage Output */}
//         {object && (
//           <section className="space-y-6 border-t border-slate-800 pt-8">
//             {/* Diagnosis Card */}
//             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
//               <div className="flex justify-between items-center mb-3">
//                 <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">Diagnosis Summary</span>
//                 <div className="flex gap-2">
//                   {object.riskLevel && (
//                     <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${
//                       object.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
//                       object.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
//                       'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
//                     }`}>
//                       RISK: {object.riskLevel}
//                     </span>
//                   )}
//                   <button
//                     onClick={exportMarkdown}
//                     className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded border border-slate-700 text-slate-300"
//                   >
//                     📋 Copy Markdown
//                   </button>
//                 </div>
//               </div>
//               <h2 className="text-xl font-semibold text-slate-100">{object.summary}</h2>
//               <p className="mt-3 text-slate-300 text-sm leading-relaxed">{object.rootCause?.explanation}</p>
//             </div>

//             {/* Script Tabs (Fix vs Rollback) */}
//             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
//               <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
//                 <div className="flex gap-4 text-xs font-semibold">
//                   <button
//                     onClick={() => setActiveTab('fix')}
//                     className={`pb-2 border-b-2 ${activeTab === 'fix' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400'}`}
//                   >
//                     Primary Remediation Script
//                   </button>
//                   <button
//                     onClick={() => setActiveTab('rollback')}
//                     className={`pb-2 border-b-2 ${activeTab === 'rollback' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400'}`}
//                   >
//                     Safety Rollback Script
//                   </button>
//                 </div>
//                 <button
//                   onClick={() => copyToClipboard(
//                     activeTab === 'fix' 
//                       ? object.remediation?.powerShellScript || '' 
//                       : object.remediation?.rollbackScript || ''
//                   )}
//                   className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded border border-slate-700 text-slate-300"
//                 >
//                   {copied ? 'Copied!' : 'Copy Script'}
//                 </button>
//               </div>

//               <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-xs font-mono text-emerald-400 border border-slate-800">
//                 <code>
//                   {activeTab === 'fix' 
//                     ? object.remediation?.powerShellScript 
//                     : object.remediation?.rollbackScript || '# No rollback required for this fix.'}
//                 </code>
//               </pre>
//             </div>
//           </section>
//         )}

//       </div>
//     </main>
//   );
// }

'use client';

import { useState } from 'react';
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';
import { sanitizeLog } from '@/lib/sanitize';

const logAnalysisSchema = z.object({
  summary: z.string().optional().default(''),
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

export default function LogTriagePage() {
  const [logInput, setLogInput] = useState('');
  const [mode, setMode] = useState<'helpdesk' | 'senior'>('senior');
  const [showSanitizedDiff, setShowSanitizedDiff] = useState(false);
  const [activeTab, setActiveTab] = useState<'fix' | 'rollback'>('fix');
  const [copied, setCopied] = useState(false);

  const { sanitized, redactedCount } = sanitizeLog(logInput);

  const { object, submit, isLoading } = useObject({
    api: '/api/analyze-log',
    schema: logAnalysisSchema,
  });

  const handleAnalyze = () => {
    if (!logInput.trim()) return;
    submit({ log: logInput, mode });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportMarkdown = () => {
    if (!object) return;
    const md = `# Log Incident Report: ${object.summary}
**Severity:** ${object.severity} | **Risk Level:** ${object.riskLevel}
**Source:** ${object.rootCause?.source} | **Event ID:** ${object.rootCause?.primaryEventId ?? 'N/A'}

## Explanation
${object.rootCause?.explanation}

## Remediation Script
\`\`\`powershell
${object.remediation?.powerShellScript}
\`\`\`

## Verification
\`\`\`powershell
${object.verificationCommand}
\`\`\``;
    copyToClipboard(md);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-white">Windows Log Triage Agent</h1>
              <span className="text-xs bg-blue-950 text-blue-400 border border-blue-800 px-2.5 py-0.5 rounded-full font-mono">
                by Karthik Krishnamurthy
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">Automated PII scrubbing, Gemini diagnosis, and PowerShell remediation.</p>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMode('helpdesk')}
              className={`px-3 py-1.5 rounded-lg transition ${mode === 'helpdesk' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              🎧 Tier-1 Helpdesk
            </button>
            <button
              onClick={() => setMode('senior')}
              className={`px-3 py-1.5 rounded-lg transition ${mode === 'senior' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'}`}
            >
              ⚡ Senior Admin
            </button>
          </div>
        </header>

        {/* Input Area */}
        <section className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <label className="font-medium text-slate-300">Paste Raw Windows Event Log:</label>
            {redactedCount > 0 && (
              <button
                onClick={() => setShowSanitizedDiff(!showSanitizedDiff)}
                className="text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2.5 py-1 rounded-md hover:bg-emerald-900/50 transition"
              >
                🔒 {redactedCount} Sensitive item(s) masked ({showSanitizedDiff ? 'Hide Preview' : 'Preview Redaction'})
              </button>
            )}
          </div>

          <textarea
            rows={7}
            value={showSanitizedDiff ? sanitized : logInput}
            onChange={(e) => setLogInput(e.target.value)}
            readOnly={showSanitizedDiff}
            placeholder="Paste Event Viewer logs here..."
            className={`w-full bg-slate-900 border rounded-xl p-4 text-sm font-mono focus:outline-none focus:ring-2 transition ${
              showSanitizedDiff ? 'border-emerald-700/50 text-emerald-300' : 'border-slate-800 text-slate-200 focus:ring-blue-500'
            }`}
          />

          <div className="flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition"
            >
              {isLoading ? 'Analyzing Log...' : 'Analyze Log & Generate Fix'}
            </button>
          </div>
        </section>

        {/* Triage Output */}
        {object && (
          <section className="space-y-6 border-t border-slate-800 pt-8">
            {/* Diagnosis Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">Diagnosis Summary</span>
                <div className="flex gap-2">
                  {object.riskLevel && (
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${
                      object.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      object.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      RISK: {object.riskLevel}
                    </span>
                  )}
                  <button
                    onClick={exportMarkdown}
                    className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded border border-slate-700 text-slate-300"
                  >
                    📋 Copy Markdown
                  </button>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-slate-100">{object.summary}</h2>
              <p className="mt-3 text-slate-300 text-sm leading-relaxed">{object.rootCause?.explanation}</p>
            </div>

            {/* Script Tabs (Fix vs Rollback) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                <div className="flex gap-4 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('fix')}
                    className={`pb-2 border-b-2 ${activeTab === 'fix' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400'}`}
                  >
                    Primary Remediation Script
                  </button>
                  <button
                    onClick={() => setActiveTab('rollback')}
                    className={`pb-2 border-b-2 ${activeTab === 'rollback' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400'}`}
                  >
                    Safety Rollback Script
                  </button>
                </div>
                <button
                  onClick={() => copyToClipboard(
                    activeTab === 'fix' 
                      ? object.remediation?.powerShellScript || '' 
                      : object.remediation?.rollbackScript || ''
                  )}
                  className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded border border-slate-700 text-slate-300"
                >
                  {copied ? 'Copied!' : 'Copy Script'}
                </button>
              </div>

              <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-xs font-mono text-emerald-400 border border-slate-800">
                <code>
                  {activeTab === 'fix' 
                    ? object.remediation?.powerShellScript 
                    : object.remediation?.rollbackScript || '# No rollback required for this fix.'}
                </code>
              </pre>
            </div>
          </section>
        )}

      </div>

      {/* Footer Attribution */}
      <footer className="mt-16 text-center text-xs text-slate-500 border-t border-slate-800/80 pt-6">
        Developed by <span className="font-semibold text-slate-300">Karthik Krishnamurthy</span> • Powered by Gemini & Next.js
      </footer>
    </main>
  );
}