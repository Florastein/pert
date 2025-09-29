import { useState, useEffect } from "react";

interface RagDoc {
  id: string;
  text: string;
}

export function useRag(userId?: string, botId?: string) {
  const storageKey = `rag-docs-${userId || "guest"}-${botId || "default"}`;
  const [docs, setDocs] = useState<RagDoc[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setDocs(JSON.parse(stored));
      } catch {
        setDocs([]);
      }
    }
  }, [storageKey]);

  // Save to localStorage whenever docs change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(docs));
  }, [docs, storageKey]);

  const addDoc = (text: string) => {
    if (!text.trim()) return;
    setDocs(prev => [...prev, { id: `doc-${Date.now()}`, text }]);
  };

  const removeDoc = (id: string) => {
    setDocs(prev => prev.filter(doc => doc.id !== id));
  };

  const clearDocs = () => {
    setDocs([]);
  };

  // Fake "search" → in real RAG you’d use embeddings + vector DB
  const search = (query: string, topK: number = 3) => {
    const q = query.toLowerCase();
    const scored = docs.map(doc => ({
      doc,
      score: doc.text.toLowerCase().includes(q) ? 1 : 0
    }));
    return scored
      .filter(s => s.score > 0)
      .slice(0, topK);
  };

  return { docs, addDoc, removeDoc, clearDocs, search };
}
