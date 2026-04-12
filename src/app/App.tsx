import { useState, useCallback, useEffect } from 'react';
import { FoodCategory } from './components/FoodCategory';
import { CategoryModal, FoodItem } from './components/CategoryModal';
import { AddProductModal } from './components/AddProductModal';
import { ReceiptScanModal } from './components/ReceiptScanModal';
import { NewCategoryModal } from './components/NewCategoryModal';
import { EditCategoryModal } from './components/EditCategoryModal';
import { ColorThemeModal, colorThemes } from './components/ColorThemeModal';
import { ZoneManagementModal } from './components/ZoneManagementModal';
import { AddZoneModal } from './components/AddZoneModal';
import { EditZoneNameModal } from './components/EditZoneNameModal';
import { DraggableZone } from './components/DraggableZone';
import { EmptySlot } from './components/EmptySlot';
import { Plus, Camera, FolderPlus, Palette, LayoutGrid, Edit2, Move } from 'lucide-react';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { calculateExpiryDate } from './utils/expiryDateCalculator';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
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
} from 'lucide-react';
import { GripVertical } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
}

const categories: Category[] = [
  { id: 'fruit', name: 'Fruit', icon: Apple, color: 'bg-green-500' },
  { id: 'groenten', name: 'Groenten', icon: Carrot, color: 'bg-orange-500' },
  { id: 'zuivel', name: 'Zuivel & Eieren', icon: Milk, color: 'bg-blue-500' },
  { id: 'vlees', name: 'Vlees', icon: Beef, color: 'bg-red-500' },
  { id: 'vis', name: 'Vis', icon: Fish, color: 'bg-cyan-500' },
  { id: 'dranken', name: 'Dranken', icon: Droplet, color: 'bg-indigo-500' },
  { id: 'ijs', name: 'Ijs & Vriezer', icon: IceCream, color: 'bg-purple-500' },
  { id: 'overig', name: 'Overig', icon: Wine, color: 'bg-pink-500' },
  { id: 'blikjes', name: 'Blikjes', icon: Package, color: 'bg-yellow-500' },
  { id: 'flessen', name: 'Flessen', icon: Beer, color: 'bg-teal-500' },
];

// Koelkast zones configuratie
const defaultFridgeZones = {
  vriezer: ['ijs', null, null], // 3 slots
  koelvakBoven: ['zuivel', 'vlees', 'vis'], // 3 slots
  koelvakOnder: [null, null, null], // 3 lege slots voor nieuwe categorieën
  groentelade: ['groenten', 'fruit', null], // 3 slots
  deur: ['dranken', null, null, null], // 4 slots
};

// Detect if device supports touch
const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Helper function to get icon by name
const getIconByName = (name: string) => {
  const iconMap: Record<string, any> = {
    Apple, Carrot, Milk, Beef, Droplet, Fish, IceCream, Wine, Package, Beer,
    Coffee, Cookie, Sandwich, Pizza, Cake, Cherry, Grape, Banana, Salad, Egg,
    Croissant, CakeSlice, Soup, Citrus, Candy, Martini, CupSoda, Drumstick,
    Wheat,
  };
  return iconMap[name] || Apple;
};

