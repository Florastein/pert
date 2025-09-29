import React, { useState, useEffect, useRef } from 'react';
import type { Theme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { 
  FiArrowLeft, 
  FiUser, 
  FiMail, 
  FiLock, 
  FiLoader, 
  FiMoon, 
  FiSun, 
  FiEye, 
  FiEyeOff,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { ChatBubbleLeftRightIcon } from './icons';

interface AuthProps {
  theme: Theme;
  toggleTheme: () => void;
  onBack: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

interface LoadingStates {
  form: boolean;
  google: boolean;
}

const AuthHeader: React.FC<Pick<AuthProps, 'theme' | 'toggleTheme' | 'onBack'>> = ({ 
  theme, 
  toggleTheme, 
  onBack 
}) => {
  return (
    <header className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm sticky top-0 z-10 border-b ${theme === 'light' ? 'border-orange-100' : 'border-gray-600'} shadow-sm`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack} 
              className={`p-2 rounded-lg ${theme === 'light' ? 'text-gray-500 hover:bg-orange-50' : 'text-gray-400 hover:bg-gray-700'} transition-colors -ml-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2`}
              aria-label="Back to landing page"
            >
              <FiArrowLeft />
            </button>
            <div className="flex items-center gap-2">
              <ChatBubbleLeftRightIcon className={`w-6 h-6 ${theme === 'light' ? 'text-orange-500' : 'text-orange-400'}`} />
              <h1 className={`text-xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>Abstract</h1>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg ${theme === 'light' ? 'text-gray-500 hover:bg-orange-50' : 'text-gray-400 hover:bg-gray-700'} transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>
        </div>
      </nav>
    </header>
  );
};

type AuthMode = 'login' | 'signup';

export const Auth: React.FC<AuthProps> = ({ theme, toggleTheme, onBack }) => {
  const { signUp, logIn, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<LoadingStates>({ form: false, google: false });
  const [attempts, setAttempts] = useState(0);
  
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.backgroundColor = theme === 'light' ? "#FFFAF3" : "#1F2937";
    return () => { document.body.style.backgroundColor = ""; };
  }, [theme]);

  useEffect(() => {
    // Reset form when switching modes
    setErrors({});
    setPassword('');
    if (mode === 'login') {
      setName('');
    }
  }, [mode]);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, [mode]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (mode === 'signup') {
      if (!name.trim()) {
        newErrors.name = 'Name is required';
      } else if (name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password: string): { strength: number; text: string; color: string } => {
    if (password.length === 0) return { strength: 0, text: '', color: 'gray' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengths = [
      { text: 'Very Weak', color: 'red' },
      { text: 'Weak', color: 'orange' },
      { text: 'Fair', color: 'yellow' },
      { text: 'Good', color: 'blue' },
      { text: 'Strong', color: 'green' }
    ];

    return { strength, ...strengths[strength] };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(prev => ({ ...prev, form: true }));
    setErrors({});

    try {
      if (mode === 'signup') {
        await signUp(name.trim(), email, password);
      } else {
        await logIn(email, password);
      }
      setAttempts(0); // Reset attempts on successful auth
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred.';
      setErrors({ general: errorMessage });
      setAttempts(prev => prev + 1);
    } finally {
      setIsLoading(prev => ({ ...prev, form: false }));
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(prev => ({ ...prev, google: true }));
    setErrors({});

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrors({ general: err.message || 'An unexpected error occurred.' });
    } finally {
      setIsLoading(prev => ({ ...prev, google: false }));
    }
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
  };

  const passwordStrength = mode === 'signup' ? getPasswordStrength(password) : null;

  const commonInputClasses = `w-full ${theme === 'light' ? 'bg-white border-gray-200 text-gray-700' : 'bg-gray-700 border-gray-600 text-gray-100'} border rounded-lg py-3 px-4 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm transition-colors`;

  const getInputClasses = (field: keyof FormErrors) => {
    const baseClasses = commonInputClasses;
    if (errors[field]) {
      return `${baseClasses} border-red-300 dark:border-red-500 pr-10`;
    }
    return baseClasses;
  };

  // Theme-based text colors
  const textPrimary = theme === 'light' ? 'text-gray-900' : 'text-gray-100';
  const textSecondary = theme === 'light' ? 'text-gray-600' : 'text-gray-300';
  const textMuted = theme === 'light' ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-orange-50' : 'bg-gray-800'}`}>
      <AuthHeader theme={theme} toggleTheme={toggleTheme} onBack={onBack} />
      
      <div className="max-w-md mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold mb-2 ${textPrimary}`}>
            {mode === 'login' ? 'Welcome back to Abstract' : 'Create your account'}
          </h2>
          <p className={textSecondary}>
            {mode === 'login' ? 'Log in to manage your AI chatbots' : 'Get started with your own AI assistants'}
          </p>
        </div>
        
        <div className={`${theme === 'light' ? 'bg-white border-orange-100' : 'bg-gray-700 border-gray-600'} p-8 rounded-xl border shadow-sm`}>
          <div className={`flex border-b ${theme === 'light' ? 'border-gray-200' : 'border-gray-600'} mb-6`}>
            <button 
              onClick={() => handleModeChange('login')} 
              className={`flex-1 pb-3 text-center font-medium transition-colors ${
                mode === 'login' 
                  ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-500 dark:border-orange-400' 
                  : `${textMuted} hover:${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`
              }`}
            >
              Log In
            </button>
            <button 
              onClick={() => handleModeChange('signup')} 
              className={`flex-1 pb-3 text-center font-medium transition-colors ${
                mode === 'signup' 
                  ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-500 dark:border-orange-400' 
                  : `${textMuted} hover:${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className={`block text-sm font-medium mb-1 ${textPrimary}`}>
                  Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FiUser />
                  </div>
                  <input 
                    type="text" 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                    placeholder="Your name" 
                    className={`${getInputClasses('name')} pl-10`}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <FiX />
                    </div>
                  )}
                </div>
                {errors.name && (
                  <p id="name-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                    <FiX />
                    {errors.name}
                  </p>
                )}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-1 ${textPrimary}`}>
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiMail />
                </div>
                <input 
                  ref={emailInputRef}
                  type="email" 
                  id="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  placeholder="email@example.com" 
                  className={`${getInputClasses('email')} pl-10`}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email ? (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <FiX />
                  </div>
                ) : email && validateEmail(email) && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <FiCheck />
                  </div>
                )}
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <FiX />
                  {errors.email}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-1 ${textPrimary}`}>
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiLock />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  minLength={6} 
                  placeholder="••••••••" 
                  className={`${getInputClasses('password')} pl-10 pr-10`}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center ${textMuted} hover:${theme === 'light' ? 'text-gray-600' : 'text-gray-200'} transition-colors`}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              
              {mode === 'signup' && password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs ${textMuted}`}>Password strength:</span>
                    <span className={`text-xs font-medium text-${passwordStrength?.color}-600`}>
                      {passwordStrength?.text}
                    </span>
                  </div>
                  <div className={`w-full ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-600'} rounded-full h-1`}>
                    <div 
                      className={`h-1 rounded-full bg-${passwordStrength?.color}-500 transition-all duration-300`}
                      style={{ width: `${(passwordStrength?.strength || 0) * 25}%` }}
                    />
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <FiX />
                  {errors.password}
                </p>
              )}
            </div>

            {errors.general && (
              <div className={`p-3 text-sm ${theme === 'light' ? 'text-red-700 bg-red-50 border-red-200' : 'text-red-400 bg-red-900/20 border-red-800'} rounded-lg border flex items-center gap-2`}>
                <FiX />
                {errors.general}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading.form || isLoading.google}
              className="w-full flex justify-center items-center gap-2 px-4 py-3 rounded-lg font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              {isLoading.form ? (
                <>
                  <FiLoader />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Log In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          <div className="relative flex py-5 items-center">
            <div className={`flex-grow border-t ${theme === 'light' ? 'border-gray-200' : 'border-gray-600'}`}></div>
            <span className={`flex-shrink mx-4 text-sm ${textMuted}`}>or continue with</span>
            <div className={`flex-grow border-t ${theme === 'light' ? 'border-gray-200' : 'border-gray-600'}`}></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading.form || isLoading.google}
            className={`w-full flex justify-center items-center gap-3 px-4 py-3 rounded-lg font-medium ${
              theme === 'light' 
                ? 'text-gray-700 bg-white hover:bg-gray-50 border-gray-200' 
                : 'text-gray-300 bg-gray-600 hover:bg-gray-500 border-gray-500'
            } border transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2`}
          >
            {isLoading.google ? (
              <FiLoader />
            ) : (
              <FcGoogle />
            )}
            <span>Google</span>
          </button>
        </div>

        <div className={`mt-6 text-center text-sm ${textMuted}`}>
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button 
                onClick={() => handleModeChange('signup')} 
                className="font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 focus:outline-none focus:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button 
                onClick={() => handleModeChange('login')} 
                className="font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300 focus:outline-none focus:underline"
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};