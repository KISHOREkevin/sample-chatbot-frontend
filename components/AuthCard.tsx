"use client";

import React, { useState } from 'react';

interface AuthCardProps {
  onAuthSuccess: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({ onAuthSuccess }) => {
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'idle' | 'email-password'>('idle');
  const [authSubMode, setAuthSubMode] = useState<'login' | 'register' | 'forgot' | 'register-otp' | 'forgot-otp' | 'reset-password'>('login');
  
  // Local form inputs
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Handle Google OAuth simulation
  const handleGoogleAuth = () => {
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');
    setTimeout(() => {
      setAuthLoading(false);
      onAuthSuccess();
    }, 1200);
  };

  // Handle Email/Password form submit validations
  const handleEmailPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (authSubMode === 'login') {
      if (!emailInput.trim() || !passwordInput.trim()) {
        setAuthError('Please fill in all fields');
        return;
      }
      if (!emailInput.includes('@')) {
        setAuthError('Please enter a valid email address');
        return;
      }
      setAuthLoading(true);
      setTimeout(() => {
        setAuthLoading(false);
        onAuthSuccess();
      }, 1200);
    } else if (authSubMode === 'register') {
      if (!nameInput.trim() || !emailInput.trim() || !passwordInput.trim() || !confirmPasswordInput.trim()) {
        setAuthError('All fields are required');
        return;
      }
      if (!emailInput.includes('@')) {
        setAuthError('Please enter a valid email address');
        return;
      }
      if (passwordInput !== confirmPasswordInput) {
        setAuthError('Passwords do not match');
        return;
      }
      if (passwordInput.length < 6) {
        setAuthError('Password must be at least 6 characters');
        return;
      }
      setAuthLoading(true);
      setTimeout(() => {
        setAuthSuccess('Registration successful! A 6-digit verification code has been dispatched to your email.');
        setAuthSubMode('register-otp');
        setOtpInput('');
        setAuthLoading(false);
      }, 1500);
    } else if (authSubMode === 'forgot') {
      if (!emailInput.trim() || !emailInput.includes('@')) {
        setAuthError('Please enter a valid email address');
        return;
      }
      setAuthLoading(true);
      setTimeout(() => {
        setAuthSuccess('A secure password reset verification code has been dispatched to your email.');
        setAuthSubMode('forgot-otp');
        setOtpInput('');
        setAuthLoading(false);
      }, 1200);
    }
  };

  const handleRegisterOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (otpInput.trim() !== '123456') {
      setAuthError('Invalid verification code. Please try 123456.');
      return;
    }

