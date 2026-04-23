import { useRef, useEffect } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

interface VirtualKeyboardProps {
  onChange: (input: string) => void;
  onKeyPress?: (button: string) => void;
  inputName?: string;
  layout?: 'default' | 'numeric';
  value?: string;
  placeholder?: string;
}

export function VirtualKeyboard({
  onChange,
  onKeyPress,
  inputName = 'default',
  layout = 'default',
  value = '',
  placeholder = 'Type hier...',
}: VirtualKeyboardProps) {
  const keyboard = useRef<any>(null);

  useEffect(() => {
    if (keyboard.current) {
      keyboard.current.setInput(value);
    }
  }, [value]);

  const handleChange = (input: string) => {
    // Automatisch de eerste letter een hoofdletter maken
    if (input.length === 1 && /[a-z]/.test(input)) {
      input = input.toUpperCase();
    }
    onChange(input);
  };

  const handleKeyPress = (button: string) => {
    if (onKeyPress) {
      onKeyPress(button);
    }
  };

  const numericLayout = {
    default: ['1 2 3', '4 5 6', '7 8 9', '{bksp} 0 {enter}'],
  };

  // AZERTY iPhone-stijl layout
  const defaultLayout = {
    default: [
      'a z e r t y u i o p',
      'q s d f g h j k l m',
      '{shift} w x c v b n {bksp}',
      '{numbers} , {space} . {enter}',
    ],
    shift: [
      'A Z E R T Y U I O P',
      'Q S D F G H J K L M',
      '{shift} W X C V B N {bksp}',
      '{numbers} , {space} . {enter}',
    ],
    numbers: [
      '1 2 3 4 5 6 7 8 9 0',
      '- / : ; ( ) € & @ "',
      '{shift} . , ? ! \' {bksp}',
      '{abc} {space} {enter}',
    ],
    numbersShift: [
      '[ ] { } # % ^ * + =',
      '_ \\ | ~ < > $ £ ¥ •',
      '{shift} . , ? ! \' {bksp}',
      '{abc} {space} {enter}',
    ],
  };

  return (
    <div className="virtual-keyboard-wrapper">
      {/* Input Preview Bar - Shows what you're typing */}
      <div className="keyboard-input-preview bg-[#c9cdd1] px-3 py-2 border-b border-gray-400">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg px-3 py-2 min-h-[40px] flex items-center shadow-sm">
            <span className={`text-base ${value ? 'text-black' : 'text-gray-400'}`}>
              {value || placeholder}
            </span>
            <span className="ml-1 animate-pulse text-blue-500 font-bold">|</span>
          </div>
        </div>
      </div>
      
      {/* Keyboard */}
      <div className="virtual-keyboard bg-[#d1d5db] rounded-t-2xl">
        <Keyboard
          keyboardRef={(r: any) => (keyboard.current = r)}
          inputName={inputName}
          layout={layout === 'numeric' ? numericLayout : defaultLayout}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          layoutName="default"
          display={{
            '{bksp}': '⌫',
            '{enter}': '✔',
            '{shift}': '⇧',
            '{space}': '          ',
            '{numbers}': '123',
            '{abc}': 'ABC',
          }}
          buttonTheme={[
            {
              class: 'keyboard-button-action',
              buttons: '{enter}',
            },
            {
              class: 'keyboard-button-special',
              buttons: '{shift} {numbers} {abc}',
            },
            {
              class: 'keyboard-button-bksp',
              buttons: '{bksp}',
            },
            {
              class: 'keyboard-button-space',
              buttons: '{space}',
            },
          ]}
        />
      </div>
    </div>
  );
}