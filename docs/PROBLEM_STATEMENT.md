# Problem Statement & Solution Alignment — LegalEase

> **Product Name:** LegalEase  
> **Tagline:** **Understand before you sign.**  
> **Platform:** Responsive Web Application  
> **Frontend:** React.js 19 + Vite  
> **Backend:** Firebase (Authentication, Cloud Firestore, Cloud Storage)  
> **AI Architecture:** GenAI + Document-Grounded RAG (Zero-Hallucination Retrieval)  
> **Primary Users:** People who need to understand legal documents without legal expertise  

---

## 1. The Core Problem Statement

Legal documents (rental leases, employment contracts, NDAs, loan agreements, service contracts, vendor agreements) are notoriously difficult for ordinary citizens, tenants, employees, and small business owners because:

1. **Legal terminology is complicated:** Archaic legalese, Latin maxims, and nested clauses obscure critical rights.
2. **Important conditions can be buried inside lengthy documents:** Essential details like automatic renewals, penalty clauses, and deposit recovery terms are hidden across tens of pages.
3. **Users may not know which clauses deserve attention:** Without legal training, users cannot distinguish standard boilerplate from high-liability commitments.
4. **Comparing two versions manually is time-consuming and error-prone:** When landlords or employers issue revised contracts, detecting subtle shifts in deadlines, fees, or obligations by eye is almost impossible.
5. **Users often don't know what questions to ask a lawyer:** Consultations with attorneys are expensive ($300–$800/hr); unprepared clients waste billable hours asking generic questions.
6. **Generic internet searches may not address the exact document the user has:** Public web searches provide generic legal definitions that fail to apply to the user's specific state laws or contract terms.

---

## 2. Product Goal & Solution Mapping

LegalEase transforms complicated contracts into a transparent, structured, and accessible experience.

| Problem Dimension | How LegalEase Solves It | Implementation File(s) | Verification Test |
| :--- | :--- | :--- | :--- |
| **1. Complex Legal Terminology** | Translates every clause into clear plain English while preserving the original verbatim text side-by-side for comparison. | `src/services/aiService.js`<br>`src/components/overview/ClauseModal.jsx` | `tests/components.test.jsx` |
| **2. Buried Conditions & Deadlines** | Extracts 4 critical categories: **Important Points**, **Obligations**, **Deadlines**, and **Points to Review**. | `src/components/overview/SummaryCards.jsx`<br>`src/components/overview/ImportantPointsList.jsx` | `tests/components.test.jsx` |
| **3. Lack of Attention Awareness** | Clearly flags high-risk clauses with visual severity badges, "Who does this affect?", and "Why should you care?". | `src/components/overview/ClauseModal.jsx`<br>`src/services/aiService.js` | `tests/ragEngine.test.js` |
| **4. Time-Consuming Version Comparison** | Side-by-side differential engine categorizing shifts into **Important changes**, **Changes to review**, and **Minor changes**. | `src/services/compareEngine.js`<br>`src/components/compare/CompareView.jsx` | `tests/compareEngine.test.js` |
| **5. Unprepared for Lawyer Consultations** | Generates a structured **Lawyer Preparation Checklist** with prioritized questions and a list of documentation to bring. | `src/components/lawyer/LawyerChecklist.jsx`<br>`src/components/checklist/LawyerChecklist.jsx` | `tests/components.test.jsx` |
| **6. Generic Internet Searches** | Document-grounded RAG Q&A that strictly cites exact sections and page numbers, stating honestly when information is not found. | `src/services/ragEngine.js`<br>`src/components/qa/DocumentQA.jsx` | `tests/ragEngine.test.js` |

---

## 3. Core Principle & Ethical Guardrails

> **LegalEase provides legal information and document assistance. It does not replace a qualified legal professional or provide definitive legal advice.**

### Strict Guardrail Rules Implemented in Code
- ❌ **No Artificial Legal Risk Scores:** The app avoids numerical risk scoring that could mislead users into false security. It uses qualitative reviews (*"Review carefully"*, *"Several points to review"*).
- ❌ **No Hallucinated Citations:** If a question cannot be answered from the document, the assistant answers: *"I couldn't find information about this in the uploaded document."*
- ❌ **No Legal Outcome Guarantees:** Disclaimers are displayed contextually on every document view, Q&A modal, and lawyer checklist.
- ❌ **No Raw Bytecode Leakage:** Built-in PDF dictionary filters ensure raw PostScript or stream bytecode (`/Type/Catalog`, `/Filter/FlateDecode`) is never displayed to users.

---

## 4. Target Personas Addressed

### Persona 1: Tenant (Rental Agreements)
- Understand deposit conditions, notice period (e.g. 60-day cutoff), and early termination charges.
- Addressed in `Rental Agreement` template extraction and specialized Q&A prompts.

### Persona 2: Job Applicant (Employment Contracts)
- Understand non-compete clauses, notice periods, termination terms, and IP ownership.
- Addressed in `Employment Contract` template extraction and specialized Q&A prompts.

### Persona 3: Freelancer & Small Business (NDAs & Service Agreements)
- Understand payment schedules, late fees, confidentiality duration, and liability caps.
- Addressed in `Mutual NDA` and `Service Agreement` template extraction and comparison.

---

## 5. Core User Journey Flow

```
Upload Document (PDF/DOCX/TXT)
       ↓
Processing & Extraction (Client-Side, Fast, Private)
       ↓
Structured Document Overview (Important Points, Obligations, Deadlines)
       ↓
Deep Dive into Clauses (Plain-English translation + Exact text citation)
       ↓
Grounded Q&A or Version Comparison
       ↓
Lawyer Preparation Checklist (Export / Copy for legal counsel)
```
