import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  Sparkles, Image as ImageIcon, Wand2, BookOpen, 
  ArrowRightLeft, Bot, Send, Upload, ChevronRight, 
  X, Copy, CheckCircle2, ChevronLeft
} from 'lucide-react';

const TARGET_MODELS = [
  { id: 'Gemini 3', type: 'text', color: 'from-blue-500 to-cyan-400' },
  { id: 'GPT-4o / o1', type: 'text', color: 'from-emerald-500 to-green-400' },
  { id: 'Claude 4', type: 'text', color: 'from-amber-500 to-orange-400' },
  { id: 'Grok 3', type: 'text', color: 'from-gray-300 to-gray-500' },
  { id: 'Llama 4', type: 'text', color: 'from-blue-600 to-indigo-500' },
  { id: 'Midjourney v7', type: 'image', color: 'from-purple-500 to-pink-500' },
  { id: 'Flux', type: 'image', color: 'from-red-500 to-rose-400' },
  { id: 'Imagen 3', type: 'image', color: 'from-teal-400 to-emerald-400' },
  { id: 'DALL·E 4', type: 'image', color: 'from-yellow-400 to-orange-500' },
  { id: 'Stable Diffusion 3.5', type: 'image', color: 'from-violet-500 to-fuchsia-500' },
  { id: 'Custom', type: 'both', color: 'from-gray-500 to-gray-700' },
] as const;

type TargetAI = typeof TARGET_MODELS[number]['id'] | string;

const MODES = [
  { 
    id: 1, 
    title: 'Reverse Engineer Image', 
    desc: 'Upload any image and get 4 optimized prompts to recreate it.', 
    icon: ImageIcon 
  },
  { 
    id: 2, 
    title: 'Create / Optimize Prompt', 
    desc: 'Turn a rough goal into a master-level prompt.', 
    icon: Wand2 
  },
  { 
    id: 3, 
    title: 'Advanced Strategies & Library', 
    desc: 'Best techniques (Chain-of-Thought, ReAct, etc.) for the chosen AI.', 
    icon: BookOpen 
  },
  { 
    id: 4, 
    title: 'Cross-Model Translation', 
    desc: 'Convert any prompt to work optimally on a different model.', 
    icon: ArrowRightLeft 
  },
  { 
    id: 5, 
    title: 'Build Full Agent / Workflow', 
    desc: 'Create complete, production-ready agent prompts and workflows.', 
    icon: Bot 
  },
];

type Message = {
  role: 'user' | 'model';
  text: string;
  image?: string; // base64
};

