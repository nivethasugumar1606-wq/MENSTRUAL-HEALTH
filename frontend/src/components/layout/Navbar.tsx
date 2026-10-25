import React, { useState } from 'react';
import {
  Calendar,
  BookOpen,
  ShoppingBag,
  Heart,
  Award,
  Shield,
  Sparkles,
  BookMarked,
  Menu,
  X
} from 'lucide-react';
import { NurturaLogoIcon } from '../common/NurturaLogoIcon.js';
import { UserProfile } from '../../../../shared/types/index.js';

export type AppPage =
  | 'welcome'
  | 'tracker'
  | 'learning'
  | 'products'
  | 'journal'
  | 'progress'
  | 'settings';

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  user: UserProfile | null;
  totalPoints: number;
  onOpenGlossary: () => void;
  discreetMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  user,
  totalPoints,
  onOpenGlossary,
  discreetMode = false
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems: { page: AppPage; label: string; icon: React.ReactNode }[] = [
    { page: 'tracker', label: 'My Cycle', icon: <Calendar size={18} /> },
    { page: 'learning', label: 'Learn & Play', icon: <BookOpen size={18} /> },
    { page: 'products', label: 'Products Guide', icon: <ShoppingBag size={18} /> },
    { page: 'journal', label: 'Body Journal', icon: <Heart size={18} /> },
    { page: 'progress', label: 'My Progress', icon: <Award size={18} /> },
    { page: 'settings', label: 'Privacy & Settings', icon: <Shield size={18} /> }
  ];

  return (
    <>
      {/* Mobile Top Header with Hamburger Toggle (< md) */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-bloom-border px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl text-bloom-plum hover:bg-bloom-bg border border-bloom-border transition"
            aria-label="Open navigation sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            {discreetMode ? (
              <div className="w-7 h-7 rounded-lg bg-[#784E82] text-white flex items-center justify-center shrink-0">
                <BookOpen size={15} />
              </div>
            ) : (
              <NurturaLogoIcon size={24} />
            )}
            <div>
              <span className="font-extrabold text-bloom-plum text-base tracking-tight block leading-tight">
                {discreetMode ? 'Diary' : 'Nurtura'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch Portal Link */}
          <a
            href="/"
            className="text-[11px] font-bold text-bloom-dusty hover:text-bloom-plum bg-bloom-bg hover:bg-bloom-secondary/30 px-2 py-1 rounded-lg border border-bloom-border transition shrink-0"
            title="Return to Welcome Portal Selection"
          >
            ← Portals
          </a>

          {/* Medical Glossary Quick Button */}
          <button
            type="button"
            onClick={onOpenGlossary}
            className="p-2 rounded-xl text-bloom-dusty hover:text-bloom-plum hover:bg-bloom-bg border border-bloom-border transition"
            title="Open Medical Glossary"
          >
            <BookMarked size={18} className="text-bloom-mauve" />
          </button>

          {user ? (
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="w-9 h-9 rounded-xl bg-bloom-mauve text-white font-bold text-xs flex items-center justify-center shadow-sm"
              title={`Signed in as ${user.nickname}`}
            >
              {user.nickname.charAt(0).toUpperCase()}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('welcome')}
              className="btn-primary py-1.5 px-3 text-xs rounded-xl shadow-none"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Backdrop Overlay for Mobile Collapsible Sidebar */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-bloom-plum/40 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Vertical Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 lg:w-72 bg-white border-r border-bloom-border flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header inside Sidebar: Logo, Flower, Age Label, Subtitle */}
        <div className="p-5 border-b border-bloom-border shrink-0">
          <div className="flex items-start justify-between">
            <button
              onClick={() => {
                onNavigate(user ? 'tracker' : 'welcome');
                setIsMobileOpen(false);
              }}
              className="flex items-center gap-3 text-left group min-w-0"
            >
              {discreetMode ? (
                <div className="w-9 h-9 rounded-2xl bg-[#784E82] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <BookOpen size={18} />
                </div>
              ) : (
                <NurturaLogoIcon size={36} className="shrink-0" />
              )}
              <div className="min-w-0">
                <span className="font-extrabold text-bloom-plum text-lg tracking-tight block">
                  {discreetMode ? 'Diary' : 'Nurtura'}
                </span>
                {!discreetMode && (
                  <span className="text-[10px] font-bold text-bloom-mauve uppercase tracking-wider block">
                    Kids Portal
                  </span>
                )}
              </div>
            </button>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden p-1.5 rounded-xl text-bloom-dusty hover:text-bloom-plum hover:bg-bloom-bg transition shrink-0 ml-1"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-2.5 pt-2 border-t border-bloom-border/60 flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-bloom-dusty/70">
              Ages 10–16
            </span>
            <a
              href="/"
              className="text-[11px] font-bold text-bloom-dusty hover:text-bloom-plum bg-bloom-bg hover:bg-bloom-secondary/30 px-2 py-0.5 rounded-lg border border-bloom-border transition flex items-center gap-1"
              title="Return to Welcome Portal Selection"
            >
              <span>←</span>
              <span>Switch Portal</span>
            </a>
          </div>
        </div>

        {/* Navigation Items (Maintaining exact order and labels) */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-bloom-dusty/70">
            Menu
          </div>

          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                type="button"
                onClick={() => {
                  onNavigate(item.page);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition text-left ${
                  isActive
                    ? 'bg-bloom-secondary/40 text-bloom-plum shadow-sm border border-bloom-secondary/70 font-extrabold'
                    : 'text-bloom-dusty hover:text-bloom-plum hover:bg-bloom-light border border-transparent'
                }`}
              >
                <span
                  className={`p-1.5 rounded-xl transition ${
                    isActive ? 'bg-bloom-mauve text-white shadow-sm' : 'bg-bloom-bg text-bloom-dusty'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-bloom-mauve shrink-0"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Bottom Section: Medical Glossary + Points + User Profile / Sign In */}
        <div className="p-3.5 border-t border-bloom-border bg-bloom-bg/40 space-y-2.5 shrink-0">
          {/* Medical Glossary Button */}
          <button
            type="button"
            onClick={() => {
              onOpenGlossary();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-white hover:bg-bloom-secondary/30 border border-bloom-border text-bloom-dusty hover:text-bloom-plum rounded-2xl text-xs font-bold transition shadow-sm"
            title="Open Medical Words Dictionary"
          >
            <BookMarked size={16} className="text-bloom-mauve shrink-0" />
            <span className="truncate">Medical Glossary</span>
            <span className="ml-auto text-[10px] text-bloom-mauve font-bold bg-bloom-secondary/50 px-1.5 py-0.5 rounded-md">
              ✦
            </span>
          </button>

          {/* User Profile & Points Display */}
          {user ? (
            <div className="p-2.5 bg-white rounded-2xl border border-bloom-border flex items-center justify-between gap-2 shadow-sm">
              <button
                type="button"
                onClick={() => {
                  onNavigate('settings');
                  setIsMobileOpen(false);
                }}
                className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-80 transition"
                title={`Profile settings for ${user.nickname}`}
              >
                <div className="w-8 h-8 rounded-xl bg-bloom-mauve text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                  {user.nickname.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-bloom-plum truncate leading-tight">
                    {user.nickname}
                  </p>
                  <p className="text-[10px] text-bloom-dusty truncate">@{user.username}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onNavigate('progress');
                  setIsMobileOpen(false);
                }}
                className="flex items-center gap-1 bg-bloom-secondary/40 hover:bg-bloom-secondary/70 text-bloom-plum font-bold text-[11px] px-2.5 py-1 rounded-xl border border-bloom-secondary transition shrink-0"
                title="Your learning points"
              >
                <Sparkles size={12} className="text-bloom-dusty" />
                <span>{totalPoints} pts</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onNavigate('welcome');
                setIsMobileOpen(false);
              }}
              className="btn-primary w-full py-2.5 text-xs rounded-2xl shadow-none"
            >
              Sign In
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
