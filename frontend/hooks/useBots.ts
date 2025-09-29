import { useState, useEffect, useMemo, useCallback } from 'react';
import type { BotConfig, Intent } from '../types';

const defaultIntents: Omit<Intent, 'id'>[] = [
  {
    name: 'Greeting',
    trainingPhrases: [
      'Hi', 'Hello', 'Hey there', 'Good morning', 'Good afternoon', 
      'Hey, how’s it going?', 'Hi assistant', 'Hello bot'
    ],
    response: 'Hi there! 👋 How can I assist you today?'
  },
  {
    name: 'Goodbye',
    trainingPhrases: [
      'Bye', 'Goodbye', 'See you later', 'Take care',
      'Talk to you soon', 'Catch you later', 'Thanks, bye'
    ],
    response: 'Goodbye! 👋 Have a great day.'
  },
  {
    name: 'Opening Hours',
    trainingPhrases: [
      'What are your hours?', 'When are you open?', 'Opening times',
      'What time do you close?', 'Are you open on weekends?', 
      'Tell me your business hours'
    ],
    response: 'We are open from 9 AM to 5 PM, Monday to Friday. 🕘'
  },
  {
    name: 'Knowledge Lookup',
    trainingPhrases: [
      'Can you find information about {topic}?',
      'Tell me about {topic}',
      'What does the document say about {topic}?',
      'Look up {topic}',
      'Do you have details on {topic}?'
    ],
    response: 'Sure, let me check the knowledge base for "{topic}" 🔍'
    // here you can pass "{topic}" as the query to your RAG pipeline
  },
  {
    name: 'Clarification',
    trainingPhrases: [
      "I don't understand", "Can you clarify?", "What do you mean?", 
      "Please explain", "That’s not clear"
    ],
    response: 'Of course! Could you rephrase or give me more details?'
  },
  {
    name: 'Fallback',
    trainingPhrases: [
      // This will catch when no intent matches
    ],
    response: "I'm not sure I understand 🤔. Would you like me to search the knowledge base for you?"
  }
];


const createNewBot = (name: string): BotConfig => ({
    id: `bot-${Date.now()}`,
    name: name,
    themeColor: '#c59d5f',
    defaultResponse: "I'm sorry, I'm not sure how to help with that. Could you try asking in a different way?",
    intents: defaultIntents.map((intent, i) => ({ ...intent, id: `intent-${Date.now()}-${i}` })),
});

const getBotsKey = (userId: string) => `botConfigs_${userId}`;
const getActiveBotIdKey = (userId: string) => `activeBotId_${userId}`;

const getInitialBots = (userId: string): BotConfig[] => {
    try {
        const item = window.localStorage.getItem(getBotsKey(userId));
        if (item) {
            const parsed = JSON.parse(item);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (error) {
        console.error(`Error reading bots for user ${userId} from localStorage`, error);
    }
    return [createNewBot('Abstract AI')];
};

const getInitialActiveBotId = (userId: string, bots: BotConfig[]): string | null => {
    try {
        const savedId = window.localStorage.getItem(getActiveBotIdKey(userId));
        if (savedId && bots.some(b => b.id === savedId)) {
            return savedId;
        }
    } catch (error) {
        console.error(`Error reading active bot ID for user ${userId} from localStorage`, error);
    }
    return null;
};


export const useBots = (userId: string | null) => {
    const [bots, setBots] = useState<BotConfig[]>([]);
    const [activeBotId, setActiveBotId] = useState<string | null>(null);

    useEffect(() => {
        if (userId) {
            const initialBots = getInitialBots(userId);
            setBots(initialBots);
            setActiveBotId(getInitialActiveBotId(userId, initialBots));
        } else {
            setBots([]);
            setActiveBotId(null);
        }
    }, [userId]);

    useEffect(() => {
        if (userId && bots.length > 0) {
            try {
                window.localStorage.setItem(getBotsKey(userId), JSON.stringify(bots));
            } catch (error) {
                console.error(`Error writing bots for user ${userId} to localStorage`, error);
            }
        } else if (userId) {
            // If the last bot for a user is deleted, we should remove the key
             try {
                window.localStorage.removeItem(getBotsKey(userId));
            } catch (error) {
                console.error(`Error removing bots for user ${userId} from localStorage`, error);
            }
        }
    }, [bots, userId]);

    useEffect(() => {
        if (userId) {
            try {
                if (activeBotId) {
                    window.localStorage.setItem(getActiveBotIdKey(userId), activeBotId);
                } else {
                    window.localStorage.removeItem(getActiveBotIdKey(userId));
                }
            } catch (error) {
                console.error(`Error handling active bot ID for user ${userId} in localStorage`, error);
            }
        }
    }, [activeBotId, userId]);

    const activeBot = useMemo(() => bots.find(b => b.id === activeBotId), [bots, activeBotId]);

    const selectBot = useCallback((id: string | null) => {
        setActiveBotId(id);
    }, []);

    const createBot = useCallback((name: string) => {
        if (!userId) return;
        const newBot = createNewBot(name);
        setBots(prev => [...prev, newBot]);
        setActiveBotId(newBot.id);
    }, [userId]);

    const updateBot = useCallback((updatedConfig: BotConfig) => {
         if (!userId) return;
        setBots(prev => prev.map(b => b.id === updatedConfig.id ? updatedConfig : b));
    }, [userId]);

    const deleteBot = useCallback((id: string) => {
        if (!userId) return;
        if (window.confirm("Are you sure you want to delete this chatbot? This action cannot be undone.")) {
            setBots(prev => prev.filter(b => b.id !== id));
            if (activeBotId === id) {
                setActiveBotId(null);
            }
        }
    }, [userId, activeBotId]);
    
    return { bots, activeBot, selectBot, createBot, updateBot, deleteBot };
};