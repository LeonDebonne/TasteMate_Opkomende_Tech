// Calculate expiry date based on product category
export function calculateExpiryDate(categoryId: string): string {
  const today = new Date();
  let daysToAdd = 7; // default

  switch (categoryId) {
    case 'fruit':
      daysToAdd = 5; // Most fruits last about 5 days
      break;
    case 'groenten':
      daysToAdd = 7; // Vegetables typically last a week
      break;
    case 'zuivel':
      daysToAdd = 14; // Dairy products and eggs have longer shelf life
      break;
    case 'vlees':
      daysToAdd = 3; // Fresh meat expires quickly
      break;
    case 'vis':
      daysToAdd = 2; // Fish expires very quickly
      break;
    case 'dranken':
      daysToAdd = 14; // Drinks typically last 2 weeks
      break;
    case 'ijs':
      daysToAdd = 90; // Frozen items last much longer
      break;
    case 'overig':
      daysToAdd = 7; // Default
      break;
  }

  const expiryDate = new Date(today);
  expiryDate.setDate(expiryDate.getDate() + daysToAdd);
  
  return expiryDate.toISOString().split('T')[0];
}