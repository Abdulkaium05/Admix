import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { translations, Language } from '../utils/i18n';
import {
  Send,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';

interface AiSupportScreenProps {
  language: Language;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export const AiSupportScreen: React.FC<AiSupportScreenProps> = ({ language }) => {
  const t = translations[language];

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text:
        language === 'bn'
          ? 'আসসালামু আলাইকুম! আমি Admix এআই অ্যাসিস্ট্যান্ট। ডুয়েট ভর্তি প্রস্তুতি ও পড়াশোনা বিষয়ক যেকোনো প্রশ্ন এখানে লিখুন।'
          : 'Hello! I am Admix AI Assistant. Feel free to ask any questions about your DUET preparation.',
      timestamp: Date.now(),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const query = (customPrompt || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          subject: 'all',
          language: language === 'en' ? 'en' : 'bn',
        }),
      });

      const data = await response.json();
      const aiReply = data.answer || (language === 'bn' ? 'দুঃখিত, উত্তর পাওয়া যায়নি।' : 'Sorry, could not generate an answer.');

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const fallbackMsg: Message = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text:
          language === 'bn'
            ? 'সার্ভারে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
            : 'Network error occurred. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text:
          language === 'bn'
            ? 'চ্যাটবক্স খালি করা হয়েছে। আপনার প্রশ্নটি লিখুন।'
            : 'Chat cleared. Please enter your question.',
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col h-[calc(100dvh-4.75rem)] sm:h-[calc(100vh-5.5rem)] py-2 sm:py-3 px-2 sm:px-3">
      {/* 1. Ultra Clean Chat Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-white rounded-2xl border border-emerald-100 shadow-2xs mb-2.5 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-emerald-950">
              Admix AI
            </h2>
            <p className="text-[10px] text-emerald-700/80">
              {language === 'bn' ? 'অনলাইন সহায়তা' : 'Online Assistant'}
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="p-1.5 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 transition-colors"
          title={language === 'bn' ? 'চ্যাট মুছে নতুন শুরু করুন' : 'Clear chat'}
          aria-label="Clear chat"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Chatbox Message Stream */}
      <div className="flex-1 overflow-y-auto space-y-2.5 p-2 bg-emerald-50/30 rounded-2xl border border-emerald-100/70">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mb-0.5 text-[10px]">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-br-xs'
                    : 'bg-white text-emerald-950 border border-emerald-100 rounded-bl-xs'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div>
                    <div className="prose prose-xs sm:prose-sm text-emerald-950 max-w-none">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-emerald-50 flex justify-end">
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="text-emerald-600 hover:text-emerald-800 text-[10px] font-medium flex items-center gap-1 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-700" />
                            <span>কপি হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>কপি</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 mb-0.5 text-[10px]">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-center gap-2 p-2 bg-white rounded-2xl border border-emerald-100 w-fit text-xs text-emerald-800 animate-pulse">
            <Bot className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
            <span>{language === 'bn' ? 'উত্তর তৈরি হচ্ছে...' : 'Thinking...'}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Direct Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-2.5 flex items-center gap-2 p-1.5 bg-white rounded-full border border-emerald-200 shadow-xs focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all flex-shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={language === 'bn' ? 'মেসেজ লিখুন...' : 'Type a message...'}
          className="flex-1 px-3.5 py-1.5 bg-transparent text-emerald-950 text-xs sm:text-sm focus:outline-hidden placeholder:text-emerald-700/40"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-xs transition-all flex-shrink-0"
          aria-label="Send"
        >
          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </form>
    </div>
  );
};

