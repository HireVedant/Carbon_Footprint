/**
 * Shopping Emission Calculator
 * Calculates CO2 from apparel, electronics, and online delivery.
 *
 * Sources:
 * - Ecoinvent lifecycle assessment database
 * - WRAP (Waste & Resources Action Programme) garment factors
 *
 * @module core/calculation/shopping
 */

import { shoppingDataset } from '../../data/datasets';

/**
 * Calculate total shopping sector emission.
 */
export function calculateTotalShoppingEmission(params: {
  apparelItemsMonthly?: number;
  electronicsItemsYearly?: number;
  onlineParcelsMonthly?: number;
  preferSecondHand?: boolean;
}): number {
  const monthlyApparel = params.apparelItemsMonthly || 1;
  const apparelEmission = monthlyApparel * 12 * shoppingDataset.categories.fast_fashion_clothing.averageKgCO2PerItem;

  const annualElectronics = params.electronicsItemsYearly || 0.5;
  const electronicsEmission = annualElectronics * shoppingDataset.categories.smartphone_gadget.averageKgCO2PerItem;

  const monthlyParcels = params.onlineParcelsMonthly || 4;
  const deliveryEmission = monthlyParcels * 12 * shoppingDataset.onlineDeliveryKgCO2PerParcel;

  let total = apparelEmission + electronicsEmission + deliveryEmission;
  if (params.preferSecondHand) {
    total *= 0.5; // 50% reduction for second-hand preference
  }
  return total;
}