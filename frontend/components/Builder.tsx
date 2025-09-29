import React, { useState, useRef, useCallback, useMemo } from 'react';
import type { BotConfig, Intent } from '../types';
import { PlusIcon, TrashIcon, UploadIcon, SparklesIcon } from './icons';
import { generateIntentsFromText } from '../services/geminiService';
import { useTheme } from '../hooks/useTheme';

// --- NEW DEPENDENCIES & SETUP ---
// You need to install these: npm install pdfjs-dist mammoth papaparse
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import Papa from 'papaparse';

// Required setup for pdf.js to work in a web environment
// Use a specific, known-good version from the CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js`;
// --- END OF NEW DEPENDENCIES ---


interface BuilderProps {
    config: BotConfig;
    setConfig: React.Dispatch<React.SetStateAction<BotConfig>>;
}

// Theme-aware styling utilities (no changes here)
const useThemeClasses = () => {
    const { theme } = useTheme();

    return useMemo(() => ({
        container: theme === 'light'
            ? 'bg-white border-orange-100'
            : 'bg-gray-700 border-gray-600',
        surface: theme === 'light'
            ? 'bg-orange-50 border-orange-200'
            : 'bg-gray-600 border-gray-500',
        text: {
            primary: theme === 'light' ? 'text-gray-900' : 'text-gray-100',
            secondary: theme === 'light' ? 'text-gray-700' : 'text-gray-300',
            muted: theme === 'light' ? 'text-gray-600' : 'text-gray-400'
        },
        input: `w-full ${
            theme === 'light'
                ? 'bg-white border-gray-200 text-gray-900'
                : 'bg-gray-700 border-gray-600 text-gray-100'
        } border rounded-lg px-3 py-2 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors`,
        button: {
            primary: 'px-4 py-2 rounded-lg font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
            secondary: `px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                theme === 'light'
                    ? 'text-gray-700 bg-orange-100 hover:bg-orange-200'
                    : 'text-gray-300 bg-gray-600 hover:bg-gray-500'
            }`,
            danger: 'p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-gray-500 hover:text-red-500'
        }
    }), [theme]);
};

