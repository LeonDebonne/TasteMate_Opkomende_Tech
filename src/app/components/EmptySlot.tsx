import { Plus } from 'lucide-react';
import { useDrop } from 'react-dnd';
import { ColorTheme } from './ColorThemeModal';

interface EmptySlotProps {
  onClick: () => void;
  zone: string;
  index: number;
  onDrop: (draggedId: string, draggedZone: string, targetZone: string, targetIndex: number) => void;
  theme: ColorTheme;
}

export function EmptySlot({ onClick, zone, index, onDrop, theme }: EmptySlotProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'CATEGORY',
    drop: (item: { id: string; zone: string }) => {
      onDrop(item.id, item.zone, zone, index);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Determine colors based on theme
  const getThemeColors = () => {
    if (theme.id === 'default') {
      return {
        borderColor: isOver ? 'border-blue-500' : 'border-gray-300 hover:border-blue-400',
        bgColor: isOver ? 'bg-blue-100' : 'hover:bg-blue-50 bg-gray-50',
        iconBg: isOver ? 'bg-blue-500' : 'bg-gray-300 group-hover:bg-blue-400',
        textColor: isOver ? 'text-blue-700' : 'text-gray-500 group-hover:text-blue-600',
      };
    } else if (theme.id === 'yellow-black') {
      return {
        borderColor: isOver ? 'border-yellow-500' : 'border-yellow-600 hover:border-yellow-400',
        bgColor: isOver ? 'bg-yellow-900/30' : 'hover:bg-yellow-900/20 bg-gray-800',
        iconBg: isOver ? 'bg-yellow-500' : 'bg-yellow-600 group-hover:bg-yellow-500',
        textColor: isOver ? 'text-yellow-300' : 'text-yellow-400 group-hover:text-yellow-300',
      };
    } else if (theme.id === 'white-black') {
      return {
        borderColor: isOver ? 'border-white' : 'border-gray-600 hover:border-gray-400',
        bgColor: isOver ? 'bg-gray-700' : 'hover:bg-gray-700 bg-gray-800',
        iconBg: isOver ? 'bg-white' : 'bg-gray-600 group-hover:bg-gray-400',
        textColor: isOver ? 'text-white' : 'text-gray-100 group-hover:text-white',
      };
    } else if (theme.id === 'black-white') {
      return {
        borderColor: isOver ? 'border-black' : 'border-gray-800 hover:border-gray-600',
        bgColor: isOver ? 'bg-gray-200' : 'hover:bg-gray-100 bg-white',
        iconBg: isOver ? 'bg-black' : 'bg-gray-800 group-hover:bg-gray-600',
        textColor: isOver ? 'text-black' : 'text-gray-900 group-hover:text-black',
      };
    } else if (theme.id === 'green-dark') {
      return {
        borderColor: isOver ? 'border-green-500' : 'border-green-600 hover:border-green-400',
        bgColor: isOver ? 'bg-green-900/30' : 'hover:bg-green-900/20 bg-gray-800',
        iconBg: isOver ? 'bg-green-500' : 'bg-green-600 group-hover:bg-green-500',
        textColor: isOver ? 'text-green-300' : 'text-green-400 group-hover:text-green-300',
      };
    } else if (theme.id === 'blue-dark') {
      return {
        borderColor: isOver ? 'border-blue-500' : 'border-blue-600 hover:border-blue-400',
        bgColor: isOver ? 'bg-blue-900/30' : 'hover:bg-blue-900/20 bg-gray-800',
        iconBg: isOver ? 'bg-blue-500' : 'bg-blue-600 group-hover:bg-blue-500',
        textColor: isOver ? 'text-blue-300' : 'text-blue-400 group-hover:text-blue-300',
      };
    }
    // Fallback to default
    return {
      borderColor: isOver ? 'border-blue-500' : 'border-gray-300 hover:border-blue-400',
      bgColor: isOver ? 'bg-blue-100' : 'hover:bg-blue-50 bg-gray-50',
      iconBg: isOver ? 'bg-blue-500' : 'bg-gray-300 group-hover:bg-blue-400',
      textColor: isOver ? 'text-blue-700' : 'text-gray-500 group-hover:text-blue-600',
    };
  };

  const colors = getThemeColors();

  return (
    <button
      ref={drop}
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 md:p-3 rounded-lg md:rounded-xl border-2 border-dashed transition-all duration-200 group relative h-full min-h-0 ${
        isOver ? 'scale-105 shadow-md' : 'hover:scale-102 shadow-sm'
      } ${colors.borderColor} ${colors.bgColor}`}
    >
      <div className={`p-1.5 md:p-2 rounded-full mb-1 transition-colors flex-shrink-0 ${colors.iconBg}`}>
        <Plus className="w-4 h-4 md:w-5 md:h-5 text-white" />
      </div>
      <span className={`text-[10px] md:text-xs font-semibold transition-colors leading-tight ${colors.textColor}`}>
        {isOver ? 'Plaats hier' : 'Nieuw'}
      </span>
    </button>
  );
}