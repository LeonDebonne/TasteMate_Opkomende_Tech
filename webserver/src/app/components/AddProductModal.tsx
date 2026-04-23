import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { calculateExpiryDate } from '../utils/expiryDateCalculator';
import { KeyboardModal } from './KeyboardModal';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (name: string, expiryDate: string, category: string, quantity: number) => void;
  categories?: Array<{ id: string; name: string }>;
}

const categoryKeywords: Record<string, string[]> = {
  fruit: [
    'appel', 'peer', 'banaan', 'sinaasappel', 'mandarijn', 'druif', 'aardbei',
    'framboos', 'bosbes', 'kiwi', 'mango', 'ananas', 'watermeloen', 'meloen',
    'perzik', 'abrikoos', 'pruim', 'kers', 'citroen', 'limoen', 'passievrucht',
    'papaya', 'granaatappel', 'vijg', 'frambozen', 'aardbeien', 'druiven',
    'blauwe bessen', 'appels', 'peren', 'kersen'
  ],
  groenten: [
    'tomaat', 'komkommer', 'paprika', 'ui', 'knoflook', 'wortel', 'sla',
    'spinazie', 'broccoli', 'bloemkool', 'courgette', 'aubergine', 'pompoen',
    'selderij', 'prei', 'champignon', 'paddenstoel', 'radijs', 'rode kool',
    'witte kool', 'spitskool', 'andijvie', 'rucola', 'veldsla', 'Chinese kool',
    'paksoi', 'boerenkool', 'snijbonen', 'sperziebonen', 'erwten', 'mais',
    'tomaten', 'wortelen', 'uien', 'paprikas', 'champignons'
  ],
  zuivel: [
    'melk', 'yoghurt', 'kwark', 'kaas', 'room', 'boter', 'karnemelk',
    'chocolademelk', 'vla', 'pudding', 'hangop', 'cottage cheese', 'ricotta',
    'mozzarella', 'cheddar', 'geitenkaas', 'brie', 'camembert', 'parmezaan',
    'mascarpone', 'crème fraîche', 'slagroom', 'koffiemelk', 'havermelk',
    'amandelmelk', 'sojamelk', 'kokosmelk', 'goudse kaas', 'oude kaas',
    'jonge kaas',
    'ei', 'eieren', 'kippeneieren', 'biologische eieren', 'scharrel',
    'scharreleieren', 'vrije uitloop', 'kwartelei', 'kwartel eieren',
    'eidooier', 'eiwit'
  ],
  vlees: [
    'kip', 'kippenvlees', 'gehakt', 'rundergehakt', 'varkensvlees', 'rundvlees',
    'biefstuk', 'speklappen', 'ribeye', 'entrecote', 'schnitzel', 'kipfilet',
    'kippendij', 'kippenpoot', 'varkenshaas', 'runderhaas', 'worst', 'salami',
    'ham', 'bacon', 'spek', 'lamsgehakt', 'lamsvlees', 'ossenhaas', 'rosbief',
    'kippenborst', 'kalfsgehakt', 'kalveren'
  ],
  vis: [
    'zalm', 'tonijn', 'kabeljauw', 'schol', 'haring', 'makreel', 'forel',
    'zeebaars', 'garnalen', 'garnaal', 'mosselen', 'inktvis', 'octopus',
    'krab', 'kreeft', 'scampi', 'pangasius', 'tilapia', 'sardines', 'ansjovis',
    'heilbot', 'tong', 'paling', 'sushi', 'sashimi'
  ],
  dranken: [
    'water', 'sap', 'cola', 'fanta', 'sprite', 'limonade', 'ijsthee',
    'vruchtensap', 'sinaasappelsap', 'appelsap', 'wijn', 'bier', 'champagne',
    'prosecco', 'frisdrank', 'energy drink', 'sportdrank', 'smoothie',
    'koffie', 'espresso', 'cappuccino'
  ],
  ijs: [
    'ijs', 'ijsjes', 'roomijs', 'sorbet', 'bevroren', 'diepvries', 'vriezer',
    'bevroren groenten', 'bevroren fruit', 'diepvriespizza', 'ijsblokjes',
    'magnum', 'cornetto', 'ben & jerry', 'haagen-dazs', 'ijstaart'
  ],
};

const categoryOptions = [
  { id: 'fruit', name: 'Fruit' },
  { id: 'groenten', name: 'Groenten' },
  { id: 'zuivel', name: 'Zuivel & Eieren' },
  { id: 'vlees', name: 'Vlees' },
  { id: 'vis', name: 'Vis' },
  { id: 'dranken', name: 'Dranken' },
  { id: 'ijs', name: 'Ijs & Vriezer' },
  { id: 'overig', name: 'Overig' },
];

