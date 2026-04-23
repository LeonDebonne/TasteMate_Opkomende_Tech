import { LucideIcon, GripVertical } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import { useRef, useState } from 'react';

interface FoodCategoryProps {
  name: string;
  icon: LucideIcon;
  color: string;
  count: number;
  onClick: () => void;
  index: number;
  moveCategory: (dragIndex: number, hoverIndex: number, dragZone: string, targetZone: string) => void;
  id: string;
  zone: string;
  theme?: {
    cardBg: string;
    cardText: string;
    border: string;
  };
}

interface DragItem {
  index: number;
  id: string;
  type: string;
  zone: string;
}

export function FoodCategory({ id, index, name, icon: Icon, color, count, onClick, moveCategory, zone, theme }: FoodCategoryProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'CATEGORY',
    item: { id, index, zone },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'CATEGORY',
    drop: (item: { id: string; index: number; zone: string }) => {
      if (item.id !== id || item.zone !== zone) {
        moveCategory(item.index, index, item.zone, zone);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className="relative cursor-pointer group"
    >
      <button
        onClick={onClick}
        className={`w-full aspect-square rounded-xl md:rounded-2xl flex flex-col items-center justify-center p-1.5 md:p-2 transition-all duration-200 ${
          isDragging ? 'opacity-40 scale-95' : isOver ? 'scale-105 ring-2 ring-blue-500' : 'hover:scale-105'
        } ${color} shadow-md hover:shadow-xl border-2 border-white/50`}
      >
        <Icon className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white mb-1 drop-shadow-md flex-shrink-0" />
        <p className="text-[10px] md:text-xs font-bold text-white text-center line-clamp-2 drop-shadow-sm px-0.5">{name}</p>
      </button>
      
      {/* Product count - top left corner */}
      {count > 0 && (
        <div className="absolute -top-1.5 -left-1.5 md:-top-2 md:-left-2 bg-white text-gray-900 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center font-bold text-[9px] md:text-[10px] shadow-lg border-2 border-gray-100 z-20">
          {count}
        </div>
      )}
    </div>
  );
}