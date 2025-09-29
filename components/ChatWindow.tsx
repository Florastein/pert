import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BotConfig, ChatMessage } from '../types';
import { getBotResponse } from '../services/geminiService';
import { useAuth } from '../hooks/useAuth';
import { useRag } from '../hooks/useRag';
import { SendIcon, PlusIcon, TrashIcon, BookOpenIcon } from './icons';
import { useTheme } from '../hooks/useTheme';

interface ChatWindowProps {
    config: BotConfig;
    isDeployed?: boolean;
}

const KnowledgeBasePanel: React.FC<{
    docs: string[];
    onAddDoc: (doc: string) => void;
    onClearDocs: () => void;
    onRemoveDoc: (index: number) => void;
    isOpen: boolean;
    theme: 'light' | 'dark';
}> = ({ docs, onAddDoc, onClearDocs, onRemoveDoc, isOpen, theme }) => {
    const [newDoc, setNewDoc] = useState('');

    const handleAddDoc = () => {
        if (newDoc.trim()) {
            onAddDoc(newDoc.trim());
            setNewDoc('');
        }
    };

    const inputClasses = `w-full ${
        theme === 'light' 
            ? 'bg-white border-gray-200 text-gray-900' 
            : 'bg-gray-700 border-gray-600 text-gray-100'
    } border rounded-lg px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors`;

    const buttonClasses = `px-3 py-1.5 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
        theme === 'light'
            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
    }`;

    if (!isOpen) return null;

    return (
        <div className={`mt-3 p-4 rounded-lg border ${
            theme === 'light' 
                ? 'bg-orange-50 border-orange-200' 
                : 'bg-gray-700 border-gray-600'
        }`}>
            <div className="space-y-3">
                <div>
                    <label className={`block text-sm font-medium mb-2 ${
                        theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                        Add Document
                    </label>
                    <textarea 
                        value={newDoc} 
                        onChange={e => setNewDoc(e.target.value)}
                        placeholder="Paste a note, document snippet, or FAQ here..."
                        className={`${inputClasses} resize-none`}
                        rows={3}
                        onKeyPress={(e) => e.key === 'Enter' && e.ctrlKey && handleAddDoc()}
                    />
                    <p className={`text-xs mt-1 ${
                        theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                        Press Ctrl+Enter to add
                    </p>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={handleAddDoc}
                        disabled={!newDoc.trim()}
                        className={`${buttonClasses} ${
                            !newDoc.trim() ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <PlusIcon className="w-4 h-4 inline mr-1" />
                        Add Document
                    </button>
                    <button 
                        onClick={onClearDocs}
                        disabled={docs.length === 0}
                        className={`${buttonClasses} ${
                            docs.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <TrashIcon className="w-4 h-4 inline mr-1" />
                        Clear All
                    </button>
                </div>

                {docs.length > 0 && (
                    <div>
                        <h4 className={`text-sm font-medium mb-2 ${
                            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                        }`}>
                            Documents ({docs.length})
                        </h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {docs.map((doc, index) => (
                                <div key={index} className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                                    theme === 'light' 
                                        ? 'bg-white border border-orange-100' 
                                        : 'bg-gray-600 border border-gray-500'
                                }`}>
                                    <span className={`flex-1 truncate ${
                                        theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                                    }`}>
                                        {doc.slice(0, 50)}{doc.length > 50 ? '...' : ''}
                                    </span>
                                    <button
                                        onClick={() => onRemoveDoc(index)}
                                        className={`ml-2 p-1 rounded ${
                                            theme === 'light'
                                                ? 'text-gray-400 hover:text-red-500 hover:bg-orange-100'
                                                : 'text-gray-400 hover:text-red-400 hover:bg-gray-500'
                                        } transition-colors`}
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <p className={`text-xs ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                    Documents are saved locally per user and bot.
                </p>
            </div>
        </div>
    );
};

const MessageBubble: React.FC<{
    message: ChatMessage;
    themeColor: string;
    theme: 'light' | 'dark';
}> = ({ message, themeColor, theme }) => {
    const isUser = message.sender === 'user';
    
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                    isUser 
                        ? 'text-white rounded-br-lg' 
                        : `${theme === 'light' ? 'bg-orange-50 text-gray-900' : 'bg-gray-700 text-gray-100'} rounded-bl-lg`
                } shadow-sm`}
                style={isUser ? { backgroundColor: themeColor } : {}}
            >
                <div className="whitespace-pre-wrap break-words">
                    {message.text}
                </div>
            </div>
        </div>
    );
};

const LoadingBubble: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => (
    <div className="flex justify-start">
        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
            theme === 'light' ? 'bg-orange-50' : 'bg-gray-700'
        } rounded-bl-lg shadow-sm`}>
            <div className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full animate-pulse ${
                    theme === 'light' ? 'bg-orange-400' : 'bg-orange-500'
                }`} style={{ animationDelay: '0s' }}></span>
                <span className={`w-2 h-2 rounded-full animate-pulse ${
                    theme === 'light' ? 'bg-orange-400' : 'bg-orange-500'
                }`} style={{ animationDelay: '0.2s' }}></span>
                <span className={`w-2 h-2 rounded-full animate-pulse ${
                    theme === 'light' ? 'bg-orange-400' : 'bg-orange-500'
                }`} style={{ animationDelay: '0.4s' }}></span>
            </div>
        </div>
    </div>
);

const ChatWindow: React.FC<ChatWindowProps> = ({ config, isDeployed = false }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showKB, setShowKB] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();
    const { docs, addDoc, removeDoc, clearDocs, search } = useRag(user?.uid, config?.id);
    const { theme } = useTheme();

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSendMessage = useCallback(async () => {
        if (!userInput.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            text: userInput,
            sender: 'user',
        };

        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsLoading(true);

        try {
            const top = search(userInput, 3);
            const context = top.map(t => t.doc.text).join('\n\n---\n\n');
            const botResponseText = await getBotResponse(userInput, config.intents, config.defaultResponse, context);
            
            const botMessage: ChatMessage = {
                id: `msg-${Date.now() + 1}`,
                text: botResponseText,
                sender: 'bot',
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error getting bot response:', error);
            const errorMessage: ChatMessage = {
                id: `msg-${Date.now() + 1}`,
                text: 'Sorry, I encountered an error. Please try again.',
                sender: 'bot',
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [userInput, isLoading, config.intents, config.defaultResponse, search]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [handleSendMessage]);

    const containerClasses = isDeployed
        ? "h-screen w-screen flex flex-col bg-white dark:bg-gray-900"
        : "h-[calc(100vh-150px)] max-h-[700px] w-full max-w-lg mx-auto flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-orange-100 dark:border-gray-700";

    const inputClasses = `flex-grow ${
        theme === 'light' 
            ? 'bg-white border-gray-200 text-gray-900' 
            : 'bg-gray-700 border-gray-600 text-gray-100'
    } border rounded-full px-4 py-3 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors`;

    return (
        <div className={containerClasses}>
            {/* Header */}
            <div 
                className="p-4 border-b border-white/20 shadow-sm"
                style={{ backgroundColor: config.themeColor }}
            >
                <h2 className="text-xl font-bold text-white text-center truncate">
                    {config.name}
                </h2>
            </div>

            {/* Knowledge Base Toggle */}
            <div className={`border-b px-4 py-3 ${
                theme === 'light' ? 'bg-orange-50' : 'bg-gray-800'
            }`}>
                <button 
                    onClick={() => setShowKB(s => !s)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        theme === 'light' 
                            ? 'text-orange-700 hover:text-orange-800' 
                            : 'text-orange-400 hover:text-orange-300'
                    }`}
                >
                    <BookOpenIcon className="w-4 h-4" />
                    Knowledge Base ({docs.length})
                    <span className={`transform transition-transform ${showKB ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </button>
                
                <KnowledgeBasePanel
                    docs={docs}
                    onAddDoc={addDoc}
                    onClearDocs={clearDocs}
                    onRemoveDoc={removeDoc}
                    isOpen={showKB}
                    theme={theme}
                />
            </div>

            {/* Messages Area */}
            <div className={`flex-1 p-4 space-y-4 overflow-y-auto ${
                theme === 'light' ? 'bg-orange-25' : 'bg-gray-900'
            }`}>
                {messages.length === 0 && (
                    <div className={`text-center py-8 ${
                        theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                        <p className="text-lg font-medium mb-2">Welcome to {config.name}!</p>
                        <p className="text-sm">Start a conversation by sending a message.</p>
                    </div>
                )}
                
                {messages.map(message => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        themeColor={config.themeColor}
                        theme={theme}
                    />
                ))}
                
                {isLoading && <LoadingBubble theme={theme} />}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t ${
                theme === 'light' 
                    ? 'bg-white border-orange-100' 
                    : 'bg-gray-800 border-gray-700'
            }`}>
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className={inputClasses}
                        disabled={isLoading}
                        autoFocus={!isDeployed}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !userInput.trim()}
                        className="p-3 rounded-full text-white disabled:opacity-50 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                        style={{ backgroundColor: config.themeColor }}
                    >
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;