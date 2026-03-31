/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Languages, 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Loader2, 
  Volume2, 
  History,
  Trash2,
  Sparkles,
  Moon,
  Sun,
  ChevronDown,
  X,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translateText, TranslationRequest, enhanceText } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SUPPORTED_LANGUAGES = [
  { code: 'bn', name: 'Bengali' },
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ur', name: 'Urdu' },
  { code: 'ar', name: 'Arabic' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
];

const TONES = [
  { id: 'neutral', label: 'Neutral' },
  { id: 'formal', label: 'Formal' },
  { id: 'casual', label: 'Casual' },
  { id: 'professional', label: 'Professional' },
];

interface HistoryItem {
  id: string;
  type: 'translate' | 'enhance';
  sourceText: string;
  resultText: string;
  targetLanguage?: string;
  timestamp: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'translate' | 'enhance'>('translate');
  const [inputText, setInputText] = useState('');
  const [resultText, setResultText] = useState('');
  const [improvements, setImprovements] = useState<string[]>([]);
  const [targetLanguage, setTargetLanguage] = useState('bn');
  const [tone, setTone] = useState<TranslationRequest['tone']>('neutral');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [detectedLang, setDetectedLang] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('truetext_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleAction = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      if (activeTab === 'translate') {
        const result = await translateText({
          text: inputText,
          targetLanguage: SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.name || targetLanguage,
          tone: tone,
        });
        setResultText(result.translatedText);
        setDetectedLang(result.detectedLanguage);
        addToHistory('translate', inputText, result.translatedText, targetLanguage);
      } else {
        const result = await enhanceText({
          text: inputText,
          tone: tone,
        });
        setResultText(result.refinedText);
        setImprovements(result.improvements);
        addToHistory('enhance', inputText, result.refinedText);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToHistory = (type: 'translate' | 'enhance', source: string, result: string, lang?: string) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      sourceText: source,
      resultText: result,
      targetLanguage: lang,
      timestamp: Date.now(),
    };

    const updatedHistory = [newItem, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('truetext_history', JSON.stringify(updatedHistory));
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('truetext_history');
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800",
      isDarkMode ? "bg-zinc-950 text-zinc-200" : "bg-zinc-50 text-zinc-900"
    )}>
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300 backdrop-blur-md",
        isDarkMode ? "bg-zinc-950/80 border-zinc-800" : "bg-white/80 border-zinc-200"
      )}>
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg",
              isDarkMode ? "bg-zinc-100 shadow-zinc-500/10" : "bg-zinc-900 shadow-zinc-900/20"
            )}>
              <Languages className={cn("w-6 h-6", isDarkMode ? "text-zinc-900" : "text-white")} />
            </div>
            <h1 className={cn(
              "text-2xl font-bold tracking-tight",
              isDarkMode ? "text-zinc-100" : "text-zinc-900"
            )}>
              TrueText
            </h1>
          </motion.div>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={toggleTheme}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-200",
                isDarkMode ? "bg-zinc-900 text-yellow-400 hover:bg-zinc-800" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "p-2.5 rounded-xl transition-all duration-200 relative",
                isDarkMode ? "bg-zinc-900 text-zinc-400 hover:bg-zinc-800" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
            >
              <History className="w-5 h-5" />
              {history.length > 0 && (
                <span className={cn(
                  "absolute top-2 right-2 w-2 h-2 rounded-full border-2",
                  isDarkMode ? "bg-zinc-100 border-zinc-950" : "bg-zinc-900 border-white"
                )}></span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-12">
          <div className={cn(
            "flex p-1 rounded-2xl border",
            isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
          )}>
            <button
              onClick={() => { setActiveTab('translate'); setInputText(''); setResultText(''); setImprovements([]); }}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                activeTab === 'translate' 
                  ? (isDarkMode ? "bg-zinc-100 text-zinc-900 shadow-lg shadow-zinc-500/10" : "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20")
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              <Languages className="w-4 h-4" />
              Translator
            </button>
            <button
              onClick={() => { setActiveTab('enhance'); setInputText(''); setResultText(''); setImprovements([]); }}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                activeTab === 'enhance' 
                  ? (isDarkMode ? "bg-zinc-100 text-zinc-900 shadow-lg shadow-zinc-500/10" : "bg-zinc-900 text-white shadow-lg shadow-zinc-900/20")
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              <Sparkles className="w-4 h-4" />
              Text Enhancer
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.h2 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"
          >
            {activeTab === 'translate' ? (
              <>Translate with <span className={isDarkMode ? "text-zinc-100" : "text-zinc-900"}>Precision</span></>
            ) : (
              <>Refine with <span className={isDarkMode ? "text-zinc-100" : "text-zinc-900"}>Elegance</span></>
            )}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto"
          >
            {activeTab === 'translate' 
              ? "Experience seamless multilingual communication powered by advanced AI." 
              : "Polish your writing for professional use. Improve tone, grammar, and clarity instantly."}
          </motion.p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className={cn(
            "flex items-center gap-1 p-1.5 rounded-2xl border w-full md:w-auto overflow-x-auto no-scrollbar",
            isDarkMode ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-200 shadow-sm"
          )}>
            {TONES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id as any)}
                className={cn(
                  "px-5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
                  tone === t.id 
                    ? (isDarkMode ? "bg-zinc-100 text-zinc-900 shadow-md shadow-zinc-500/10" : "bg-zinc-900 text-white shadow-md shadow-zinc-900/20")
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'translate' && (
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <button 
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className={cn(
                    "w-full md:w-48 flex items-center justify-between gap-2 px-5 py-3 rounded-2xl border text-sm font-semibold transition-all",
                    isDarkMode ? "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Languages className={cn("w-4 h-4", isDarkMode ? "text-zinc-400" : "text-zinc-500")} />
                    {SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.name}
                  </span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", isLangMenuOpen && "rotate-180")} />
                </button>
                
                <AnimatePresence>
                  {isLangMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={cn(
                        "absolute top-full right-0 mt-2 w-full md:w-56 rounded-2xl border shadow-xl z-50 overflow-hidden py-2",
                        isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                      )}
                    >
                      {SUPPORTED_LANGUAGES.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setTargetLanguage(lang.code);
                            setIsLangMenuOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-5 py-2.5 text-sm transition-colors",
                            targetLanguage === lang.code 
                              ? (isDarkMode ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-white")
                              : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          )}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Main Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
          {/* Input Box */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "group relative flex flex-col rounded-[2rem] border transition-all duration-300",
              isDarkMode 
                ? "bg-zinc-900/30 border-zinc-800 focus-within:border-zinc-500 focus-within:bg-zinc-900/50" 
                : "bg-white border-zinc-200 focus-within:border-zinc-400 shadow-xl shadow-zinc-200/50"
            )}
          >
            <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-200/10 dark:border-zinc-800/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  {activeTab === 'translate' 
                    ? (detectedLang ? `Detected: ${detectedLang}` : 'Source Text')
                    : 'Original Text'}
                </span>
              </div>
              {inputText && (
                <button 
                  onClick={() => setInputText('')}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              )}
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={activeTab === 'translate' ? "What would you like to translate?" : "Paste your text to refine..."}
              className="w-full h-80 p-8 bg-transparent resize-none focus:outline-none text-xl leading-relaxed placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
            />

            <div className="px-8 py-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <div className="text-xs text-zinc-400 font-medium">
                {inputText.length} characters
              </div>
            </div>
          </motion.div>

          {/* Decorative Icon (Middle) */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
            <motion.div
              animate={{ 
                opacity: isLoading ? 0.15 : 0.05,
                scale: isLoading ? 1.1 : 1
              }}
              className={isDarkMode ? "text-zinc-100" : "text-zinc-900"}
            >
              {activeTab === 'translate' ? <ArrowRightLeft className="w-24 h-24" /> : <Sparkles className="w-24 h-24" />}
            </motion.div>
          </div>

          {/* Output Box */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "relative flex flex-col rounded-[2rem] border transition-all duration-300",
              isDarkMode 
                ? "bg-zinc-900/30 border-zinc-800" 
                : "bg-white border-zinc-200 shadow-xl shadow-zinc-200/50"
            )}
          >
            <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-200/10 dark:border-zinc-800/50">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                {activeTab === 'translate' 
                  ? SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.name
                  : 'Refined Version'}
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => copyToClipboard(resultText)}
                  className={cn(
                    "p-2.5 rounded-xl transition-all",
                    isDarkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                  )}
                >
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className={cn("w-5 h-5", isDarkMode ? "text-zinc-400 hover:text-zinc-100" : "text-zinc-400 hover:text-zinc-900")} />}
                </button>
                <button className={cn(
                  "p-2.5 rounded-xl transition-all",
                  isDarkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                )}>
                  <Volume2 className={cn("w-5 h-5", isDarkMode ? "text-zinc-400 hover:text-zinc-100" : "text-zinc-400 hover:text-zinc-900")} />
                </button>
              </div>
            </div>

            <div className="w-full h-80 p-8 text-xl leading-relaxed overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {resultText ? (
                  <motion.div
                    key={resultText}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-zinc-800 dark:text-zinc-200"
                  >
                    {resultText}
                    {activeTab === 'enhance' && improvements.length > 0 && (
                      <div className="mt-8 pt-8 border-t border-zinc-200/10 dark:border-zinc-800/50">
                        <h5 className={cn(
                          "text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2",
                          isDarkMode ? "text-zinc-100" : "text-zinc-900"
                        )}>
                          <Info className="w-4 h-4" />
                          Key Improvements
                        </h5>
                        <ul className="space-y-3">
                          {improvements.map((imp, idx) => (
                            <li key={idx} className="text-sm text-zinc-500 dark:text-zinc-400 flex items-start gap-3">
                              <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", isDarkMode ? "bg-zinc-100" : "bg-zinc-900")} />
                              {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-zinc-300 dark:text-zinc-800 italic">
                    {activeTab === 'translate' ? "Translation will appear here..." : "Refined text will appear here..."}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {isLoading && (
              <div className="absolute inset-0 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-[2px] rounded-[2rem] flex items-center justify-center z-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <Loader2 className={cn("w-12 h-12 animate-spin", isDarkMode ? "text-zinc-100" : "text-zinc-900")} />
                    <Sparkles className={cn("w-5 h-5 absolute -top-1 -right-1 animate-pulse", isDarkMode ? "text-zinc-400" : "text-zinc-500")} />
                  </div>
                  <p className={cn("text-sm font-bold tracking-widest uppercase", isDarkMode ? "text-zinc-100" : "text-zinc-900")}>Processing</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Action Button (Below Cards) */}
        <div className="mt-12 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAction}
            disabled={isLoading || !inputText.trim()}
            className={cn(
              "w-full max-w-md py-5 rounded-3xl font-bold text-lg shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              isDarkMode 
                ? "bg-zinc-100 text-zinc-900 shadow-zinc-500/10 hover:bg-white" 
                : "bg-zinc-900 text-white shadow-zinc-900/30 hover:bg-zinc-800"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              activeTab === 'translate' ? <Languages className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />
            )}
            {activeTab === 'translate' ? 'Translate Now' : 'Enhance Text'}
          </motion.button>
        </div>

        {/* History Section */}
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-16 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <History className={cn("w-6 h-6", isDarkMode ? "text-zinc-400" : "text-zinc-500")} />
                  Recent Activity
                </h3>
                <button 
                  onClick={clearHistory}
                  className="text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-zinc-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear History
                </button>
              </div>
              
              {history.length === 0 ? (
                <div className={cn(
                  "rounded-[2rem] border border-dashed p-16 text-center",
                  isDarkMode ? "border-zinc-800 bg-zinc-900/20" : "border-zinc-200 bg-zinc-50"
                )}>
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                  </div>
                  <p className="text-zinc-400 font-medium">Your history is empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.map((item) => (
                    <motion.div 
                      key={item.id} 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "p-6 rounded-3xl border transition-all group cursor-pointer",
                        isDarkMode ? "bg-zinc-900/30 border-zinc-800 hover:border-zinc-500" : "bg-white border-zinc-200 hover:border-zinc-400 shadow-sm hover:shadow-md"
                      )}
                      onClick={() => {
                        setActiveTab(item.type);
                        setInputText(item.sourceText);
                        setResultText(item.resultText);
                        if (item.targetLanguage) setTargetLanguage(item.targetLanguage);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          {item.type === 'translate' ? (
                            <>
                              <Languages className="w-3 h-3" />
                              <span>Auto</span>
                              <ArrowRightLeft className="w-3 h-3" />
                              <span>{SUPPORTED_LANGUAGES.find(l => l.code === item.targetLanguage)?.name}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              <span>Enhancement</span>
                            </>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-zinc-300">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1 mb-1">{item.sourceText}</p>
                      <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2">{item.resultText}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className={cn(
        "mt-24 py-12 border-t transition-colors duration-300",
        isDarkMode ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-200"
      )}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              isDarkMode ? "bg-zinc-100" : "bg-zinc-900"
            )}>
              <Languages className={cn("w-5 h-5", isDarkMode ? "text-zinc-900" : "text-white")} />
            </div>
            <span className={cn("font-bold", isDarkMode ? "text-white" : "text-zinc-900")}>TrueText</span>
          </div>
          <p className="text-sm text-zinc-400">
            © 2026 TrueText. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy</a>
            <a href="#" className="text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms</a>
            <a href="#" className="text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Github</a>
          </div>
        </div>
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: ${isDarkMode ? '#27272a' : '#E4E4E7'}; 
          border-radius: 10px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { 
          background: ${isDarkMode ? '#3f3f46' : '#D4D4D8'}; 
        }
      `}</style>
    </div>
  );
}
