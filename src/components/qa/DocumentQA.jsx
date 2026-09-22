import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import DisclaimerBanner from '../common/DisclaimerBanner';
import { useDocument } from '../../context/DocumentContext';
import { askDocumentQuestion } from '../../services/aiService';
import { isPdfBytecode } from '../../services/documentParser';
import { sanitizeText } from '../../services/securityService';

export default function DocumentQA({ isOpen, onClose, prefilledQuestion = '' }) {
  const { activeDocument, activeAnalysis } = useDocument();

  const [inputQuestion, setInputQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'init-msg',
      role: 'assistant',
      content: `Hello! I'm your LegalEase document assistant for "${activeDocument?.title || 'your document'}". What clause, obligation, or deadline would you like me to clarify in plain English?`,
      sources: []
    }
  ]);
  const [isAnswering, setIsAnswering] = useState(false);
  const [activeSourceModal, setActiveSourceModal] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnswering]);

  const handleSend = React.useCallback(async (questionText) => {
    const q = questionText || inputQuestion;
    if (!q || !q.trim() || isAnswering) return;

    const cleanUserText = sanitizeText(q.trim());
    const userMsg = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: cleanUserText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setIsAnswering(true);

    try {
      const response = await askDocumentQuestion(cleanUserText, activeAnalysis || {}, activeDocument);
      const botMsg = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: sanitizeText(response.answer),
        sources: response.sources || [],
        found: response.found
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: 'msg_err_' + Date.now(),
          role: 'assistant',
          content: "I couldn't find information about this in the uploaded document.",
          sources: [],
          found: false
        }
      ]);
    } finally {
      setIsAnswering(false);
    }
  }, [inputQuestion, isAnswering, activeAnalysis, activeDocument]);

  // Reset chat messages when switching or uploading a document
  const activeDocId = activeDocument?.id;
  const activeDocTitle = activeDocument?.title;
  useEffect(() => {
    setMessages([
      {
        id: 'init-msg',
        role: 'assistant',
        content: `Hello! I'm your LegalEase document assistant for "${activeDocTitle || 'your document'}". What clause, obligation, or deadline would you like me to clarify in plain English?`,
        sources: []
      }
    ]);
  }, [activeDocId, activeDocTitle]);

  useEffect(() => {
    if (prefilledQuestion && isOpen) {
      handleSend(prefilledQuestion);
    }
  }, [prefilledQuestion, isOpen, handleSend]);

  const suggestedQuestions = React.useMemo(() => {
    if (activeAnalysis?.suggestedQuestions && activeAnalysis.suggestedQuestions.length > 0) {
      return activeAnalysis.suggestedQuestions;
    }
    const docType = (activeAnalysis?.documentType || activeDocument?.title || '').toLowerCase();
    if (docType.includes('employment')) {
      return [
        'What notice period is required to resign?',
        'Who owns intellectual property created during employment?',
        'Are there non-compete or non-solicitation restrictions?',
        'What happens if I am terminated without cause?'
      ];
    }
    if (docType.includes('nda') || docType.includes('confidential')) {
      return [
        'How long does the confidentiality obligation last?',
        'What information is considered confidential under this agreement?',
        'What are the exceptions to confidentiality?',
        'What happens if confidential information is accidentally disclosed?'
      ];
    }
    if (docType.includes('service') || docType.includes('contractor')) {
      return [
        'What is the payment schedule and late fee policy?',
        'Who owns the final work deliverables and IP?',
        'How can either party terminate this service agreement?',
        'What warranties or liability limits apply?'
      ];
    }
    return [
      'What happens if I terminate early?',
      'When will I get my deposit back?',
      'Can the agreement renew automatically?',
      'How much notice is required before moving out?'
    ];
  }, [activeAnalysis, activeDocument]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ask about ${activeDocument?.title || 'Document'}`}
      subtitle="Document-grounded plain English answers with page and section citations"
      maxWidth="max-w-3xl"
    >
      <div className="flex flex-col h-[65vh] max-h-[600px] justify-between">
        {/* Contextual disclaimer per PRD §26 */}
        <DisclaimerBanner type="qa" className="mb-space-sm" />

        {/* Chat message stream */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 py-2">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  isUser ? 'self-end flex-row-reverse' : 'self-start'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-primary text-on-primary'
                      : 'bg-secondary-container text-on-secondary-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isUser ? 'person' : 'balance'}
                  </span>
                </div>

                <div
                  className={`p-space-sm md:p-3 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-primary-container text-on-primary rounded-tr-xs'
                      : 'bg-surface-container-low text-on-surface rounded-tl-xs border border-outline-variant/30'
                  }`}
                >
                  <p>{msg.content}</p>

                  {/* Grounded Source References per PRD §12 */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-outline-variant/30 flex flex-col gap-1.5">
                      <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
                        Source Reference
                      </span>
                      {msg.sources.map((src, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center justify-between gap-2 p-1.5 rounded bg-surface-container-lowest border border-outline-variant/30 text-xs"
                        >
                          <span className="text-primary font-medium truncate">
                            {src.citation}
                          </span>
                          <button
                            onClick={() => setActiveSourceModal(src)}
                            className="text-secondary hover:text-primary font-semibold text-[11px] shrink-0 underline cursor-pointer"
                          >
                            [View section]
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isAnswering && (
            <div className="self-start flex gap-2.5 max-w-[85%]">
              <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs">
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  progress_activity
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/30 flex items-center gap-2">
                <span className="animate-pulse">Finding relevant document clauses...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions Chips per PRD §13 */}
        <div className="pt-2 border-t border-outline-variant/30 flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-on-surface-variant">
            Suggested questions:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={isAnswering}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-surface-container hover:bg-secondary-container text-xs text-primary font-medium transition-colors cursor-pointer border border-outline-variant/30 shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mt-2 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask a question about this agreement..."
            disabled={isAnswering}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-container text-sm text-on-surface placeholder:text-on-surface-variant/60 border border-outline-variant/50 focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isAnswering}
            className="px-4 py-2.5 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:bg-primary transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span>Ask</span>
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </form>
      </div>

      {/* Source detail modal if user clicks [View section] */}
      {activeSourceModal && (
        <Modal
          isOpen={Boolean(activeSourceModal)}
          onClose={() => setActiveSourceModal(null)}
          title={activeSourceModal.title}
          subtitle={activeSourceModal.citation}
        >
          <div className="flex flex-col gap-3">
            <p className="text-sm font-mono p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 leading-relaxed text-on-surface">
              {(!activeSourceModal.excerpt || isPdfBytecode(activeSourceModal.excerpt))
                ? 'Section details and legal conditions verified from document structure.'
                : activeSourceModal.excerpt}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setActiveSourceModal(null)}
                className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-sm cursor-pointer"
              >
                Close Excerpt
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
