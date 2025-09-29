/**
 * Sign In Form Component with Biblical Theming
 */

'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Shield, Crown, Key, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { LoginCredentials } from '@/types/auth';
import { BiblicalCard } from '@/components/ui/BiblicalCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { clsx } from 'clsx';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  totpCode: z.string().optional(),
  rememberMe: z.boolean().default(false)
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInFormProps {
  callbackUrl?: string;
  className?: string;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  callbackUrl,
  className
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithCredentials, error, loading, clearError } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [requiresTOTP, setRequiresTOTP] = useState(false);

  const errorParam = searchParams?.get('error');
  const displayError = error || (errorParam ? getErrorMessage(errorParam) : null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      totpCode: '',
      rememberMe: false
    }
  });

  const watchedEmail = watch('email');

  const onSubmit = async (data: SignInFormData) => {
    try {
      clearError();

      const credentials: LoginCredentials = {
        email: data.email,
        password: data.password,
        totpCode: data.totpCode,
        rememberMe: data.rememberMe
      };

      await signInWithCredentials(credentials);

      // Redirect to callback URL or dashboard
      const redirectUrl = callbackUrl || '/dashboard';
      router.push(redirectUrl);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';

      // Check if TOTP is required
      if (errorMessage.includes('TOTP') || errorMessage.includes('2FA')) {
        setRequiresTOTP(true);
      }
    }
  };

  const handleForgotPassword = () => {
    if (watchedEmail) {
      router.push(`/auth/forgot-password?email=${encodeURIComponent(watchedEmail)}`);
    } else {
      router.push('/auth/forgot-password');
    }
  };

  const getBiblicalGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return {
        greeting: 'May His mercies be new this morning',
        reference: 'Lamentations 3:23',
        icon: <Crown className="w-5 h-5 text-amber-500" />
      };
    } else if (hour < 18) {
      return {
        greeting: 'Walk in His light this day',
        reference: '1 John 1:7',
        icon: <Shield className="w-5 h-5 text-blue-500" />
      };
    } else {
      return {
        greeting: 'Rest in His peace this evening',
        reference: 'Psalm 4:8',
        icon: <Key className="w-5 h-5 text-purple-500" />
      };
    }
  };

  const biblicalMessage = getBiblicalGreeting();

  return (
    <div className={clsx('w-full max-w-md mx-auto', className)}>
      <BiblicalCard variant="divine" className="overflow-hidden">
        {/* Header */}
        <div className="biblical-card-header text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="biblical-heading text-2xl text-gray-900 dark:text-white mb-2">
            Enter the Sacred Portal
          </h1>

          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            {biblicalMessage.icon}
            <span>{biblicalMessage.greeting}</span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
            {biblicalMessage.reference}
          </p>
        </div>

        {/* Error Message */}
        {displayError && (
          <div className="mx-6 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700 dark:text-red-300">
                {displayError}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="biblical-card-content space-y-4">
          {/* Email Field */}
          <div className="form-field">
            <label htmlFor="email" className="form-label">
              Sacred Email
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              className={clsx(
                'form-input',
                errors.email && 'border-red-500 focus:ring-red-500'
              )}
              placeholder="your@email.com"
              autoComplete="email"
            />
            {errors.email && (
              <p className="form-error">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="form-field">
            <label htmlFor="password" className="form-label">
              Divine Passphrase
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                className={clsx(
                  'form-input pr-10',
                  errors.password && 'border-red-500 focus:ring-red-500'
                )}
                placeholder="Enter your sacred passphrase"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="form-error">{errors.password.message}</p>
            )}
          </div>

          {/* TOTP Field */}
          {requiresTOTP && (
            <div className="form-field">
              <label htmlFor="totpCode" className="form-label">
                Divine Seal Code
              </label>
              <input
                {...register('totpCode')}
                type="text"
                id="totpCode"
                className={clsx(
                  'form-input text-center tracking-widest',
                  errors.totpCode && 'border-red-500 focus:ring-red-500'
                )}
                placeholder="000000"
                maxLength={6}
                autoComplete="one-time-code"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter the 6-digit code from your authenticator app
              </p>
              {errors.totpCode && (
                <p className="form-error">{errors.totpCode.message}</p>
              )}
            </div>
          )}

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                {...register('rememberMe')}
                type="checkbox"
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Remember my covenant
              </span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
            >
              Forgot passphrase?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className={clsx(
              'w-full py-3 px-4 rounded-lg font-medium transition-all duration-300',
              'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700',
              'text-white shadow-lg hover:shadow-xl biblical-glow',
              'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg',
              'transform hover:scale-105 active:scale-95'
            )}
          >
            {isSubmitting || loading ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner size="sm" color="primary" />
                <span>Seeking divine authorization...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Enter Sacred Realm</span>
              </div>
            )}
          </button>

          {/* Additional Options */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              New to the covenant?{' '}
              <button
                type="button"
                onClick={() => router.push('/auth/signup')}
                className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
              >
                Begin your journey
              </button>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="biblical-card-footer text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p className="biblical-text italic">
              "I am the way and the truth and the life. No one comes to the Father except through me."
            </p>
            <p className="font-medium">John 14:6</p>
          </div>
        </div>
      </BiblicalCard>
    </div>
  );
};

function getErrorMessage(error: string): string {
  switch (error) {
    case 'CredentialsSignin':
      return 'Invalid email or password. Please check your credentials.';
    case 'EmailNotVerified':
      return 'Please verify your email before signing in.';
    case 'AccountDisabled':
      return 'Your account has been disabled. Please contact support.';
    case 'SessionExpired':
      return 'Your session has expired. Please sign in again.';
    case 'BiblicalValidationFailed':
      return 'Divine validation failed. Please try again or contact support.';
    case 'TOTPRequired':
      return 'Two-factor authentication is required for your account.';
    case 'RateLimited':
      return 'Too many sign-in attempts. Please wait before trying again.';
    default:
      return 'An error occurred during sign in. Please try again.';
  }
}

export default SignInForm;