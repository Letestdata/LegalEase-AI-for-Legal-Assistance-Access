# Security Policy — LegalEase

At **LegalEase**, safeguarding sensitive legal documents, personal information, and user privacy is of paramount importance. This document outlines our security policies, architecture, data governance practices, and vulnerability disclosure procedure.

---

## 1. Supported Versions

Security updates and patches are actively maintained for the following versions:

| Version | Supported          | Security Maintenance Status |
| ------- | ------------------ | --------------------------- |
| 1.0.x   | :white_check_mark: | Currently Supported         |
| < 1.0.0 | :x:                | Deprecated                  |

---

## 2. Core Security Architecture & Privacy by Design

LegalEase implements a defense-in-depth security model specifically tailored for confidential legal documents:

### 2.1 Zero-Knowledge Client-Side Processing
- **Local Parsing First:** Documents uploaded in `.pdf`, `.docx`, and `.txt` formats are parsed client-side using Web Workers (`pdfjs-dist` and `mammoth`).
- **No Unconsented Cloud Retention:** Documents analyzed in offline/demo mode are stored strictly in browser sandboxed storage (`localStorage`/`IndexedDB`) and never transmitted to external third-party servers without explicit user authentication.
- **Immediate In-Memory Redaction:** Sensitive Personally Identifiable Information (PII) such as Social Security Numbers, government IDs, and payment card numbers can be sanitized before AI processing.

### 2.2 Strict Content Security Policy (CSP)
The application enforces a rigid Content Security Policy in `index.html`:
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com https://*.firebaseapp.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.firebasestorage.app https://generativelanguage.googleapis.com https://ui-avatars.com data: blob:; font-src 'self' https://fonts.gstatic.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; worker-src 'self' blob:; frame-src 'self' https://*.firebaseapp.com;
```

### 2.3 Additional HTTP Security Headers
- `X-Content-Type-Options: nosniff` (Prevents MIME-sniffing attacks)
- `Referrer-Policy: strict-origin-when-cross-origin` (Guards cross-origin referrer data leakage)
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` (Blocks unauthorized hardware access)

### 2.4 XSS Mitigation & Input Sanitization
- **DOMPurify Sanitization:** All user inputs, document extracts, and external strings are rigorously sanitized using `DOMPurify` with an explicit whitelist of safe tags (`<b>`, `<i>`, `<em>`, `<strong>`, `<p>`, `<br>`, `<span>`, `<ul>`, `<li>`, `<ol>`, `<code>`).
- **Dangerous Tag Stripping:** All `<script>`, `<iframe>`, `<object>`, `<embed>`, and `on*` inline event handlers are removed before rendering.

### 2.5 Magic-Byte Binary Signature Validation
To prevent malware disguising as documents (e.g. renaming an executable to `.pdf`):
- All uploaded files have their leading byte signatures verified via `securityService.verifyFileMagicBytes()`.
- PDF files must start with the `%PDF-` (`0x25 0x50 0x44 0x46`) header.
- DOCX files must start with the ZIP PK header (`0x50 0x4B 0x03 0x04`).

---

## 3. Grounded AI Ethics & Anti-Hallucination Guardrails

- **Strict Source Grounding:** The Retrieval-Augmented Generation (RAG) engine operates on exact semantic chunks extracted from the uploaded document.
- **Zero Fabrication Rule:** If requested information is absent from the document, the engine states: *"I couldn't find information about this in the uploaded document."*
- **No Numerical Risk Scores:** To prevent misleading pseudo-scientific risk assumptions, qualitative evaluations (*"Important points to review"*, *"Review carefully"*) are used instead of misleading percentages.
- **Mandatory Legal Disclaimer:** Every view, modal, and checklist reminds users that LegalEase provides educational document analysis and does not constitute formal legal counsel.

---

## 4. Reporting a Vulnerability

We welcome security researchers and community contributors to report potential vulnerabilities responsibly:

1. **Email:** Send details to `security@legalease-ai.internal` (or submit a private security advisory on GitHub).
2. **Details to Include:**
   - Detailed description of the vulnerability and attack vector.
   - Proof of concept (PoC) steps or script to reproduce.
   - Impact assessment on document privacy or client integrity.
3. **Response Timelines:**
   - Acknowledgement within **24 hours**.
   - Assessment and triage within **48 hours**.
   - Release of patch or mitigation within **5 business days**.

Please do not open public issues on GitHub for undisclosed security vulnerabilities.
