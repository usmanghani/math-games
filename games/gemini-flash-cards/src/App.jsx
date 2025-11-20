import React, { useState, useEffect, useRef } from 'react';
import { Mic, Home, ArrowLeft, Star, Volume2, RefreshCw } from 'lucide-react';

// Simple confetti effect component using canvas
const Confetti = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43', '#5352ED'];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
};

// Number word mapping for speech recognition
const NUMBER_WORDS = {
  '0': ['zero', 'oh'],
  '1': ['one', 'won'],
  '2': ['two', 'to', 'too'],
  '3': ['three', 'tree'],
  '4': ['four', 'for'],
  '5': ['five'],
  '6': ['six'],
  '7': ['seven'],
  '8': ['eight', 'ate'],
  '9': ['nine']
};

export default function App() {
  const [view, setView] = useState('home'); // home, game
  const [mode, setMode] = useState('numbers'); // numbers, alphabet, mixed
  const [currentCard, setCurrentCard] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct', 'wrong', null
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Speech Recognition Setup
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        handleAnswer(transcript);
      };
    }
  }, [currentCard]);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for kids
    utterance.pitch = 1.1; // Slightly higher pitch
    window.speechSynthesis.speak(utterance);
  };

  const generateCard = (selectedMode) => {
    let chars = [];
    if (selectedMode === 'numbers' || selectedMode === 'mixed') {
      chars = [...chars, ...'0123456789'.split('')];
    }
    if (selectedMode === 'alphabet' || selectedMode === 'mixed') {
      chars = [...chars, ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
    }
    
    const randomChar = chars[Math.floor(Math.random() * chars.length)];
    setCurrentCard(randomChar);
    setFeedback(null);
    setShowConfetti(false);
  };

  const startGame = (selectedMode) => {
    setMode(selectedMode);
    setView('game');
    setScore(0);
    generateCard(selectedMode);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleAnswer = (spokenText) => {
    let isCorrect = false;
    const target = currentCard.toLowerCase();

    // Logic for checking answers
    if (target >= '0' && target <= '9') {
      // Check digits
      if (spokenText.includes(target)) isCorrect = true;
      // Check number words
      if (NUMBER_WORDS[target]?.some(word => spokenText.includes(word))) isCorrect = true;
    } else {
      // Alphabet
      // Strict check for single letters to avoid "See" matching "C" erroneously in sentences, 
      // but loose enough for "The letter A"
      if (spokenText === target || spokenText.endsWith(` ${target}`) || spokenText === `${target}.`) {
        isCorrect = true;
      }
      // Phonetic fallbacks (common kid mispronunciations or mic errors)
      if (target === 'a' && (spokenText.includes('hey') || spokenText.includes('ay'))) isCorrect = true;
      if (target === 'b' && spokenText.includes('bee')) isCorrect = true;
      if (target === 'c' && (spokenText.includes('see') || spokenText.includes('sea'))) isCorrect = true;
      if (target === 'r' && spokenText.includes('are')) isCorrect = true;
      if (target === 'u' && spokenText.includes('you')) isCorrect = true;
      if (target === 'y' && spokenText.includes('why')) isCorrect = true;
    }

    if (isCorrect) {
      setFeedback('correct');
      setScore(prev => prev + 1);
      setShowConfetti(true);
      speak(`That's right! It is ${currentCard}`);
      setTimeout(() => {
        generateCard(mode);
      }, 3000);
    } else {
      setFeedback('wrong');
      speak(`Not quite. This is ${currentCard}. Try again!`);
    }
  };

  const getColor = (char) => {
    // Fun colors for cards
    const colors = [
      'text-red-500', 'text-blue-500', 'text-green-500', 
      'text-purple-500', 'text-orange-500', 'text-pink-500'
    ];
    return colors[char.charCodeAt(0) % colors.length];
  };

  // Render Methods
  const renderHome = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-50 p-4 space-y-8">
      <h1 className="text-5xl font-black text-blue-600 tracking-tight text-center mb-4 drop-shadow-sm">
        Flash Cards!
      </h1>
      
      <div className="grid grid-cols-1 gap-6 w-full max-w-xs">
        <button 
          onClick={() => startGame('numbers')}
          className="bg-white border-b-8 border-blue-200 active:border-b-0 active:translate-y-2 transition-all p-6 rounded-3xl shadow-xl flex items-center justify-between group"
        >
          <div className="bg-blue-100 p-3 rounded-2xl">
            <span className="text-3xl font-bold text-blue-600">123</span>
          </div>
          <span className="text-2xl font-bold text-gray-700 group-hover:text-blue-600">Numbers</span>
        </button>

        <button 
          onClick={() => startGame('alphabet')}
          className="bg-white border-b-8 border-green-200 active:border-b-0 active:translate-y-2 transition-all p-6 rounded-3xl shadow-xl flex items-center justify-between group"
        >
          <div className="bg-green-100 p-3 rounded-2xl">
            <span className="text-3xl font-bold text-green-600">ABC</span>
          </div>
          <span className="text-2xl font-bold text-gray-700 group-hover:text-green-600">Alphabet</span>
        </button>

        <button 
          onClick={() => startGame('mixed')}
          className="bg-white border-b-8 border-purple-200 active:border-b-0 active:translate-y-2 transition-all p-6 rounded-3xl shadow-xl flex items-center justify-between group"
        >
          <div className="bg-purple-100 p-3 rounded-2xl">
            <span className="text-3xl font-bold text-purple-600">Mix</span>
          </div>
          <span className="text-2xl font-bold text-gray-700 group-hover:text-purple-600">Fun Mix</span>
        </button>
      </div>
      
      <p className="text-gray-400 text-sm mt-8 text-center px-8">
        Works best on Safari (iOS) or Chrome. Enable microphone access when asked.
      </p>
    </div>
  );

  const renderGame = () => (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden relative">
      {showConfetti && <Confetti />}
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 z-10">
        <button 
          onClick={() => setView('home')}
          className="p-3 bg-white rounded-2xl shadow-sm border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 transition-all text-slate-600"
        >
          <ArrowLeft size={32} />
        </button>
        <div className="flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-2xl border-2 border-yellow-200">
          <Star className="text-yellow-500 fill-yellow-500" size={24} />
          <span className="text-2xl font-bold text-yellow-700">{score}</span>
        </div>
      </div>

      {/* Main Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 z-10">
        <div className={`
          relative w-full max-w-sm aspect-[3/4] bg-white rounded-[3rem] shadow-2xl flex items-center justify-center
          border-8 transition-colors duration-500
          ${feedback === 'correct' ? 'border-green-400 bg-green-50' : feedback === 'wrong' ? 'border-red-400 bg-red-50' : 'border-white'}
        `}>
          
          {/* The Character */}
          <span className={`text-[12rem] font-black select-none drop-shadow-md transition-all transform ${feedback === 'correct' ? 'scale-110' : ''} ${getColor(currentCard)}`}>
            {currentCard}
          </span>

          {/* Helper TTS Button (Little speaker icon) */}
          <button 
            onClick={() => speak(currentCard)}
            className="absolute top-6 right-6 p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
          >
            <Volume2 className="text-slate-400" size={24} />
          </button>
          
          {/* Feedback Overlay Text */}
          {feedback === 'correct' && (
            <div className="absolute bottom-12 animate-bounce">
              <span className="bg-green-500 text-white px-6 py-2 rounded-full text-xl font-bold shadow-lg">
                Good Job!
              </span>
            </div>
          )}
          
          {feedback === 'wrong' && (
            <div className="absolute bottom-12 animate-shake">
              <span className="bg-red-500 text-white px-6 py-2 rounded-full text-xl font-bold shadow-lg">
                Try Again!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 pb-12 z-10 flex justify-center items-center space-x-8">
        
        <button 
          onClick={() => generateCard(mode)}
          className="p-6 bg-white rounded-full shadow-lg border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 text-slate-400 hover:text-slate-600 transition-all"
        >
          <RefreshCw size={32} />
        </button>

        <button 
          onClick={toggleListening}
          className={`
            p-8 rounded-full shadow-2xl border-b-8 active:border-b-0 active:translate-y-2 transition-all transform
            ${isListening 
              ? 'bg-red-500 border-red-700 text-white scale-110 animate-pulse' 
              : 'bg-blue-500 border-blue-700 text-white hover:bg-blue-600'}
          `}
        >
          <Mic size={48} strokeWidth={2.5} />
        </button>
        
        {/* Placeholder for alignment */}
        <div className="w-20" /> 
      </div>
    </div>
  );

  return (
    <div className="font-sans touch-none select-none">
      {view === 'home' ? renderHome() : renderGame()}
    </div>
  );
}