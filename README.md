# LegalEase AI — Understand Before You Sign

> **LegalEase** is a production-ready, privacy-first, GenAI-powered legal document assistant designed to empower everyday individuals and small businesses to comprehend complex legal agreements with confidence, clarity, and speed.

---

## 1. Problem Statement Alignment & Mission

### The Core Problem Statement (from PRD)
Legal documents are notoriously difficult for ordinary users because:
1. **Legal terminology is complicated:** Archaic legalese, Latin maxims, and nested caveats obscure critical obligations.
2. **Important conditions can be buried inside lengthy documents:** Essential details like automatic renewals, penalty fees, and deposit recovery terms are buried across tens of pages.
3. **Users may not know which clauses deserve attention:** Without legal training, users cannot distinguish standard boilerplate from high-liability commitments.
4. **Comparing two versions manually is time-consuming:** When counterparties issue revised contracts, detecting subtle shifts in deadlines, fees, or obligations by eye is error-prone.
5. **Users often don't know what questions to ask a lawyer:** Consultations with attorneys are expensive ($300–$800/hr); unprepared clients waste billable hours asking generic questions.
6. **Generic internet searches may not address the exact document the user has:** Public web searches provide generic definitions that fail to apply to the user's specific contract terms.

### How LegalEase Solves This
LegalEase addresses this by turning complex documents into an understandable, structured, and actionable experience.
**Understand before you sign.**  
It surfaces critical obligations, tracks strict deadlines, flags unbalanced risk clauses, grounds every insight in the exact source text with precise citations, and prepares users for fruitful conversations with professional legal counsel.

---

## 2. Target Users & Document Types

### Primary Users
1. **Tenants & Renters:** Individuals evaluating residential or commercial leases, sublets, and property agreements.
2. **Employees & Contractors:** Job seekers and freelancers reviewing offer letters, employment contracts, IP assignment terms, and non-compete covenants.
3. **Entrepreneurs & Small Business Owners:** Founders signing vendor agreements, partnership contracts, mutual NDAs, and SaaS Master Services Agreements (MSAs).
4. **Consumers:** Individuals navigating loan agreements, personal guarantees, and complex service contracts.

### Supported Document Formats
- **PDF Documents (`.pdf`)**: Native digital PDFs with robust client-side stream decoding and automated bytecode rejection.
- **Microsoft Word (`.docx`)**: Structured XML document extraction via Mammoth.js.
- **Plain Text (`.txt`)**: Text agreements and markdown contracts.

---

## 3. Core Features & Capabilities

### 1. High-Performance Client-Side Document Parsing & Ingestion
- Fast, secure file extraction supporting PDF, DOCX, and TXT formats up to 25 MB.
- **Zero Raw Bytecode Leakage:** Built-in PDF dictionary and stream filters ensure users never see raw binary or PDF bytecode (`/Type/Catalog`, `/FlateDecode`, etc.).
- Client-side pre-processing ensures private documents are sanitized before analysis.

### 2. Plain-English Summary & Risk Categorization
- **Executive Summary:** High-level synopsis of the document's core terms, parties, and effective dates.
- **Structured Overview Metrics:** Immediate visibility into:
  - **Important Points:** Key rights, terms, and conditions.
  - **Obligations:** Explicit user duties, payment commitments, and maintenance standards.
  - **Deadlines:** Notice periods, renewal cutoff dates, cure windows, and milestones.
  - **Points to Review:** High-risk or unusual clauses deserving immediate scrutiny.
- **Interactive Clause Breakdown:** Expandable cards categorizing clauses by risk level (High, Moderate, Low, Standard) with:
  - *What it means* (Plain-English translation).
  - *Who it affects* (Tenant, Landlord, Employee, Employer, etc.).
  - *Why it matters* (Financial liability, operational restriction, legal hazard).
  - *Direct Source Citation* (Section number and estimated page).

### 3. Document-Grounded Q&A with RAG (Retrieval-Augmented Generation)
- **Zero Hallucination Guarantee:** Answers are strictly grounded in the ingested document text.
- **Source-Level Citations:** Every answer references the specific clause and page from which the insight was derived.
- **Confidence Indicator:** Displays high/medium/low confidence metrics based on semantic vector similarity and keyword overlap.
- **Document-Type Adaptive Chips:** Intelligent suggested question prompts tailored to the document category (e.g., security deposit and pet policies for leases; severance and IP ownership for employment agreements; confidentiality duration for NDAs).

