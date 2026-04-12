import { useState, useEffect, useRef } from 'react';
import { connectWS } from './wss';
import { Send, UserCircle, Sparkles, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [showNamePopup, setShowNamePopup] = useState(true);
  const [inputName, setInputName] = useState('');
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typers, setTypers] = useState([]);

  const socket = useRef(null);
  const timer = useRef(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typers]);

  useEffect(() => {
    socket.current = connectWS();

    const handleRoomNotice = (name) => {
      console.log(`${name} joined`);
    };

    const handleChatMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleTyping = (name) => {
      setTypers((prev) => {
        if (!prev.includes(name)) return [...prev, name];
        return prev;
      });
    };

    const handleStopTyping = (name) => {
      setTypers((prev) => prev.filter((t) => t !== name));
    };

    socket.current.on('room-notice', handleRoomNotice);
    socket.current.on('chat-message', handleChatMessage);
    socket.current.on('typing', handleTyping);
    socket.current.on('stop-typing', handleStopTyping);

    return () => {
      if (socket.current) {
        socket.current.off('room-notice', handleRoomNotice);
        socket.current.off('chat-message', handleChatMessage);
        socket.current.off('typing', handleTyping);
        socket.current.off('stop-typing', handleStopTyping);
        socket.current.disconnect();
      }
    };
  }, []);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputName.trim();
    if (trimmed) {
      setUsername(trimmed);
      setShowNamePopup(false);
      socket.current.emit('join-room', trimmed);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const msg = {
      id: Date.now(),
      sender: username,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, msg]);
    socket.current.emit('chat-message', msg);
    setText('');
    socket.current.emit('stop-typing', username);
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    socket.current.emit('typing', username);

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      socket.current.emit('stop-typing', username);
    }, 1000);
  };

  if (showNamePopup) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
          className="w-full max-w-sm p-8 border border-white/10 rounded-3xl bg-slate-900/50 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-400">
              <Sparkles size={32} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-white mb-2">Welcome</h2>
          <p className="text-slate-400 text-center text-sm mb-6">Enter your display name to join the chat</p>
          
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <UserCircle size={20} />
              </div>
              <input
                autoFocus
                type="text"
                className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-slate-500"
                placeholder="e.g. John Doe"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
              />
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all flex justify-center items-center gap-2"
            >
              Start Chatting
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-3xl mx-auto bg-slate-950/50 shadow-2xl relative ring-1 ring-white/5 md:my-4 md:h-[calc(100vh-2rem)] md:rounded-3xl overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-64 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="z-10 px-6 py-4 flex justify-between items-center bg-slate-900/60 backdrop-blur-xl border-b border-white/5 relative">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30">
            <MessageSquare size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Project Nexus</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-xs text-emerald-400 font-medium">
                Online
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-white/5 flex items-center gap-2 backdrop-blur-sm">
            <UserCircle size={14} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-300">{username}</span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 elegant-scrollbar z-0 relative">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isMe = msg.sender === username;
            return (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                layout
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}
              >
                {!isMe && <span className="text-[11px] font-medium text-slate-400 mb-1.5 ml-1">{msg.sender}</span>}
                <div className={`relative px-5 py-3.5 max-w-[85%] md:max-w-[75%] shadow-sm overflow-hidden ${
                  isMe 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-3xl rounded-tr-sm shadow-indigo-500/20' 
                    : 'bg-slate-800/80 text-slate-100 rounded-3xl rounded-tl-sm border border-white/5 shadow-black/20 backdrop-blur-sm'
                }`}>
                  <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>
                </div>
                <span className={`text-[10px] text-slate-500 mt-1.5 ${isMe ? 'mr-1' : 'ml-1'}`}>{msg.time}</span>
              </motion.div>
            );
          })}
          
          {/* Typing indicator */}
          {typers.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, originY: 1 }}
              className="flex flex-col items-start"
            >
              <span className="text-[11px] font-medium text-slate-400 mb-1.5 ml-1">
                {typers.join(', ')} {typers.length > 1 ? 'are' : 'is'} typing...
              </span>
              <div className="bg-slate-800/60 backdrop-blur-sm border border-white/5 rounded-3xl rounded-tl-sm px-4 py-3.5 flex gap-1.5 shadow-sm w-fit">
                <div className="typing-dot h-1.5 w-1.5 rounded-full"></div>
                <div className="typing-dot h-1.5 w-1.5 rounded-full"></div>
                <div className="typing-dot h-1.5 w-1.5 rounded-full"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} className="h-1" />
      </main>

      {/* Input Area */}
      <footer className="z-10 p-4 md:p-6 bg-transparent border-t border-white/5 backdrop-blur-xl shrink-0">
        <form onSubmit={sendMessage} className="relative flex items-end gap-2">
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-lg transition-opacity opacity-0 group-focus-within:opacity-100" />
            <input
              type="text"
              className="relative w-full px-5 py-4 bg-slate-900 border border-slate-700/50 focus:border-indigo-500/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
              placeholder="Message..."
              value={text}
              onChange={handleTyping}
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!text.trim()}
            type="submit" 
            className="flex-shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={20} className="ml-0.5" />
          </motion.button>
        </form>
      </footer>
    </div>
  );
}

export default App;