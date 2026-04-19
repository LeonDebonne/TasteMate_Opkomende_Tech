import { Dialog, DialogContent } from './ui/dialog';
import { VirtualKeyboard } from './VirtualKeyboard';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DialogTitle } from './ui/dialog';

interface KeyboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChange: (input: string) => void;
  value: string;
  layout?: 'default' | 'numeric';
  inputName?: string;
  placeholder?: string;
  onConfirm?: () => void;
}

export function KeyboardModal({
  isOpen,
  onClose,
  onChange,
  value,
  layout = 'default',
  inputName = 'default',
  placeholder = 'Type hier...',
  onConfirm,
}: KeyboardModalProps) {
  const handleKeyPress = (button: string) => {
    if (button === '{enter}') {
      // Als er een onConfirm handler is, roep die aan, anders sluit gewoon
      if (onConfirm) {
        onConfirm();
      }
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-full w-full p-0 m-0 fixed bottom-0 left-0 right-0 translate-x-0 translate-y-0 border-0 rounded-t-2xl shadow-2xl"
        style={{
          top: 'auto',
          transform: 'none',
        }}
        aria-describedby={undefined}
      >
        <VisuallyHidden>
          <DialogTitle>Virtueel toetsenbord</DialogTitle>
        </VisuallyHidden>
        <div className="bg-[#d1d5db] pb-safe">
          <VirtualKeyboard
            onChange={onChange}
            value={value}
            layout={layout}
            inputName={inputName}
            placeholder={placeholder}
            onKeyPress={handleKeyPress}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}