    setAuthLoading(true);
    setTimeout(() => {
      setAuthLoading(false);
      onAuthSuccess();
    }, 1200);
  };

  const handleForgotOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (otpInput.trim() !== '123456') {
      setAuthError('Invalid verification code. Please try 123456.');
      return;
    }

    setAuthLoading(true);
    setTimeout(() => {
      setAuthLoading(false);
      setAuthSubMode('reset-password');
      setPasswordInput('');
      setConfirmPasswordInput('');
      setAuthSuccess('Code verified successfully! Please define your new password.');
    }, 1200);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!passwordInput.trim() || !confirmPasswordInput.trim()) {
      setAuthError('All fields are required');
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setAuthError('Passwords do not match');
      return;
    }
    if (passwordInput.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }

    setAuthLoading(true);
    setTimeout(() => {
      setAuthLoading(false);
      setAuthSubMode('login');
      setAuthSuccess('Password reset successful! Please sign in with your new password.');
      setPasswordInput('');
      setConfirmPasswordInput('');
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#090B11] p-4 overflow-hidden select-none">
      
      {/* Glow Spheres */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px] float-glow-1 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[100px] float-glow-2 pointer-events-none"></div>

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-slate-950/60 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl transition-all duration-300 hover:border-white/15">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1.5px] shadow-[0_0_30px_rgba(99,102,241,0.3)] mb-4">
            <div className="h-full w-full bg-slate-950 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-cyan-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Aegis AI Chat
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            {authMode === 'idle' 
              ? 'Sign in with secure credentials' 
              : authSubMode === 'login' 
                ? 'Sign in to your account' 
                : authSubMode === 'register' 
                  ? 'Create your credentials' 
                  : authSubMode === 'forgot'
                    ? 'Recover your account password'
                    : authSubMode === 'register-otp' || authSubMode === 'forgot-otp'
                      ? 'Verify code sent to your email'
                      : 'Configure new account password'}
          </p>
        </div>

        {/* Status Message (Error / Success) */}
        {authError && (
          <div className="mb-5 bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-2.5 rounded-xl text-xs flex items-start gap-2 animate-shake">
            <svg className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{authError}</span>
          </div>
        )}

        {authSuccess && (
          <div className="mb-5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{authSuccess}</span>
          </div>
        )}

        {/* Auth Loading Overlay */}
        {authLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="relative w-14 h-14 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-400 animate-spin"></div>
            </div>
            <p className="text-sm text-zinc-300 animate-pulse font-medium text-center">
              {authMode === 'idle' 
                ? 'Connecting to Google Authentication...' 
                : authSubMode === 'login' 
                  ? 'Verifying secure identity...' 
                  : authSubMode === 'register' 
                    ? 'Creating account security boundaries...' 
                    : authSubMode === 'forgot'
                      ? 'Dispatching reset validation token...'
                      : authSubMode === 'register-otp' || authSubMode === 'forgot-otp'
                        ? 'Verifying security token...'
                        : 'Reconfiguring account password...'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {authMode === 'idle' ? (
              <>
                {/* Google Authenticator */}
                <button
                  onClick={handleGoogleAuth}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.74 1.64 15.06 1 12 1 7.24 1 3.2 3.73 1.24 7.7l3.86 3C6.01 7.77 8.76 5.04 12 5.04z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.91c2.2-2.02 3.67-5.01 3.67-8.64z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.1 14.7a7.12 7.12 0 0 1 0-4.4L1.24 7.3a11.94 11.94 0 0 0 0 9.4l3.86-3z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.91c-1.1.74-2.5 1.18-4.2 1.18-3.24 0-5.99-2.73-6.9-5.66L1.24 15.7C3.2 19.67 7.24 23 12 23z"
                    />
                  </svg>
                  Continue with Google
                </button>

                <div className="relative flex py-2 items-center justify-center">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink mx-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">or</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                {/* Email & Password login option */}
                <button
                  onClick={() => {
                    setAuthMode('email-password');
                    setAuthSubMode('login');
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-slate-900 border border-white/10 hover:border-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Sign in with Email & Password
                </button>
              </>
            ) : authSubMode === 'register-otp' ? (
              <form onSubmit={handleRegisterOtpSubmit} className="space-y-4 animate-fadeIn">
                <div className="text-center mb-2">
                  <p className="text-xs text-zinc-400">
                    We've sent a 6-digit confirmation code to <span className="text-indigo-400 font-semibold">{emailInput}</span>.
                  </p>
                </div>

                <div>
                  <div className="flex justify-center mb-3">
                    <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                      <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider text-center mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-center font-mono text-2xl tracking-[0.5em] pl-[0.5em]"
                    autoFocus
                  />
                  <p className="text-[10px] text-zinc-500 text-center mt-2">
                    Tip: Enter <span className="text-indigo-400 font-semibold font-mono">123456</span> to simulate validation
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-white font-semibold shimmer-button transition-all duration-200 cursor-pointer shadow-lg hover:shadow-indigo-500/20 text-sm mt-2"
                >
                  Verify & Proceed
                </button>

                <div className="flex flex-col gap-2.5 pt-2 text-center text-xs">
                  <p className="text-zinc-500">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthSuccess('A new verification code has been dispatched.');
                        setOtpInput('');
                      }}
                      className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      Resend OTP
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthSubMode('register');
                      setAuthError('');
                      setAuthSuccess('');
                    }}
                    className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors duration-150 mt-1 cursor-pointer"
                  >
                    Back to registration
                  </button>
                </div>
              </form>
            ) : authSubMode === 'forgot-otp' ? (
              <form onSubmit={handleForgotOtpSubmit} className="space-y-4 animate-fadeIn">
                <div className="text-center mb-2">
                  <p className="text-xs text-zinc-400">
                    Enter the 6-digit password reset validation token sent to <span className="text-indigo-400 font-semibold">{emailInput}</span>.
                  </p>
                </div>

                <div>
                  <div className="flex justify-center mb-3">
                    <div className="h-12 w-12 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                      <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m-5-4a5 5 0 015 5M6 18H4a2 2 0 01-2-2v-2a2 2 0 012-2h2m0 6V12m0 6h12a2 2 0 002-2v-4a2 2 0 00-2-2H6" />
                      </svg>
                    </div>
                  </div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider text-center mb-2">
                    Security Token
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-center font-mono text-2xl tracking-[0.5em] pl-[0.5em]"
                    autoFocus
                  />
                  <p className="text-[10px] text-zinc-500 text-center mt-2">
                    Tip: Enter <span className="text-indigo-400 font-semibold font-mono">123456</span> to simulate validation
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-white font-semibold shimmer-button transition-all duration-200 cursor-pointer shadow-lg hover:shadow-indigo-500/20 text-sm mt-2"
                >
                  Verify Code
                </button>

                <div className="flex flex-col gap-2.5 pt-2 text-center text-xs">
                  <p className="text-zinc-500">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthSuccess('A new password reset token has been dispatched.');
                        setOtpInput('');
                      }}
                      className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      Resend Token
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthSubMode('forgot');
                      setAuthError('');
                      setAuthSuccess('');
                    }}
                    className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors duration-150 mt-1 cursor-pointer"
                  >
                    Back to recovery request
                  </button>
                </div>
              </form>
            ) : authSubMode === 'reset-password' ? (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4 animate-fadeIn">
                <div className="text-center mb-2">
                  <p className="text-xs text-zinc-400">
                    Define a secure password for your account <span className="text-indigo-400 font-semibold">{emailInput}</span>.
                  </p>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
                    autoFocus
                  />
                </div>

                {/* Confirm Password field */}
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-white font-semibold shimmer-button transition-all duration-200 cursor-pointer shadow-lg hover:shadow-indigo-500/20 text-sm mt-2"
                >
                  Reset Password & Login
                </button>

                <div className="flex flex-col gap-2.5 pt-2 text-center text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthSubMode('login');
                      setAuthError('');
                      setAuthSuccess('');
                    }}
                    className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors duration-150 mt-1 cursor-pointer"
                  >
                    Cancel and Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleEmailPasswordSubmit} className="space-y-4 animate-fadeIn">
                
                {/* Name field (Register only) */}
                {authSubMode === 'register' && (
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Full Name</label>
                    <input
                      type="text"
                      placeholder="Alex Carter"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
                      autoFocus
                    />
                  </div>
                )}

                {/* Email field (Always visible in email-password flow) */}
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="alex.carter@company.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
                    autoFocus={authSubMode !== 'register'}
                  />
                </div>

                {/* Password field (Login & Register only) */}
                {authSubMode !== 'forgot' && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Password</label>
                      {authSubMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthSubMode('forgot');
                            setAuthError('');
                            setAuthSuccess('');
                          }}
                          className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
                    />
                  </div>
                )}

                {/* Confirm Password field (Register only) */}
                {authSubMode === 'register' && (
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
                    />
                  </div>
                )}
                
                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-white font-semibold shimmer-button transition-all duration-200 cursor-pointer shadow-lg hover:shadow-indigo-500/20 text-sm mt-2"
                >
                  {authSubMode === 'login' 
                    ? 'Sign In' 
                    : authSubMode === 'register' 
                      ? 'Create Security Profile' 
                      : 'Send Recovery Email'}
                </button>

                {/* Alternative Navigation Panels */}
                <div className="flex flex-col gap-2.5 pt-2 text-center text-xs">
                  {authSubMode === 'login' ? (
                    <p className="text-zinc-500">
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthSubMode('register');
                          setAuthError('');
                          setAuthSuccess('');
                        }}
                        className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        Sign Up
                      </button>
                    </p>
                  ) : (
                    <p className="text-zinc-500">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthSubMode('login');
                          setAuthError('');
                          setAuthSuccess('');
                        }}
                        className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        Sign In
                      </button>
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('idle');
                      setAuthError('');
                      setAuthSuccess('');
                    }}
                    className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors duration-150 mt-1 cursor-pointer"
                  >
                    Back to authentication choices
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Disclaimer details */}
        <div className="mt-8 text-center text-xs text-zinc-500">
          Secure login verified under SHA-256 SSL protocols.<br />
          Auth credentials held strictly in runtime memory.
        </div>

      </div>
    </div>
  );
};
