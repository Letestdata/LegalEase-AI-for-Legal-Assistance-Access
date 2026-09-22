import { describe, it, expect, beforeEach } from 'vitest';
import { documentService } from '../src/services/documentService';
import { isPdfBytecode } from '../src/services/documentParser';

describe('Document Service & Storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retrieves default initial mock documents when storage is empty', async () => {
    const docs = await documentService.getDocuments('test-user');
    expect(docs).toBeDefined();
    expect(docs.length).toBeGreaterThanOrEqual(1);
    expect(docs[0]).toHaveProperty('title');
    expect(docs[0]).toHaveProperty('rawContent');
  });

  it('guarantees retrieved documents never contain raw PDF bytecode', async () => {
    const docs = await documentService.getDocuments('test-user');
    for (const doc of docs) {
      expect(isPdfBytecode(doc.rawContent)).toBe(false);
    }
  });

  it('saves a new document and persists it across retrievals', async () => {
    const newDoc = {
      id: 'doc-custom-test',
      title: 'Freelance Design Agreement',
      fileName: 'Freelance_Contract.docx',
      rawContent: '1.0 SCOPE OF WORK\nDesigner shall create brand assets.',
      summary: 'Standard design contract.',
      riskScore: 35
    };

    const saved = await documentService.saveDocument(newDoc, 'test-user');
    expect(saved.id).toBe('doc-custom-test');

    const allDocs = await documentService.getDocuments('test-user');
    const found = allDocs.find(d => d.id === 'doc-custom-test');
    expect(found).toBeDefined();
    expect(found.title).toBe('Freelance Design Agreement');
  });

  it('renames an existing document title', async () => {
    const initialDoc = {
      id: 'doc-rename-test',
      title: 'Old Lease Title',
      fileName: 'Lease.pdf',
      rawContent: 'Terms of lease.',
      riskScore: 20
    };
    await documentService.saveDocument(initialDoc, 'test-user');

    await documentService.renameDocument('doc-rename-test', 'Updated Lease Title 2026', 'test-user');

    const allDocs = await documentService.getDocuments('test-user');
    const renamed = allDocs.find(d => d.id === 'doc-rename-test');
    expect(renamed.title).toBe('Updated Lease Title 2026');
  });

  it('deletes a document by id', async () => {
    const docToDelete = {
      id: 'doc-to-delete',
      title: 'Temporary NDA',
      fileName: 'NDA.pdf',
      rawContent: 'Confidentiality agreement.',
      riskScore: 10
    };
    await documentService.saveDocument(docToDelete, 'test-user');

    const success = await documentService.deleteDocument('doc-to-delete', 'test-user');
    expect(success).toBe(true);

    const allDocs = await documentService.getDocuments('test-user');
    const found = allDocs.find(d => d.id === 'doc-to-delete');
    expect(found).toBeUndefined();
  });
});
