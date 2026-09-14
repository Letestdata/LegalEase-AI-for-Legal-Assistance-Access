# PRD — LegalEase

**Product Name:** LegalEase
**Tagline:** **Understand before you sign.**
**Platform:** Responsive Web Application
**Frontend:** React.js
**Backend:** Firebase
**AI:** GenAI + document-based RAG
**Primary Users:** People who need to understand legal documents without legal expertise

---

## 1. Product Overview

LegalEase is a GenAI-powered legal document assistant that helps users understand complicated legal documents in simple language.

Users can upload documents such as:

* Rental agreements
* Employment contracts
* NDAs
* Service agreements
* Loan agreements
* Insurance policies
* Terms & conditions
* Vendor agreements
* Other PDF/DOC/DOCX legal documents

The application analyzes the uploaded document and presents:

* Simple explanations
* Important points
* Obligations
* Deadlines
* Clauses that deserve attention
* Document-based Q&A
* Comparison between two document versions
* Questions and checklists for discussing the document with a legal professional

### Core principle

**LegalEase provides legal information and document assistance. It does not replace a qualified legal professional or provide definitive legal advice.**

---

# 2. Problem Statement

Legal documents are often difficult for ordinary users because:

1. Legal terminology is complicated.
2. Important conditions can be buried inside lengthy documents.
3. Users may not know which clauses deserve attention.
4. Comparing two versions manually is time-consuming.
5. Users often don't know what questions to ask a lawyer.
6. Generic internet searches may not address the exact document the user has.

LegalEase addresses this by turning complex documents into an understandable, structured experience.

---

# 3. Product Goal

The primary goal is:

> **Help users understand what a legal document says, identify important areas to review, and prepare better questions before making a decision or speaking with a legal professional.**

### Success criteria

A user should be able to:

```text
Upload document
      ↓
Understand document
      ↓
Find important points
      ↓
Ask questions
      ↓
Compare versions
      ↓
Prepare questions/checklist
```

without needing technical or legal expertise.

---

# 4. Target Users

## Primary Users

### Individual users

People reviewing:

* Rental agreements
* Employment contracts
* Loan documents
* Service agreements
* Insurance documents
* NDAs

### Students

Students learning about contracts and legal documents.

### Freelancers

Users reviewing:

* Client agreements
* Service contracts
* NDAs
* Payment agreements

### Small businesses

Users reviewing basic:

* Vendor contracts
* Employee agreements
* Service agreements
* Partnership documents

---

# 5. User Personas

## Persona 1 — Tenant

**Problem:** Received a 20-page rental agreement.

**Needs:**

* Understand deposit conditions
* Understand notice period
* Find early termination conditions
* Know what questions to ask the landlord/lawyer

---

## Persona 2 — Job Applicant

**Problem:** Received an employment contract.

**Needs:**

* Understand notice period
* Understand termination terms
* Identify confidentiality/IP clauses
* Understand benefits and obligations

---

## Persona 3 — Freelancer

**Problem:** Client sends a service agreement.

**Needs:**

* Understand payment conditions
* Find penalties
* Understand termination
* Identify important obligations

---

# 6. Core Features

## Feature 1 — User Authentication

Users can create and access their accounts.

### Authentication methods

* Email/password
* Google Sign-In

### Requirements

* Secure authentication
* Session persistence
* Logout
* Forgot password
* Account creation

### Firebase

Use **Firebase Authentication**.

---

# 7. Feature 2 — Document Upload

Users can upload:

* PDF
* DOC
* DOCX

### Upload interface

```text
Upload a document

[ Choose File ]

PDF, DOC or DOCX
```

### Requirements

* File type validation
* File size validation
* Upload progress
* Upload status
* Remove uploaded file
* Retry failed upload

### Firebase

Store original documents in:

**Firebase Storage**

---

# 8. Feature 3 — Document Processing

After upload:

```text
Reading document
      ↓
Finding important sections
      ↓
Understanding key terms
      ↓
Generating summary
      ↓
Analysis complete
```

