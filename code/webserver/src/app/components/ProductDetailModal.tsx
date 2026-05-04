import { useState } from 'react';
import { X, Trash2, Plus, Minus, Edit2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { getProductIcon } from '../utils/productIcons';

export interface FoodItem {
  id: string;
  name: string;
  expiryDate: string;
  quantity: number;
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FoodItem | null;
  categoryName: string;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onUpdateExpiryDate: (id: string, newExpiryDate: string) => void;
  onDelete: (id: string) => void;
}

export function ProductDetailModal({
  isOpen,
  onClose,
  item,
  categoryName,
  onUpdateQuantity,
  onUpdateExpiryDate,
  onDelete,
}: ProductDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [editedDate, setEditedDate] = useState('');

  if (!item) return null;

  const ProductIcon = getProductIcon(item.name);

  const isExpiringSoon = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const isExpired = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  const getDaysRemaining = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      year: 'numeric' 
    });
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(item.id);
      onClose();
      setTimeout(() => {
        setIsDeleting(false);
      }, 50);
    }, 150);
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleSaveDate = () => {
    if (editedDate) {
      onUpdateExpiryDate(item.id, editedDate);
      setIsEditingDate(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingDate(false);
    setEditedDate('');
  };

  const handleStartEdit = () => {
    setEditedDate(item.expiryDate);
    setIsEditingDate(true);
  };

  const daysRemaining = getDaysRemaining(item.expiryDate);
  const expired = isExpired(item.expiryDate);
  const expiringSoon = isExpiringSoon(item.expiryDate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Product Details</DialogTitle>
        </DialogHeader>

        <div className={`flex flex-col items-center p-6 rounded-2xl transition-all duration-150 ${
          isDeleting ? 'scale-75 opacity-50' : ''
        } ${
          expired
            ? 'bg-red-50 border-2 border-red-300'
            : expiringSoon
            ? 'bg-orange-50 border-2 border-orange-300'
            : 'bg-blue-50 border-2 border-blue-300'
        }`}>
          <ProductIcon className={`w-20 h-20 mb-4 ${
            expired
              ? 'text-red-600'
              : expiringSoon
              ? 'text-orange-600'
              : 'text-blue-600'
          }`} />
          
          <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">{item.name}</h3>
          <p className="text-sm text-gray-600 mb-4">Categorie: {categoryName}</p>

          <div className="w-full space-y-4">
            {/* Houdbaarheidsdatum */}
            <div className={`p-4 rounded-lg ${
              expired ? 'bg-red-100' : expiringSoon ? 'bg-orange-100' : 'bg-blue-100'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">Houdbaarheidsdatum</p>
                {!isEditingDate && (
                  <Button
                    onClick={handleStartEdit}
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 hover:bg-white/50"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
              {isEditingDate ? (
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={editedDate}
                    onChange={(e) => setEditedDate(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveDate}
                      size="sm"
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Opslaan
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      Annuleren
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-lg font-bold">{formatDate(item.expiryDate)}</p>
                  <p className={`text-sm mt-1 font-semibold ${
                    expired ? 'text-red-700' : expiringSoon ? 'text-orange-700' : 'text-blue-700'
                  }`}>
                    {expired 
                      ? `Verlopen ${Math.abs(daysRemaining)} dag${Math.abs(daysRemaining) === 1 ? '' : 'en'} geleden`
                      : daysRemaining === 0
                      ? 'Vandaag verlopen'
                      : daysRemaining === 1
                      ? 'Morgen verlopen'
                      : `Nog ${daysRemaining} dagen houdbaar`
                    }
                  </p>
                </>
              )}
            </div>

            {/* Aantal */}
            <div className="p-4 rounded-lg bg-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-3">Aantal</p>
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={handleDecrement}
                  disabled={item.quantity <= 1}
                  className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
                  size="icon"
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <span className="text-3xl font-bold text-gray-800 min-w-[60px] text-center">
                  {item.quantity}
                </span>
                <Button
                  onClick={handleIncrement}
                  className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600"
                  size="icon"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <Button
            onClick={handleDelete}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Verwijderen
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Sluiten
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}