const BotSettings: React.FC<BuilderProps> = ({ config, setConfig }) => {
    // No changes to this component
    const classes = useThemeClasses();

    const handleChange = useCallback((key: keyof BotConfig, value: string) => {
        setConfig(c => ({ ...c, [key]: value }));
    }, [setConfig]);

    return (
        <div className={`${classes.container} p-6 rounded-xl shadow-sm border`}>
            <h2 className={`${classes.text.primary} text-xl font-bold mb-6`}>
                Bot Settings
            </h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="botName" className={`block text-sm font-medium mb-1 ${classes.text.secondary}`}>
                        Bot Name
                    </label>
                    <input
                        type="text"
                        id="botName"
                        value={config.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={classes.input}
                        placeholder="Enter your bot's name"
                    />
                </div>
                <div>
                    <label htmlFor="defaultResponse" className={`block text-sm font-medium mb-1 ${classes.text.secondary}`}>
                        Default Response
                    </label>
                    <textarea
                        id="defaultResponse"
                        rows={3}
                        value={config.defaultResponse}
                        onChange={(e) => handleChange('defaultResponse', e.target.value)}
                        className={classes.input}
                        placeholder="e.g., Sorry, I don't understand."
                    />
                </div>
                <div>
                    <label htmlFor="themeColor" className={`block text-sm font-medium mb-1 ${classes.text.secondary}`}>
                        Theme Color
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            id="themeColor"
                            value={config.themeColor}
                            onChange={(e) => handleChange('themeColor', e.target.value)}
                            className={`p-1 h-10 w-14 block ${
                                classes.input.split(' ')[0] // Get background and border classes
                            } cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none`}
                        />
                        <input
                            type="text"
                            value={config.themeColor}
                            onChange={(e) => handleChange('themeColor', e.target.value)}
                            className={classes.input}
                            placeholder="#F97316"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MODIFIED COMPONENT: DataImporter ---
const DataImporter: React.FC<{ setConfig: BuilderProps['setConfig'] }> = ({ setConfig }) => {
    const classes = useThemeClasses();
    const [textSource, setTextSource] = useState('');
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedIntents, setGeneratedIntents] = useState<Intent[]>([]);
    const [selectedIntents, setSelectedIntents] = useState<Record<string, boolean>>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError(null);
        setFileName(file.name);
        setIsLoading(true);
        setGeneratedIntents([]); // Clear previous results

        const resetInput = () => {
            if (fileInputRef.current) fileInputRef.current.value = "";
        };

        const handleJsonFile = (text: string) => {
            try {
                const data = JSON.parse(text);
                if (Array.isArray(data)) {
                    const validatedIntents = data
                        .filter(d => d.name && d.response)
                        .map((d, i) => ({
                            id: `imported-json-${Date.now()}-${i}`,
                            name: d.name,
                            trainingPhrases: d.trainingPhrases || [],
                            response: d.response,
                        }));
                    setGeneratedIntents(validatedIntents);
                    setSelectedIntents(validatedIntents.reduce((acc, intent) => ({ ...acc, [intent.id]: true }), {}));
                } else {
                    throw new Error("JSON file must contain an array of intents.");
                }
            } catch (err) {
                setError("Failed to parse JSON. Please ensure it's a valid JSON array. Expected format: [{name, trainingPhrases?, response}]");
                setFileName('');
            } finally {
                setIsLoading(false);
                resetInput();
            }
        };

        const handlePdfFile = (arrayBuffer: ArrayBuffer) => {
            pdfjsLib.getDocument(arrayBuffer).promise.then(async (pdf) => {
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += (textContent.items as any[]).map(item => item.str).join(' ') + '\n';
                }
                setTextSource(fullText);
            }).catch(() => {
                setError("Failed to parse PDF file. It may be corrupted or protected.");
                setFileName('');
            }).finally(() => {
                setIsLoading(false);
                resetInput();
            });
        };

        const handleDocxFile = (arrayBuffer: ArrayBuffer) => {
            mammoth.extractRawText({ arrayBuffer }).then(result => {
                setTextSource(result.value);
            }).catch(() => {
                setError("Failed to parse DOCX file. Only .docx format is supported, not legacy .doc.");
                setFileName('');
            }).finally(() => {
                setIsLoading(false);
                resetInput();
            });
        };

        const handleCsvFile = (text: string) => {
            Papa.parse(text, {
                complete: (results) => {
                    if (results.errors.length) {
                        setError(`CSV parsing error: ${results.errors[0].message}`);
                        setFileName('');
                        return;
                    }
                    const intentsMap = new Map<string, Intent>();
                    (results.data as string[][]).forEach((row, i) => {
                        if (row.length < 2 || !row[0]?.trim() || !row[row.length - 1]?.trim()) return;

                        let name: string, phrase: string, response: string;
                        if (row.length >= 3) {
                            [name, phrase, response] = [row[0].trim(), row[1].trim(), row[2].trim()];
                        } else {
                            [phrase, response] = [row[0].trim(), row[1].trim()];
                            name = phrase;
                        }

                        if (intentsMap.has(name)) {
                            const existingIntent = intentsMap.get(name)!;
                            if (!existingIntent.trainingPhrases.includes(phrase)) {
                                existingIntent.trainingPhrases.push(phrase);
                            }
                        } else {
                            intentsMap.set(name, {
                                id: `imported-csv-${Date.now()}-${i}`,
                                name,
                                trainingPhrases: [phrase],
                                response,
                            });
                        }
                    });

                    const validatedIntents = Array.from(intentsMap.values());
                    if (validatedIntents.length === 0) {
                        setError("No valid intents found in CSV. Expected format: [intent_name, training_phrase, response] or [training_phrase, response].");
                        setFileName('');
                        return;
                    }
                    setGeneratedIntents(validatedIntents);
                    setSelectedIntents(validatedIntents.reduce((acc, intent) => ({ ...acc, [intent.id]: true }), {}));
                    setTextSource('');
                },
                error: (err: any) => {
                    setError(`Failed to parse CSV: ${err.message}`);
                    setFileName('');
                },
                skipEmptyLines: true,
            });
            setIsLoading(false);
            resetInput();
        };

        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const reader = new FileReader();

        switch (fileExtension) {
            case 'json':
                reader.onload = (e) => handleJsonFile(e.target?.result as string);
                reader.readAsText(file);
                break;
            case 'txt':
                reader.onload = (e) => {
                    setTextSource(e.target?.result as string);
                    setIsLoading(false);
                    resetInput();
                };
                reader.readAsText(file);
                break;
            case 'pdf':
                reader.onload = (e) => handlePdfFile(e.target?.result as ArrayBuffer);
                reader.readAsArrayBuffer(file);
                break;
            case 'docx':
                reader.onload = (e) => handleDocxFile(e.target?.result as ArrayBuffer);
                reader.readAsArrayBuffer(file);
                break;
            case 'csv':
                reader.onload = (e) => handleCsvFile(e.target?.result as string);
                reader.readAsText(file);
                break;
            default:
                setError("Unsupported file type. Please upload a .txt, .json, .pdf, .docx, or .csv file.");
                setFileName('');
                setIsLoading(false);
                resetInput();
                break;
        }
    }, [setConfig]);

    const handleGenerate = useCallback(async () => {
        if (!textSource.trim()) {
            setError("Please paste text or upload a file to generate intents.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const results = await generateIntentsFromText(textSource);
            const newIntents = results.map((intent, i) => ({
                ...intent,
                id: `generated-${Date.now()}-${i}`,
            }));
            setGeneratedIntents(newIntents);
            setSelectedIntents(newIntents.reduce((acc, intent) => ({ ...acc, [intent.id]: true }), {}));
        } catch (err: any) {
            setError(err.message || "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [textSource]);

    const handleAddSelectedIntents = useCallback(() => {
        const intentsToAdd = generatedIntents.filter(intent => selectedIntents[intent.id]);
        setConfig(c => ({
            ...c,
            intents: [...c.intents, ...intentsToAdd]
        }));
        setGeneratedIntents([]);
        setSelectedIntents({});
        setTextSource('');
        setFileName('');
        setError(null);
    }, [generatedIntents, selectedIntents, setConfig]);

    const selectedCount = useMemo(() =>
        Object.values(selectedIntents).filter(v => v).length,
        [selectedIntents]
    );

    const handleTextSourceChange = useCallback((value: string) => {
        setTextSource(value);
        if (fileName) setFileName('');
        if (error) setError(null);
    }, [fileName, error]);

    return (
        <div className={`${classes.container} p-6 rounded-xl shadow-sm border mb-8`}>
            <h2 className={`${classes.text.primary} text-xl font-bold mb-2`}>
                Import & Generate Intents
            </h2>
            <p className={`${classes.text.muted} mb-6 text-sm`}>
                Automatically create intents by uploading a file (.txt, .json, .pdf, .docx, .csv) or pasting content.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="block w-full">
                        <span className={`text-sm font-medium mb-1 block ${classes.text.secondary}`}>
                            Input Content
                        </span>
                        <textarea
                            value={textSource}
                            onChange={(e) => handleTextSourceChange(e.target.value)}
                            className={`${classes.input} h-40 resize-none`}
                            placeholder="Paste your content here or upload a file..."
                        />
                    </label>
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={classes.button.secondary}
                        >
                            <UploadIcon className="w-5 h-5" />
                            <span className="truncate max-w-[100px]">{fileName || 'Upload File'}</span>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".txt,.json,.pdf,.docx,.csv"
                            className="hidden"
                        />

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !textSource.trim()}
                            className={classes.button.primary}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <SparklesIcon className="w-5 h-5" />
                            )}
                            <span>Generate</span>
                        </button>
                    </div>
                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                            {error}
                        </p>
                    )}
                </div>

                <div className={`${classes.surface} border p-4 rounded-lg h-60 overflow-y-auto`}>
                    <h3 className={`${classes.text.primary} text-lg font-semibold mb-2`}>
                        Generated Intents Preview
                    </h3>
                    {isLoading && (
                        <div className={`${classes.text.muted} text-sm h-full flex items-center justify-center`}>
                            Processing file, please wait...
                        </div>
                    )}
                    {!isLoading && generatedIntents.length === 0 && (
                        <div className={`${classes.text.muted} text-sm h-full flex items-center justify-center`}>
                            Your generated or imported intents will appear here for review.
                        </div>
                    )}
                    {!isLoading && generatedIntents.length > 0 && (
                        <div className="space-y-3">
                            {generatedIntents.map(intent => (
                                <div key={intent.id} className="text-sm">
                                    <label className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors ${
                                        classes.text.secondary
                                    } hover:${classes.surface.split(' ')[0]}`}>
                                        <input
                                            type="checkbox"
                                            checked={!!selectedIntents[intent.id]}
                                            onChange={(e) => setSelectedIntents(s => ({
                                                ...s,
                                                [intent.id]: e.target.checked
                                            }))}
                                            className={`h-4 w-4 rounded ${
                                                classes.input.split(' ')[0]
                                            } border text-orange-500 focus:ring-orange-500 shrink-0`}
                                        />
                                        <span className="font-semibold truncate">{intent.name}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {generatedIntents.length > 0 && (
                <div className="mt-6 flex justify-end items-center gap-2">
                    <button
                        onClick={() => {
                            setGeneratedIntents([]);
                            setFileName('');
                            setError(null);
                        }}
                        className={classes.button.secondary}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddSelectedIntents}
                        disabled={selectedCount === 0}
                        className="px-6 py-2 rounded-lg font-medium text-white bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Add {selectedCount} Selected Intent{selectedCount !== 1 ? 's' : ''}
                    </button>
                </div>
            )}
        </div>
    );
};


const IntentEditor: React.FC<BuilderProps> = ({ config, setConfig }) => {
    // No changes to this component
    const classes = useThemeClasses();
    const [newIntentName, setNewIntentName] = useState('');

    const handleAddIntent = useCallback(() => {
        if (!newIntentName.trim()) return;
        const newIntent: Intent = {
            id: `intent-${Date.now()}`,
            name: newIntentName.trim(),
            trainingPhrases: [],
            response: ''
        };
        setConfig(c => ({ ...c, intents: [...c.intents, newIntent] }));
        setNewIntentName('');
    }, [newIntentName, setConfig]);

    const handleDeleteIntent = useCallback((intentId: string) => {
        setConfig(c => ({ ...c, intents: c.intents.filter(i => i.id !== intentId) }));
    }, [setConfig]);

    const handleIntentChange = useCallback((updatedIntent: Intent) => {
        setConfig(c => ({
            ...c,
            intents: c.intents.map(i => i.id === updatedIntent.id ? updatedIntent : i)
        }));
    }, [setConfig]);

    const handleTrainingPhraseChange = useCallback((intentId: string, index: number, value: string) => {
        const intent = config.intents.find(i => i.id === intentId);
        if (!intent) return;
        const newPhrases = [...intent.trainingPhrases];
        newPhrases[index] = value;
        handleIntentChange({ ...intent, trainingPhrases: newPhrases });
    }, [config.intents, handleIntentChange]);

    const addTrainingPhrase = useCallback((intentId: string) => {
        const intent = config.intents.find(i => i.id === intentId);
        if (!intent) return;
        handleIntentChange({ ...intent, trainingPhrases: [...intent.trainingPhrases, ''] });
    }, [config.intents, handleIntentChange]);

    const deleteTrainingPhrase = useCallback((intentId: string, index: number) => {
        const intent = config.intents.find(i => i.id === intentId);
        if (!intent) return;
        const newPhrases = intent.trainingPhrases.filter((_, i) => i !== index);
        handleIntentChange({ ...intent, trainingPhrases: newPhrases });
    }, [config.intents, handleIntentChange]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddIntent();
        }
    }, [handleAddIntent]);

    return (
        <div className={`${classes.container} p-6 rounded-xl shadow-sm border`}>
            <h2 className={`${classes.text.primary} text-xl font-bold mb-6`}>
                Intents ({config.intents.length})
            </h2>

            <div className="space-y-4">
                {config.intents.map(intent => (
                    <IntentItem
                        key={intent.id}
                        intent={intent}
                        onIntentChange={handleIntentChange}
                        onDeleteIntent={handleDeleteIntent}
                        onTrainingPhraseChange={handleTrainingPhraseChange}
                        onAddTrainingPhrase={addTrainingPhrase}
                        onDeleteTrainingPhrase={deleteTrainingPhrase}
                        classes={classes}
                    />
                ))}
            </div>

            <div className="mt-6 flex gap-2">
                <input
                    type="text"
                    value={newIntentName}
                    onChange={(e) => setNewIntentName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={classes.input}
                    placeholder="New intent name (e.g., 'Check Status')"
                />
                <button
                    onClick={handleAddIntent}
                    disabled={!newIntentName.trim()}
                    style={{ backgroundColor: config.themeColor }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add Intent
                </button>
            </div>
        </div>
    );
};

const IntentItem: React.FC<{
    intent: Intent;
    onIntentChange: (intent: Intent) => void;
    onDeleteIntent: (id: string) => void;
    onTrainingPhraseChange: (intentId: string, index: number, value: string) => void;
    onAddTrainingPhrase: (intentId: string) => void;
    onDeleteTrainingPhrase: (intentId: string, index: number) => void;
    classes: ReturnType<typeof useThemeClasses>;
}> = ({
    intent,
    onIntentChange,
    onDeleteIntent,
    onTrainingPhraseChange,
    onAddTrainingPhrase,
    onDeleteTrainingPhrase,
    classes
}) => {
    // No changes to this component
    const handleNameChange = useCallback((name: string) => {
        onIntentChange({ ...intent, name });
    }, [intent, onIntentChange]);

    const handleResponseChange = useCallback((response: string) => {
        onIntentChange({ ...intent, response });
    }, [intent, onIntentChange]);

    return (
        <div className={`${classes.surface} border p-4 rounded-lg`}>
            <div className="flex justify-between items-center mb-3">
                <input
                    type="text"
                    value={intent.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={`text-lg font-semibold bg-transparent focus:${
                        classes.surface.split(' ')[0]
                    } rounded-lg px-3 py-2 -ml-2 ${
                        classes.text.primary
                    } focus:outline-none focus:ring-2 focus:ring-orange-500`}
                    placeholder="Intent Name"
                />
                <button
                    onClick={() => onDeleteIntent(intent.id)}
                    className={`${classes.button.danger} ${
                        classes.text.secondary.split(' ')[0]
                    } hover:${classes.surface.split(' ')[0]}`}
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-2">
                <div>
                    <h4 className={`text-sm font-medium mb-2 ${classes.text.secondary}`}>
                        Training Phrases (User says) • {intent.trainingPhrases.length}
                    </h4>
                    <div className="space-y-2">
                        {intent.trainingPhrases.map((phrase, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={phrase}
                                    onChange={(e) => onTrainingPhraseChange(intent.id, index, e.target.value)}
                                    className={classes.input}
                                    placeholder="e.g., Hello"
                                />
                                <button
                                    onClick={() => onDeleteTrainingPhrase(intent.id, index)}
                                    className={`${classes.button.danger} ${
                                        classes.text.secondary.split(' ')[0]
                                    } hover:${classes.surface.split(' ')[0]}`}
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {intent.trainingPhrases.length === 0 && (
                            <p className={`text-xs px-1 ${classes.text.muted}`}>
                                Add phrases users might say to trigger this intent.
                            </p>
                        )}
                        <button
                            onClick={() => onAddTrainingPhrase(intent.id)}
                            className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm flex items-center gap-1 mt-1 transition-colors"
                        >
                            <PlusIcon className="w-4 h-4" /> Add Phrase
                        </button>
                    </div>
                </div>
                <div>
                    <label className={`text-sm font-medium mb-2 block ${classes.text.secondary}`}>
                        Bot Response
                    </label>
                    <textarea
                        value={intent.response}
                        onChange={(e) => handleResponseChange(e.target.value)}
                        className={classes.input}
                        rows={2}
                        placeholder="e.g., Hello, how can I help?"
                    />
                </div>
            </div>
        </div>
    );
};

const Builder: React.FC<BuilderProps> = ({ config, setConfig }) => {
    // No changes to this component
    const { theme } = useTheme();

    return (
        <div className={`max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 sm:p-6 lg:p-8 ${
            theme === 'light' ? 'bg-orange-50' : 'bg-gray-800'
        } min-h-screen`}>
            <div className="lg:col-span-1">
                <BotSettings config={config} setConfig={setConfig} />
            </div>
            <div className="lg:col-span-2 space-y-8">
                <DataImporter setConfig={setConfig} />
                <IntentEditor config={config} setConfig={setConfig} />
            </div>
        </div>
    );
};

export default Builder;