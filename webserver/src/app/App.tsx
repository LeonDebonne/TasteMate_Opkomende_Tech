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
  Flame,
  FlaskConical,
  CircleDot,
  Heart,
  Star,
  Sparkles,
} from 'lucide-react';
import { GripVertical } from 'lucide-react';



interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
}

const categories: Category[] = [
];

// Koelkast zones configuratie
const defaultFridgeZones = {
  vriezer: [null, null, null], // 3 slots
  koelvakBoven: [null, null, null], // 3 slots
  koelvakOnder: [null, null, null], // 3 lege slots voor nieuwe categorieën
  groentelade: [null, null, null], // 3 slots
  deur: [null, null, null, null], // 4 slots
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
    Wheat, Flame, FlaskConical, CircleDot, Heart, Star, Sparkles,
  };
  return iconMap[name] || Apple;
};

export default function App() {
const [inventory, setInventory] = useState<Record<string, FoodItem[]>>(() => {
  return {};
});

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showReceiptScanModal, setShowReceiptScanModal] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryZone, setNewCategoryZone] = useState<string>('');
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [fridgeZones, setFridgeZones] = useState(defaultFridgeZones);
  const [zoneOrder, setZoneOrder] = useState<string[]>([
    'vriezer',
    'koelvakBoven',
    'koelvakOnder',
    'groentelade',
    'deur',
  ]);
  const [zoneTypes, setZoneTypes] = useState<Record<string, 'kast' | 'deur'>>({
    vriezer: 'kast',
    koelvakBoven: 'kast',
    koelvakOnder: 'kast',
    groentelade: 'kast',
    deur: 'deur',
  });
  const [colorTheme, setColorTheme] = useState(() => {
    const saved = localStorage.getItem('colorTheme');
    return saved || 'default';
  });
  const [showColorThemeModal, setShowColorThemeModal] = useState(false);
  const [showZoneManagementModal, setShowZoneManagementModal] = useState(false);
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [zoneManagementMode, setZoneManagementMode] = useState<'add' | 'remove'>('add');
  const [zoneNames, setZoneNames] = useState<Record<string, string>>({
    vriezer: 'Vriezer',
    koelvakBoven: 'Koelvak Boven',
    koelvakOnder: 'Koelvak Onder',
    groentelade: 'Groentelade',
    deur: 'Deur',
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

  useEffect(() => {
    fetch("http://localhost:5000/inventory")
      .then((res) => res.json())
      .then((data) => {
        const groupedInventory: Record<string, FoodItem[]> = {};

        data.products.forEach((product: any) => {
          const categoryId = product.categoryId || "";

          if (!groupedInventory[categoryId]) {
            groupedInventory[categoryId] = [];
          }

          groupedInventory[categoryId].push({
            id: product.id,
            name: product.name,
            quantity: product.quantity,
            expiryDate: product.expiryDate,
          });
        });

        setInventory(groupedInventory);

        setCustomCategories(
          data.categories.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            icon: Apple,
            color: "bg-gray-500",
          }))
        );
        if (data.fridgeZones) setFridgeZones(data.fridgeZones);
        if (data.zoneOrder) setZoneOrder(data.zoneOrder);
        if (data.zoneTypes) setZoneTypes(data.zoneTypes);
        if (data.zoneNames) setZoneNames(data.zoneNames);
      })
      .catch((err) => {
        console.error("Kon inventory niet laden:", err);
      });
  }, []);

  useEffect(() => {
    if (!fridgeZones || !zoneOrder || !zoneTypes || !zoneNames) return;
    if (zoneOrder.length === 0) return;

    fetch("http://localhost:5000/layout", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fridgeZones,
        zoneOrder,
        zoneTypes,
        zoneNames,
      }),
    }).catch((err) => {
      console.error("Kon layout niet opslaan:", err);
    });
  }, [fridgeZones, zoneOrder, zoneTypes, zoneNames]);

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

  const handleAddProductFromModal = async (
  name: string,
  expiryDate: string,
  categoryId: string,
  quantity: number
) => {
  console.log("HANDLE ADD PRODUCT WORDT UITGEVOERD");

  handleAddItem(categoryId, name, expiryDate, quantity);

  await fetch("http://localhost:5000/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      quantity,
      categoryId,
      expiryDate,
    }),
  });
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

