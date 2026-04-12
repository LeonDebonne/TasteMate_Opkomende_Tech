import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { KeyboardModal } from './KeyboardModal';

interface AddZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddZone: (zoneName: string, zoneType: 'kast' | 'deur') => void;
}

export function AddZoneModal({ isOpen, onClose, onAddZone }: AddZoneModalProps) {
  const [zoneName, setZoneName] = useState('');
  const [zoneType, setZoneType] = useState<'kast' | 'deur'>('kast');
  const [showKeyboard, setShowKeyboard] = useState(false);

  const handleSubmit = () => {
    if (zoneName.trim()) {
      onAddZone(zoneName.trim(), zoneType);
      setZoneName('');
      setZoneType('kast');
      onClose();
    }
  };

  const handleClose = () => {
    setZoneName('');
    setZoneType('kast');
    setShowKeyboard(false);
    onClose();
  };

  const handleKeyboardChange = (input: string) => {
    setZoneName(input);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nieuwe Zone Toevoegen</DialogTitle>
          <DialogDescription>
            Geef een naam en type voor de nieuwe zone
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Zone Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zone Naam
            </label>
            <Input
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              onFocus={() => setShowKeyboard(true)}
              placeholder="Bijv. Deur Links"
              className="w-full"
            />
          </div>

          {/* Zone Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zone Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setZoneType('kast')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  zoneType === 'kast'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-300 bg-white hover:border-blue-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">📦</div>
                  <div className="font-semibold text-sm">Kast</div>
                  <div className="text-xs text-gray-500 mt-1">3 kolommen</div>
                </div>
              </button>
              
              <button
                onClick={() => setZoneType('deur')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  zoneType === 'deur'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-300 bg-white hover:border-blue-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🚪</div>
                  <div className="font-semibold text-sm">Deur</div>
                  <div className="text-xs text-gray-500 mt-1">1 kolom</div>
                </div>
              </button>
            </div>
          </div>

          {/* Virtual Keyboard Modal */}
          <KeyboardModal
            isOpen={showKeyboard}
            onClose={() => setShowKeyboard(false)}
            onChange={handleKeyboardChange}
            value={zoneName}
            layout="default"
            inputName="zone-name"
            placeholder="Zone naam"
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 h-12 text-base"
            >
              Annuleren
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!zoneName.trim()}
              className="flex-1 h-12 text-base bg-blue-500 hover:bg-blue-600 text-white"
            >
              Toevoegen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}