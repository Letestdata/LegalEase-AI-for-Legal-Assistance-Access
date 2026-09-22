/**
 * Document Service
 * Manages document storage, Firestore metadata records, deletion, and retrieval.
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  orderBy 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from './firebase';
import { isPdfBytecode, generateCleanLegalTemplate } from './documentParser';

const MOCK_DOCS_KEY = 'legalease_documents';

/**
 * Sanitizes any document record that might contain raw PDF bytecode
 */
function sanitizeDocumentRecord(doc) {
  if (!doc) return doc;
  const clone = { ...doc };
  if (isPdfBytecode(clone.rawContent)) {
    const cleanTitle = (clone.title || clone.fileName || 'Legal Agreement').replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    clone.rawContent = generateCleanLegalTemplate(cleanTitle, clone.fileName || 'Document.pdf');
  }
  if (isPdfBytecode(clone.riskSummary)) {
    clone.riskSummary = 'Plain-English breakdown ready for review.';
  }
  return clone;
}

// Default initial sample documents matching Stitch Home Dashboard
const INITIAL_MOCK_DOCUMENTS = [
  {
    id: 'doc-rental-agreement',
    fileName: 'Rental_Agreement.pdf',
    title: 'Rental Agreement',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    sizeBytes: 2516582,
    pages: 14,
    status: '3 review items',
    statusType: 'review', // 'review' | 'ready'
    riskSummary: 'Early termination penalty clause needs verification.',
    analyzedAt: 'Analyzed today',
    updatedAt: 'Updated 2h ago',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    rawContent: `RENTAL LEASE AGREEMENT
1.0 PARTIES AND PREMISES
This Residential Lease Agreement is entered into between Metropolitan Realty Partners ("Landlord") and Sarah Jenkins ("Tenant").

3.4 AUTOMATIC RENEWAL
Upon expiration of the initial term, this Agreement shall automatically renew for a successive 12-month term unless Tenant delivers formal written notice of non-renewal.

5.1 NOTICE PERIOD
Tenant shall provide at least sixty (60) calendar days prior written notice before moving out or terminating this lease.

8.3 SECURITY DEPOSIT
Tenant agrees to deposit the sum of $2,450 to be held in an escrow account. Landlord shall return the deposit, less documented itemized repairs, within 21 days following final walk-through inspection.

14.2 EARLY TERMINATION CHARGE
In the event Tenant vacates before the lease expiration, Tenant forfeits the security deposit and shall pay an early termination administrative charge equal to two months base rent.`
  },
  {
    id: 'doc-employment-contract',
    fileName: 'Employment_Contract.pdf',
    title: 'Employment Contract',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    sizeBytes: 1258291,
    pages: 6,
    status: 'Ready',
    statusType: 'ready',
    riskSummary: 'Non-compete and IP clauses standard for your region.',
    analyzedAt: 'Analyzed yesterday',
    updatedAt: 'Updated 1d ago',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    rawContent: `EMPLOYMENT AGREEMENT
1.0 EMPLOYMENT RELATIONSHIP
Company hereby employs Employee as Senior Software Architect.

4.0 NOTICE PERIOD AND TERMINATION
Either party may terminate employment with thirty (30) days written notice. Company reserves the right to provide payment in lieu of notice.

7.0 INTELLECTUAL PROPERTY
Employee agrees that all inventions, designs, and code authored within the scope of duties belong exclusively to Company.`
  },
  {
    id: 'doc-nda-agreement',
    fileName: 'Mutual_NDA_Standard.docx',
    title: 'NDA Agreement',
    fileType: 'DOCX',
    fileSize: '840 KB',
    sizeBytes: 860160,
    pages: 3,
    status: 'Ready',
    statusType: 'ready',
    riskSummary: 'Mutual confidentiality scope matches standard norms.',
    analyzedAt: 'Analyzed 3 days ago',
    updatedAt: 'Updated 3d ago',
    createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    rawContent: `MUTUAL NON-DISCLOSURE AGREEMENT
1.0 PURPOSE
Parties intend to explore a mutually beneficial business relationship.

3.0 CONFIDENTIAL INFORMATION OBLIGATIONS
Recipient shall protect Disclosing Party's Confidential Information with the same degree of care used for its own confidential assets, but not less than reasonable care.

5.0 TERM
The obligations of confidentiality shall endure for a period of three (3) years from the date of disclosure.`
  }
];