const handleCreateCategory = async (name: string, iconName: string, color: string, zone: string) => {
  const newCategory: Category = {
    id: `custom_${Date.now()}`,
    name,
    icon: getIconByName(iconName),
    color,
  };

  const updatedZones = { ...fridgeZones };
  const zoneSlots = [...updatedZones[zone]];
  const firstEmptyIndex = zoneSlots.findIndex(slot => slot === null);

  if (firstEmptyIndex !== -1) {
    zoneSlots[firstEmptyIndex] = newCategory.id;
  } else {
    zoneSlots.push(newCategory.id);
  }

  updatedZones[zone] = zoneSlots;

  setCustomCategories(prev => [...prev, newCategory]);
  setFridgeZones(updatedZones);

  await fetch("http://localhost:5000/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: newCategory.id,
      name: newCategory.name,
    }),
  });

  await fetch("http://localhost:5000/layout", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fridgeZones: updatedZones,
      zoneOrder,
      zoneTypes,
      zoneNames,
    }),
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
    setZoneNames(prev => ({
      ...prev,
      [zone]: newName,
    }));
  };

  const handleReorderZones = (newOrder: string[]) => {
    setZoneOrder(newOrder);
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
      return newNames;
    });

    setZoneTypes(prev => {
      const newTypes = { ...prev };
      delete newTypes[zoneKey];
      return newTypes;
    });

    setZoneOrder(prev => prev.filter(z => z !== zoneKey));
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
        className={`flex flex-col flex-1 min-h-0 ${isLast ? '' : 'mb-2'}`}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <div className={`w-2.5 h-2.5 md:w-3.5 md:h-3.5 ${getZoneColor(zoneKey)} rounded-full shadow-sm`}></div>
          <h3 className={`text-[10px] sm:text-xs font-bold ${theme.cardText} uppercase tracking-wider truncate`}>{zoneName}</h3>
        </div>
        <div className={`${theme.cardBg} rounded-lg p-1.5 border ${theme.border} shadow-sm flex-1 min-h-0 overflow-hidden flex flex-col`}>
          <div className={`grid ${gridCols} gap-1.5 h-full auto-rows-fr ${zoneType === 'deur' ? 'content-between' : ''}`}>
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
      <div className={`w-screen h-screen overflow-hidden bg-gradient-to-br ${theme.bg}`}>
        <div className="w-full h-full flex flex-col p-2 gap-2">
          {/* Header with Quick Actions */}
          <div className="shrink-0">
            {/* Quick Add Buttons */}
            <div className="flex flex-row justify-center gap-2">
              <Button
                onClick={() => setShowAddProductModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 p-2.5 rounded-xl"
              >
                <Plus className="w-5 h-5" />
                <span className="sr-only">Product toevoegen</span>
              </Button>
              <Button
                onClick={() => setShowReceiptScanModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 p-2.5 rounded-xl"
              >
                <Camera className="w-5 h-5" />
                <span className="sr-only">Kassaticket scannen</span>
              </Button>
              <Button
                onClick={() => setShowColorThemeModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 p-2.5 rounded-xl"
              >
                <Palette className="w-5 h-5" />
                <span className="sr-only">Kleurenschema</span>
              </Button>
              <Button
                onClick={() => setShowZoneManagementModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 p-2.5 rounded-xl"
              >
                <LayoutGrid className="w-5 h-5" />
                <span className="sr-only">Zones beheren</span>
              </Button>
            </div>
          </div>

          {/* Main Fridge Layout */}
          <div className={`${theme.cardBg} rounded-2xl shadow-2xl p-2 border ${theme.border} flex-1 min-h-0 overflow-hidden`}>
            <div className="flex flex-row gap-2 h-full items-stretch">
              {/* Linker kant - Kast Zones */}
              {kastZones.length > 0 && (
                <div className="flex-[3] min-w-0 min-h-0 h-full overflow-hidden flex flex-col">
                  <div className={`${theme.cardBg} rounded-xl p-2 border ${theme.border} shadow-lg h-full min-h-0 overflow-hidden flex flex-col`}>
                    {kastZones.map((zoneKey, index) => 
                      renderZone(zoneKey, 'kast', index === kastZones.length - 1)
                    )}
                  </div>
                </div>
              )}

              {/* Rechter kant - Deur Zones */}
              {deurZones.length > 0 && (
                <div className="flex-[1] min-w-[90px] max-w-[32vw] min-h-0 overflow-hidden">
                  <div className={`${theme.cardBg} rounded-xl p-2 border ${theme.border} shadow-lg h-full min-h-0 overflow-auto flex flex-col`}>
                    {deurZones.map((zoneKey, index) => {
                      const isLastZone = index === deurZones.length - 1;
                      return (
                        <div key={zoneKey} className={`flex-1 flex flex-col min-h-0 ${!isLastZone ? 'mb-2' : ''}`}>
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
            onAddItem={async (name, expiryDate, quantity) => {
              handleAddItem(selectedCategory, name, expiryDate, quantity);

              await fetch("http://localhost:5000/products", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name,
                  quantity,
                  categoryId: selectedCategory,
                  expiryDate,
                }),
              });
            }}
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