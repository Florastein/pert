import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useBots } from './hooks/useBots';
import { useTheme } from './hooks/useTheme';
import type { Theme } from './hooks/useTheme';
import { View } from './types';
import type { BotConfig } from './types';
import Builder from './components/Builder';
import Preview from './components/Preview';
import ChatWindow from './components/ChatWindow';
import { BotSelector } from './components/BotSelector';
import { Auth } from './components/Auth';
import { LandingPage } from './components/LandingPage';
import { CodeBracketIcon, ChatBubbleLeftRightIcon, MoonIcon, SunIcon, ArrowLeftIcon, ArrowRightOnRectangleIcon } from './components/icons';

const Header: React.FC<{
    botName: string;
    onGoBack: () => void;
    onLogout: () => void;
    currentView: View;
    setView: (view: View) => void;
    themeColor: string;
    theme: Theme;
    toggleTheme: () => void;
}> = ({ botName, onGoBack, onLogout, currentView, setView, themeColor, theme, toggleTheme }) => {
    const commonClasses = "px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2";
    const activeClasses = "text-white";
    const inactiveClasses = theme === 'light' 
        ? "bg-transparent text-gray-600 hover:bg-orange-50 hover:text-gray-900" 
        : "bg-transparent text-gray-400 hover:bg-gray-700 hover:text-gray-100";

    return (
        <header className={`${theme === 'light' ? 'bg-white/90 border-orange-100' : 'bg-gray-800/90 border-gray-600'} backdrop-blur-sm sticky top-0 z-10 border-b shadow-sm`}>
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onGoBack} 
                            className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                                theme === 'light' 
                                    ? 'text-gray-500 hover:bg-orange-50' 
                                    : 'text-gray-400 hover:bg-gray-700'
                            }`}
                            aria-label="Back to bot selection"
                        >
                           <ArrowLeftIcon className="w-5 h-5"/>
                        </button>
                        <h1 className={`text-lg sm:text-xl font-bold truncate ${
                            theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                        }`}>
                           <span className={`font-normal ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} hidden sm:inline`}>
                               Editing:
                           </span> {botName}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`${theme === 'light' ? 'bg-orange-100/70' : 'bg-gray-700/70'} p-1 rounded-lg flex items-center`}>
                            <button
                                onClick={() => setView(View.BUILDER)}
                                className={`${commonClasses} ${currentView === View.BUILDER ? activeClasses : inactiveClasses}`}
                                style={currentView === View.BUILDER ? {backgroundColor: themeColor} : {}}
                            >
                                <ChatBubbleLeftRightIcon className="w-5 h-5"/>
                                <span className="hidden sm:inline">Builder</span>
                            </button>
                            <button
                                onClick={() => setView(View.PREVIEW)}
                                className={`${commonClasses} ${currentView === View.PREVIEW ? activeClasses : inactiveClasses}`}
                                style={currentView === View.PREVIEW ? {backgroundColor: themeColor} : {}}
                            >
                                <CodeBracketIcon className="w-5 h-5"/>
                                <span className="hidden sm:inline">Preview & Embed</span>
                            </button>
                        </div>
                         <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                                theme === 'light' 
                                    ? 'text-gray-500 hover:bg-orange-50' 
                                    : 'text-gray-400 hover:bg-gray-700'
                            }`}
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                        </button>
                         <button
                            onClick={onLogout}
                            className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                                theme === 'light' 
                                    ? 'text-gray-500 hover:bg-orange-50' 
                                    : 'text-gray-400 hover:bg-gray-700'
                            }`}
                            aria-label="Logout"
                        >
                           <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
};

const App: React.FC = () => {
    const [deployedConfig, setDeployedConfig] = useState<BotConfig | null>(null);
    const { user, loading, logOut } = useAuth();
    const { bots, activeBot, selectBot, createBot, updateBot, deleteBot } = useBots(user?.uid ?? null);
    const [view, setView] = useState<View>(View.BUILDER);
    const { theme, toggleTheme } = useTheme();
    const [authView, setAuthView] = useState<'landing' | 'login'>('landing');
    
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                try {
                    const decodedConfig = JSON.parse(atob(hash));
                    if (decodedConfig.id && decodedConfig.name && decodedConfig.intents) {
                        setDeployedConfig(decodedConfig);
                    } else {
                        setDeployedConfig(null);
                    }
                } catch (e) {
                    console.error("Failed to parse bot config from URL hash", e);
                    setDeployedConfig(null);
                }
            } else {
                setDeployedConfig(null);
            }
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    if (deployedConfig) {
        return <ChatWindow config={deployedConfig} isDeployed={true} />;
    }
    
    if (loading) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${
                theme === 'light' ? 'bg-orange-50' : 'bg-gray-800'
            }`}>
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    let mainContent;

    if (!user) {
        if (authView === 'login') {
             mainContent = (
                <Auth
                    theme={theme}
                    toggleTheme={toggleTheme}
                    onBack={() => setAuthView('landing')}
                />
            );
        } else {
            mainContent = (
                <LandingPage
                    onGetStarted={() => setAuthView('login')}
                    theme={theme}
                    toggleTheme={toggleTheme}
                />
            );
        }
    } else if (!activeBot) {
         mainContent = (
            <BotSelector
                bots={bots}
                userName={user.displayName || user.email}
                onSelectBot={selectBot}
                onCreateBot={createBot}
                onDeleteBot={deleteBot}
                onLogout={logOut}
                theme={theme}
                toggleTheme={toggleTheme}
            />
        );
    } else {
        mainContent = (
             <>
                <Header
                    botName={activeBot.name}
                    onGoBack={() => selectBot(null)}
                    onLogout={logOut}
                    currentView={view}
                    setView={setView}
                    themeColor={activeBot.themeColor}
                    theme={theme}
                    toggleTheme={toggleTheme}
                />
                <main className={theme === 'light' ? 'bg-orange-50' : 'bg-gray-800'}>
                    {view === View.BUILDER && <Builder config={activeBot} setConfig={updateBot} />}
                    {view === View.PREVIEW && <Preview config={activeBot} />}
                </main>
            </>
        )
    }

    return (
        <div className={`min-h-screen transition-colors duration-200 ${
            theme === 'light' 
                ? 'bg-orange-50 text-gray-900' 
                : 'bg-gray-800 text-gray-100'
        }`}>
            {mainContent}
        </div>
    );
};

export default App;