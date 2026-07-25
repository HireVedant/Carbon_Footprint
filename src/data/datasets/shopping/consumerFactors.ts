/**
 * Consumer Goods & Shopping Emission Datasets
 * Source: UNEP Fashion & Electronics Lifecycle Assessment Index
 * Units: kg CO2e / item or kg CO2e / month
 */

export interface ShoppingCategoryEntry {
  id: string;
  name: string;
  averageKgCO2PerItem: number;
  secondHandDiscountMultiplier: number; // e.g. 0.20 (80% reduction for pre-owned)
}

export interface ShoppingDataset {
  datasetVersion: string;
  source: string;
  publicationDate: string;
  updateDate: string;
  onlineDeliveryKgCO2PerParcel: number;
  categories: Record<string, ShoppingCategoryEntry>;
}

export const shoppingDataset: ShoppingDataset = {
  datasetVersion: 'UNEP-CONSUMER-2026.1',
  source: 'UNEP Lifecycle Assessment Reports & India E-Commerce Carbon Index',
  publicationDate: '2024-09-01',
  updateDate: '2026-01-10',
  onlineDeliveryKgCO2PerParcel: 0.85, // Last mile delivery footprint in India
  categories: {
    'fast_fashion_clothing': {
      id: 'fast_fashion_clothing',
      name: 'Apparel & Clothing Items',
      averageKgCO2PerItem: 14.5,
      secondHandDiscountMultiplier: 0.20
    },
    'smartphone_gadget': {
      id: 'smartphone_gadget',
      name: 'Smartphones & Small Electronics',
      averageKgCO2PerItem: 65.0,
      secondHandDiscountMultiplier: 0.15
    },
    'laptop_computer': {
      id: 'laptop_computer',
      name: 'Laptops & Desktop Computers',
      averageKgCO2PerItem: 240.0,
      secondHandDiscountMultiplier: 0.18
    },
    'furniture_item': {
      id: 'furniture_item',
      name: 'Furniture & Major Home Decor',
      averageKgCO2PerItem: 90.0,
      secondHandDiscountMultiplier: 0.25
    }
  }
};

// ─── Dataset Registry Self-Registration ──────────────────────────────────────
import { registry } from '../registry/DatasetRegistry';
registry.register({
  id: 'shopping_consumer',
  displayName: 'UNEP Consumer Goods Lifecycle Assessment Index',
  version: shoppingDataset.datasetVersion,
  source: shoppingDataset.source,
  publicationDate: shoppingDataset.publicationDate,
  updateDate: shoppingDataset.updateDate,
  units: 'kg CO2e / item',
  category: 'SHOPPING',
  status: 'active',
  description: 'Lifecycle CO₂ emission estimates for consumer goods categories in the Indian market.',
  license: 'CC-BY-4.0 (UNEP)',
  data: shoppingDataset,
});
