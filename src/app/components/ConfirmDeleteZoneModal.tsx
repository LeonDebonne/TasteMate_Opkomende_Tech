import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  zoneName: string;
}

export function ConfirmDeleteZoneModal({
  isOpen,
  onClose,
  onConfirm,
  zoneName,
}: ConfirmDeleteZoneModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Zone Verwijderen
          </DialogTitle>
          <DialogDescription>
            Deze actie kan niet ongedaan worden gemaakt
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-700">
            Weet je zeker dat je <span className="font-semibold">"{zoneName}"</span> wilt verwijderen?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Alle categorieën in deze zone blijven behouden maar worden verwijderd uit de zone.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 h-12 text-base"
          >
            Annuleren
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 h-12 text-base bg-red-500 hover:bg-red-600 text-white"
          >
            Verwijderen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}