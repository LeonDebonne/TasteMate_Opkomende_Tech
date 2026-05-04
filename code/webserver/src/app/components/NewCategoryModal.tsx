import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { KeyboardModal } from './KeyboardModal';
import {
  Apple,
  Carrot,
  Milk,
  Beef,
  Fish,
  Droplet,
  IceCream,
  Wine,
  Coffee,
  Cookie,
  Sandwich,
  Pizza,
  Cake,
  Cherry,
  Grape,
  Banana,
  Salad,
  Egg,
  Croissant,
  CakeSlice,
  Soup,
  Citrus,
  Candy,
  Beer,
  Martini,
  CupSoda,
  Drumstick,
  Wheat,
  Flame,
  FlaskConical,
  CircleDot,
  Heart,
  Star,
  Sparkles,
  Package,
  type LucideIcon,
} from 'lucide-react';

interface NewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (name: string, icon: string, color: string, zone: string) => void;
  zone?: string;
  availableZones?: { id: string; name: string }[];
  zoneNames?: Record<string, string>;
}

const availableIcons: { name: string; icon: LucideIcon }[] = [
  { name: 'Apple', icon: Apple },
  { name: 'Carrot', icon: Carrot },
  { name: 'Milk', icon: Milk },
  { name: 'Beef', icon: Beef },
  { name: 'Fish', icon: Fish },
  { name: 'Droplet', icon: Droplet },
  { name: 'IceCream', icon: IceCream },
  { name: 'Wine', icon: Wine },
  { name: 'Package', icon: Package },
  { name: 'Beer', icon: Beer },
  { name: 'Coffee', icon: Coffee },
  { name: 'Cookie', icon: Cookie },
  { name: 'Sandwich', icon: Sandwich },
  { name: 'Pizza', icon: Pizza },
  { name: 'Cake', icon: Cake },
  { name: 'Cherry', icon: Cherry },
  { name: 'Grape', icon: Grape },
  { name: 'Banana', icon: Banana },
  { name: 'Salad', icon: Salad },
  { name: 'Egg', icon: Egg },
  { name: 'Croissant', icon: Croissant },
  { name: 'CakeSlice', icon: CakeSlice },
  { name: 'Soup', icon: Soup },
  { name: 'Citrus', icon: Citrus },
  { name: 'Candy', icon: Candy },
  { name: 'Martini', icon: Martini },
  { name: 'CupSoda', icon: CupSoda },
  { name: 'Drumstick', icon: Drumstick },
  { name: 'Wheat', icon: Wheat },
  { name: 'Flame', icon: Flame },
  { name: 'FlaskConical', icon: FlaskConical },
  { name: 'CircleDot', icon: CircleDot },
  { name: 'Heart', icon: Heart },
  { name: 'Star', icon: Star },
  { name: 'Sparkles', icon: Sparkles },
];

const availableColors = [
  { name: 'Groen', value: 'bg-green-500' },
  { name: 'Oranje', value: 'bg-orange-500' },
  { name: 'Blauw', value: 'bg-blue-500' },
  { name: 'Rood', value: 'bg-red-500' },
  { name: 'Cyaan', value: 'bg-cyan-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Paars', value: 'bg-purple-500' },
  { name: 'Roze', value: 'bg-pink-500' },
  { name: 'Geel', value: 'bg-yellow-500' },
  { name: 'Lime', value: 'bg-lime-500' },
  { name: 'Teal', value: 'bg-teal-500' },
  { name: 'Fuchsia', value: 'bg-fuchsia-500' },
];

const zones = [
  { id: 'vriezer', name: 'Vriezer' },
  { id: 'koelvakBoven', name: 'Koelvak Boven' },
  { id: 'koelvakOnder', name: 'Koelvak Onder' },
  { id: 'groentelade', name: 'Groentelade' },
  { id: 'deur', name: 'Deur' },
];

export function NewCategoryModal({ isOpen, onClose, onAddCategory, zone, availableZones, zoneNames }: NewCategoryModalProps) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Apple');
  const [selectedColor, setSelectedColor] = useState('bg-green-500');
  const [selectedZone, setSelectedZone] = useState(zone || 'koelvakOnder');
  const [showKeyboard, setShowKeyboard] = useState(false);

  // Create zones list from props or use default
  const zonesList = availableZones || zones;

  // Update selectedZone when zone prop changes
  useEffect(() => {
    if (zone) {
      setSelectedZone(zone);
    }
  }, [zone]);

  const handleSubmit = () => {
    if (name.trim()) {
      onAddCategory(name.trim(), selectedIcon, selectedColor, selectedZone);
      setName('');
      setSelectedIcon('Apple');
      setSelectedColor('bg-green-500');
      setSelectedZone(zone || 'koelvakOnder');
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setSelectedIcon('Apple');
    setSelectedColor('bg-green-500');
    setSelectedZone(zone || 'koelvakOnder');
    setShowKeyboard(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nieuwe Categorie Aanmaken</DialogTitle>
          <DialogDescription>Voeg een nieuwe categorie toe aan je koelkast.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Naam */}
          <div>
            <Label htmlFor="category-name">Naam</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setShowKeyboard(true)}
              placeholder="Bijv. Sauzen, Snacks, etc."
              className="mt-1"
            />
          </div>

          {/* Zone selectie - DROPDOWN */}
          <div>
            <Label htmlFor="zone-select">Zone in koelkast</Label>
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Selecteer een zone" />
              </SelectTrigger>
              <SelectContent>
                {zonesList.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    {zoneNames ? (zoneNames[zone.id] || zone.name) : zone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Icoon selectie */}
          <div>
            <Label>Kies een icoon</Label>
            <div className="grid grid-cols-6 gap-2 mt-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
              {availableIcons.map((iconItem) => {
                const IconComponent = iconItem.icon;
                return (
                  <button
                    key={iconItem.name}
                    onClick={() => setSelectedIcon(iconItem.name)}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center ${
                      selectedIcon === iconItem.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kleur selectie */}
          <div>
            <Label>Kies een kleur</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {availableColors.map((colorItem) => (
                <button
                  key={colorItem.value}
                  onClick={() => setSelectedColor(colorItem.value)}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center ${
                    selectedColor === colorItem.value
                      ? 'border-blue-500 ring-2 ring-blue-300'
                      : 'border-gray-300'
                  }`}
                >
                  <div className={`${colorItem.value} w-8 h-8 rounded-full`} />
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <Label>Voorbeeld</Label>
            <div className="mt-2 flex justify-center">
              <div className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-200 bg-gray-50">
                <div className={`${selectedColor} p-3 rounded-full mb-2`}>
                  {(() => {
                    const IconComponent = availableIcons.find((i) => i.name === selectedIcon)?.icon || Apple;
                    return <IconComponent className="w-8 h-8 text-white" />;
                  })()}
                </div>
                <span className="text-sm font-medium text-gray-700">{name || 'Categorie naam'}</span>
              </div>
            </div>
          </div>

          {/* Keyboard Modal */}
          <KeyboardModal
            isOpen={showKeyboard}
            onClose={() => setShowKeyboard(false)}
            onChange={(input) => setName(input)}
            value={name}
            layout="default"
            inputName="category-name"
            placeholder="Categorienaam"
          />

          {/* Acties */}
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={handleClose}>
              Annuleren
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Aanmaken
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}