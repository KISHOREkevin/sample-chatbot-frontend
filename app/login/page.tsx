"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthCard } from '../../components/AuthCard';

export default function LoginPage() {
  const router = useRouter();
  
  return (
    <AuthCard onAuthSuccess={() => router.push('/chat')} />
  );
}
