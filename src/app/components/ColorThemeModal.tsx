import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';

export interface ColorTheme {
  id: string;
  name: string;
  bg: string;
  text: string;
  cardBg: string;
  cardText: string;
  border: string;
}

export const colorThemes: ColorTheme[] = [
  {
    id: 'default',
    name: 'Standaard (Blauw/Wit)',
    bg: 'from-blue-50 to-blue-100',
    text: 'text-gray-900',
    cardBg: 'bg-white',
    cardText: 'text-gray-700',
    border: 'border-gray-300',
  },
  {
    id: 'yellow-black',
    name: 'Geel op Zwart',
    bg: 'from-gray-900 to-black',
    text: 'text-yellow-400',
    cardBg: 'bg-gray-800',
    cardText: 'text-yellow-300',
    border: 'border-yellow-600',
  },
  {
    id: 'white-black',
    name: 'Wit op Zwart',
    bg: 'from-gray-900 to-black',
    text: 'text-white',
    cardBg: 'bg-gray-800',
    cardText: 'text-gray-100',
    border: 'border-gray-600',
  },
  {
    id: 'black-white',
    name: 'Zwart op Wit',
    bg: 'from-white to-gray-100',
    text: 'text-black',
    cardBg: 'bg-white',
    cardText: 'text-gray-900',
    border: 'border-gray-800',
  },
  {
    id: 'green-dark',
    name: 'Groen op Donker',
    bg: 'from-gray-900 to-green-950',
    text: 'text-green-400',
    cardBg: 'bg-gray-800',
    cardText: 'text-green-300',
    border: 'border-green-600',
  },
  {
    id: 'blue-dark',
    name: 'Blauw op Donker',
    bg: 'from-gray-900 to-blue-950',
    text: 'text-blue-400',
    cardBg: 'bg-gray-800',
    cardText: 'text-blue-300',
    border: 'border-blue-600',
  },
];

interface ColorThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onSelectTheme: (themeId: string) => void;
}

export function ColorThemeModal({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}: ColorThemeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Kleurenschema Kiezen</DialogTitle>
          <DialogDescription>Kies een kleurenschema voor je applicatie.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {colorThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                onSelectTheme(theme.id);
                onClose();
              }}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                currentTheme === theme.id
                  ? 'border-blue-500 ring-2 ring-blue-300'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">{theme.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {currentTheme === theme.id && '✓ Actief'}
                  </div>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${theme.bg} border-2 ${theme.border}`}
                ></div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}