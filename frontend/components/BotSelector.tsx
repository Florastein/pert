import React, { useState } from 'react';
import type { BotConfig } from '../types';
import type { Theme } from '../hooks/useTheme';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ChatBubbleLeftRightIcon, 
  MoonIcon, 
  SunIcon, 
  ArrowRightOnRectangleIcon, 
  UserIcon,
  SparklesIcon,
  InformationCircleIcon 
} from './icons';

interface BotSelectorProps {
    bots: BotConfig[];
    userName: string | null;
    onSelectBot: (id: string) => void;
    onCreateBot: (name: string) => void;
    onDeleteBot: (id: string) => void;
    onLogout: () => void;
    theme: Theme;
    toggleTheme: () => void;
}

const BotSelectorHeader: React.FC<{ 
    userName: string | null;
    onLogout: () => void;
    theme: Theme; 
    toggleTheme: () => void; 
}> = ({ userName, onLogout, theme, toggleTheme }) => {
    return (
        <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-10 border-b border-orange-100 shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <ChatBubbleLeftRightIcon className="w-6 h-6 text-orange-500" />
                            <h1 className="text-xl font-bold text-gray-900">Abstract</h1>
                        </div>
                        <div className="h-6 w-px bg-orange-200 mx-2 hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-gray-500" />
                            <span className="text-sm text-gray-600 hidden sm:inline">Welcome,</span>
                            <span className="font-medium text-gray-900 truncate max-w-xs sm:max-w-md">
                                {userName}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-gray-500 hover:bg-orange-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                            aria-label="Logout"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            <span className="hidden sm:inline text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
};

const BotCard: React.FC<{
    bot: BotConfig;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ bot, onSelect, onDelete }) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(bot.id);
        setShowDeleteConfirm(false);
    };

    const handleDeleteCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteConfirm(false);
    };

    return (
        <div 
            className="group bg-white rounded-xl shadow-sm border border-orange-100 hover:shadow-md hover:border-orange-200 transition-all duration-200 overflow-hidden cursor-pointer"
            onClick={() => onSelect(bot.id)}
        >
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 pr-3 line-clamp-2 flex-1">
                        {bot.name}
                    </h3>
                    <div 
                        className="w-4 h-4 rounded-full shrink-0 mt-1 border border-orange-200"
                        style={{ backgroundColor: bot.themeColor }}
                    />
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                        <SparklesIcon className="w-4 h-4 text-orange-400" />
                        {bot.intents.length} intent{bot.intents.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-400">
                        Created {new Date(bot.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                </div>

                {bot.description && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                        {bot.description}
                    </p>
                )}
            </div>
            
            <div className="bg-orange-50/50 border-t border-orange-100 p-3 flex justify-between items-center">
                {showDeleteConfirm ? (
                    <div className="flex items-center gap-2 w-full">
                        <span className="text-xs text-gray-600 font-medium flex-1">
                            Delete bot?
                        </span>
                        <button
                            onClick={handleDeleteConfirm}
                            className="px-2 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                        >
                            Yes
                        </button>
                        <button
                            onClick={handleDeleteCancel}
                            className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-white rounded transition-colors"
                        >
                            No
                        </button>
                    </div>
                ) : (
                    <>
                        <button
                            onClick={handleDeleteClick}
                            className="p-2 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors group-hover:opacity-100 opacity-0 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            aria-label={`Delete ${bot.name}`}
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onSelect(bot.id); }}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                        >
                            <PencilIcon className="w-4 h-4" />
                            <span>Edit</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export const BotSelector: React.FC<BotSelectorProps> = ({ 
    bots, 
    userName, 
    onSelectBot, 
    onCreateBot, 
    onDeleteBot, 
    onLogout, 
    theme, 
    toggleTheme 
}) => {
    const [newBotName, setNewBotName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newBotName.trim()) {
            setIsCreating(true);
            try {
                await onCreateBot(newBotName.trim());
                setNewBotName('');
            } finally {
                setIsCreating(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-orange-50">
            <BotSelectorHeader 
                theme={theme} 
                toggleTheme={toggleTheme} 
                userName={userName} 
                onLogout={onLogout} 
            />
            
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Create Bot Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <PlusIcon className="w-5 h-5 text-orange-500" />
                        <h2 className="text-xl font-bold text-gray-900">Create New Bot</h2>
                    </div>
                    
                    <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={newBotName}
                                onChange={(e) => setNewBotName(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm transition-colors"
                                placeholder="Give your bot a friendly name..."
                                maxLength={50}
                            />
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                <InformationCircleIcon className="w-4 h-4" />
                                <span>You can customize everything else after creation</span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={!newBotName.trim() || isCreating}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 min-w-[140px]"
                        >
                            {isCreating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <PlusIcon className="w-5 h-5" />
                                    <span>Create Bot</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Bots Grid Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">My Chatbots</h2>
                            <p className="text-gray-600 mt-1">
                                {bots.length} bot{bots.length !== 1 ? 's' : ''} created
                            </p>
                        </div>
                        {bots.length > 0 && (
                            <div className="text-sm text-gray-500 bg-orange-100 px-3 py-1 rounded-full">
                                Click any bot to start editing
                            </div>
                        )}
                    </div>

                    {bots.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {bots.map(bot => (
                                <BotCard
                                    key={bot.id}
                                    bot={bot}
                                    onSelect={onSelectBot}
                                    onDelete={onDeleteBot}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 px-6 bg-white/50 rounded-xl border-2 border-dashed border-orange-200">
                            <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto text-orange-300" />
                            <h3 className="mt-4 text-xl font-semibold text-gray-900">No chatbots yet</h3>
                            <p className="mt-2 text-gray-600 max-w-md mx-auto">
                                Create your first AI chatbot to get started. You'll be able to customize its personality, 
                                responses, and appearance.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};