export default function App() {
  const [inventory, setInventory] = useState<Record<string, FoodItem[]>>(() => {
    // Clear old inventory data to force reload of sample data
    localStorage.removeItem('inventory');
    
    // Return sample inventory by default
    const defaultInventory = {
      groenten: [
        { id: '1', name: 'Wortelen', expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 2 },
        { id: '2', name: 'Komkommer', expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 1 },
        { id: '3', name: 'Tomaten', expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 4 },
        { id: '4', name: 'Paprika', expiryDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 3 },
        { id: '5', name: 'Sla', expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 1 },
      ],
      fruit: [
        { id: '6', name: 'Appels', expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 6 },
        { id: '7', name: 'Bananen', expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 5 },
        { id: '8', name: 'Sinaasappels', expiryDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 4 },
        { id: '9', name: 'Druiven', expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 1 },
      ],
      zuivel: [
        { id: '10', name: 'Melk', expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 2 },
        { id: '11', name: 'Yoghurt', expiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 8 },
        { id: '12', name: 'Kaas', expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 1 },
        { id: '13', name: 'Eieren (doos)', expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 1 },
        { id: '14', name: 'Boter', expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 1 },
      ],
      vlees: [
        { id: '15', name: 'Kipfilet (500g)', expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 1 },
        { id: '16', name: 'Gehakt (300g)', expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 1 },
        { id: '17', name: 'Bacon', expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 1 },
      ],
      vis: [
        { id: '18', name: 'Zalm (filet)', expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 2 },
        { id: '19', name: 'Garnalen (250g)', expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 1 },
      ],
      dranken: [
        { id: '20', name: 'Sinaasappelsap', expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 1 },
        { id: '21', name: 'Cola (blikjes)', expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 6 },
        { id: '22', name: 'Water (flessen)', expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 4 },
      ],
      ijs: [
        { id: '23', name: 'Vanille ijs (bak)', expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 1 },
        { id: '24', name: 'Pizza', expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 2 },
        { id: '25', name: 'Erwten (bevroren zak)', expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 1 },
      ],
      overig: [
        { id: '26', name: 'Mayonaise', expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 1 },
        { id: '27', name: 'Ketchup', expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: 1 },
      ],
    };
    
    // Save to localStorage so it persists
    localStorage.setItem('inventory', JSON.stringify(defaultInventory));
    
    return defaultInventory;
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showReceiptScanModal, setShowReceiptScanModal] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryZone, setNewCategoryZone] = useState<string>('');
  const [customCategories, setCustomCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('customCategories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Recreate icon references
        return parsed.map((cat: any) => ({
          ...cat,
          icon: getIconByName(cat.iconName),
        }));
      } catch {
        return [];
      }
    }
    return [];
  });
  const [fridgeZones, setFridgeZones] = useState(() => {
    const saved = localStorage.getItem('fridgeZones');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultFridgeZones;
      }
    }
    return defaultFridgeZones;
  });
  const [zoneOrder, setZoneOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('zoneOrder');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ['vriezer', 'koelvakBoven', 'koelvakOnder', 'groentelade', 'deur'];
      }
    }
    return ['vriezer', 'koelvakBoven', 'koelvakOnder', 'groentelade', 'deur'];
  });
  const [zoneTypes, setZoneTypes] = useState<Record<string, 'kast' | 'deur'>>(() => {
    const saved = localStorage.getItem('zoneTypes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          vriezer: 'kast',
          koelvakBoven: 'kast',
          koelvakOnder: 'kast',
          groentelade: 'kast',
          deur: 'deur',
        };
      }
    }
    return {
      vriezer: 'kast',
      koelvakBoven: 'kast',
      koelvakOnder: 'kast',
      groentelade: 'kast',
      deur: 'deur',
    };
  });
  const [colorTheme, setColorTheme] = useState(() => {
    const saved = localStorage.getItem('colorTheme');
    return saved || 'default';
  });
  const [showColorThemeModal, setShowColorThemeModal] = useState(false);
  const [showZoneManagementModal, setShowZoneManagementModal] = useState(false);
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [zoneManagementMode, setZoneManagementMode] = useState<'add' | 'remove'>('add');
  const [zoneNames, setZoneNames] = useState(() => {
    const saved = localStorage.getItem('zoneNames');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          vriezer: 'Vriezer',
          koelvakBoven: 'Koelvak Boven',
          koelvakOnder: 'Koelvak Onder',
          groentelade: 'Groentelade',
          deur: 'Deur',
        };
      }
    }
    return {
      vriezer: 'Vriezer',
      koelvakBoven: 'Koelvak Boven',
      koelvakOnder: 'Koelvak Onder',
      groentelade: 'Groentelade',
      deur: 'Deur',
    };
  });
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [showEditZoneNameModal, setShowEditZoneNameModal] = useState(false);
  const [zoneDragMode, setZoneDragMode] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [modifiedDefaultCategories, setModifiedDefaultCategories] = useState<Record<string, Partial<Category>>>(() => {
    const saved = localStorage.getItem('modifiedDefaultCategories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Recreate icon references
        const result: Record<string, Partial<Category>> = {};
        Object.keys(parsed).forEach(key => {
          result[key] = {
            ...parsed[key],
            icon: parsed[key].iconName ? getIconByName(parsed[key].iconName) : undefined,
          };
        });
        return result;
      } catch {
        return {};
      }
    }
    return {};
  });

  // Combine default and custom categories with modifications
  const allCategories = [
    ...categories.map(cat => {
      const modification = modifiedDefaultCategories[cat.id];
      if (modification) {
        return { ...cat, ...modification };
      }
      return cat;
    }),
    ...customCategories
  ];

  // Save custom categories to localStorage
  useEffect(() => {
    const categoriesToSave = customCategories.map(cat => ({
      ...cat,
      iconName: cat.icon.name || 'Apple', // Store icon name instead of component
    }));
    localStorage.setItem('customCategories', JSON.stringify(categoriesToSave));
  }, [customCategories]);

  // Save modified default categories to localStorage
  useEffect(() => {
    const modifiedToSave: Record<string, any> = {};
    Object.keys(modifiedDefaultCategories).forEach(key => {
      modifiedToSave[key] = {
        ...modifiedDefaultCategories[key],
        iconName: modifiedDefaultCategories[key].icon?.name || 'Apple',
      };
    });
    localStorage.setItem('modifiedDefaultCategories', JSON.stringify(modifiedToSave));
  }, [modifiedDefaultCategories]);

  // Save fridge zones to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('fridgeZones', JSON.stringify(fridgeZones));
  }, [fridgeZones]);

  // Save zone types to localStorage
  useEffect(() => {
    localStorage.setItem('zoneTypes', JSON.stringify(zoneTypes));
  }, [zoneTypes]);

  // Save inventory to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  const moveCategory = useCallback((dragIndex: number, hoverIndex: number, dragZone: string, targetZone: string) => {
    setFridgeZones((prevZones: any) => {
      const newZones = { ...prevZones };
      
      if (dragZone === targetZone) {
        // Moving within the same zone
        const zoneCategories = [...newZones[dragZone]];
        const draggedCategory = zoneCategories[dragIndex];
        zoneCategories.splice(dragIndex, 1);
        zoneCategories.splice(hoverIndex, 0, draggedCategory);
        newZones[dragZone] = zoneCategories;
      } else {
        // Moving between different zones
        const sourceZone = [...newZones[dragZone]];
        const targetZoneArray = [...newZones[targetZone]];
        
        const draggedCategory = sourceZone[dragIndex];
        sourceZone[dragIndex] = null; // Replace with null in source
        targetZoneArray[hoverIndex] = draggedCategory; // Place in target
        
        newZones[dragZone] = sourceZone;
        newZones[targetZone] = targetZoneArray;
      }
      
      return newZones;
    });
  }, []);

  const handleDropOnEmptySlot = useCallback((draggedId: string, draggedZone: string, targetZone: string, targetIndex: number) => {
    setFridgeZones((prevZones: any) => {
      const newZones = { ...prevZones };
      
      if (draggedZone === targetZone) {
        // Moving within the same zone
        const zoneCategories = [...newZones[draggedZone]];
        const dragIndex = zoneCategories.indexOf(draggedId);
        
        if (dragIndex !== -1) {
          zoneCategories.splice(dragIndex, 1);
          zoneCategories.splice(targetIndex, 0, draggedId);
          newZones[draggedZone] = zoneCategories;
        }
      } else {
        // Moving between different zones
        const sourceZone = [...newZones[draggedZone]];
        const targetZoneArray = [...newZones[targetZone]];
        
        const dragIndex = sourceZone.indexOf(draggedId);
        if (dragIndex !== -1) {
          sourceZone[dragIndex] = null; // Replace with null in source
          targetZoneArray[targetIndex] = draggedId; // Place in target
          
          newZones[draggedZone] = sourceZone;
          newZones[targetZone] = targetZoneArray;
        }
      }
      
      return newZones;
    });
  }, []);

  const getCategoryItems = (categoryId: string): FoodItem[] => {
    return inventory[categoryId] || [];
  };

  const getTotalItemCount = (categoryId: string): number => {
    const items = getCategoryItems(categoryId);
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleAddItem = (categoryId: string, name: string, expiryDate: string, quantity: number) => {
    setInventory((prev) => {
      const categoryItems = prev[categoryId] || [];
      
      // Check if item with same name and expiry date exists
      const existingItemIndex = categoryItems.findIndex(
        (item) => item.name === name && item.expiryDate === expiryDate
      );

      if (existingItemIndex >= 0) {
        // Increase quantity
        const updatedItems = [...categoryItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return { ...prev, [categoryId]: updatedItems };
      } else {
        // Add new item
        const newItem: FoodItem = {
          id: Date.now().toString() + Math.random(),
          name,
          expiryDate,
          quantity,
        };
        return { ...prev, [categoryId]: [...categoryItems, newItem] };
      }
    });
  };

  const handleRemoveItem = (categoryId: string, itemId: string) => {
    setInventory((prev) => {
      const categoryItems = prev[categoryId] || [];
      const updatedItems = categoryItems
        .map((item) => {
          if (item.id === itemId) {
            // Verlaag quantity met 1
            const newQuantity = item.quantity - 1;
            // Als quantity <= 0, verwijder het item (door null terug te geven)
            if (newQuantity <= 0) {
              return null;
            }
            // Anders, update de quantity
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item): item is FoodItem => item !== null); // Filter null waarden eruit
      return { ...prev, [categoryId]: updatedItems };
    });
  };

  const handleRemoveItemCompletely = (categoryId: string, itemId: string) => {
    setInventory((prev) => {
      const categoryItems = prev[categoryId] || [];
      const updatedItems = categoryItems.filter((item) => item.id !== itemId);
      return { ...prev, [categoryId]: updatedItems };
    });
  };

  const handleUpdateQuantity = (categoryId: string, itemId: string, newQuantity: number) => {
    setInventory((prev) => {
      const categoryItems = prev[categoryId] || [];
      const updatedItems = categoryItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      return { ...prev, [categoryId]: updatedItems };
    });
  };

  const handleUpdateExpiryDate = (categoryId: string, itemId: string, newExpiryDate: string) => {
    setInventory((prev) => {
      const categoryItems = prev[categoryId] || [];
      const updatedItems = categoryItems.map((item) =>
        item.id === itemId ? { ...item, expiryDate: newExpiryDate } : item
      );
      return { ...prev, [categoryId]: updatedItems };
    });
  };

  const handleAddProductFromModal = (name: string, expiryDate: string, categoryId: string, quantity: number) => {
    handleAddItem(categoryId, name, expiryDate, quantity);
  };

  const handleProductsFromReceipt = (products: Array<{ name: string; category: string; quantity?: number }>) => {
    // Calculate default expiry date (7 days from now)
    const defaultExpiryDate = new Date();
    defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 7);
    const expiryDateString = defaultExpiryDate.toISOString().split('T')[0];

    products.forEach(product => {
      handleAddItem(product.category, product.name, expiryDateString, product.quantity || 1);
    });
  };

  const handleCreateCategory = (name: string, iconName: string, color: string, zone: string) => {
    const newCategory: Category = {
      id: `custom_${Date.now()}`,
      name,
      icon: getIconByName(iconName),
      color,
    };
    
    setCustomCategories(prev => [...prev, newCategory]);
    
    // Find first empty slot in the zone and replace it with the new category
    setFridgeZones(prev => {
      const newZones = { ...prev };
      const zoneSlots = [...newZones[zone]];
      const firstEmptyIndex = zoneSlots.findIndex(slot => slot === null);
      
      if (firstEmptyIndex !== -1) {
        zoneSlots[firstEmptyIndex] = newCategory.id;
      } else {
        // If no empty slot, add to the end
        zoneSlots.push(newCategory.id);
      }
      
      newZones[zone] = zoneSlots;
      return newZones;
    });
  };

  const handleOpenNewCategoryModal = (zone: string) => {
    setNewCategoryZone(zone);
    setShowNewCategoryModal(true);
  };

  const handleDeleteCategory = useCallback((categoryId: string, zone: string, index: number) => {
    // Remove category from zone (replace with null)
    setFridgeZones((prevZones: any) => {
      const newZones = { ...prevZones };
      const zoneSlots = [...newZones[zone]];
      zoneSlots[index] = null;
      newZones[zone] = zoneSlots;
      return newZones;
    });

    // Also remove from custom categories if it's custom
    if (categoryId.startsWith('custom_')) {
      setCustomCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }

    // Remove inventory for this category
    setInventory(prev => {
      const newInventory = { ...prev };
      delete newInventory[categoryId];
      return newInventory;
    });
  }, []);

  const handleSelectColorTheme = (themeId: string) => {
    setColorTheme(themeId);
    localStorage.setItem('colorTheme', themeId);
  };

  const handleAddZoneRow = (zone: string) => {
    setFridgeZones(prev => {
      const newZones = { ...prev };
      const zoneArray = [...newZones[zone]];
      // Determine slots per row based on zone type
      const zoneType = zoneTypes[zone] || 'kast';
      const slotsToAdd = zoneType === 'deur' ? 1 : 3;
      for (let i = 0; i < slotsToAdd; i++) {
        zoneArray.push(null);
      }
      newZones[zone] = zoneArray;
      return newZones;
    });
  };

  const handleRemoveZoneRow = (zone: string) => {
    setFridgeZones(prev => {
      const newZones = { ...prev };
      const zoneArray = [...newZones[zone]];
      // Determine slots per row based on zone type
      const zoneType = zoneTypes[zone] || 'kast';
      const slotsToRemove = zoneType === 'deur' ? 1 : 3;
      const minimumSlots = zoneType === 'deur' ? 1 : 3;
      
      // Only remove if we have more than minimum (1 row)
      if (zoneArray.length > minimumSlots) {
        zoneArray.splice(-slotsToRemove, slotsToRemove);
      }
      
      newZones[zone] = zoneArray;
      return newZones;
    });
  };

  const getZoneRowCounts = () => {
    const counts: Record<string, number> = {};
    
    zoneOrder.forEach(zoneKey => {
      const zoneData = fridgeZones[zoneKey];
      if (zoneData) {
        const zoneType = zoneTypes[zoneKey];
        const slotsPerRow = (zoneType === 'deur') ? 1 : 3;
        counts[zoneKey] = Math.ceil(zoneData.length / slotsPerRow);
      }
    });
    
    return counts;
  };

  const handleEditZoneName = (zone: string, newName: string) => {
    setZoneNames(prev => {
      const updated = {
        ...prev,
        [zone]: newName,
      };
      localStorage.setItem('zoneNames', JSON.stringify(updated));
      return updated;
    });
  };

  const handleReorderZones = (newOrder: string[]) => {
    setZoneOrder(newOrder);
    localStorage.setItem('zoneOrder', JSON.stringify(newOrder));
  };

  const handleAddNewZone = (zoneName: string, zoneType?: 'kast' | 'deur') => {
    const zoneKey = `custom_zone_${Date.now()}`;
    
    // Ask for zone type if not provided
    if (!zoneType) {
      const typeChoice = confirm('Kies zone type:\nOK = Kast (3 kolommen)\nAnnuleren = Deur (1 kolom)');
      zoneType = typeChoice ? 'kast' : 'deur';
    }
    
    const initialSlots = zoneType === 'deur' ? [null] : [null, null, null];
    
    setFridgeZones(prev => ({
      ...prev,
      [zoneKey]: initialSlots,
    }));
    setZoneNames(prev => ({
      ...prev,
      [zoneKey]: zoneName,
    }));
    setZoneTypes(prev => ({
      ...prev,
      [zoneKey]: zoneType!,
    }));
    setZoneOrder(prev => [...prev, zoneKey]);
  };

  const handleRemoveCustomZone = (zoneKey: string) => {
    setFridgeZones(prev => {
      const newZones = { ...prev };
      delete newZones[zoneKey];
      return newZones;
    });
    setZoneNames(prev => {
      const newNames = { ...prev };
      delete newNames[zoneKey];
      localStorage.setItem('zoneNames', JSON.stringify(newNames));
      return newNames;
    });
    setZoneTypes(prev => {
      const newTypes = { ...prev };
      delete newTypes[zoneKey];
      localStorage.setItem('zoneTypes', JSON.stringify(newTypes));
      return newTypes;
    });
    setZoneOrder(prev => {
      const newOrder = prev.filter(z => z !== zoneKey);
      localStorage.setItem('zoneOrder', JSON.stringify(newOrder));
      return newOrder;
    });
  };

  // Handle opening edit category modal
  const handleOpenEditCategoryModal = (categoryId: string) => {
    setEditingCategoryId(categoryId);
    setShowEditCategoryModal(true);
  };

  // Handle updating category
  const handleUpdateCategory = (categoryId: string, name: string, iconName: string, color: string) => {
    const isCustom = categoryId.startsWith('custom_');
    
    if (isCustom) {
      // Update custom category
      setCustomCategories(prev => 
        prev.map(cat => 
          cat.id === categoryId 
            ? { ...cat, name, icon: getIconByName(iconName), color }
            : cat
        )
      );
    } else {
      // Update default category modification
      setModifiedDefaultCategories(prev => ({
        ...prev,
        [categoryId]: {
          name,
          icon: getIconByName(iconName),
          color,
        },
      }));
    }
    
    setShowEditCategoryModal(false);
    setEditingCategoryId(null);
  };

  // Handle deleting category from edit modal
  const handleDeleteCategoryFromEdit = (categoryId: string) => {
    const isCustom = categoryId.startsWith('custom_');
    
    if (isCustom) {
      // Remove from custom categories
      setCustomCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
    
    // Find and remove from fridge zones
    Object.keys(fridgeZones).forEach(zoneKey => {
      const zone = fridgeZones[zoneKey];
      const categoryIndex = zone.findIndex(catId => catId === categoryId);
      if (categoryIndex !== -1) {
        setFridgeZones(prev => {
          const newZone = [...prev[zoneKey]];
          newZone[categoryIndex] = null;
          return { ...prev, [zoneKey]: newZone };
        });
      }
    });
    
    // Remove from inventory
    setInventory(prev => {
      const newInventory = { ...prev };
      delete newInventory[categoryId];
      return newInventory;
    });
    
    setShowEditCategoryModal(false);
    setEditingCategoryId(null);
  };

  // Get current theme configuration
  const theme = colorThemes.find(t => t.id === colorTheme) || colorThemes[0];

  const selectedCategoryData = allCategories.find((cat) => cat.id === selectedCategory);

  // Get only categories that are currently in the fridge
  const activeCategoryIds = new Set<string>();
  Object.values(fridgeZones).forEach((zone: any) => {
    zone.forEach((categoryId: string | null) => {
      if (categoryId) {
        activeCategoryIds.add(categoryId);
      }
    });
  });
  const activeCategories = allCategories.filter(cat => activeCategoryIds.has(cat.id));

  // Separate zones by type
  const kastZones = zoneOrder.filter(zoneKey => {
    const type = zoneTypes[zoneKey];
    return type === 'kast' || !type; // Default to kast if not specified
  });
  
  const deurZones = zoneOrder.filter(zoneKey => {
    const type = zoneTypes[zoneKey];
    return type === 'deur';
  });

  // Zone color indicators
  const zoneColorMap: Record<string, string> = {
    vriezer: 'bg-purple-500',
    koelvakBoven: 'bg-blue-600',
    koelvakOnder: 'bg-blue-600',
    groentelade: 'bg-green-500',
    deur: 'bg-indigo-500',
  };

  // Helper function to get zone color
  const getZoneColor = (zoneKey: string) => {
    return zoneColorMap[zoneKey] || 'bg-gray-500';
  };

  // Helper function to render a zone
  const renderZone = (zoneKey: string, zoneType: 'kast' | 'deur', isLast: boolean = false) => {
    const zoneData = fridgeZones[zoneKey];
    if (!zoneData) return null;

    const zoneName = zoneNames[zoneKey] || zoneKey;
    const gridCols = zoneType === 'deur' ? 'grid-cols-1' : 'grid-cols-3';

    return (
      <div 
        key={zoneKey}
        className={`${zoneType === 'deur' ? 'flex-1 flex flex-col' : ''} ${isLast ? '' : 'mb-3 md:mb-4'}`}
      >
        <div className="flex items-center gap-1.5 md:gap-2.5 mb-1.5 md:mb-2.5">
          <div className={`w-2.5 h-2.5 md:w-3.5 md:h-3.5 ${getZoneColor(zoneKey)} rounded-full shadow-sm`}></div>
          <h3 className={`text-xs md:text-base font-bold ${theme.cardText} uppercase tracking-wider`}>{zoneName}</h3>
        </div>
        <div className={`${theme.cardBg} rounded-lg md:rounded-xl p-1.5 md:p-2.5 border ${theme.border} shadow-sm ${zoneType === 'deur' ? 'flex-1 flex flex-col' : ''}`}>
          <div className={`grid ${gridCols} gap-1.5 md:gap-2.5 ${zoneType === 'deur' ? 'h-full content-between' : ''}`}>
            {zoneData.map((categoryId: string | null, index: number) => {
              if (!categoryId) {
                return (
                  <EmptySlot 
                    key={`${zoneKey}-empty-${index}`} 
                    onClick={() => handleOpenNewCategoryModal(zoneKey)} 
                    zone={zoneKey} 
                    index={index} 
                    onDrop={handleDropOnEmptySlot}
                    theme={theme}
                  />
                );
              }
              const category = allCategories.find(c => c.id === categoryId);
              if (!category) {
                return (
                  <EmptySlot 
                    key={`${zoneKey}-empty-${index}`} 
                    onClick={() => handleOpenNewCategoryModal(zoneKey)} 
                    zone={zoneKey} 
                    index={index} 
                    onDrop={handleDropOnEmptySlot}
                    theme={theme}
                  />
                );
              }
              return (
                <FoodCategory
                  key={categoryId}
                  id={categoryId}
                  index={index}
                  name={category.name}
                  icon={category.icon}
                  color={category.color}
                  count={getTotalItemCount(categoryId)}
                  onClick={() => setSelectedCategory(categoryId)}
                  moveCategory={moveCategory}
                  zone={zoneKey}
                  onDelete={() => handleDeleteCategory(categoryId, zoneKey, index)}
                  theme={theme}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
      <div className={`min-h-screen bg-gradient-to-br ${theme.bg} p-1.5 md:p-6 flex items-center justify-center`}>
        <div className="w-full max-w-4xl">
          {/* Header with Quick Actions */}
          <div className="mb-2 md:mb-6">
            {/* Quick Add Buttons */}
            <div className="flex flex-row justify-center gap-1.5 md:gap-3">
              <Button
                onClick={() => setShowAddProductModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 p-2 md:p-4 rounded-lg md:rounded-xl"
              >
                <Plus className="w-4 h-4 md:w-6 md:h-6" />
                <span className="sr-only">Product toevoegen</span>
              </Button>
              <Button
                onClick={() => setShowReceiptScanModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 p-2 md:p-4 rounded-lg md:rounded-xl"
              >
                <Camera className="w-4 h-4 md:w-6 md:h-6" />
                <span className="sr-only">Kassaticket scannen</span>
              </Button>
              <Button
                onClick={() => setShowColorThemeModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 p-2 md:p-4 rounded-lg md:rounded-xl"
              >
                <Palette className="w-4 h-4 md:w-6 md:h-6" />
                <span className="sr-only">Kleurenschema</span>
              </Button>
              <Button
                onClick={() => setShowZoneManagementModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 p-2 md:p-4 rounded-lg md:rounded-xl"
              >
                <LayoutGrid className="w-4 h-4 md:w-6 md:h-6" />
                <span className="sr-only">Zones beheren</span>
              </Button>
            </div>
          </div>

          {/* Main Fridge Layout */}
          <div className={`${theme.cardBg} rounded-lg md:rounded-3xl shadow-2xl p-1.5 md:p-6 border ${theme.border}`}>
            <div className="flex flex-row gap-1.5 md:gap-6 justify-center items-stretch">
              {/* Linker kant - Kast Zones */}
              {kastZones.length > 0 && (
                <div className="flex-[3] max-w-lg">
                  <div className={`${theme.cardBg} rounded-lg md:rounded-2xl p-1.5 md:p-4 border ${theme.border} shadow-lg h-full`}>
                    {kastZones.map((zoneKey, index) => 
                      renderZone(zoneKey, 'kast', index === kastZones.length - 1)
                    )}
                  </div>
                </div>
              )}

              {/* Rechter kant - Deur Zones */}
              {deurZones.length > 0 && (
                <div className="w-24 md:w-40">
                  <div className={`${theme.cardBg} rounded-lg md:rounded-2xl p-1.5 md:p-4 border ${theme.border} shadow-lg h-full flex flex-col`}>
                    {deurZones.map((zoneKey, index) => {
                      const isLastZone = index === deurZones.length - 1;
                      return (
                        <div key={zoneKey} className={`flex-1 flex flex-col ${!isLastZone ? 'mb-2 md:mb-4' : ''}`}>
                          {renderZone(zoneKey, 'deur', isLastZone)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedCategory && selectedCategoryData && (
          <CategoryModal
            key={selectedCategory}
            isOpen={true}
            onClose={() => setSelectedCategory(null)}
            categoryName={selectedCategoryData.name}
            categoryId={selectedCategory}
            items={getCategoryItems(selectedCategory)}
            onAddItem={(name, expiryDate, quantity) => handleAddItem(selectedCategory, name, expiryDate, quantity)}
            onRemoveItem={(itemId) => handleRemoveItem(selectedCategory, itemId)}
            onUpdateQuantity={(itemId, newQuantity) => handleUpdateQuantity(selectedCategory, itemId, newQuantity)}
            onUpdateExpiryDate={(itemId, newExpiryDate) => handleUpdateExpiryDate(selectedCategory, itemId, newExpiryDate)}
            onEditCategory={() => handleOpenEditCategoryModal(selectedCategory)}
          />
        )}

        <AddProductModal
          isOpen={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          onAddProduct={handleAddProductFromModal}
          categories={activeCategories.map(cat => ({ id: cat.id, name: cat.name }))}
        />

        <ReceiptScanModal
          isOpen={showReceiptScanModal}
          onClose={() => setShowReceiptScanModal(false)}
          onProductsDetected={handleProductsFromReceipt}
        />

        <NewCategoryModal
          isOpen={showNewCategoryModal}
          onClose={() => setShowNewCategoryModal(false)}
          onAddCategory={handleCreateCategory}
          zone={newCategoryZone}
          availableZones={zoneOrder.map(zoneKey => ({ id: zoneKey, name: zoneNames[zoneKey] || zoneKey }))}
          zoneNames={zoneNames}
        />

        <ColorThemeModal
          isOpen={showColorThemeModal}
          onClose={() => setShowColorThemeModal(false)}
          currentTheme={colorTheme}
          onSelectTheme={handleSelectColorTheme}
        />

        <ZoneManagementModal
          isOpen={showZoneManagementModal}
          onClose={() => setShowZoneManagementModal(false)}
          zones={zoneOrder}
          zoneNames={zoneNames}
          zoneRowCounts={getZoneRowCounts()}
          onAddRow={handleAddZoneRow}
          onRemoveRow={handleRemoveZoneRow}
          onOpenAddZoneModal={() => setShowAddZoneModal(true)}
          onRemoveZone={handleRemoveCustomZone}
          onReorderZones={handleReorderZones}
          onEditZoneName={handleEditZoneName}
        />

        <AddZoneModal
          isOpen={showAddZoneModal}
          onClose={() => setShowAddZoneModal(false)}
          onAddZone={handleAddNewZone}
        />

        <EditZoneNameModal
          isOpen={showEditZoneNameModal}
          onClose={() => setShowEditZoneNameModal(false)}
          zoneNames={zoneNames}
          onEditZoneName={handleEditZoneName}
        />

        <EditCategoryModal
          isOpen={showEditCategoryModal}
          onClose={() => {
            setShowEditCategoryModal(false);
            setEditingCategoryId(null);
          }}
          categoryId={editingCategoryId || ''}
          currentName={editingCategoryId ? (allCategories.find(c => c.id === editingCategoryId)?.name || '') : ''}
          currentIconName={editingCategoryId ? (allCategories.find(c => c.id === editingCategoryId)?.icon.name || 'Apple') : 'Apple'}
          currentColor={editingCategoryId ? (allCategories.find(c => c.id === editingCategoryId)?.color || 'bg-gray-500') : 'bg-gray-500'}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategoryFromEdit}
          productCount={editingCategoryId ? getTotalItemCount(editingCategoryId) : 0}
          isDefaultCategory={!editingCategoryId?.startsWith('custom_')}
        />

        <Toaster />
      </div>
    </DndProvider>
  );
}