import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle, X, FileText, Edit2, Apple, Fish, Milk, Beef, Carrot, Egg, Wine, IceCream, Droplet, Banana, Cherry, Grape, Pizza, Croissant, Coffee, Cookie, CakeSlice } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { createWorker } from 'tesseract.js';
import { toast } from 'sonner';
import { calculateExpiryDate } from '../utils/expiryDateCalculator';
import { VirtualKeyboard } from './VirtualKeyboard';

interface ReceiptScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductsDetected: (products: Array<{ name: string; category: string; quantity?: number }>) => void;
}

const categoryKeywords: Record<string, string[]> = {
  fruit: [
    'appel', 'peer', 'banaan', 'sinaasappel', 'mandarijn', 'druif', 'aardbei',
    'framboos', 'bosbes', 'kiwi', 'mango', 'ananas', 'watermeloen', 'meloen',
    'perzik', 'abrikoos', 'pruim', 'kers', 'citroen', 'limoen', 'appels', 'peren',
  ],
  groenten: [
    'tomaat', 'komkommer', 'paprika', 'ui', 'knoflook', 'wortel', 'sla',
    'spinazie', 'broccoli', 'bloemkool', 'courgette', 'aubergine', 'champignon',
    'tomaten', 'wortelen', 'uien', 'paprikas', 'champignons',
  ],
  zuivel: [
    'melk', 'yoghurt', 'kwark', 'kaas', 'room', 'boter', 'karnemelk',
    'chocolademelk', 'vla', 'pudding', 'mozzarella', 'cheddar', 'geitenkaas',
    'ei', 'eieren', 'kippeneieren', 'scharrel',
  ],
  vlees: [
    'kip', 'gehakt', 'rundergehakt', 'varkensvlees', 'rundvlees',
    'biefstuk', 'kipfilet', 'worst', 'salami', 'ham', 'bacon', 'spek',
  ],
  vis: [
    'zalm', 'tonijn', 'kabeljauw', 'schol', 'haring', 'makreel', 'forel',
    'garnalen', 'garnaal', 'mosselen',
  ],
  dranken: [
    'water', 'sap', 'cola', 'fanta', 'sprite', 'limonade', 'ijsthee',
    'vruchtensap', 'sinaasappelsap', 'appelsap', 'wijn', 'bier',
  ],
  ijs: [
    'ijs', 'ijsjes', 'roomijs', 'sorbet', 'bevroren', 'diepvries',
  ],
};

