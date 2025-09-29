/**
 * Sign In Page
 * Main authentication entry point for C0RS0 Portal
 */

'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SignInForm from '@/components/auth/SignInForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-purple-900 p-4">
      <div className="w-full max-w-md">
        <SignInForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-purple-900">
        <LoadingSpinner size="lg" text="Loading authentication..." />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}