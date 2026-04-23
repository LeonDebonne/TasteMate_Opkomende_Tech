import {
  Apple,
  Cherry,
  Citrus,
  Grape,
  Carrot,
  Leaf,
  Salad,
  Milk,
  Egg,
  Beef,
  Fish,
  Cake,
  Coffee,
  Wine,
  Beer,
  Droplets,
  IceCream,
  Pizza,
  Sandwich,
  Cookie,
  Package,
  LucideIcon,
} from 'lucide-react';

const productIconMap: Record<string, LucideIcon> = {
  // Fruit
  'appel': Apple,
  'appels': Apple,
  'banaan': Apple,
  'bananen': Apple,
  'kers': Cherry,
  'kersen': Cherry,
  'sinaasappel': Citrus,
  'citroen': Citrus,
  'limoen': Citrus,
  'mandarijn': Citrus,
  'druif': Grape,
  'druiven': Grape,
  
  // Groenten
  'wortel': Carrot,
  'wortelen': Carrot,
  'sla': Salad,
  'spinazie': Leaf,
  'broccoli': Leaf,
  'kool': Leaf,
  'salade': Salad,
  
  // Zuivel
  'melk': Milk,
  'kaas': Package,
  'yoghurt': Milk,
  'kwark': Milk,
  'room': Milk,
  'boter': Package,
  
  // Eieren
  'ei': Egg,
  'eieren': Egg,
  
  // Vlees
  'vlees': Beef,
  'rundvlees': Beef,
  'varkensvlees': Beef,
  'gehakt': Beef,
  'biefstuk': Beef,
  'kip': Beef,
  'kipfilet': Beef,
  'ham': Beef,
  'bacon': Beef,
  'spek': Beef,
  'worst': Beef,
  
  // Vis
  'vis': Fish,
  'zalm': Fish,
  'tonijn': Fish,
  'haring': Fish,
  'garnalen': Fish,
  
  // Dranken
  'wijn': Wine,
  'bier': Beer,
  'water': Droplets,
  'sap': Droplets,
  'cola': Droplets,
  'fanta': Droplets,
  'koffie': Coffee,
  
  // Ijs & Gebak
  'ijs': IceCream,
  'ijsjes': IceCream,
  'taart': Cake,
  'cake': Cake,
  'koek': Cookie,
  'cookie': Cookie,
  'croissant': Cookie,
  
  // Overig
  'pizza': Pizza,
  'brood': Sandwich,
  'sandwich': Sandwich,
};

export function getProductIcon(productName: string): LucideIcon {
  const lowerName = productName.toLowerCase();
  
  // Check for exact matches or partial matches
  for (const [key, icon] of Object.entries(productIconMap)) {
    if (lowerName.includes(key)) {
      return icon;
    }
  }
  
  // Default icon
  return Package;
}