export function ReceiptScanModal({ isOpen, onClose, onProductsDetected }: ReceiptScanModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detectedProducts, setDetectedProducts] = useState<Array<{ name: string; category: string; quantity?: number }>>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scannedLines, setScannedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState<number>(0);
  const [showTextInput, setShowTextInput] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('1');
  const [editCategory, setEditCategory] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const editNameRef = useRef<HTMLInputElement>(null);
  const editQuantityRef = useRef<HTMLInputElement>(null);

  const getProductIcon = (productName: string) => {
    const lowerName = productName.toLowerCase();
    
    // Fruit
    if (lowerName.includes('appel')) return Apple;
    if (lowerName.includes('banaan')) return Banana;
    if (lowerName.includes('kers') || lowerName.includes('kersen')) return Cherry;
    if (lowerName.includes('druif') || lowerName.includes('druiven')) return Grape;
    
    // Groenten
    if (lowerName.includes('wortel') || lowerName.includes('wortelen')) return Carrot;
    
    // Zuivel
    if (lowerName.includes('melk') || lowerName.includes('yoghurt') || lowerName.includes('kwark')) return Milk;
    
    // Vlees
    if (lowerName.includes('vlees') || lowerName.includes('kip') || lowerName.includes('gehakt')) return Beef;
    
    // Vis
    if (lowerName.includes('zalm') || lowerName.includes('vis') || lowerName.includes('tonijn')) return Fish;
    
    // Eieren
    if (lowerName.includes('ei') || lowerName.includes('eieren')) return Egg;
    
    // Dranken
    if (lowerName.includes('water') || lowerName.includes('sap') || lowerName.includes('cola') || lowerName.includes('wijn') || lowerName.includes('bier')) return Droplet;
    if (lowerName.includes('koffie') || lowerName.includes('thee')) return Coffee;
    
    // Ijs
    if (lowerName.includes('ijs')) return IceCream;
    
    // Brood/bakkerij
    if (lowerName.includes('brood') || lowerName.includes('croissant')) return Croissant;
    if (lowerName.includes('koek')) return Cookie;
    if (lowerName.includes('taart') || lowerName.includes('gebak')) return CakeSlice;
    
    // Pizza/fastfood
    if (lowerName.includes('pizza')) return Pizza;
    
    // Default: gebruik categorie icon
    const category = detectCategory(productName);
    const categoryIcons: Record<string, any> = {
      fruit: Apple,
      groenten: Carrot,
      zuivel: Milk,
      vlees: Beef,
      vis: Fish,
      eieren: Egg,
      dranken: Droplet,
      ijs: IceCream,
      overig: Wine,
    };
    
    return categoryIcons[category] || Wine;
  };

  const detectCategory = (name: string): string => {
    const lowerName = name.toLowerCase();

    for (const [categoryId, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (lowerName.includes(keyword)) {
          return categoryId;
        }
      }
    }

    return 'overig';
  };

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setDetectedProducts([]);
    setScannedLines([]);
    setCurrentLine(0);

    try {
      // Show image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      const worker = await createWorker('nld', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      // Get all lines
      const allLines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      setScannedLines(allLines);

      // Process line by line with visual feedback
      const products: Array<{ name: string; category: string; quantity?: number }> = [];
      const skipPatterns = [
        /^\s*$/,
        /totaal/i,
        /subtotaal/i,
        /btw/i,
        /vat/i,
        /pinpas/i,
        /contant/i,
        /datum/i,
        /date/i,
        /tijd/i,
        /time/i,
        /bon/i,
        /receipt/i,
        /kassier/i,
        /cashier/i,
        /^\d+$/,
        /^[€$]\s*\d/,
        /^\d+[.,]\d+$/,
        /bedankt/i,
        /thank/i,
        /welkom/i,
        /welcome/i,
        /^\*+$/,
        /^-+$/,
        /^=+$/,
      ];

      for (let i = 0; i < allLines.length; i++) {
        setCurrentLine(i);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for visual effect
        
        let line = allLines[i];
        
        // Skip empty lines and common receipt text
        if (skipPatterns.some(pattern => pattern.test(line))) {
          continue;
        }

        // Skip lines that are mostly numbers/prices
        if (/^\d+[.,]\d+/.test(line) || /[€$£]\s*\d/.test(line)) {
          continue;
        }

        // Check for "product:aantal" format (colon format - primary)
        let productName = line;
        let quantity = 1;
        const colonMatch = line.match(/^(.+?)\s*:\s*(\d+)$/);
        if (colonMatch) {
          productName = colonMatch[1].trim();
          quantity = parseInt(colonMatch[2], 10);
        }

        // Check for "product - aantal" format (dash format - secondary)
        if (!colonMatch) {
          const dashMatch = line.match(/^(.+?)\s*-\s*(\d+)$/);
          if (dashMatch) {
            productName = dashMatch[1].trim();
            quantity = parseInt(dashMatch[2], 10);
          }
        }

        // Remove price information from the end
        productName = productName.replace(/\s*[\d.,]+\s*[€$]?\s*$/g, '');
        productName = productName.replace(/\s*[€$]\s*[\d.,]+\s*$/g, '');
        
        // Remove quantity indicators (only if not already extracted from colon/dash format)
        if (!colonMatch) {
          const quantityMatch = productName.match(/^(\d+)x\s*(.+)$/i) || productName.match(/^(\d+)\s*st\s*(.+)$/i);
          if (quantityMatch) {
            quantity = parseInt(quantityMatch[1], 10);
            productName = quantityMatch[2];
          }
        }
        
        // Clean up the product name
        productName = productName.trim();

        // Only add if product has meaningful content (at least 3 characters)
        if (productName.length >= 3 && /[a-zA-Z]/.test(productName)) {
          const category = detectCategory(productName);
          
          // Don't add if it's a duplicate
          if (!products.some(p => p.name.toLowerCase() === productName.toLowerCase())) {
            products.push({ name: productName, category, quantity });
            setDetectedProducts([...products]); // Update in real-time
          }
        }
      }
      
      if (products.length === 0) {
        toast.error('Geen producten gevonden op het kassaticket');
      } else {
        toast.success(`${products.length} product(en) gedetecteerd!`);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Fout bij het verwerken van de afbeelding');
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setScannedLines([]);
      setCurrentLine(0);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleAddProducts = () => {
    onProductsDetected(detectedProducts);
    handleClose();
  };

  const handleClose = () => {
    setDetectedProducts([]);
    setSelectedImage(null);
    setIsProcessing(false);
    setProgress(0);
    onClose();
  };

  const removeProduct = (index: number) => {
    setDetectedProducts(products => products.filter((_, i) => i !== index));
  };

  const getCategoryName = (categoryId: string): string => {
    const names: Record<string, string> = {
      fruit: 'Fruit',
      groenten: 'Groenten',
      zuivel: 'Zuivel & Eieren',
      vlees: 'Vlees',
      vis: 'Vis',
      dranken: 'Dranken',
      ijs: 'Ijs & Vriezer',
      overig: 'Overig',
    };
    return names[categoryId] || 'Overig';
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedData = event.clipboardData.getData('text');
    setPastedText(pastedData);
    processPastedText(pastedData);
  };

  const processPastedText = (text: string) => {
    setIsProcessing(true);
    setProgress(0);
    setDetectedProducts([]);
    setScannedLines([]);
    setCurrentLine(0);

    setTimeout(async () => {
      try {
        // Get all lines
        const allLines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        setScannedLines(allLines);

        // Process line by line with visual feedback
        const products: Array<{ name: string; category: string; quantity?: number }> = [];
        const skipPatterns = [
          /^\s*$/,
          /totaal/i,
          /subtotaal/i,
          /btw/i,
          /vat/i,
          /pinpas/i,
          /contant/i,
          /datum/i,
          /date/i,
          /tijd/i,
          /time/i,
          /bon/i,
          /receipt/i,
          /kassier/i,
          /cashier/i,
          /^\d+$/,
          /^[€$]\s*\d/,
          /^\d+[.,]\d+$/,
          /bedankt/i,
          /thank/i,
          /welkom/i,
          /welcome/i,
          /^\*+$/,
          /^-+$/,
          /^=+$/,
        ];

        for (let i = 0; i < allLines.length; i++) {
          setCurrentLine(i);
          await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for visual effect
          
          let line = allLines[i];
          
          // Skip empty lines and common receipt text
          if (skipPatterns.some(pattern => pattern.test(line))) {
            continue;
          }

          // Skip lines that are mostly numbers/prices
          if (/^\d+[.,]\d+/.test(line) || /[€$£]\s*\d/.test(line)) {
            continue;
          }

          // Check for "product:aantal" format (colon format - primary)
          let productName = line;
          let quantity = 1;
          const colonMatch = line.match(/^(.+?)\s*:\s*(\d+)$/);
          if (colonMatch) {
            productName = colonMatch[1].trim();
            quantity = parseInt(colonMatch[2], 10);
          }

          // Check for "product - aantal" format (dash format - secondary)
          if (!colonMatch) {
            const dashMatch = line.match(/^(.+?)\s*-\s*(\d+)$/);
            if (dashMatch) {
              productName = dashMatch[1].trim();
              quantity = parseInt(dashMatch[2], 10);
            }
          }

          // Remove price information from the end
          productName = productName.replace(/\s*[\d.,]+\s*[€$]?\s*$/g, '');
          productName = productName.replace(/\s*[€$]\s*[\d.,]+\s*$/g, '');
          
          // Remove quantity indicators (only if not already extracted from colon/dash format)
          if (!colonMatch) {
            const quantityMatch = productName.match(/^(\d+)x\s*(.+)$/i) || productName.match(/^(\d+)\s*st\s*(.+)$/i);
            if (quantityMatch) {
              quantity = parseInt(quantityMatch[1], 10);
              productName = quantityMatch[2];
            }
          }
          
          // Clean up the product name
          productName = productName.trim();

          // Only add if product has meaningful content (at least 3 characters)
          if (productName.length >= 3 && /[a-zA-Z]/.test(productName)) {
            const category = detectCategory(productName);
            
            // Don't add if it's a duplicate
            if (!products.some(p => p.name.toLowerCase() === productName.toLowerCase())) {
              products.push({ name: productName, category, quantity });
              setDetectedProducts([...products]); // Update in real-time
            }
          }
        }
        
        if (products.length === 0) {
          toast.error('Geen producten gevonden op het kassaticket');
        } else {
          toast.success(`${products.length} product(en) gedetecteerd!`);
        }
      } catch (error) {
        console.error('Error processing pasted text:', error);
        toast.error('Fout bij het verwerken van de geplakte tekst');
      } finally {
        setIsProcessing(false);
        setProgress(0);
        setScannedLines([]);
        setCurrentLine(0);
      }
    }, 100);
  };

  const startEditing = (index: number) => {
    const product = detectedProducts[index];
    setEditingIndex(index);
    setEditName(product.name);
    setEditQuantity(product.quantity?.toString() || '1');
    setEditCategory(product.category);
    setTimeout(() => {
      editNameRef.current?.focus();
    }, 100);
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      const updatedProducts = detectedProducts.map((product, index) => {
        if (index === editingIndex) {
          return {
            name: editName,
            category: editCategory,
            quantity: parseInt(editQuantity, 10),
          };
        }
        return product;
      });
      setDetectedProducts(updatedProducts);
      setEditingIndex(null);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Kassaticket scannen</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Scan je kassaticket om de producten automatisch toe te voegen aan je inventaris.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {!isProcessing && detectedProducts.length === 0 && !showTextInput && (
            <>
              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  variant="outline"
                  className="h-32 flex flex-col gap-2"
                >
                  <Camera className="w-8 h-8" />
                  <span>Foto maken</span>
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="h-32 flex flex-col gap-2"
                >
                  <Upload className="w-8 h-8" />
                  <span>Bestand uploaden</span>
                </Button>
                <Button
                  onClick={() => setShowTextInput(true)}
                  variant="outline"
                  className="h-32 flex flex-col gap-2"
                >
                  <FileText className="w-8 h-8" />
                  <span>Tekst plakken</span>
                </Button>
              </div>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Tips voor beste resultaten:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Zorg voor goede verlichting</li>
                  <li>• Houd de camera recht boven het ticket</li>
                  <li>• Maak de foto zo scherp mogelijk</li>
                  <li>• Bij tekst plakken: gebruik "product:aantal" (bijv. "Appels:3") of "product - aantal"</li>
                  <li>• Controleer en bewerk de gedetecteerde producten voordat je ze toevoegt</li>
                </ul>
              </div>
            </>
          )}

          {!isProcessing && detectedProducts.length === 0 && showTextInput && (
            <>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Plak hier de tekst van je kassaticket:
                  </label>
                  <textarea
                    ref={textAreaRef}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    onFocus={() => setActiveInput('pastedText')}
                    onBlur={() => setActiveInput(null)}
                    onPaste={handlePaste}
                    placeholder="Plak hier de tekst van je kassaticket..."
                    className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => processPastedText(pastedText)} 
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                    disabled={!pastedText.trim()}
                  >
                    Tekst verwerken
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowTextInput(false);
                      setPastedText('');
                    }} 
                    variant="outline" 
                    className="flex-1"
                  >
                    Terug
                  </Button>
                </div>
              </div>

              {activeInput === 'pastedText' && (
                <VirtualKeyboard
                  inputRef={textAreaRef}
                  value={pastedText}
                  onChange={setPastedText}
                  onClose={() => setActiveInput(null)}
                />
              )}
            </>
          )}

          {isProcessing && (
            <div className="py-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2 text-center">Kassaticket verwerken...</p>
              <p className="text-sm text-gray-600 mb-4 text-center">Dit kan even duren</p>
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mb-4 text-center">{progress}%</p>

              {scannedLines.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2 text-center">
                    Regel {currentLine + 1} van {scannedLines.length} verwerken...
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                    {scannedLines.map((line, index) => (
                      <div
                        key={index}
                        className={`py-1 px-2 text-sm transition-all ${
                          index === currentLine
                            ? 'bg-blue-100 font-semibold text-blue-900'
                            : index < currentLine
                            ? 'text-gray-400'
                            : 'text-gray-600'
                        }`}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedImage && !isProcessing && (
            <div className="mb-4">
              <img src={selectedImage} alt="Receipt" className="max-h-48 mx-auto rounded-lg border" />
            </div>
          )}

          {detectedProducts.length > 0 && !isProcessing && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-semibold">
                  {detectedProducts.length} product(en) gedetecteerd
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {detectedProducts.map((product, index) => {
                  const ProductIcon = getProductIcon(product.name);
                  const isEditing = editingIndex === index;

                  if (isEditing) {
                    return (
                      <div
                        key={index}
                        className="bg-blue-50 border-2 border-blue-400 rounded-lg p-3"
                      >
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Productnaam
                            </label>
                            <input
                              ref={editNameRef}
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onFocus={() => setActiveInput('editName')}
                              onBlur={() => setTimeout(() => setActiveInput(null), 200)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Aantal
                              </label>
                              <input
                                ref={editQuantityRef}
                                type="number"
                                min="1"
                                value={editQuantity}
                                onChange={(e) => setEditQuantity(e.target.value)}
                                onFocus={() => setActiveInput('editQuantity')}
                                onBlur={() => setTimeout(() => setActiveInput(null), 200)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Categorie
                              </label>
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="fruit">Fruit</option>
                                <option value="groenten">Groenten</option>
                                <option value="zuivel">Zuivel & Eieren</option>
                                <option value="vlees">Vlees</option>
                                <option value="vis">Vis</option>
                                <option value="dranken">Dranken</option>
                                <option value="ijs">Ijs & Vriezer</option>
                                <option value="overig">Overig</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button onClick={saveEdit} size="sm" className="flex-1">
                              Opslaan
                            </Button>
                            <Button onClick={cancelEdit} size="sm" variant="outline" className="flex-1">
                              Annuleren
                            </Button>
                          </div>

                          {activeInput === 'editName' && editNameRef.current && (
                            <VirtualKeyboard
                              inputRef={editNameRef}
                              value={editName}
                              onChange={setEditName}
                              onClose={() => setActiveInput(null)}
                            />
                          )}

                          {activeInput === 'editQuantity' && editQuantityRef.current && (
                            <VirtualKeyboard
                              inputRef={editQuantityRef}
                              value={editQuantity}
                              onChange={setEditQuantity}
                              onClose={() => setActiveInput(null)}
                              isNumeric
                            />
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={index}
                      className="bg-white border rounded-lg p-3 flex items-center gap-3 hover:border-blue-400 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <ProductIcon className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">
                          {product.name} {product.quantity && product.quantity > 1 && (
                            <span className="text-blue-600">× {product.quantity}</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          {getCategoryName(product.category)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => startEditing(index)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => removeProduct(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleAddProducts} className="flex-1 bg-blue-500 hover:bg-blue-600">
                  Producten toevoegen ({detectedProducts.length})
                </Button>
                <Button onClick={handleClose} variant="outline" className="flex-1">
                  Annuleren
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}