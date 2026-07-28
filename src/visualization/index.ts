/**
 * Visualization System — Central Exports
 *
 * Import all visualization components from this single entry point.
 * Components, charts, maps, and widgets are organized by type.
 */

// Charts
export { PremiumRadarChart } from './charts/PremiumRadarChart';
export { PremiumDoughnut } from './charts/PremiumDoughnut';
export { GaugeWidget } from './charts/GaugeWidget';
export { Sparkline } from './charts/Sparkline';
export { TrendChart } from './charts/TrendChart';

// Maps
export { IndiaMap } from './maps/IndiaMap';
export type { MapLayer, MapStateData } from './maps/IndiaMap';
export { StateInsightPanel } from './maps/StateInsightPanel';

// Widgets
export { KPIWidget } from './widgets/KPIWidget';

// Providers
export { VisualizationDataProvider } from './providers/VisualizationDataProvider';
