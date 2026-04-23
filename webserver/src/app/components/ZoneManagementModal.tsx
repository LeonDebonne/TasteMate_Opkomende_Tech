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
import { Plus, Minus, GripVertical, Trash2, Edit2, Check, X } from 'lucide-react';
import { ConfirmDeleteZoneModal } from './ConfirmDeleteZoneModal';
import { KeyboardModal } from './KeyboardModal';

interface ZoneManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: string[]; // Array of zone keys in order
  zoneNames: Record<string, string>;
  zoneRowCounts: Record<string, number>;
  onAddRow: (zone: string) => void;
  onRemoveRow: (zone: string) => void;
  onOpenAddZoneModal: () => void;
  onRemoveZone: (zone: string) => void;
  onReorderZones: (zones: string[]) => void;
  onEditZoneName: (zone: string, newName: string) => void;
}

const defaultZoneNames: Record<string, string> = {
  vriezer: 'Vriezer',
  koelvakBoven: 'Koelvak Boven',
  koelvakOnder: 'Koelvak Onder',
  groentelade: 'Groentelade',
  deur: 'Deur',
};

export function ZoneManagementModal({
  isOpen,
  onClose,
  zones,
  zoneNames,
  zoneRowCounts,
  onAddRow,
  onRemoveRow,
  onOpenAddZoneModal,
  onRemoveZone,
  onReorderZones,
  onEditZoneName,
}: ZoneManagementModalProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirmZone, setDeleteConfirmZone] = useState<string | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedIndex === null || draggedIndex === index) return;

    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newZones = [...zones];
    const draggedZone = newZones[draggedIndex];

    // Remove from old position
    newZones.splice(draggedIndex, 1);

    // Insert at new position
    newZones.splice(dropIndex, 0, draggedZone);

    onReorderZones(newZones);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const startEditingZoneName = (zoneKey: string) => {
    setEditingZone(zoneKey);
    setEditingName(zoneNames[zoneKey] || '');
    setShowKeyboard(true);
  };

  const saveZoneName = () => {
    if (editingZone && editingName.trim()) {
      onEditZoneName(editingZone, editingName.trim());
    }
    setEditingZone(null);
    setEditingName('');
    setShowKeyboard(false);
  };

  const cancelEditingZoneName = () => {
    setEditingZone(null);
    setEditingName('');
    setShowKeyboard(false);
  };

  const openDeleteConfirmModal = (zoneKey: string) => {
    setDeleteConfirmZone(zoneKey);
  };

  const closeDeleteConfirmModal = () => {
    setDeleteConfirmZone(null);
  };

  const handleKeyboardChange = (input: string) => {
    setEditingName(input);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Zones Beheren</DialogTitle>
          <DialogDescription>
            Versleep zones om de volgorde te wijzigen, bewerk namen, of beheer rijen
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {zones.map((zoneKey, index) => (
            <div
              key={zoneKey}
              draggable={editingZone !== zoneKey}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`border-2 rounded-lg p-3 transition-all ${
                draggedIndex === index
                  ? 'bg-blue-50 border-blue-500 opacity-50'
                  : dragOverIndex === index
                  ? 'bg-blue-50 border-blue-400'
                  : 'border-gray-300 hover:border-blue-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {editingZone !== zoneKey && (
                  <div
                    className="cursor-grab active:cursor-grabbing flex-shrink-0"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <GripVertical className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  {editingZone === zoneKey ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onFocus={() => setShowKeyboard(true)}
                        className="h-8"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveZoneName();
                          if (e.key === 'Escape') cancelEditingZoneName();
                        }}
                      />
                      <button
                        onClick={saveZoneName}
                        className="p-1.5 rounded bg-green-100 hover:bg-green-200"
                      >
                        <Check className="w-4 h-4 text-green-700" />
                      </button>
                      <button
                        onClick={cancelEditingZoneName}
                        className="p-1.5 rounded bg-red-100 hover:bg-red-200"
                      >
                        <X className="w-4 h-4 text-red-700" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="font-semibold text-gray-900 flex items-center gap-2">
                        {zoneNames[zoneKey] || zoneKey}
                        <button
                          onClick={() => startEditingZoneName(zoneKey)}
                          className="p-1 rounded hover:bg-gray-100"
                          title="Naam bewerken"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        Rijen: {zoneRowCounts[zoneKey] || 0}
                      </div>
                    </>
                  )}
                </div>
                {editingZone !== zoneKey && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => onAddRow(zoneKey)}
                      className="p-3 rounded-lg bg-green-100 hover:bg-green-200 transition-colors"
                      title="Rij toevoegen"
                    >
                      <Plus className="w-5 h-5 text-green-700" />
                    </button>
                    <button
                      onClick={() => onRemoveRow(zoneKey)}
                      disabled={zoneRowCounts[zoneKey] <= 1}
                      className={`p-3 rounded-lg transition-colors ${
                        zoneRowCounts[zoneKey] <= 1
                          ? 'bg-gray-100 opacity-50 cursor-not-allowed'
                          : 'bg-orange-100 hover:bg-orange-200'
                      }`}
                      title="Rij verwijderen"
                    >
                      <Minus className="w-5 h-5 text-orange-700" />
                    </button>
                    <button
                      onClick={() => openDeleteConfirmModal(zoneKey)}
                      className="p-3 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
                      title="Zone verwijderen"
                    >
                      <Trash2 className="w-5 h-5 text-red-700" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <Button
            onClick={onOpenAddZoneModal}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe Zone Toevoegen
          </Button>
        </div>
      </DialogContent>
      
      {/* Virtual Keyboard Modal */}
      <KeyboardModal
        isOpen={showKeyboard}
        onClose={() => setShowKeyboard(false)}
        onChange={handleKeyboardChange}
        value={editingName}
        layout="default"
        inputName="zone-name"
        placeholder="Zone naam"
      />
      
      <ConfirmDeleteZoneModal
        isOpen={deleteConfirmZone !== null}
        onClose={closeDeleteConfirmModal}
        onConfirm={() => {
          if (deleteConfirmZone) {
            onRemoveZone(deleteConfirmZone);
          }
          closeDeleteConfirmModal();
        }}
        zoneName={deleteConfirmZone ? zoneNames[deleteConfirmZone] : ''}
      />
    </Dialog>
  );
}