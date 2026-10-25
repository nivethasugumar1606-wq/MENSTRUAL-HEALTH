import React, { useState } from 'react';
import { AgeBand, PeriodStatus } from '../../../../shared/types/index.js';
import {
  Calendar,
  Sparkles,
  Shield,
  Heart,
  ArrowRight,
  BookOpen,
  Lock,
  AlertCircle,
  X
} from 'lucide-react';
import { NurturaLogoIcon } from '../../components/common/NurturaLogoIcon.js';

interface WelcomeOnboardingProps {
  onRegister: (payload: {
    username: string;
    password: string;
    nickname: string;
    ageBand: AgeBand;
    periodStatus: PeriodStatus;
  }) => Promise<void>;
  onLogin: (credentials: { username: string; password: string }) => Promise<void>;
  onExploreWithoutAccount: () => void;
}

export const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({
  onRegister,
  onLogin,
  onExploreWithoutAccount
}) => {
  const [mode, setMode] = useState<'welcome' | 'register' | 'login'>('welcome');

  // Register state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [ageBand, setAgeBand] = useState<AgeBand>('13-14');
  const [periodStatus, setPeriodStatus] = useState<PeriodStatus>('not_started');

  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username.trim().length < 3) {
      setError('Please choose a username with at least 3 letters.');
      return;
    }
    if (password.length < 6) {
      setError('Please choose a password with at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await onRegister({
        username: username.trim().toLowerCase(),
        password,
        nickname: nickname.trim() || 'Friend',
        ageBand,
        periodStatus
      });
    } catch (err: any) {
      setError(err?.message || 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await onLogin({
        username: loginUsername.trim().toLowerCase(),
        password: loginPassword
      });
    } catch (err: any) {
      setError(err?.message || 'Incorrect username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#F5EFF8] text-[#342C40] min-h-screen flex flex-col justify-between select-none">
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="w-full border-b border-[#D7C4E8]/40 bg-[#F5EFF8]">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          {/* Left Brand */}
          <div className="flex items-center gap-2.5">
            <NurturaLogoIcon size={26} />
            <span className="font-extrabold text-[#342C40] text-xl tracking-tight">
              Nurtura
            </span>
          </div>

          {/* Right Links & Sign in */}
          <div className="flex items-center gap-5 sm:gap-7">
            <button
              type="button"
              onClick={onExploreWithoutAccount}
              className="text-sm font-semibold text-[#765477] hover:text-[#342C40] transition cursor-pointer"
            >
              Explore lessons
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode('login');
              }}
              className="border border-[#765477]/60 hover:border-[#342C40] text-sm font-bold text-[#342C40] px-5 py-1.5 rounded-full hover:bg-white/80 transition cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN HERO SECTION */}
      <section className="w-full">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-10 sm:pt-14 pb-16 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column Text & Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-[#342C40] leading-[1.12] tracking-tight">
                Learn about your body,{' '}
                <span className="text-[#8E6593]">at your own pace.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#765477] leading-relaxed max-w-xl font-normal">
                A comforting, private haven to learn about menstrual cycles, puberty, hygiene, and body changes with zero pressure.
              </p>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('register');
                  }}
                  className="px-6 sm:px-7 py-3.5 rounded-2xl bg-[#765477] hover:bg-[#634264] text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition flex items-center gap-2 group cursor-pointer"
                >
                  <span>Create my private account</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={onExploreWithoutAccount}
                  className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#765477] hover:text-[#342C40] transition cursor-pointer py-2"
                >
                  <BookOpen size={18} />
                  <span>Explore lessons first</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-[#765477] pt-1">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('login');
                  }}
                  className="font-bold underline text-[#342C40] hover:text-[#765477] transition cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            </div>

            {/* Right Column Illustration Panel */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-white rounded-3xl border border-[#D7C4E8] shadow-sm p-5 sm:p-6 w-full max-w-[340px] sm:max-w-[360px] flex flex-col items-center relative overflow-hidden">
                {/* Welcome message bubble at top */}
                <div className="w-full text-center py-2.5 px-3 rounded-2xl border border-[#D7C4E8] bg-white text-[#342C40] font-bold text-xs sm:text-sm shadow-2xs leading-snug mb-3">
                  Hi! Welcome to Nurtura, your gentle body science friend
                </div>

                {/* Hero Illustration Artwork */}
                <div className="relative w-full flex items-center justify-center">
                  <img
                    src="/illustrations/hero-illustration-art.png"
                    alt="Nurtura friend"
                    className="w-full h-auto object-contain select-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. GOOD TO KNOW BEFORE YOU START SECTION */}
      <section className="w-full">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 pb-16 sm:pb-20">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#342C40] mb-8">
            Good to know before you start
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl border border-[#D7C4E8]/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-sm transition min-h-[200px]">
              <div className="w-10 h-10 rounded-xl bg-[#FDEAEF] flex items-center justify-center text-[#E26D7D] mb-4">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[#342C40] text-base mb-2">
                  Periods start at different ages
                </h3>
                <p className="text-xs sm:text-sm text-[#765477] leading-relaxed">
                  Anywhere between 9 and 16 is completely normal and healthy.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl border border-[#D7C4E8]/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-sm transition min-h-[200px]">
              <div className="w-10 h-10 rounded-xl bg-[#F4EBF7] flex items-center justify-center text-[#B48AB8] mb-4">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[#342C40] text-base mb-2">
                  Every cycle is unique
                </h3>
                <p className="text-xs sm:text-sm text-[#765477] leading-relaxed">
                  Forget rigid 28-day rules. Teen bodies have their own personal rhythms.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl border border-[#D7C4E8]/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-sm transition min-h-[200px]">
              <div className="w-10 h-10 rounded-xl bg-[#E8F4F8] flex items-center justify-center text-[#4A90A4] mb-4">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[#342C40] text-base mb-2">
                  Privacy comes first
                </h3>
                <p className="text-xs sm:text-sm text-[#765477] leading-relaxed">
                  We never collect full legal names, school names, or phone numbers.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-3xl border border-[#D7C4E8]/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-sm transition min-h-[200px]">
              <div className="w-10 h-10 rounded-xl bg-[#E8F7F0] flex items-center justify-center text-[#4EA87D] mb-4">
                <Heart size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[#342C40] text-base mb-2">
                  Education and care
                </h3>
                <p className="text-xs sm:text-sm text-[#765477] leading-relaxed">
                  Predictions are gentle estimates, not a medical diagnosis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW NURTURA WORKS SECTION */}
      <section className="w-full">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 pb-20 sm:pb-24">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#342C40] mb-8">
            How Nurtura works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#765477] text-white font-bold flex items-center justify-center shrink-0 text-base shadow-xs">
                1
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-[#342C40] text-lg">Learn</h3>
                <p className="text-xs sm:text-sm text-[#765477] leading-relaxed">
                  Short, friendly lessons on cycles, puberty, and hygiene.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#765477] text-white font-bold flex items-center justify-center shrink-0 text-base shadow-xs">
                2
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-[#342C40] text-lg">Track</h3>
                <p className="text-xs sm:text-sm text-[#765477] leading-relaxed">
                  Note how you feel and see your own pattern take shape.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#765477] text-white font-bold flex items-center justify-center shrink-0 text-base shadow-xs">
                3
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-[#342C40] text-lg">Bloom</h3>
                <p className="text-xs sm:text-sm text-[#765477] leading-relaxed">
                  Feel ready and confident about the changes ahead.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM CALL-TO-ACTION SECTION */}
      <footer className="w-full bg-[#342C40] text-white py-12 sm:py-16 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Ready to start, privately?
            </h2>
            <p className="text-sm sm:text-base text-[#D7C4E8]">
              No real name, no school, no phone number. Just you and Petal.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode('register');
            }}
            className="px-7 py-3.5 rounded-full bg-white hover:bg-[#FAF6FC] text-[#342C40] font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition flex items-center gap-2 shrink-0 group cursor-pointer"
          >
            <span>Create my private account</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </footer>

      {/* 6. REGISTER MODAL */}
      {mode === 'register' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#342C40]/60 backdrop-blur-xs animate-fade-in">
          <div className="bloom-card p-6 sm:p-8 bg-white border border-[#D7C4E8] rounded-3xl shadow-2xl max-w-lg w-full space-y-5 relative">
            <button
              type="button"
              onClick={() => setMode('welcome')}
              className="absolute top-5 right-5 text-bloom-dusty hover:text-bloom-plum p-1.5 rounded-full hover:bg-bloom-light transition cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-bloom-dusty bg-bloom-secondary/40 px-3 py-1 rounded-full inline-block">
                Free & Private Registration
              </span>
              <h2 className="text-2xl font-bold text-bloom-plum pt-1">Create Your Safe Account</h2>
              <p className="text-xs text-bloom-dusty">
                We only ask for minimal details to personalize your tracker
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs sm:text-sm text-left">
              <div>
                <label className="block font-bold text-bloom-plum mb-1">
                  Choose a Username (e.g. flowergirl21) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Secret username for logging in"
                  className="w-full px-3.5 py-2.5 bg-bloom-bg border border-bloom-border rounded-xl text-bloom-plum focus:outline-none focus:border-bloom-dusty"
                />
              </div>

              <div>
                <label className="block font-bold text-bloom-plum mb-1">
                  Password (at least 6 characters) <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-bloom-bg border border-bloom-border rounded-xl text-bloom-plum focus:outline-none focus:border-bloom-dusty"
                />
              </div>

              <div>
                <label className="block font-bold text-bloom-plum mb-1">
                  Friendly Nickname <span className="text-bloom-dusty font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Maya or Petal"
                  className="w-full px-3.5 py-2.5 bg-bloom-bg border border-bloom-border rounded-xl text-bloom-plum focus:outline-none focus:border-bloom-dusty"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-bloom-plum mb-1">
                    Your Age Band
                  </label>
                  <select
                    value={ageBand}
                    onChange={(e) => setAgeBand(e.target.value as AgeBand)}
                    className="w-full px-3 py-2 bg-bloom-bg border border-bloom-border rounded-xl font-semibold text-bloom-plum focus:outline-none focus:border-bloom-dusty cursor-pointer"
                  >
                    <option value="10-12">10 – 12 years old</option>
                    <option value="13-14">13 – 14 years old</option>
                    <option value="15-16">15 – 16 years old</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-bloom-plum mb-1">
                    Have you started periods?
                  </label>
                  <select
                    value={periodStatus}
                    onChange={(e) => setPeriodStatus(e.target.value as PeriodStatus)}
                    className="w-full px-3 py-2 bg-bloom-bg border border-bloom-border rounded-xl font-semibold text-bloom-plum focus:outline-none focus:border-bloom-dusty cursor-pointer"
                  >
                    <option value="not_started">Haven't started yet</option>
                    <option value="started_recently">Started recently</option>
                    <option value="tracking_regularly">Tracking regularly</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-bloom-bg border border-bloom-border text-[11px] text-bloom-dusty flex items-center gap-2">
                <Lock size={14} className="text-bloom-mauve shrink-0" />
                <span>We never ask for your email, full name, phone number, or home address.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-none cursor-pointer"
              >
                {loading ? 'Creating Account...' : 'Complete Safe Signup'}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-bloom-dusty">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setMode('login');
                    }}
                    className="font-bold underline text-bloom-plum hover:text-bloom-dusty cursor-pointer"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. LOGIN MODAL */}
      {mode === 'login' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#342C40]/60 backdrop-blur-xs animate-fade-in">
          <div className="bloom-card p-6 sm:p-8 bg-white border border-[#D7C4E8] rounded-3xl shadow-2xl max-w-md w-full space-y-5 relative">
            <button
              type="button"
              onClick={() => setMode('welcome')}
              className="absolute top-5 right-5 text-bloom-dusty hover:text-bloom-plum p-1.5 rounded-full hover:bg-bloom-light transition cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-bloom-dusty bg-bloom-secondary/40 px-3 py-1 rounded-full inline-block">
                Secure Sign In
              </span>
              <h2 className="text-2xl font-bold text-bloom-plum pt-1">Welcome Back!</h2>
              <p className="text-xs text-bloom-dusty">Sign in to access your private cycle vault</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs sm:text-sm text-left">
              <div>
                <label className="block font-bold text-bloom-plum mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Your username"
                  className="w-full px-3.5 py-2.5 bg-bloom-bg border border-bloom-border rounded-xl text-bloom-plum focus:outline-none focus:border-bloom-dusty"
                />
              </div>

              <div>
                <label className="block font-bold text-bloom-plum mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-bloom-bg border border-bloom-border rounded-xl text-bloom-plum focus:outline-none focus:border-bloom-dusty"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-none cursor-pointer"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('register');
                  }}
                  className="font-bold text-bloom-dusty hover:text-bloom-plum underline cursor-pointer"
                >
                  Need an account? Sign up
                </button>
                <button
                  type="button"
                  onClick={() => setMode('welcome')}
                  className="text-bloom-dusty hover:text-bloom-plum cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