The user should see understandable progress messages.

Do not expose technical terminology such as:

* embeddings
* vector indexing
* RAG retrieval
* token processing

---

# 9. Feature 4 — Document Overview

After analysis, show a structured overview.

### Header

```text
Rental Agreement

Rental_Agreement.pdf
Analyzed today
```

### Overall Review

Use:

* Review carefully
* Informational
* Several points to review

Avoid presenting an artificial numerical legal score.

### Summary statistics

Example:

```text
8 Important Points
5 Obligations
3 Deadlines
4 Points to Review
```

---

# 10. Feature 5 — Important Points

AI identifies areas that deserve user attention.

Examples:

### Early termination

> You may have to pay a charge if you leave before the agreement ends.

### Notice period

> You need to provide 60 days' notice.

### Automatic renewal

> The agreement may renew automatically unless notice is provided.

### Security deposit

> The agreement explains when the deposit should be returned.

Each item should have:

* Title
* Simple explanation
* Importance indicator
* Source/page
* View details action

---

# 11. Feature 6 — Clause Explanation

Users can open an important clause.

### Information displayed

```text
What the document says
        ↓
Simple explanation
        ↓
Who does this affect?
        ↓
Why should you care?
        ↓
Questions to consider
        ↓
Source
```

### Example

**Early termination**

**Simple explanation:**

> If you leave before the agreement ends, the agreement says you may have to pay a charge.

**Source:**

> Page 7 • Section 14.2

### Important requirement

AI must distinguish between:

**What the document says**

and

**AI-generated explanation.**

---

# 12. Feature 7 — Document Q&A

Users can ask questions about the uploaded document.

Example:

> What happens if I leave early?

The AI retrieves relevant sections and answers based on the document.

### Response structure

```text
Answer

According to the agreement...

Source

Page 7 • Section 14.2

[View section]
```

### Requirements

* Questions must be associated with a specific document.
* Answers should prioritize uploaded-document content.
* Show source/page references.
* Don't invent missing information.
* If information isn't found, explicitly say so.

Example:

> “I couldn't find information about this in the uploaded document.”

---

# 13. Feature 8 — Suggested Questions

When viewing a document, generate useful questions.

Example:

```text
Suggested questions

• What happens if I terminate early?
• When will I get my deposit back?
• Can the agreement renew automatically?
• What happens if payment is late?
```

Users can click a question to automatically send it to the document assistant.

---

# 14. Feature 9 — Compare Documents

Users can upload two documents:

```text
Original
        +
New Version
        ↓
Comparison
```

The system identifies:

* Added clauses
* Removed clauses
* Modified clauses
* Changed amounts
* Changed deadlines
* Changed obligations
* Changed termination conditions

### Example

```text
Notice Period

Original
30 days

        →

New
60 days

Why it matters

The new agreement requires twice as much
notice before termination.
```

---

# 15. Feature 10 — Comparison Categories

Changes should be grouped into:

### Important changes

Changes that may significantly affect the user's obligations or rights.

### Changes to review

Changes that deserve attention but may have less obvious impact.

### Minor changes

Formatting or small wording changes.

Do not automatically claim that a change is legally harmful.

Use wording such as:

> “This change may affect your obligations.”

---

# 16. Feature 11 — Lawyer Preparation

The system should help users prepare for a discussion with a qualified legal professional.

Generate:

### Main concern

> Early termination and security deposit.

### Relevant sections

> Section 14.2
> Section 16.1

### Questions

```text
☐ Can the termination charge be changed?
☐ What happens if I cannot provide 60 days' notice?
☐ When can the deposit be withheld?
```

### Information to prepare

```text
☐ Signed agreement
☐ Payment receipts
☐ Relevant messages
☐ Important dates
```

### Actions

* Copy questions
* Download checklist

---

# 17. Feature 12 — My Documents

Users can see previously uploaded documents.

### Document card

```text
📄 Rental Agreement

PDF • 2.4 MB
Analyzed Sep 14, 2026

[ Open ]
```

