import React, { useState } from 'react';
import { Lock, AlertCircle, ShieldAlert } from 'lucide-react';
import { unlockWithPin, deleteEverythingLocal } from '../../services/privacyStorageService.js';

interface PinUnlockModalProps {
  isOpen: boolean;
  onUnlocked: (data: any) => void;
  onResetApp: () => void;
}

export const PinUnlockModal: React.FC<PinUnlockModalProps> = ({
  isOpen,
  onUnlocked,
  onResetApp
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);
      if (nextPin.length === 4) {
        attemptUnlock(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  const attemptUnlock = async (pinToTry: string) => {
    setUnlocking(true);
    setError(null);
    try {
      const decrypted = await unlockWithPin(pinToTry);
      onUnlocked(decrypted);
    } catch (err: any) {
      setError(err.message || 'Incorrect PIN. Please try again.');
      setPin('');
    } finally {
      setUnlocking(false);
    }
  };

  const handleResetEverything = async () => {
    await deleteEverythingLocal();
    setShowForgotConfirm(false);
    onResetApp();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bloom-plum/60 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-white rounded-3xl border border-[#D7C4E8] shadow-2xl max-w-sm w-full p-6 text-center space-y-5">
        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-bloom-secondary/50 text-[#784E82] flex items-center justify-center mx-auto shadow-sm">
          <Lock size={26} />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-bloom-plum">Vault Locked</h2>
          <p className="text-xs text-bloom-dusty mt-1">
            Enter your 4-digit PIN to access your private records
          </p>
        </div>

        {/* 4 PIN Dots */}
        <div className="flex justify-center gap-4 py-2">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  isFilled
                    ? 'bg-[#784E82] border-[#784E82] scale-110'
                    : 'bg-white border-[#D7C4E8]'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center justify-center gap-1.5 animate-shake">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={unlocking}
              onClick={() => handleDigit(digit)}
              className="h-12 rounded-2xl bg-bloom-light hover:bg-[#E8DCF0] text-bloom-plum font-bold text-lg transition active:scale-95 flex items-center justify-center"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-2xl text-xs font-bold text-bloom-dusty hover:bg-bloom-light transition flex items-center justify-center"
          >
            Clear
          </button>
          <button
            type="button"
            disabled={unlocking}
            onClick={() => handleDigit('0')}
            className="h-12 rounded-2xl bg-bloom-light hover:bg-[#E8DCF0] text-bloom-plum font-bold text-lg transition active:scale-95 flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-2xl text-xs font-bold text-bloom-dusty hover:bg-bloom-light transition flex items-center justify-center"
          >
            ⌫
          </button>
        </div>

        {/* Forgot PIN Option */}
        <div className="pt-2 border-t border-bloom-border/60">
          <button
            type="button"
            onClick={() => setShowForgotConfirm(true)}
            className="text-[11px] text-bloom-dusty hover:text-rose-600 transition underline underline-offset-2"
          >
            Forgot PIN?
          </button>
        </div>
      </div>

      {/* Forgot PIN Confirm Dialog */}
      {showForgotConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bloom-plum/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-bloomHover max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-base font-bold text-rose-950">Cannot Recover PIN</h3>
            <p className="text-xs text-bloom-dusty leading-relaxed">
              Because your records are encrypted with AES-GCM and the key is derived from your PIN, there is no master recovery password.
            </p>
            <p className="text-xs text-rose-700 font-semibold leading-relaxed">
              To regain access, all encrypted local records must be cleared and the app returned to its initial clean state.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForgotConfirm(false)}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-bloom-dusty hover:bg-bloom-light transition"
              >
                Try PIN Again
              </button>
              <button
                type="button"
                onClick={handleResetEverything}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition"
              >
                Reset App
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
