import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertTriangle } from 'lucide-react';
import {
  Apple,
  Carrot,
  Milk,
  Beef,
  Droplet,
  Fish,
  IceCream,
  Wine,
  Package,
  Beer,
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
} from 'lucide-react';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  currentName: string;
  currentIconName: string;
  currentColor: string;
  onUpdateCategory: (categoryId: string, name: string, iconName: string, color: string) => void;
  onDeleteCategory?: (categoryId: string) => void;
  productCount?: number;
  isDefaultCategory?: boolean;
}

const availableIcons = [
  { name: 'Apple', component: Apple },
  { name: 'Carrot', component: Carrot },
  { name: 'Milk', component: Milk },
  { name: 'Beef', component: Beef },
  { name: 'Fish', component: Fish },
  { name: 'Droplet', component: Droplet },
  { name: 'IceCream', component: IceCream },
  { name: 'Wine', component: Wine },
  { name: 'Package', component: Package },
  { name: 'Beer', component: Beer },
  { name: 'Coffee', component: Coffee },
  { name: 'Cookie', component: Cookie },
  { name: 'Sandwich', component: Sandwich },
  { name: 'Pizza', component: Pizza },
  { name: 'Cake', component: Cake },
  { name: 'Cherry', component: Cherry },
  { name: 'Grape', component: Grape },
  { name: 'Banana', component: Banana },
  { name: 'Salad', component: Salad },
  { name: 'Egg', component: Egg },
  { name: 'Croissant', component: Croissant },
  { name: 'CakeSlice', component: CakeSlice },
  { name: 'Soup', component: Soup },
  { name: 'Citrus', component: Citrus },
  { name: 'Candy', component: Candy },
  { name: 'Martini', component: Martini },
  { name: 'CupSoda', component: CupSoda },
  { name: 'Drumstick', component: Drumstick },
  { name: 'Wheat', component: Wheat },
  { name: 'Flame', component: Flame },
  { name: 'FlaskConical', component: FlaskConical },
  { name: 'CircleDot', component: CircleDot },
  { name: 'Heart', component: Heart },
  { name: 'Star', component: Star },
  { name: 'Sparkles', component: Sparkles },
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
  { name: 'Teal', value: 'bg-teal-500' },
  { name: 'Lime', value: 'bg-lime-500' },
  { name: 'Amber', value: 'bg-amber-500' },
  { name: 'Emerald', value: 'bg-emerald-500' },
  { name: 'Fuchsia', value: 'bg-fuchsia-500' },
  { name: 'Violet', value: 'bg-violet-500' },
  { name: 'Sky', value: 'bg-sky-500' },
];

export function EditCategoryModal({
  isOpen,
  onClose,
  categoryId,
  currentName,
  currentIconName,
  currentColor,
  onUpdateCategory,
  onDeleteCategory,
  productCount,
  isDefaultCategory = false,
}: EditCategoryModalProps) {
  const [name, setName] = useState(currentName);
  const [selectedIcon, setSelectedIcon] = useState(currentIconName);
  const [selectedColor, setSelectedColor] = useState(currentColor);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setName(currentName);
    setSelectedIcon(currentIconName);
    setSelectedColor(currentColor);
  }, [currentName, currentIconName, currentColor, isOpen]);

  const handleSave = () => {
    if (name.trim()) {
      onUpdateCategory(categoryId, name.trim(), selectedIcon, selectedColor);
      onClose();
    }
  };

  const handleCancel = () => {
    setName(currentName);
    setSelectedIcon(currentIconName);
    setSelectedColor(currentColor);
    onClose();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDeleteCategory) {
      onDeleteCategory(categoryId);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const SelectedIconComponent = availableIcons.find((icon) => icon.name === selectedIcon)?.component || Apple;

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Categorie Aanpassen</DialogTitle>
          <DialogDescription>
            Pas de naam, het icoon en de kleur van deze categorie aan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Category Name */}
          <div>
            <Label htmlFor="categoryName">Categorienaam</Label>
            <Input
              id="categoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bijv. Fruit, Vlees, Dranken..."
              className="mt-1"
            />
          </div>

          {/* Preview */}
          <div>
            <Label>Voorbeeld</Label>
            <div className="mt-2 flex items-center justify-center">
              <div className={`${selectedColor} rounded-2xl p-6 flex flex-col items-center justify-center w-32 h-32 shadow-lg`}>
                <SelectedIconComponent className="w-12 h-12 text-white mb-2" />
                <p className="text-xs font-bold text-white text-center line-clamp-2">{name || 'Categorie'}</p>
              </div>
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <Label>Selecteer Icoon</Label>
            <div className="grid grid-cols-7 gap-2 mt-2 max-h-48 overflow-y-auto border rounded-lg p-2">
              {availableIcons.map((icon) => {
                const IconComponent = icon.component;
                const isSelected = icon.name === selectedIcon;
                return (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => setSelectedIcon(icon.name)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 scale-110'
                        : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <Label>Selecteer Kleur</Label>
            <div className="grid grid-cols-8 gap-2 mt-2">
              {availableColors.map((color) => {
                const isSelected = color.value === selectedColor;
                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`relative w-full aspect-square rounded-lg ${color.value} transition-all ${
                      isSelected ? 'ring-4 ring-blue-500 ring-offset-2 scale-110' : 'hover:scale-105'
                    }`}
                    title={color.name}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full border-2 border-gray-800" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Opslaan
            </Button>
            <Button onClick={handleCancel} variant="outline" className="flex-1">
              Annuleren
            </Button>
            {onDeleteCategory && (
              <Button
                onClick={handleDeleteClick}
                variant="destructive"
                className="flex-1"
              >
                {productCount > 0 && <AlertTriangle className="w-4 h-4 mr-2" />}
                Verwijderen
              </Button>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Categorie verwijderen?</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Weet je zeker dat je de categorie <span className="font-bold text-gray-900">"{currentName}"</span> wilt verwijderen?
            </p>
            {productCount > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 font-semibold text-sm">
                  ⚠️ Let op: Deze categorie bevat nog {productCount} product{productCount !== 1 ? 'en' : ''}!
                </p>
                <p className="text-red-600 text-sm mt-2">
                  Als je deze categorie verwijdert, worden <span className="font-bold">alle {productCount} product{productCount !== 1 ? 'en' : ''} definitief verwijderd</span>. Deze actie kan niet ongedaan worden gemaakt.
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                onClick={handleCancelDelete}
                variant="outline"
                className="flex-1"
              >
                Annuleren
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                {productCount > 0 ? 'Verwijder alles' : 'Verwijderen'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}