class DocumentService {
  constructor() {
    this.initMockDocuments();
  }

  initMockDocuments() {
    try {
      const stored = localStorage.getItem(MOCK_DOCS_KEY);
      if (!stored) {
        localStorage.setItem(MOCK_DOCS_KEY, JSON.stringify(INITIAL_MOCK_DOCUMENTS));
      }
    } catch (e) {
      console.warn("Storage init warning", e);
    }
  }

  async getDocuments(userId = 'default_user') {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(
          collection(db, 'documents'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => sanitizeDocumentRecord({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn("Error fetching documents from Firestore, fallback to local:", err);
      }
    }

    // Local Storage Mock
    try {
      const stored = localStorage.getItem(MOCK_DOCS_KEY);
      const rawDocs = stored ? JSON.parse(stored) : INITIAL_MOCK_DOCUMENTS;
      let hasBytecode = false;
      const sanitized = rawDocs.map(d => {
        if (isPdfBytecode(d.rawContent) || isPdfBytecode(d.riskSummary)) {
          hasBytecode = true;
          return sanitizeDocumentRecord(d);
        }
        return d;
      });
      if (hasBytecode) {
        localStorage.setItem(MOCK_DOCS_KEY, JSON.stringify(sanitized));
      }
      return sanitized;
    } catch {
      return INITIAL_MOCK_DOCUMENTS;
    }
  }

  async saveDocument(docData, userId = 'default_user') {
    const documentId = docData.id || 'doc_' + Date.now();
    const fullDoc = sanitizeDocumentRecord({
      ...docData,
      id: documentId,
      userId,
      createdAt: docData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'documents', documentId), fullDoc);
        return fullDoc;
      } catch (err) {
        console.warn("Error saving document to Firestore, saving to local:", err);
      }
    }

    // Local Storage
    try {
      const docs = await this.getDocuments(userId);
      const existingIdx = docs.findIndex(d => d.id === documentId);
      if (existingIdx >= 0) {
        docs[existingIdx] = fullDoc;
      } else {
        docs.unshift(fullDoc);
      }
      localStorage.setItem(MOCK_DOCS_KEY, JSON.stringify(docs));
    } catch (e) {
      console.warn("Local storage save error:", e);
    }

    return fullDoc;
  }

  async deleteDocument(documentId, userId = 'default_user') {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'documents', documentId));
      } catch (err) {
        console.warn("Error deleting document from Firestore:", err);
      }
    }

    try {
      const docs = await this.getDocuments(userId);
      const filtered = docs.filter(d => d.id !== documentId);
      localStorage.setItem(MOCK_DOCS_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  async renameDocument(documentId, newTitle, userId = 'default_user') {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'documents', documentId);
        await setDoc(docRef, { title: newTitle, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.warn("Error renaming document in Firestore:", err);
      }
    }

    try {
      const docs = await this.getDocuments(userId);
      const target = docs.find(d => d.id === documentId);
      if (target) {
        target.title = newTitle;
        target.updatedAt = 'Just now';
        localStorage.setItem(MOCK_DOCS_KEY, JSON.stringify(docs));
        return target;
      }
    } catch (e) {
      console.warn("Error renaming locally:", e);
    }
    return null;
  }

  async uploadFileToStorage(file, userId = 'default_user') {
    if (!isFirebaseConfigured || !storage) {
      return {
        downloadUrl: null,
        storagePath: `local/${file.name}`
      };
    }

    const storagePath = `users/${userId}/documents/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = await uploadBytesResumable(storageRef, file);
    const downloadUrl = await getDownloadURL(uploadTask.ref);

    return {
      downloadUrl,
      storagePath
    };
  }
}

export const documentService = new DocumentService();
