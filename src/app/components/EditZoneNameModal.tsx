import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Edit2 } from 'lucide-react';
import { KeyboardModal } from './KeyboardModal';

interface EditZoneNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  zoneNames: {
    vriezer: string;
    koelvakBoven: string;
    koelvakOnder: string;
    groentelade: string;
    deur: string;
  };
  onEditZoneName: (zone: string, newName: string) => void;
}

export function EditZoneNameModal({
  isOpen,
  onClose,
  zoneNames,
  onEditZoneName,
}: EditZoneNameModalProps) {
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);

  const handleStartEdit = (key: string, name: string) => {
    setEditingZone(key);
    setEditValue(name);
    setShowKeyboard(true);
  };

  const handleSaveEdit = () => {
    if (editingZone && editValue.trim()) {
      onEditZoneName(editingZone, editValue.trim());
      setEditingZone(null);
      setEditValue('');
      setShowKeyboard(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingZone(null);
    setEditValue('');
    setShowKeyboard(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Zone Namen Bewerken</DialogTitle>
          <DialogDescription>Klik op een zone om de naam aan te passen</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {Object.entries(zoneNames).map(([key, name]) => (
            <div key={key}>
              {editingZone === key ? (
                <div className="space-y-2">
                  <Label>Nieuwe naam voor "{name}"</Label>
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onFocus={() => setShowKeyboard(true)}
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveEdit}
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                    >
                      Opslaan
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="flex-1"
                    >
                      Annuleren
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleStartEdit(key, name)}
                >
                  <span className="font-medium">{name}</span>
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        <KeyboardModal
          isOpen={showKeyboard}
          onClose={() => setShowKeyboard(false)}
          onChange={(input) => setEditValue(input)}
          value={editValue}
          layout="default"
          inputName="zone-edit-name"
          placeholder="Zone naam bewerken"
        />
      </DialogContent>
    </Dialog>
  );
}