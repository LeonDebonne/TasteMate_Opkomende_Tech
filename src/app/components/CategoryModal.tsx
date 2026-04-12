import { useState } from 'react';
import { Plus, X, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { calculateExpiryDate } from '../utils/expiryDateCalculator';
import { getProductIcon } from '../utils/productIcons';
import { KeyboardModal } from './KeyboardModal';
import { ProductDetailModal } from './ProductDetailModal';

export interface FoodItem {
  id: string;
  name: string;
  expiryDate: string;
  quantity: number;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  categoryId: string;
  items: FoodItem[];
  onAddItem: (name: string, expiryDate: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onUpdateExpiryDate: (itemId: string, newExpiryDate: string) => void;
  onEditCategory?: () => void;
}

export function CategoryModal({
  isOpen,
  onClose,
  categoryName,
  categoryId,
  items,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
  onUpdateExpiryDate,
  onEditCategory,
}: CategoryModalProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [itemName, setItemName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeInput, setActiveInput] = useState<'name' | 'quantity' | null>(null);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [longPressItemId, setLongPressItemId] = useState<string | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleAdd = () => {
    if (itemName.trim() && quantity > 0) {
      const finalExpiryDate = expiryDate || calculateExpiryDate(categoryId);
      onAddItem(itemName.trim(), finalExpiryDate, quantity);
      setItemName('');
      setExpiryDate('');
      setQuantity(1);
      setActiveInput(null);
      setShowAddForm(false);
    }
  };

  const handleProductClick = (item: FoodItem) => {
    setSelectedItem(item);
    setShowProductDetail(true);
  };

  const handleCloseProductDetail = () => {
    setShowProductDetail(false);
    setSelectedItem(null);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    // Update the quantity via parent
    onUpdateQuantity(itemId, newQuantity);
    
    // Update the selectedItem state so the modal shows the updated quantity
    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem({ ...selectedItem, quantity: newQuantity });
    }
  };

  const handleUpdateExpiryDate = (itemId: string, newExpiryDate: string) => {
    // Update the expiry date via parent
    onUpdateExpiryDate(itemId, newExpiryDate);
    
    // Update the selectedItem state so the modal shows the updated date
    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem({ ...selectedItem, expiryDate: newExpiryDate });
    }
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  };

  const handleKeyboardChange = (input: string) => {
    if (activeInput === 'name') {
      setItemName(input);
    } else if (activeInput === 'quantity') {
      const numValue = parseInt(input) || 0;
      setQuantity(numValue);
    }
  };

  const handleLongPressStart = (itemId: string) => {
    setLongPressItemId(itemId);
    const timer = setTimeout(() => {
      handleRemove(itemId);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
    }
    setLongPressItemId(null);
    setLongPressTimer(null);
  };

  const handleRemove = (itemId: string) => {
    setRemovingItemId(itemId);
    setTimeout(() => {
      onRemoveItem(itemId);
      setTimeout(() => {
        setRemovingItemId(null);
      }, 50);
    }, 150);
  };

  const handleQuickDelete = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    handleRemove(itemId);
  };

  const handleDeleteCompletely = (itemId: string) => {
    onRemoveItem(itemId);
    handleCloseProductDetail();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <span>{categoryName}</span>
            {onEditCategory && (
              <Button
                onClick={onEditCategory}
                variant="outline"
                size="sm"
                className="h-10 px-3 hover:bg-blue-50 hover:border-blue-500 transition-all"
                title="Categorie aanpassen"
              >
                <Settings className="w-5 h-5 text-blue-600" />
              </Button>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Beheer de producten in deze categorie.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4">
          {showAddForm ? (
            <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
              <div>
                <Label htmlFor="itemName">Productnaam</Label>
                <Input
                  id="itemName"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  onFocus={() => setActiveInput('name')}
                  placeholder="Bijv. Melk, Kaas, Appels..."
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="itemQuantity">Aantal</Label>
                <Input
                  id="itemQuantity"
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  onFocus={() => setActiveInput('quantity')}
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Houdbaarheidsdatum (optioneel)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Laat leeg voor automatische berekening
                </p>
              </div>

              {activeInput && (
                <KeyboardModal
                  isOpen={!!activeInput}
                  onClose={() => setActiveInput(null)}
                  onChange={handleKeyboardChange}
                  value={activeInput === 'name' ? itemName : quantity.toString()}
                  layout={activeInput === 'quantity' ? 'numeric' : 'default'}
                  inputName={activeInput}
                  placeholder={activeInput === 'name' ? 'Product naam' : 'Aantal'}
                />
              )}

              <div className="flex gap-2">
                <Button onClick={handleAdd} className="flex-1 bg-blue-500 hover:bg-blue-600">
                  Toevoegen
                </Button>
                <Button
                  onClick={() => {
                    setShowAddForm(false);
                    setItemName('');
                    setExpiryDate('');
                    setQuantity(1);
                    setActiveInput(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Annuleren
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowAddForm(true)} className="w-full mb-4 bg-blue-500 hover:bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Product toevoegen
            </Button>
          )}

          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Geen producten in deze categorie</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6 p-4">
              {items.map((item) => {
                const ProductIcon = getProductIcon(item.name);
                const isRemoving = removingItemId === item.id;
                const isLongPressing = longPressItemId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleProductClick(item)}
                    className="relative cursor-pointer"
                    onMouseDown={() => handleLongPressStart(item.id)}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    onTouchStart={() => handleLongPressStart(item.id)}
                    onTouchEnd={handleLongPressEnd}
                    onTouchCancel={handleLongPressEnd}
                  >
                    <div
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-150 border-2 ${
                        isRemoving ? 'scale-75 opacity-50' : isLongPressing ? 'scale-95 ring-4 ring-red-400' : 'hover:scale-105'
                      } ${
                        isExpired(item.expiryDate)
                          ? 'bg-red-50 border-red-300 hover:bg-red-100 hover:border-red-400'
                          : isExpiringSoon(item.expiryDate)
                          ? 'bg-orange-50 border-orange-300 hover:bg-orange-100 hover:border-orange-400'
                          : 'bg-blue-50 border-blue-300 hover:bg-blue-100 hover:border-blue-400'
                      } shadow-sm hover:shadow-md`}
                    >
                      <ProductIcon
                        className={`w-12 h-12 mb-2 transition-all duration-150 drop-shadow-sm ${
                          isExpired(item.expiryDate)
                            ? 'text-red-600'
                            : isExpiringSoon(item.expiryDate)
                            ? 'text-orange-600'
                            : 'text-blue-600'
                        }`}
                      />
                      <p className="text-xs text-center px-1 font-semibold text-gray-700 line-clamp-2">
                        {item.name}
                      </p>
                    </div>
                    
                    {/* Delete X button - always visible on top left */}
                    <button
                      onClick={(e) => handleQuickDelete(e, item.id)}
                      className={`absolute -top-3 -left-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-lg border-2 border-white transition-all duration-150 z-10 ${
                        isRemoving ? 'scale-75 opacity-50' : 'hover:scale-110'
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    {/* Notification badge with quantity */}
                    <div className={`absolute -top-3 -right-3 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white transition-all duration-150 ${
                      isRemoving ? 'scale-75 opacity-50' : ''
                    }`}>
                      {item.quantity}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <ProductDetailModal
          isOpen={showProductDetail}
          onClose={handleCloseProductDetail}
          item={selectedItem}
          categoryName={categoryName}
          onUpdateQuantity={handleUpdateQuantity}
          onUpdateExpiryDate={handleUpdateExpiryDate}
          onDelete={handleDeleteCompletely}
        />
      </DialogContent>
    </Dialog>
  );
}