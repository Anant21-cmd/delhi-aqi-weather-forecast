import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Trash2,
  Sparkles,
  Bot,
  User,
  Clock,
  ShieldCheck,
  Compass,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aqiService } from '../services/api';

export const ChatbotPage = () => {
  const { selectedLocation } = useApp();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `Hello! I am your **NCMRWF Environmental Intelligence Assistant**. I am actively monitoring air quality, thermal inversion soundings, satellite fire hotspots, and coupled meteorological forecasts across **${selectedLocation}**.\n\nAsk me anything about why pollution is changing, how the weather affects dispersion, or what is projected over the next 72 hours!`,
      timestamp: new Date(),
      sources: ['CPCB CAAQMS', 'Copernicus ERA5', 'NASA FIRMS', 'NCMRWF Unified Model'],
      suggested: [
        'Why is pollution high today?',
        'Will AQI increase tomorrow?',
        'Is stubble burning affecting Delhi?',
        'Is the weather helping pollution dispersion?',
        'Which area has better air quality?'
      ]
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isSending) return;

    setError(null);
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await aqiService.sendChatMessage({
        message: text,
        location_name: selectedLocation
      });

      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date(res.data.timestamp || Date.now()),
        sources: res.data.sources_consulted || [],
        suggested: res.data.suggested_followups || []
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Unable to receive response from assistant. Please retry.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: `Conversation reset. Ready to answer your questions regarding **${selectedLocation}** air quality and meteorological coupling.`,
        timestamp: new Date(),
        sources: ['CPCB', 'NCMRWF'],
        suggested: [
          'Why is pollution high today?',
          'Will AQI increase tomorrow?',
          'Is stubble burning affecting Delhi?'
        ]
      }
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <span>NCMRWF AI Environmental Assistant</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Grounded in Live Physics
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Actively contextualized for: <strong className="text-white">{selectedLocation}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-900 text-sky-400 border border-slate-800'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-2xl space-y-2 ${msg.role === 'user' ? 'items-end' : ''}`}>
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                {/* Formatted Markdown-like paragraphs */}
                <div className="whitespace-pre-line space-y-2">
                  {msg.content.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx}>
                      {paragraph.split('**').map((chunk, cIdx) =>
                        cIdx % 2 === 1 ? <strong key={cIdx} className={msg.role === 'user' ? 'text-white' : 'text-slate-900 font-bold'}>{chunk}</strong> : chunk
                      )}
                    </p>
                  ))}
                </div>

                {/* Grounding Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-500">Sources:</span>
                    {msg.sources.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div className={`text-[10px] text-slate-400 px-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>

              {/* Suggested Followups */}
              {msg.suggested && msg.suggested.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {msg.suggested.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item)}
                      className="text-[11px] font-medium px-3 py-1 rounded-full bg-white hover:bg-sky-50 text-sky-700 border border-sky-200 shadow-sm transition-all text-left"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Bubble */}
        {isSending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-sky-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm text-xs text-slate-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500 animate-spin" />
              <span>Analyzing boundary layer sounding, satellite FIRMS feed, and 72h forecast...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Footer */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask why pollution is high, about inversion conditions, stubble burning, or forecast..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isSending}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
