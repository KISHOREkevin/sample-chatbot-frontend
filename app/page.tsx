import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chatty AI Chat - Secure & Intelligent Conversation Gateway',
  description: 'Experience Chatty AI Chat: a secure, enterprise-grade AI conversational platform integrated with OpenRouter models. Upload avatars, verify credentials under SHA-256 protocols, and stream real-time responses safely.',
  keywords: ['Chatty AI', 'Secure AI Chat', 'OpenRouter chatbot', 'Enterprise Assistant', 'AI Workspace'],
  openGraph: {
    title: 'Chatty AI Chat - Secure & Intelligent Conversation Gateway',
    description: 'Experience Chatty AI Chat: a secure, enterprise-grade AI conversational platform integrated with OpenRouter models.',
    type: 'website',
  }
};

export default async function LandingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const isAuthenticated = !!token;

  return (
    <div className="relative min-h-screen w-full bg-[#080B11] text-zinc-100 overflow-hidden font-sans select-none">
      
      {/* CSS Animation and Glow Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        html {
          scroll-behavior: smooth;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.08); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        @keyframes dash {
          to { stroke-dashoffset: -40; }
        }
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(99,102,241,0.3)); }
          50% { filter: drop-shadow(0 0 15px rgba(34,211,238,0.8)); }
        }
        .animate-pulse-slow { animation: pulse-slow 8s infinite ease-in-out; }
        .animate-float-slow { animation: float-slow 6s infinite ease-in-out; }
        .animate-dash { stroke-dasharray: 8; animation: dash 3s infinite linear; }
        .animate-pulse-glow { animation: pulse-glow 3s infinite ease-in-out; }
      `}} />

      {/* Ambient background glow spheres */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      {/* Navigation Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1.5px] shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <div className="h-full w-full bg-slate-950 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Chatty AI
          </span>
        </div>

        <nav className="flex items-center gap-6">
          <Link 
            href={isAuthenticated ? "/chat" : "/login"} 
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 cursor-pointer"
          >
            {isAuthenticated ? 'Go to Workspace' : 'Sign In'}
          </Link>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-89px)]">
        
        {/* Left column: Hero description */}
        <section className="lg:col-span-6 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Integrated with OpenRouter Gateway
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            The Ultimate Hub for{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              AI Chat & Image Creation
            </span>
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
            Chatty AI is a secure portal to connect with multiple LLM engines like DeepSeek V3, DeepSeek R1, Claude, and GPT-4o via OpenRouter. Initiate real-time streaming chats, customize verified profiles, and unlock stunning high-resolution image generation under one sandbox.
          </p>

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2">
            <Link 
              href={isAuthenticated ? "/chat" : "/login"}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold rounded-xl text-sm shadow-xl shadow-indigo-600/15 hover:shadow-indigo-500/30 transition-all duration-200 hover:-translate-y-0.5 text-center cursor-pointer"
            >
              {isAuthenticated ? 'Open Chat Console' : 'Get Started for Free'}
            </Link>
            <a 
              href="#features" 
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-zinc-300 hover:text-white font-semibold rounded-xl text-sm transition-all duration-200 hover:-translate-y-0.5 text-center cursor-pointer"
            >
              Explore Capabilities
            </a>
          </div>

          {/* SaaS Indicators */}
          <div className="pt-6 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0 text-left border-t border-white/5">
            <div>
              <p className="text-xl font-bold text-white">SHA-256</p>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Security SSL</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">OpenRouter</p>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Model Gateway</p>
            </div>
            <div>
              <p className="text-xl font-bold text-white">&lt; 100ms</p>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Latency response</p>
            </div>
          </div>
        </section>

        {/* Right column: Interactive illustration mock */}
        <section className="lg:col-span-6 flex justify-center items-center">
          <div className="relative w-full max-w-lg aspect-square bg-slate-950/40 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-indigo-500/20 animate-float-slow">
            
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/[0.02] rounded-2xl pointer-events-none"></div>

            {/* Neural network SVG canvas */}
            <svg viewBox="0 0 400 400" className="w-full h-full">
              {/* Grid Background */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Connections (Lines) */}
              <path d="M 80,100 L 200,80" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" />
              <path d="M 200,80 L 320,100" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" />
              <path d="M 80,100 L 140,240" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1.5" />
              <path d="M 200,80 L 200,200" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="2" className="animate-dash" />
              <path d="M 320,100 L 260,240" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1.5" />
              <path d="M 140,240 L 200,200" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="1.5" />
              <path d="M 260,240 L 200,200" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="1.5" />
              <path d="M 140,240 L 200,320" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" />
              <path d="M 260,240 L 200,320" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1.5" />
              <path d="M 200,200 L 200,320" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="2" className="animate-dash" />

              {/* Pulsing connections */}
              <circle cx="200" cy="80" r="4" fill="#6366f1" className="animate-pulse" />
              <circle cx="200" cy="200" r="5" fill="#22d3ee" className="animate-pulse" />
              <circle cx="200" cy="320" r="4" fill="#6366f1" className="animate-pulse" />

              {/* Node Outer Rings (Glassy) */}
              <circle cx="80" cy="100" r="28" fill="rgba(30, 41, 59, 0.6)" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <circle cx="320" cy="100" r="28" fill="rgba(30, 41, 59, 0.6)" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <circle cx="200" cy="80" r="32" fill="rgba(99, 102, 241, 0.08)" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1.5" className="animate-pulse-glow" />
              <circle cx="200" cy="200" r="40" fill="rgba(34, 211, 238, 0.08)" stroke="rgba(34, 211, 238, 0.3)" strokeWidth="1.5" className="animate-pulse-glow" style={{ animationDelay: '1s' }} />
              <circle cx="200" cy="320" r="30" fill="rgba(30, 41, 59, 0.6)" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <circle cx="140" cy="240" r="24" fill="rgba(30, 41, 59, 0.6)" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <circle cx="260" cy="240" r="24" fill="rgba(30, 41, 59, 0.6)" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

              {/* Icons / Graphics Inside Nodes */}
              {/* Center Core Node */}
              <path d="M 195,190 L 205,190 M 192,200 L 208,200 M 196,210 L 204,210" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
              {/* Top Engine Node */}
              <polygon points="200,68 212,86 188,86" fill="rgba(99, 102, 241, 0.6)" />
              {/* Left Client Node */}
              <rect x="70" y="90" width="20" height="20" rx="4" fill="rgba(6, 182, 212, 0.3)" stroke="#06b6d4" strokeWidth="1.5" />
              {/* Right Output Node */}
              <rect x="310" y="90" width="20" height="20" rx="4" fill="rgba(6, 182, 212, 0.3)" stroke="#06b6d4" strokeWidth="1.5" />
              {/* Bottom Storage Node */}
              <circle cx="200" cy="320" r="10" fill="rgba(255,255,255,0.05)" stroke="#fff" strokeWidth="1.5" />

              {/* Chat Bubble simulation floating above */}
              <g transform="translate(40, 290)">
                <rect width="130" height="50" rx="12" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <circle cx="24" cy="25" r="10" fill="#6366f1" />
                <path d="M 21,25 L 27,25 M 24,22 L 24,28" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="42" y="16" width="70" height="6" rx="3" fill="rgba(255,255,255,0.3)" />
                <rect x="42" y="28" width="50" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
              </g>

              {/* Secondary Chat Bubble simulation */}
              <g transform="translate(230, 20)">
                <rect width="130" height="50" rx="12" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <circle cx="24" cy="25" r="10" fill="#22d3ee" />
                <path d="M 22,25 C 22,22 26,22 26,25 C 26,28 22,28 22,25" stroke="#fff" strokeWidth="1.5" fill="none" />
                <rect x="42" y="16" width="60" height="6" rx="3" fill="rgba(255,255,255,0.3)" />
                <rect x="42" y="28" width="75" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
              </g>
            </svg>

            {/* Shield Indicator Badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 rounded-full px-5 py-2 flex items-center gap-2 shadow-xl shadow-black/60">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">SSL Sandbox Secure</span>
            </div>

          </div>
        </section>

      </main>

      {/* Capabilities / Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5 bg-slate-950/20">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
            Designed for Speed and Built for Security
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Chatty AI Chat delivers a highly refined ecosystem optimized under Next.js and FastAPI boundaries.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-8 backdrop-blur-md hover:border-indigo-500/20 transition-all duration-300 hover:-translate-y-1">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-6">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Secure Sandbox Auth</h3>
            <p className="text-zinc-400 text-sm font-normal leading-relaxed">
              State tokens are kept inside HTTP-only cookies and memory. Custom profiles, avatar image uploads, and security keys are protected.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-8 backdrop-blur-md hover:border-indigo-500/20 transition-all duration-300 hover:-translate-y-1">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 mb-6">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multi-Model LLM Gateway</h3>
            <p className="text-zinc-400 text-sm font-normal leading-relaxed">
              Equipped with a multi-model selector allowing you to query DeepSeek V3, DeepSeek R1, Claude, and GPT models via OpenRouter.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-8 backdrop-blur-md hover:border-indigo-500/20 transition-all duration-300 hover:-translate-y-1">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 mb-6">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Image Generation</h3>
            <p className="text-zinc-400 text-sm font-normal leading-relaxed">
              Upgrade to Chatty Pro to unlock high-fidelity AI text-to-image prompts directly integrated inside your conversation history.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-6">
        <div>
          &copy; {new Date().getFullYear()} Chatty AI Core. Securely configured.
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>FastAPI and NextJS systems fully operational</span>
        </div>
      </footer>

    </div>
  );
}