### Actions

* Open
* Rename
* Delete

### Search

Users can search their documents by filename.

---

# 18. Feature 13 — Profile

Simple account management.

### Sections

**Account**

* Personal information
* Security

**Application**

* Privacy
* About LegalEase

**Account action**

* Sign out

---

# 19. Dashboard

The dashboard should prioritize the user's next action.

### Layout

```text
Good morning 👋

Understand your legal documents
in simple language.

┌─────────────────────────────┐
│ Understand a document       │
│ Upload a PDF or DOCX        │
│                             │
│ [ Upload Document ]         │
└─────────────────────────────┘

┌───────────────┐ ┌───────────────┐
│ Compare       │ │ Ask           │
│ Documents     │ │ Your Document │
└───────────────┘ └───────────────┘

Recent Documents
```

---

# 20. Firebase Architecture

```text
React.js
   │
   ├── Firebase Authentication
   │
   ├── Cloud Firestore
   │
   ├── Firebase Storage
   │
   └── Firebase Cloud Functions
             │
             ▼
        AI Processing
```

---

# 21. Firestore Data Model

## users

```text
users/{userId}

{
  name,
  email,
  photoURL,
  createdAt
}
```

## documents

```text
documents/{documentId}

{
  userId,
  fileName,
  fileType,
  fileSize,
  storagePath,
  documentType,
  status,
  createdAt,
  updatedAt
}
```

Possible status:

```text
uploaded
processing
completed
failed
```

---

## analyses

```text
analyses/{analysisId}

{
  documentId,
  userId,
  summary,
  importantPoints,
  obligations,
  deadlines,
  concerns,
  createdAt
}
```

---

## conversations

```text
conversations/{conversationId}

{
  documentId,
  userId,
  createdAt,
  updatedAt
}
```

Messages can be stored as a subcollection:

```text
conversations/{conversationId}/messages/{messageId}
```

```text
{
  role,
  content,
  sources,
  createdAt
}
```

---

# 22. Firebase Storage Structure

```text
documents/
   {userId}/
       {documentId}/
           original.pdf
```

Users should only be able to access their own files.

---

# 23. Security Requirements

This is especially important because legal documents may contain sensitive information.

### Authentication

All private application data requires authentication.

### Firestore

Users can only:

```text
READ → their own data
WRITE → their own data
DELETE → their own data
```

### Storage

Users can only access files belonging to their own account.

### AI API keys

Never put AI API keys in React frontend code.

Use a secure backend/Cloud Function.

### Document access

Never expose Firebase Storage URLs publicly if the documents are intended to be private.

---

# 24. AI Architecture

Use a document-grounded approach.

```text
Upload
  ↓
Extract text
  ↓
Split into sections
  ↓
Store document content
  ↓
Create searchable representations
  ↓
Retrieve relevant sections
  ↓
GenAI
  ↓
Structured response
  ↓
React UI
```

For Q&A:

```text
User Question
      ↓
Find relevant document sections
      ↓
Send relevant context to AI
      ↓
Generate answer
      ↓
Attach source references
      ↓
Display answer
```

---

# 25. AI Output Rules

The AI should:

### Do

* Explain legal language simply.
* Identify relevant document sections.
* Cite page/section sources.
* Say when information isn't found.
* Distinguish document facts from AI interpretation.
* Suggest questions for a lawyer.
* Explain potential areas of concern.

### Don't

* Claim to be a lawyer.
* Guarantee legal outcomes.
* Declare something illegal without appropriate legal basis.
* Invent clauses.
* Invent citations.
* Fabricate information missing from the document.
* Tell users they will win/lose a legal case.
* Present a confidence score as legal certainty.

---

# 26. Disclaimer Strategy

Don't hide everything behind one disclaimer.

Use contextual notices.

### Document page

> “This analysis explains the uploaded document and is not professional legal advice.”

### AI Q&A

> “Answers are based on the uploaded document. They may not reflect applicable law or your specific circumstances.”

### Lawyer preparation