### 4. Side-by-Side Version Comparison (Redline & Diff Analysis)
- Compare two document versions (e.g., initial draft vs. counter-offer, or standard template vs. landlord's addendum).
- **Three-Tier Classification:**
  - **Modified Clauses:** Track altered language, changed amounts, or shifted deadlines.
  - **Added Clauses:** Identify newly introduced obligations or liabilities.
  - **Removed Clauses:** Highlight protections or rights omitted in the revised version.
- **Risk Impact Shift:** Clear visual indicators explaining whether a change favors or harms the user.

### 5. Lawyer Consultation Preparation & Negotiation Agenda
- Generates structured, prioritized questions for legal counsel to maximize consultation efficiency and minimize billable hours.
- Identifies critical clauses requiring formal negotiation or redlining.
- **Printable / Exportable Consultation Checklist:** Users can export or print a structured briefing document prior to meeting their attorney.

### 6. Privacy-First Security & Data Governance
- **Client-Side Sanitization:** All text rendered in the interface is sanitized via DOMPurify to eliminate Cross-Site Scripting (XSS).
- **Strict Content Security Policy (CSP):** Implemented via strict HTTP meta headers preventing unauthorized script execution and cross-site leaks.
- **Secure File Storage & Access:** Strict Firestore and Firebase Storage security rules ensuring users can only read and modify documents they own.
- **Guest Mode & Data Sovereignty:** Users can analyze documents locally in guest mode without persisting any private data to cloud servers.

---

## 4. Architecture & Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Vite | Ultra-fast single-page web application with reactive state. |
| **Styling & Design System** | Tailwind CSS + Modern CSS | Accessible, responsive, glassmorphic UI adhering to Stitch design tokens. |
| **Document Processing** | PDF.js + Mammoth.js | High-performance in-browser extraction for PDF and DOCX files. |
| **Sanitization & Security** | DOMPurify | Robust defense against HTML and script injection attacks. |
| **Authentication & Cloud** | Firebase Auth + Firestore + Storage | Secure identity management, document persistence, and encrypted storage. |
| **Testing Framework** | Vitest + Testing Library + jsdom | Comprehensive unit, service, integration, and accessibility test suites. |
| **Code Quality & Linter** | Oxlint | High-speed static analysis enforcing zero-warning code quality. |

---

## 5. Security & Privacy Guarantees

- **Authentication Isolation:** Fine-grained authorization guarantees that user A cannot query, read, or delete user B's documents.
- **Magic-Byte Binary Inspection:** Validates incoming file headers at the binary level to prevent malicious MIME spoofing or disguised executable uploads.
- **No Model Training on User Data:** Legal documents are processed solely within the current session/user context and are never utilized to train public foundation models.
- **Prominent Legal Disclaimers:** Visible disclaimers on every view clarify that LegalEase provides educational legal information and analysis, not certified legal counsel.

---

## 6. Accessibility & Usability (WCAG 2.1 AA Compliant)

- **Keyboard Navigation:** Full keyboard support across all workflows, modals, tabs, and interactive clause accordions.
- **Screen Reader Friendly:** Built with semantic HTML5 elements, explicit `aria-label` attributes, `role="dialog"`, `role="status"`, and live regions (`aria-live="polite"`).
- **Skip to Content:** Direct skip link enabling keyboard users to bypass navigation and jump straight to main content.
- **Contrast & Typography:** Accessible color ratios (>4.5:1), distinct focus rings (`focus-visible`), and scalable font sizing.

---

## 7. Getting Started & Development

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn

### Installation
```bash
# Clone repository
git clone https://github.com/your-username/LegalEase-AI-for-Legal-Assistance-Access.git
cd LegalEase-AI-for-Legal-Assistance-Access

# Install dependencies
npm install
```

### Running Locally
```bash
# Start local development server
npm run dev
```
Navigate to `http://localhost:5173` in your web browser.

### Running Test Suite
```bash
# Execute comprehensive Vitest test suite
npm run test
```

### Running Code Quality / Linter
```bash
# Run Oxlint static analysis
npm run lint
```

### Building for Production
```bash
# Compile and optimize production build
npm run build
```

---

## 8. PRD Verification Matrix

| PRD Requirement | Implementation Module | Test Suite Coverage |
| :--- | :--- | :--- |
| **Document Ingestion (PDF, DOCX, TXT)** | `src/services/documentParser.js` | `tests/documentParser.test.js` |
| **Plain-English Clause Extraction** | `src/services/aiService.js` | `tests/ragEngine.test.js` |
| **Grounded Q&A with Citations** | `src/services/ragEngine.js`, `DocumentQA.jsx` | `tests/ragEngine.test.js` |
| **Side-by-Side Redline Comparison** | `src/services/compareEngine.js`, `CompareView.jsx` | `tests/compareEngine.test.js` |
| **Lawyer Consultation Checklist** | `src/components/lawyer/LawyerChecklist.jsx`, `src/components/checklist/LawyerChecklist.jsx` | `tests/components.test.jsx` |
| **Privacy & Security Standards** | `src/services/firebase.js`, `firestore.rules` | `tests/documentService.test.js` |
| **Accessible User Experience** | `src/components/common/*` | `tests/components.test.jsx` |

---

## 9. License

This project is licensed under the MIT License — see the LICENSE file for details.
