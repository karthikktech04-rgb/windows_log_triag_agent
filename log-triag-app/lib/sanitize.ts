// // lib/sanitize.ts

// export function sanitizeLog(rawLog: string): string {
//   let sanitized = rawLog;

//   // 1. Redact IPv4 Addresses (e.g., 192.168.1.50 -> [REDACTED_IP])
//   const ipv4Regex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
//   sanitized = sanitized.replace(ipv4Regex, '[REDACTED_IP]');

//   // 2. Redact Windows Security Identifiers / SIDs (e.g., S-1-5-21-123456789-...)
//   const sidRegex = /S-1-[0-5]-(?:[0-9]+-){1,10}[0-9]+/g;
//   sanitized = sanitized.replace(sidRegex, '[REDACTED_SID]');

//   // 3. Redact MAC Addresses (e.g., 00:1A:2B:3C:4D:5E)
//   const macRegex = /\b(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})\b/g;
//   sanitized = sanitized.replace(macRegex, '[REDACTED_MAC]');

//   // 4. Redact potential Password/Token assignments in log strings
//   const secretRegex = /(password|passwd|token|pwd|secret)\s*[:=]\s*[^\s,;]+/gi;
//   sanitized = sanitized.replace(secretRegex, '$1=[REDACTED_SECRET]');

//   return sanitized;
// }

export interface SanitizeResult {
  sanitized: string;
  redactedCount: number;
}

export function sanitizeLog(rawLog: string): SanitizeResult {
  if (!rawLog) return { sanitized: '', redactedCount: 0 };

  let count = 0;
  const countReplacer = (regex: RegExp, replacement: string) => (text: string) => {
    return text.replace(regex, (match) => {
      count++;
      return replacement;
    });
  };

  let sanitized = rawLog;

  // 1. IPv4 Addresses
  sanitized = countReplacer(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g, '[REDACTED_IP]')(sanitized);

  // 2. Windows Domain Users (e.g. CORP\JohnDoe or DOMAIN\admin)
  sanitized = countReplacer(/\b[A-Z0-9_-]+\\[A-Za-z0-9._-]+\b/g, '[REDACTED_DOMAIN_USER]')(sanitized);

  // 3. User Directories (e.g. C:\Users\johndoe)
  sanitized = countReplacer(/[C-Z]:\\Users\\[^\s\\]+/gi, 'C:\\Users\\[REDACTED_USER]')(sanitized);

  // 4. Security Identifiers (SIDs)
  sanitized = countReplacer(/S-1-5-21-\d+-\d+-\d+-\d+/g, '[REDACTED_SID]')(sanitized);

  // 5. Passwords & Key-Value Secrets
  sanitized = countReplacer(/(password|pwd|secret|cred)=([^\s&]+)/gi, '$1=[REDACTED_SECRET]')(sanitized);

  // 6. Email Addresses
  sanitized = countReplacer(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[REDACTED_EMAIL]')(sanitized);

  return { sanitized, redactedCount: count };
}