export function AddProductModal({ isOpen, onClose, onAddProduct, categories }: AddProductModalProps) {
  const [productName, setProductName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeInput, setActiveInput] = useState<'name' | 'quantity' | null>(null);

  // Use provided categories or default ones
  const availableCategories = categories || categoryOptions;

  const detectCategory = (name: string): { id: string; name: string } | null => {
    const lowerName = name.toLowerCase();

    for (const [categoryId, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (lowerName.includes(keyword)) {
          const categoryNames: Record<string, string> = {
            fruit: 'Fruit',
            groenten: 'Groenten',
            zuivel: 'Zuivel & Eieren',
            vlees: 'Vlees',
            vis: 'Vis',
            dranken: 'Dranken',
            ijs: 'Ijs & Vriezer',
            overig: 'Overig',
          };
          return { id: categoryId, name: categoryNames[categoryId] };
        }
      }
    }

    return { id: 'overig', name: 'Overig' };
  };

  const handleNameChange = (value: string) => {
    setProductName(value);
    if (value.trim()) {
      const detected = detectCategory(value);
      if (detected) {
        setDetectedCategory(detected.id);
        // Only auto-set if user hasn't manually selected a category
        if (!selectedCategory) {
          setSelectedCategory(detected.id);
          setCategoryName(detected.name);
          // Automatically set expiry date based on category
          const calculatedExpiry = calculateExpiryDate(detected.id);
          setExpiryDate(calculatedExpiry);
        }
      }
    } else {
      setDetectedCategory(null);
    }
  };

  const handleCategoryChange = (newCategoryId: string) => {
    setSelectedCategory(newCategoryId);
    const categoryOption = availableCategories.find(opt => opt.id === newCategoryId);
    if (categoryOption) {
      setCategoryName(categoryOption.name);
      // Update expiry date based on new category
      const calculatedExpiry = calculateExpiryDate(newCategoryId);
      setExpiryDate(calculatedExpiry);
    }
  };

  const handleKeyboardChange = (input: string) => {
    if (activeInput === 'name') {
      handleNameChange(input);
    } else if (activeInput === 'quantity') {
      const numValue = parseInt(input) || 1;
      setQuantity(numValue);
    }
  };

  const handleAdd = () => {
    if (productName.trim() && expiryDate && selectedCategory && quantity > 0) {
      onAddProduct(productName.trim(), expiryDate, selectedCategory, quantity);
      setProductName('');
      setExpiryDate('');
      setDetectedCategory(null);
      setSelectedCategory('');
      setCategoryName('');
      setQuantity(1);
      setActiveInput(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Nieuw product toevoegen</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Voeg een nieuw product toe aan je inventaris.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="productName">Productnaam</Label>
              <Input
                id="productName"
                value={productName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Bijv. Melk, Appels, Kip..."
                className="mt-1"
                onFocus={() => setActiveInput('name')}
                readOnly
              />
            </div>

            <div>
              <Label htmlFor="productCategory">Categorie</Label>
              <select
                id="productCategory"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecteer een categorie...</option>
                {availableCategories.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              {detectedCategory && selectedCategory === detectedCategory && (
                <p className="text-xs text-gray-500 mt-1">
                  ✓ Automatisch gedetecteerd, pas aan indien nodig
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="productQuantity">Aantal</Label>
              <Input
                id="productQuantity"
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="mt-1"
                onFocus={() => setActiveInput('quantity')}
                readOnly
              />
            </div>

            <div>
              <Label htmlFor="productExpiryDate">Houdbaarheidsdatum</Label>
              <Input
                id="productExpiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="mt-1"
              />
              {expiryDate && (
                <p className="text-xs text-gray-500 mt-1">
                  ✓ Automatisch ingesteld op basis van producttype
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 Tip: Het systeem bepaalt automatisch de categorie op basis van de productnaam
              </p>
            </div>

            {activeInput && (
              <KeyboardModal
                isOpen={!!activeInput}
                onClose={() => setActiveInput(null)}
                onChange={handleKeyboardChange}
                value={activeInput === 'name' ? productName : quantity.toString()}
                layout={activeInput === 'quantity' ? 'numeric' : 'default'}
                inputName={activeInput}
                placeholder={activeInput === 'name' ? 'Product naam' : 'Aantal'}
              />
            )}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleAdd}
                disabled={!productName.trim() || !expiryDate || !selectedCategory || quantity < 1}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Toevoegen
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1">
                Annuleren
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}