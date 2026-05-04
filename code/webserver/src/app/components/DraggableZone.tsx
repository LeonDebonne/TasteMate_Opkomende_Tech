import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical } from 'lucide-react';

interface DraggableZoneProps {
  zone: string;
  zoneName: string;
  index: number;
  children: React.ReactNode;
  moveZone: (dragIndex: number, hoverIndex: number) => void;
  isDragMode: boolean;
}

export function DraggableZone({
  zone,
  zoneName,
  index,
  children,
  moveZone,
  isDragMode,
}: DraggableZoneProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'ZONE',
    item: { zone, index },
    canDrag: isDragMode,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'ZONE',
    hover(item: { zone: string; index: number }) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      moveZone(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      className={`relative ${isDragging ? 'opacity-40' : 'opacity-100'} ${
        isDragMode ? 'cursor-move' : ''
      }`}
      style={{ height: '160px' }}
    >
      {isDragMode && (
        <div
          ref={drag}
          className="absolute -left-8 top-1/2 -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing bg-blue-500 rounded-lg p-2 shadow-lg hover:bg-blue-600 transition-colors"
        >
          <GripVertical className="w-5 h-5 text-white" />
        </div>
      )}
      {children}
    </div>
  );
}
