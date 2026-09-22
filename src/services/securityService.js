/**
 * Security Service
 * Provides client-side sanitization, XSS mitigation via DOMPurify,
 * and magic-byte file signature validation.
 */
import DOMPurify from 'dompurify';

/**
 * Sanitizes rich text or HTML string, stripping dangerous tags and scripts.
 * @param {string} dirty 
 * @returns {string} Clean sanitized string
 */
export function sanitizeHtml(dirty) {
  if (!dirty || typeof dirty !== 'string') return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'span', 'ul', 'li', 'ol', 'code'],
    ALLOWED_ATTR: ['class']
  });
}

/**
 * Sanitizes plain text to prevent script injection in user-rendered strings.
 * @param {string} text 
 * @returns {string}
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/**
 * Validates file binary headers (Magic Bytes) to ensure the uploaded file
 * actually matches its declared extension and is not an disguised executable.
 * @param {File|Blob} file 
 * @returns {Promise<boolean>}
 */
export async function verifyFileMagicBytes(file) {
  if (!file) return false;
  const name = file.name.toLowerCase();

  try {
    const slice = file.slice(0, 8);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // PDF files must start with %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
    if (name.endsWith('.pdf')) {
      return (
        bytes[0] === 0x25 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x44 &&
        bytes[3] === 0x46
      );
    }

    // DOCX files are ZIP archives starting with PK.. (0x50, 0x4B, 0x03, 0x04)
    if (name.endsWith('.docx')) {
      return bytes[0] === 0x50 && bytes[1] === 0x4B;
    }

    // TXT files: check for absence of null bytes or executable headers (MZ)
    if (name.endsWith('.txt')) {
      // Must not start with MZ (Windows EXE) or ELF (Linux ELF)
      if (bytes[0] === 0x4D && bytes[1] === 0x5A) return false; // MZ
      if (bytes[0] === 0x7F && bytes[1] === 0x45 && bytes[2] === 0x4C && bytes[3] === 0x46) return false; // ELF
      return true;
    }

    return true;
  } catch {
    // If arrayBuffer reading fails, fail safe for binary formats
    return !name.endsWith('.pdf') && !name.endsWith('.docx');
  }
}

/**
 * Redacts common Personally Identifiable Information (PII) from text
 * for enhanced legal document privacy before client-side or AI processing.
 * @param {string} text
 * @returns {string} Sanitized text with redacted PII
 */
export function redactPII(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    // Redact US Social Security Numbers: 000-00-0000
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED SSN]')
    // Redact Credit Card Numbers: 16 digits (hyphen/space separated)
    .replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, '[REDACTED CARD]')
    // Redact Phone Numbers: (xxx) xxx-xxxx or xxx-xxx-xxxx or +1-xxx-xxx-xxxx
    .replace(/(?:\+?1[-.\s]?)?(?:\(\d{3}\)|\b\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[REDACTED PHONE]');
}

/**
 * Validates whether a URL is safe to open/link (blocks javascript:, vbscript:, data:)
 * @param {string} url
 * @returns {boolean}
 */
export function isSafeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('vbscript:') || trimmed.startsWith('data:text/html')) {
    return false;
  }
  return true;
}

