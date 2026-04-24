import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix the mangled return statement
content = content.replace(/re    <div className="h-screen/, '  return (\n    <div className="h-screen');
content = content.replace(/bg-brand-bg">8\)' }}>/, 'bg-brand-bg">');

// Step 1: Target Selection
content = content.replace(/<div className="flex-1 overflow-y-auto p-8 md:p-12 flex flex-col justify-center max-w-5xl mx-auto w-full">/, '<div className="flex-1 overflow-y-auto p-[40px] flex flex-col">');

// Step 1 Typography
content = content.replace(/<div className="text-center mb-10 space-y-4">/, '<div className="mb-[40px] max-w-[800px]">');
content = content.replace(/<h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">Select Target Architecture<\/h2>/, '<h2 className="text-[32px] font-bold text-white mb-2">Welcome, Architect.</h2>');
content = content.replace(/<p className="text-neutral-400 text-lg">Which AI or image generator are you targeting today\?<\/p>/, '<p className="text-[16px] text-brand-muted">Target model synchronized for April 2026 parameters. Choose an operation mode to begin optimization.</p>');

// Buttons inside Step 1 and 2 replacing neutral-900 to brand-panel etc.
// But wait, the Target Models map has special styling
content = content.replace(/className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8"/, 'className="grid grid-cols-3 gap-[20px] mt-[32px] mb-8"');

// Target Box
content = content.replace(/className="group relative p-6 bg-neutral-900 border border-neutral-800 hover:border-cyan-500\/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-\[0_0_30px_-10px_rgba\(6,182,212,0\.3\)\] hover:-translate-y-1 text-left"/g, 
  'className="group relative p-[24px] bg-brand-panel border border-brand-border hover:border-brand-accent rounded-[12px] transition-all duration-200 hover:-translate-y-[2px] text-left"');

// Removing Gradients in Target Models (optional, but requested to match aesthetic closely)
content = content.replace(/<div className=\{`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br \$\{model\.color\} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`\} \/>/g, '');

// Typography in Target Cards
content = content.replace(/<span className="text-xs font-mono font-medium text-neutral-500 uppercase tracking-wider">\{model\.type\}<\/span>/g, '<span className="text-[13px] text-brand-muted">({model.type})</span>');
content = content.replace(/<span className="text-lg font-semibold text-neutral-200 group-hover:text-white transition-colors">\{model\.id\}<\/span>/g, '<span className="text-[16px] font-semibold text-white block mt-2">{model.id}</span>');


// STEP 2: Mode Selection
content = content.replace(/<div className="flex-1 overflow-y-auto p-8 md:p-12 flex flex-col justify-center max-w-4xl mx-auto w-full">/, '<div className="flex-1 overflow-y-auto p-[40px] flex flex-col">');

content = content.replace(/<div className="text-center mb-10 space-y-4">/, '<div className="mb-[40px] max-w-[800px]">');
content = content.replace(/<h2 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">Choose Operation Mode<\/h2>/, '<h2 className="text-[32px] font-bold text-white mb-2">Operation Mode</h2>');
content = content.replace(/<p className="text-neutral-400 text-lg">Select how you want to forge prompts for <span className="text-cyan-400 font-semibold">\{targetAI\}<\/span>\.<\/p>/, '<p className="text-[16px] text-brand-muted">Select how you want to forge prompts for <span className="text-brand-accent-blue font-bold">{targetAI}</span>.</p>');

content = content.replace(/<div className="grid grid-cols-1 md:grid-cols-2 gap-4">/, '<div className="grid grid-cols-3 gap-[20px] mt-[32px]">');

content = content.replace(/className=\{`group p-6 bg-neutral-900 border border-neutral-800 hover:border-cyan-500\/50 rounded-xl text-left transition-all duration-300 hover:-translate-y-1 \$\{idx === 4 \? 'md:col-span-2 md:mx-auto md:w-1\/2' : ''\}`\}/g,
  'className="group relative p-[24px] bg-brand-panel border border-brand-border hover:border-brand-accent rounded-[12px] transition-all duration-200 hover:-translate-y-[2px] text-left"');
  
content = content.replace(/<div className="p-3 bg-neutral-800 rounded-lg group-hover:bg-cyan-500\/20 group-hover:text-cyan-400 transition-colors">/g, 
  '<div className="absolute top-[16px] right-[16px] opacity-30 text-[18px]">');

content = content.replace(/<h3 className="text-lg font-semibold text-neutral-200 group-hover:text-white transition-colors">\{m\.title\}<\/h3>/g, 
  '<h3 className="text-[16px] font-semibold text-white mb-[10px]">{m.title}</h3>');
content = content.replace(/<p className="text-sm text-neutral-500 leading-relaxed group-hover:text-neutral-400">\{m\.desc\}<\/p>/g,
  '<p className="text-[13px] leading-[1.5] text-brand-muted m-0">{m.desc}</p>');

// Ensure structure fits by somewhat altering Icon block rendering if necessary, but leaving it as absolute top right badge fits the "badge" style from original HTML
content = content.replace(/<div className="flex items-start space-x-4">/g, '<div>');


// Main input / Chat area updates
content = content.replace(/<div className=\{`px-6 py-4 rounded-2xl \$\{message\.role === 'user' \? 'bg-neutral-800 text-neutral-100 rounded-tr-none' : 'bg-neutral-900\/80 border border-neutral-800 text-neutral-300 rounded-tl-none prose prose-invert prose-cyan max-w-none prose-p:leading-relaxed prose-pre:bg-neutral-950 prose-pre:border prose-pre:border-neutral-800'\}`\}>/g,
  '<div className={`px-[24px] py-[16px] rounded-[12px] \${message.role === \'user\' ? \'bg-brand-active text-white\' : \'bg-brand-panel border border-brand-border text-brand-text prose prose-invert max-w-none prose-p:leading-[1.5]\'}`}>');

// Chat input section
content = content.replace(/<div className="p-4 md:p-6 bg-neutral-950\/80 backdrop-blur-xl border-t border-neutral-800 relative z-20">/, 
  '<div className="p-[20px] bg-brand-bg border-t border-brand-border">');
  
content = content.replace(/<div className="flex items-end bg-neutral-900 border border-neutral-700 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500\/50 rounded-2xl p-2 transition-all shadow-2xl">/,
  '<div className="flex items-end bg-brand-panel border border-brand-border rounded-[8px] p-2 focus-within:border-brand-accent transition-colors">');
  
content = content.replace(/<button \\n                      onClick=\{generateResponse\}\\n                      disabled=\{isLoading \|\| \(\!inputValue\.trim\(\) && \!selectedImage\)\}\\n                      className="p-3 m-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 shadow-lg shadow-cyan-500\/20 hover:shadow-cyan-500\/40"\\n                    >/m,
  '<button onClick={generateResponse} disabled={isLoading || (!inputValue.trim() && !selectedImage)} className="p-3 m-1 bg-brand-accent text-[#0B0E14] hover:bg-opacity-90 font-bold rounded-[6px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0">');


fs.writeFileSync('src/App.tsx', content);
