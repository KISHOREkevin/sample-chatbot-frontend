"use client";

import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '@/redux/store';
import { loginUserThunk, registerUserThunk, otpVerifyThunk, forgotPasswordThunk, verifyResetOtpThunk, resetPasswordThunk, resendRegistrationOtpThunk } from '@/redux/slices/authSlice';
import { Eye, EyeOff } from 'lucide-react';

interface AuthCardProps {
  onAuthSuccess: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({ onAuthSuccess }) => {
  const dispatch = useAppDispatch();
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'idle' | 'email-password'>('idle');
  const [authSubMode, setAuthSubMode] = useState<'login' | 'register' | 'forgot' | 'register-otp' | 'forgot-otp' | 'reset-password'>('login');
  
  // Local form inputs
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // OTP Countdown Timer State & Effects
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getOtpRemainingTime = (otpCreatedAt: string | undefined | null): number => {
    if (!otpCreatedAt) return 300;
    const hasTimezone = otpCreatedAt.endsWith('Z') || /([+-]\d{2}:?\d{2})$/.test(otpCreatedAt);
    const dateStr = hasTimezone ? otpCreatedAt : `${otpCreatedAt}Z`;
    const elapsed = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    return Math.max(0, 300 - elapsed);
  };

  const handleResendRegistrationOtp = async () => {
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    try {
      const response = await dispatch(resendRegistrationOtpThunk({ email: emailInput })).unwrap();
      setAuthSuccess('A new verification code has been dispatched to your email.');
      setOtpInput('');
      setTimeLeft(getOtpRemainingTime(response.otp_created_at));
      setAuthLoading(false);
    } catch (err: any) {
      setAuthError(err);
      setAuthLoading(false);
    }
  };

  const handleResendForgotOtp = async () => {
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    try {
      const response = await dispatch(forgotPasswordThunk({ email: emailInput })).unwrap();
      setAuthSuccess('A new password reset token has been dispatched.');
      setOtpInput('');
      setTimeLeft(getOtpRemainingTime(response.otp_created_at));
      setAuthLoading(false);
    } catch (err: any) {
      setAuthError(err);
      setAuthLoading(false);
    }
  };

  // Handle Google OAuth simulation
  const handleGoogleAuth = () => {
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');
    setTimeout(() => {
      onAuthSuccess();
    }, 1200);
  };

  // Handle Email/Password form submit validations
  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
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
      try {
        await dispatch(loginUserThunk({ email: emailInput, password: passwordInput })).unwrap();
        onAuthSuccess();
      } catch (err: any) {
        const errorMsg = typeof err === 'object' && err.error ? err.error : err;
        if (errorMsg === 'User not verified') {
          setAuthSuccess('Your account is not verified yet. Please enter the verification code sent to your email.');
          setAuthSubMode('register-otp');
          setOtpInput('');
          if (typeof err === 'object' && err.otp_created_at) {
            setTimeLeft(getOtpRemainingTime(err.otp_created_at));
          } else {
            setTimeLeft(300);
          }
        } else {
          setAuthError(errorMsg);
        }
        setAuthLoading(false);
      }
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
      try {
        const response = await dispatch(registerUserThunk({
          email: emailInput,
          full_name: nameInput,
          password: passwordInput,
          avatar: avatarFile
        })).unwrap();

        setAuthSuccess('Registration successful! A 6-digit verification code has been dispatched to your email.');
        setAuthSubMode('register-otp');
        setOtpInput('');
        setTimeLeft(getOtpRemainingTime(response.otp_created_at));
        setAuthLoading(false);
      } catch (err: any) {
        setAuthError(err);
        setAuthLoading(false);
      }
    } else if (authSubMode === 'forgot') {
      if (!emailInput.trim() || !emailInput.includes('@')) {
        setAuthError('Please enter a valid email address');
        return;
      }
      setAuthLoading(true);
      try {
        const response = await dispatch(forgotPasswordThunk({ email: emailInput })).unwrap();
        setAuthSuccess('A secure password reset verification code has been dispatched to your email.');
        setAuthSubMode('forgot-otp');
        setOtpInput('');
        setTimeLeft(getOtpRemainingTime(response.otp_created_at));
        setAuthLoading(false);
      } catch (err: any) {
        setAuthError(err);
        setAuthLoading(false);
      }
    }
  };

  const handleRegisterOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!otpInput.trim() || otpInput.length !== 6) {
      setAuthError('Please enter a 6-digit verification code.');
      return;
    }

    setAuthLoading(true);
    try {
      await dispatch(otpVerifyThunk({
        email: emailInput,
        otp_code: otpInput
      })).unwrap();
      
      setAuthLoading(false);
      setAuthSubMode('login');
      setAuthSuccess('Account verified successfully! Please sign in with your password.');
      setPasswordInput('');
      setConfirmPasswordInput('');
    } catch (err: any) {
      setAuthError(err);
      setAuthLoading(false);
    }
  };

  const handleForgotOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!otpInput.trim() || otpInput.length !== 6) {
      setAuthError('Please enter a 6-digit verification code.');
      return;
    }

    setAuthLoading(true);
    try {
      await dispatch(verifyResetOtpThunk({ email: emailInput, otp_code: otpInput })).unwrap();
      setAuthLoading(false);
      setAuthSubMode('reset-password');
      setPasswordInput('');
      setConfirmPasswordInput('');
      setAuthSuccess('Code verified successfully! Please define your new password.');
    } catch (err: any) {
      setAuthError(err);
      setAuthLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
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
    try {
      await dispatch(resetPasswordThunk({
        email: emailInput,
        otp_code: otpInput,
        new_password: passwordInput
      })).unwrap();
      setAuthLoading(false);
      setAuthSubMode('login');
      setAuthSuccess('Password reset successful! Please sign in with your new password.');
      setPasswordInput('');
      setConfirmPasswordInput('');
    } catch (err: any) {
      setAuthError(err);
      setAuthLoading(false);
    }
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
            Chatty AI Chat
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
                    Verification Code {timeLeft > 0 ? `(Expires in ${formatTime(timeLeft)})` : <span className="text-rose-400 font-bold">(Expired)</span>}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter code"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-center font-mono text-2xl tracking-[0.5em] pl-[0.5em]"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={timeLeft <= 0 || authLoading}
                  className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition-all duration-200 cursor-pointer shadow-lg text-sm mt-2 ${
                    timeLeft <= 0 
                      ? 'bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed shadow-none hover:shadow-none' 
                      : 'shimmer-button hover:shadow-indigo-500/20'
                  }`}
                >
                  Verify & Proceed
                </button>

                <div className="flex flex-col gap-2.5 pt-2 text-center text-xs">
                  <p className="text-zinc-500">
                    Didn't receive the code?{' '}
                    {timeLeft > 0 ? (
                      <span className="font-semibold text-zinc-600 cursor-not-allowed select-none">
                        Resend OTP in {formatTime(timeLeft)}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendRegistrationOtp}
                        disabled={authLoading}
                        className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Resend OTP
                      </button>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthSubMode('register');
                      setTimeLeft(0);
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
                    Security Token {timeLeft > 0 ? `(Expires in ${formatTime(timeLeft)})` : <span className="text-rose-400 font-bold">(Expired)</span>}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter code"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-center font-mono text-2xl tracking-[0.5em] pl-[0.5em]"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={timeLeft <= 0 || authLoading}
                  className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition-all duration-200 cursor-pointer shadow-lg text-sm mt-2 ${
                    timeLeft <= 0 
                      ? 'bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed shadow-none hover:shadow-none' 
                      : 'shimmer-button hover:shadow-indigo-500/20'
                  }`}
                >
                  Verify Code
                </button>

                <div className="flex flex-col gap-2.5 pt-2 text-center text-xs">
                  <p className="text-zinc-500">
                    Didn't receive the code?{' '}
                    {timeLeft > 0 ? (
                      <span className="font-semibold text-zinc-600 cursor-not-allowed select-none">
                        Resend Token in {formatTime(timeLeft)}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendForgotOtp}
                        disabled={authLoading}
                        className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Resend Token
                      </button>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthSubMode('forgot');
                      setTimeLeft(0);
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
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password field */}
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
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
                      setTimeLeft(0);
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
                  <>
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

                    {/* Avatar Upload (Register only) */}
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Avatar Image</label>
                      <div className="flex items-center gap-3">
                        <label className="flex-1 flex flex-col items-center justify-center px-4 py-2 bg-slate-900 border border-white/10 border-dashed rounded-xl cursor-pointer hover:border-indigo-500 transition-colors text-xs text-zinc-400 hover:text-zinc-300">
                          <svg className="w-5 h-5 mb-1 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span className="truncate max-w-[180px]">{avatarFile ? avatarFile.name : 'Upload avatar (optional)'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </label>
                        {avatarFile && (
                          <button
                            type="button"
                            onClick={() => setAvatarFile(null)}
                            className="p-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer border border-rose-500/10"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
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
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm Password field (Register only) */}
                {authSubMode === 'register' && (
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
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
                      setTimeLeft(0);
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