> “Use this checklist to prepare for a discussion with a qualified legal professional.”

---

# 27. UI Requirements

### Color palette

```text
Primary:          #1F4E5F
Secondary:        #5F8D9E
Background:       #F7F9FA
Card:             #FFFFFF
Text:             #172027
Secondary Text:   #66737A
Success:          #2E7D5B
Warning:          #D89B2B
Danger:           #C94C4C
Border:           #E3E8EB
```

### Design characteristics

* Clean
* Minimal
* Professional
* Friendly
* Accessible
* Responsive
* Large clickable areas
* Clear buttons
* Consistent icons
* No unnecessary animations

---

# 28. Navigation

### Desktop

```text
LegalEase

Home
My Documents
Compare
Profile

────────────

Privacy
Help

Sign Out
```

### Mobile

Bottom navigation:

```text
Home | Documents | Compare | Profile
```

---

# 29. Responsive Requirements

### Desktop

* Sidebar navigation
* Two-column layouts where appropriate
* Maximum content width ~1200px

### Tablet

* Reduced spacing
* Compact sidebar

### Mobile

* Bottom navigation
* Single-column cards
* Stacked comparison documents
* Full-width primary buttons
* Chat input fixed at bottom
* Upload area optimized for touch

---

# 30. Error Handling

## Unsupported file

> **That file type isn't supported.**
> Please upload a PDF, DOC, or DOCX file.

## File too large

> **This file is too large.**
> Please upload a smaller document.

## Analysis failure

> **We couldn't analyze this document.**
> Please try again.

Buttons:

**Try Again**

**Go Back**

## AI cannot find answer

> **I couldn't find this information in the uploaded document.**

This is preferable to hallucinating an answer.

---

# 31. Empty States

### No documents

> **No documents yet**
> Upload your first legal document to get started.

**Upload Document**

### No comparisons

> **No comparisons yet**
> Upload two versions of a document to see what changed.

**Compare Documents**

---

# 32. MVP Scope

For the first working version, implement only:

### Must Have

* [x] Firebase Authentication
* [x] Dashboard
* [x] PDF/DOC/DOCX upload
* [x] Firebase Storage
* [x] Firestore
* [x] Document processing
* [x] AI summary
* [x] Important points
* [x] Clause explanation
* [x] Document Q&A
* [x] Source/page references
* [x] Document comparison
* [x] Lawyer preparation checklist
* [x] My Documents
* [x] Delete document
* [x] Responsive UI

### Do NOT add initially

* ❌ Court case prediction
* ❌ Legal case filing
* ❌ AI-generated lawsuits
* ❌ Lawyer marketplace
* ❌ Payment system
* ❌ Complex legal database
* ❌ Numerical legal risk score
* ❌ Social features
* ❌ Unnecessary analytics dashboards

---

# 33. Future Features

After the MVP works:

### Phase 2

* Hindi/Gujarati explanations
* More document formats
* Voice questions
* Document annotations
* Export analysis as PDF
* More advanced comparison

### Phase 3

* Jurisdiction-aware legal research
* Authoritative legal-source citations
* Lawyer referral
* Collaboration
* Organization accounts
* Contract templates

Jurisdiction-specific answers should only be added when the system has reliable legal sources; otherwise the product risks becoming a hallucinating legal chatbot.

---

# 34. Core User Journey

The entire product should revolve around this:

```text
                START
                  │
                  ▼
              Dashboard
                  │
                  ▼
          Upload Document
                  │
                  ▼
             Processing
                  │
                  ▼
          Document Overview
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
   Important     Ask       Compare
     Points      AI       Documents
       │
       ▼
  Clause Details
       │
       ▼
 Prepare Questions
       │
       ▼
 Lawyer Checklist
```

## Product success metric

The most meaningful MVP metric isn't “number of AI messages.”

Track whether users successfully complete:

**Upload → Analyze → Open important point → View source → Ask question / Prepare checklist.**

That measures whether LegalEase actually helps someone understand a document rather than merely giving them a chatbot to talk to.
