import React, { createContext, useContext, useState, useEffect } from 'react';
import { documentService } from '../services/documentService';
import { extractTextFromFile, validateFile } from '../services/documentParser';
import { analyzeLegalDocument } from '../services/aiService';
import { compareDocuments } from '../services/compareEngine';
import { useAuth } from './AuthContext';

const DocumentContext = createContext(null);

export function DocumentProvider({ children }) {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [activeDocument, setActiveDocument] = useState(null);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [comparisonData, setComparisonData] = useState(null);
  const [error, setError] = useState(null);

  const userId = currentUser ? currentUser.uid : 'default_user';

  // Load documents on mount or user change
  useEffect(() => {
    loadDocuments();
  }, [userId]);

  const loadDocuments = async () => {
    try {
      const docs = await documentService.getDocuments(userId);
      setDocuments(docs);
      // If no active document, set first one as active
      if (!activeDocument && docs.length > 0) {
        selectDocument(docs[0]);
      }
    } catch (err) {
      console.warn("Could not load documents", err);
    }
  };

  const selectDocument = async (docItem) => {
    setActiveDocument(docItem);
    setError(null);
    if (!docItem) {
      setActiveAnalysis(null);
      return;
    }

    // Generate or fetch analysis for this document
    try {
      const text = docItem.rawContent || `Agreement: ${docItem.title}\nTerms and conditions governing agreement.`;
      const analysis = await analyzeLegalDocument(text, docItem.fileName);
      setActiveAnalysis(analysis);
    } catch (e) {
      console.error("Error analyzing document", e);
    }
  };

  const uploadAndAnalyzeDocument = async (file) => {
    setError(null);
    setIsAnalyzing(true);
    setAnalysisStep('Reading document');
    setAnalysisProgress(10);

    try {
      validateFile(file);

      const rawText = await extractTextFromFile(file);

      const analysis = await analyzeLegalDocument(
        rawText,
        file.name,
        (stepText, stepIndex, totalSteps) => {
          setAnalysisStep(stepText);
          setAnalysisProgress(Math.round((stepIndex / totalSteps) * 100));
        }
      );

      const newDoc = {
        id: 'doc_' + Date.now(),
        fileName: file.name,
        title: analysis.documentType || file.name.replace(/\.[^/.]+$/, ''),
        fileType: file.name.split('.').pop().toUpperCase(),
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        sizeBytes: file.size,
        pages: analysis.sections ? Math.max(1, Math.ceil(analysis.sections.length / 2)) : 1,
        status: analysis.stats.pointsToReviewCount > 0 ? `${analysis.stats.pointsToReviewCount} review items` : 'Ready',
        statusType: analysis.stats.pointsToReviewCount > 0 ? 'review' : 'ready',
        riskSummary: analysis.pointsToReview[0] || 'Plain-English breakdown ready for review.',
        analyzedAt: 'Analyzed today',
        updatedAt: 'Just now',
        rawContent: rawText
      };

      const saved = await documentService.saveDocument(newDoc, userId);
      setDocuments(prev => [saved, ...prev]);
      setActiveDocument(saved);
      setActiveAnalysis(analysis);
      setIsAnalyzing(false);
      return saved;
    } catch (err) {
      setIsAnalyzing(false);
      setError(err.message || 'We couldn\'t analyze this document. Please try again.');
      throw err;
    }
  };

  const deleteDoc = async (id) => {
    await documentService.deleteDocument(id, userId);
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (activeDocument && activeDocument.id === id) {
      const remaining = documents.filter(d => d.id !== id);
      selectDocument(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const renameDoc = async (id, newTitle) => {
    const updated = await documentService.renameDocument(id, newTitle, userId);
    if (updated) {
      setDocuments(prev => prev.map(d => d.id === id ? updated : d));
      if (activeDocument && activeDocument.id === id) {
        setActiveDocument(updated);
      }
    }
  };

  const runComparison = (originalDoc, revisedDoc) => {
    const origText = originalDoc?.rawContent || (documents[0]?.rawContent || '');
    const revText = revisedDoc?.rawContent || (documents[1]?.rawContent || '');
    const diffResult = compareDocuments(
      origText,
      revText,
      originalDoc?.fileName || 'Original (v2.1)',
      revisedDoc?.fileName || 'New Proposed (v3.0)'
    );
    setComparisonData(diffResult);
    return diffResult;
  };

  const value = {
    documents,
    activeDocument,
    activeAnalysis,
    isAnalyzing,
    analysisStep,
    analysisProgress,
    comparisonData,
    error,
    uploadAndAnalyzeDocument,
    selectDocument,
    deleteDocument: deleteDoc,
    renameDocument: renameDoc,
    runComparison
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
}