export default function App() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [targetAI, setTargetAI] = useState<TargetAI>('');
  const [customTarget, setCustomTarget] = useState('');
  const [mode, setMode] = useState<number | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageMimeType, setSelectedImageMimeType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleTargetSelect = (id: string) => {
    if (id === 'Custom') {
      if (!customTarget.trim()) return;
      setTargetAI(customTarget);
    } else {
      setTargetAI(id);
    }
    setStep(2);
  };

  const handleModeSelect = (id: number) => {
    setMode(id);
    setStep(3);
    
    // Add initialization message
    const modeInfo = MODES.find(m => m.id === id);
    setMessages([
      {
        role: 'model',
        text: `**Target AI Locked:** ${targetAI}\n**Mode Active:** ${modeInfo?.title}\n\nI am PromptForge AI v2026. Please provide your input (or upload an image) to begin.`
      }
    ]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setSelectedImageMimeType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const generateResponse = async () => {
    if (!inputValue.trim() && !selectedImage) return;
    
    setError('');
    const userText = inputValue;
    const userImg = selectedImage;
    const userImgMime = selectedImageMimeType;
    
    setMessages(prev => [...prev, { role: 'user', text: userText, image: userImg || undefined }]);
    setInputValue('');
    setSelectedImage(null);
    setSelectedImageMimeType(null);
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key is required but not found in environment variables.");
      
      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `
You are PromptForge AI v2026 — the world's most advanced universal prompt architect, reverse prompt engineer, and strategy expert.
The user has locked in the target AI: "${targetAI}".
The user has selected Mode ${mode}: "${MODES.find(m => m.id === mode)?.title}".

Core Rules (Always Follow):
1. Be extremely precise, structured, and actionable.
2. Use the latest 2026 best practices for "${targetAI}".
3. Always give multiple ready-to-copy versions (3–5 variations).
4. Output in clean, beautiful Markdown with clear sections.
5. Provide specific details, parameters, aspect ratios, quality boosters, and negative prompts for image models.
6. Provide chain-of-thought, few-shot examples, JSON/XML structure tips, temperature recommendations for text LLMs.
7. Always end your response EXACTLY with this question: 
   "What would you like to do next? (new image, refine this prompt, switch mode, or change target AI?)"

If Mode 1 (Reverse Engineer Image): 
The user has likely uploaded an image (or described one). Give a deep forensic breakdown (subject, composition, lighting, style references, mood, technical details). Deliver EXACTLY 4 optimized prompts for ${targetAI} (Max Detail, Artistic, Concise, Creative). Add negative prompt suggestions.

If Mode 2 (Create / Optimize Prompt):
Take their goal and turn it into a master-level prompt for ${targetAI}. Show before/after with clear improvements.

If Mode 3 (Advanced Prompt Strategies):
Offer the best techniques for ${targetAI} and provide ready-to-use templates.

If Mode 4 (Cross-Model Translation):
Convert their prompt to work optimally on ${targetAI}.

If Mode 5 (Build Full Agent / Workflow):
Create complete, production-ready agent prompts or multi-step workflows.
`;

      const contentsParts: any[] = [];
      
      if (userImg && userImgMime) {
        const base64Data = userImg.split(',')[1];
        contentsParts.push({
          inlineData: {
            mimeType: userImgMime,
            data: base64Data
          }
        });
      }
      
      contentsParts.push({ text: userText || "Analyze this image based on the selected mode." });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: { parts: contentsParts },
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "No response generated." }]);

    } catch (err: any) {
      setError(err.message || "An error occurred while generating the prompt.");
      setMessages(prev => [...prev, { role: 'model', text: "❌ **Error:** " + (err.message || "Something went wrong.") }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setStep(1);
    setTargetAI('');
    setMode(null);
    setMessages([]);
    setInputValue('');
  };

    return (
    <div className="h-screen bg-brand-bg text-brand-text font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar Focus Info */}
      <div className="md:w-[240px] border-b md:border-b-0 md:border-r border-brand-border bg-brand-panel p-6 flex flex-col shrink-0">
        <div className="mb-10">
          <div className="flex items-center space-x-2 text-brand-accent mb-2">
            <Sparkles className="w-6 h-6" />
            <h1 className="text-[1.2rem] font-extrabold tracking-[-0.05em] text-white">PROMPTFORGE</h1>
          </div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-brand-muted font-semibold mt-6 mb-3">SYSTEM STATUS</p>
          <div className="bg-brand-accent-blue/10 border border-brand-accent-blue text-brand-accent-blue px-3 py-1 rounded-full text-[11px] font-bold uppercase inline-block mb-6">
            Target Locked: {targetAI || 'None'}
          </div>
        </div>

        <div className="space-y-6 flex-1">
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-[0.1em] text-brand-muted font-semibold mb-3">
              PRIMARY CHANNELS
            </div>
            
            <div className={`px-3 py-2.5 rounded-md text-[13px] transition-all cursor-pointer ${step === 1 ? 'bg-brand-active text-white' : 'text-brand-muted hover:bg-brand-active/50'}`} onClick={() => setStep(1)}>
              Architecture Lab
            </div>
            <div className={`px-3 py-2.5 rounded-md text-[13px] transition-all cursor-pointer ${step === 2 ? 'bg-brand-active text-white' : 'text-brand-muted hover:bg-brand-active/50'}`} onClick={() => setStep(2)}>
              Operation Mode
            </div>
            <div className={`px-3 py-2.5 rounded-md text-[13px] transition-all cursor-pointer ${step === 3 ? 'bg-brand-active text-white' : 'text-brand-muted hover:bg-brand-active/50'}`} onClick={() => setStep(3)}>
              Optimization Terminal
            </div>
          </div>
        </div>

        {step > 1 && (
          <button 
            onClick={resetAll}
            className="flex items-center justify-center space-x-2 w-full py-2 text-[13px] font-medium text-brand-muted hover:text-white bg-brand-active/50 hover:bg-brand-active rounded-md transition-colors mt-auto"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Reset Session</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-brand-bg">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: TARGET SELECTION */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 overflow-y-auto p-8 md:p-12 flex flex-col justify-center max-w-5xl mx-auto w-full"
            >
              <div className="mb-[40px] max-w-[800px]">
                <h2 className="text-[32px] font-bold text-white mb-2">Welcome, Architect.</h2>
                <p className="text-[16px] text-brand-muted">Target model synchronized for April 2026 parameters. Choose an operation mode to begin optimization.</p>
              </div>

              <div className="grid grid-cols-3 gap-[20px] mt-[32px] mb-8">
                {TARGET_MODELS.map(model => (
                  model.id !== 'Custom' && (
                    <button
                      key={model.id}
                      onClick={() => handleTargetSelect(model.id)}
                      className="group relative p-[24px] bg-brand-panel border border-brand-border hover:border-brand-accent rounded-[12px] transition-all duration-200 hover:-translate-y-[2px] text-left"
                    >
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br \${model.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />
                      <div className="relative z-10 flex flex-col space-y-2">
                        <span className="text-[13px] text-brand-muted">({model.type})</span>
                        <span className="text-[16px] font-semibold text-white block mt-2">{model.id}</span>
                      </div>
                    </button>
                  )
                ))}
              </div>

              <div className="flex items-center space-x-4 max-w-md mx-auto w-full p-2 bg-neutral-900 border border-neutral-800 rounded-xl focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all">
                <input 
                  type="text" 
                  value={customTarget}
                  onChange={e => setCustomTarget(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTargetSelect('Custom')}
                  placeholder="Custom (tell me the model)"
                  className="flex-1 bg-transparent border-none text-white focus:outline-none px-4 py-2 placeholder-neutral-600"
                />
                <button 
                  onClick={() => handleTargetSelect('Custom')}
                  disabled={!customTarget.trim()}
                  className="p-2 bg-neutral-800 text-neutral-300 hover:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: MODE SELECTION */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto p-8 md:p-12 flex flex-col justify-center max-w-4xl mx-auto w-full"
            >
              <div className="mb-[40px] max-w-[800px]">
                <h2 className="text-[32px] font-bold text-white mb-2">Operation Mode</h2>
                <p className="text-[16px] text-brand-muted">Select how you want to forge prompts for <span className="text-brand-accent-blue font-bold">{targetAI}</span>.</p>
              </div>

              <div className="grid grid-cols-3 gap-[20px] mt-[32px]">
                {MODES.map((m, idx) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleModeSelect(m.id)}
                      className={`group p-6 bg-neutral-900 border border-neutral-800 hover:border-cyan-500/50 rounded-xl text-left transition-all duration-300 hover:-translate-y-1 \${idx === 4 ? 'md:col-span-2 md:mx-auto md:w-1/2' : ''}`}
                    >
                      <div>
                        <div className="absolute top-[16px] right-[16px] opacity-30 text-[18px]">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h3 className="text-[16px] font-semibold text-white mb-[10px]">{m.title}</h3>
                          <p className="text-[13px] leading-[1.5] text-brand-muted m-0">{m.desc}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 3: WORKSPACE & CHAT */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
                {messages.map((message, idx) => (
                  <div key={idx} className={`flex max-w-4xl mx-auto \${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex space-x-4 max-w-[85%] \${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${message.role === 'user' ? 'bg-brand-accent-blue/10 text-brand-accent-blue border border-brand-accent-blue' : 'bg-brand-panel text-brand-text border border-brand-border'}`}>
                        {message.role === 'user' ? <span className="font-mono text-[13px]">U</span> : <Bot className="w-5 h-5" />}
                      </div>

                      {/* Content */}
                      <div className={`flex flex-col space-y-3 \${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {message.image && (
                          <div className="rounded-xl overflow-hidden border border-neutral-700 bg-neutral-800/50 backdrop-blur max-w-sm">
                            <img src={message.image} alt="Uploaded text context" className="w-full h-auto object-cover" />
                          </div>
                        )}
                        <div className={`px-6 py-4 rounded-2xl \${message.role === 'user' ? 'bg-neutral-800 text-neutral-100 rounded-tr-none' : 'bg-neutral-900/80 border border-neutral-800 text-neutral-300 rounded-tl-none prose prose-invert prose-cyan max-w-none prose-p:leading-relaxed prose-pre:bg-neutral-950 prose-pre:border prose-pre:border-neutral-800'}`}>
                          {message.role === 'model' ? (
                            <Markdown
                              components={{
                                code({node, inline, className, children, ...props}: any) {
                                  const match = /language-(\w+)/.exec(className || '')
                                  const content = String(children).replace(/\n$/, '')
                                  return !inline && match ? (
                                    <div className="relative group">
                                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                          onClick={() => navigator.clipboard.writeText(content)}
                                          className="flex items-center space-x-2 text-xs bg-[#0B0E14] hover:bg-[#161B22] p-2 rounded-md text-brand-text border border-brand-border"
                                          title="Copy code"
                                        >
                                          <Copy className="w-3 h-3" />
                                          <span>Copy</span>
                                        </button>
                                      </div>
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    </div>
                                  ) : (
                                    <code className={`bg-[#0B0E14] px-1.5 py-0.5 rounded text-brand-accent-blue font-mono text-sm ${className || ''}`} {...props}>
                                      {children}
                                    </code>
                                  )
                                }
                              }}
                            >
                              {message.text}
                            </Markdown>
                          ) : (
                            <div className="whitespace-pre-wrap">{message.text}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex max-w-4xl mx-auto justify-start">
                    <div className="flex space-x-4 max-w-[85%]">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-brand-panel text-brand-text border border-brand-border">
                        <Bot className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="px-[24px] py-[16px] rounded-[12px] bg-brand-panel border border-brand-border text-brand-text rounded-tl-none flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-[20px] bg-brand-bg border-t border-brand-border">
                <div className="max-w-4xl mx-auto w-full relative">
                  
                  {selectedImage && (
                    <div className="absolute bottom-full left-0 mb-4 bg-neutral-900 p-2 rounded-xl border border-neutral-700 shadow-xl max-w-xs flex items-start space-x-3 group">
                       <img src={selectedImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-neutral-800" />
                       <div className="flex-1 py-1">
                          <p className="text-xs text-neutral-400 truncate">Image attached</p>
                       </div>
                       <button onClick={() => { setSelectedImage(null); setSelectedImageMimeType(null); }} className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-md text-neutral-400 hover:text-white transition-colors">
                          <X className="w-4 h-4" />
                       </button>
                    </div>
                  )}

                  <div className="flex items-end bg-brand-panel border border-brand-border rounded-[8px] p-2 focus-within:border-brand-accent transition-colors">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 text-neutral-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-colors shrink-0"
                      title="Upload Image"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    
                    <textarea 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          generateResponse();
                        }
                      }}
                      placeholder={mode === 1 ? "Upload an image or describe the vibe..." : "What are we forging today?"}
                      className="flex-1 max-h-48 min-h-[52px] bg-transparent text-white px-3 py-3.5 focus:outline-none resize-none placeholder-neutral-500 leading-relaxed"
                      rows={1}
                    />

                    <button 
                      onClick={generateResponse}
                      disabled={isLoading || (!inputValue.trim() && !selectedImage)}
                      className="p-3 m-1 bg-brand-accent text-[#0B0E14] hover:opacity-90 font-bold rounded-[6px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-center mt-3">
                    <span className="text-[11px] font-mono text-brand-muted">SHIFT + ENTER to add a new line • ENTER to submit</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Bar */}
        <div className="absolute bottom-0 w-full h-[32px] bg-[#010409] border-t border-brand-border flex items-center px-[20px] font-mono text-[11px] text-[#484F58] justify-between z-30">
          <div>
            <span className="w-[8px] h-[8px] rounded-full bg-brand-accent inline-block mr-[6px]"></span>
            ENGINE_READY // LATENCY: 12MS // SECURITY: ENCRYPTED
          </div>
          <div>PROMPTFORGE_V2026_CORE</div>
        </div>

      </div>

    </div>
  );
}
