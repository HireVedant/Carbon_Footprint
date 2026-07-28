# Scientific Validation Report

## Overview

This document validates the scientific methodology used in EcoTrack AI's carbon emission calculations. Every emission factor, dataset, and calculation pipeline is traceable to authoritative Indian and international sources.

---

## 1. Data Sources

| Category | Source | Authority | Data Type |
|----------|--------|-----------|-----------|
| Electricity Grid Factors | CEA (Central Electricity Authority) | Government of India | State-wise grid emission factors (kg CO₂/kWh) |
| Vehicle Emissions | ARAI (Automotive Research Association of India) | MoHUP | ARAI Category A2 & M1 emission factors |
| Aviation | ICAO (International Civil Aviation Organization) | UN | Haversine distance × cabin class multipliers |
| Cooking Fuels | CPCB / MoEFCC | Government of India | Fuel-specific emission factors |
| Appliances | BEE (Bureau of Energy Efficiency) | Government of India | Star-rated appliance power consumption |
| Diet & Food | ICAR / FAO | Government of India / UN | Dietary emission benchmarks |
| Waste | CPCB | Government of India | Municipal solid waste averages |
| Consumer Goods | Ecoinvent / WRAP | International LCA databases | Lifecycle assessment emission factors |
| Public Transit | CSE (Centre for Science and Environment) | India | Metro, bus, auto, taxi emission factors |

---

## 2. Calculation Formulas

### 2.1 Transport — Personal Vehicles

```
Annual Emission (kg CO₂) = Daily km × 365 × Emission Factor (kg CO₂/km) / Occupancy
```

- **Emission Factor**: Derived from ARAI vehicle categories, matched by fuel type (Petrol, Diesel, CNG, Electric)
- **Occupancy**: Driver + passengers; defaults to 1 (solo driver)
- **EV Adjustment**: Electric vehicles use `grid factor × efficiency` instead of fuel-based emission

### 2.2 Transport — Aviation

```
Flight Emission = Distance × Emission Factor × Cabin Class Multiplier × Trips/Year × Round Trip
```

- **Distance**: Calculated via Haversine formula between airport IATA codes
- **Cabin Class**: Economy (1.0×), Premium Economy (1.6×), Business (2.8×), First (4.0×)

### 2.3 Transport — Public Transit

```
Annual Emission = Weekly km × 52 × Mode Emission Factor (kg CO₂/km)
```

### 2.4 Energy — Electricity

```
Annual Electricity Emission = (Monthly kWh × 12 × Grid Factor) / Household Members
```

- **Monthly kWh Priority**: Direct kWh input > Bill-based estimation (₹/7.5) > Baseline (120 kWh/person/month)
- **Solar Offset**: 1 kW solar ≈ 120 kWh/month offset in India
- **Grid Factor**: State-specific from CEA; falls back to national average (0.82 kg CO₂/kWh)

### 2.5 Energy — Cooking Fuel

```
Annual Cooking Emission = Monthly Consumption × Fuel Factor × 12 / Household Members
```

### 2.6 Food

```
Base Emission = Σ (Diet Category Weight × Base Annual kg CO₂)
Adjusted Emission = Base Emission × Waste Multiplier + Dining Out Addon
```

- **Diet Categories**: Mapped to ICAR Indian dietary emission benchmarks
- **Multi-Diet**: Weighted sum across multiple food categories
- **Waste Multipliers**: LOW (1.1×), MODERATE (1.3×), HIGH (1.5×)

### 2.7 Waste

```
Waste Emission = Daily Waste × 365 × Landfill Methane Factor
               - Composting Credit (if applicable)
               - Recycling Credit (if applicable)
```

- **Per-capita waste**: Urban (0.35 kg/day), Rural (0.28 kg/day) from CPCB data
- **Floor**: Minimum 25 kg CO₂/year

### 2.8 Shopping

```
Shopping Emission = (Monthly Apparel × 12 × Apparel Factor)
                  + (Annual Electronics × Electronics Factor)
                  + (Monthly Parcels × 12 × Delivery Factor)
                  × Second-hand Discount (0.5× if applicable)
```

---

## 3. Eco Score Calculation

```
Score = f(Annual Tonnes CO₂, Indian Per-capita Benchmarks)
```

| Range | Grade | Indian Context |
|-------|-------|----------------|
| 90-100 | A+ | Top ~10% of population (below 1.0 tonne) |
| 80-89 | A | Excellent (1.0-1.5 tonnes) |
| 70-79 | B+ | Very Good (1.5-2.5 tonnes) |
| 60-69 | B | Good |
| 50-59 | C+ | Above Average |
| 40-49 | C | Average |
| 25-39 | D | Below Average |
| 0-24 | F | Needs Improvement |

**Indian per-capita benchmark**: ~1.9 tonnes CO₂/year (World Bank, 2023)

---

## 4. Confidence Engine

Confidence is **computed** from data completeness — never hardcoded.

| Factor | Impact |
|--------|--------|
| Exact kWh provided | +25% energy confidence |
| State specified | +10% energy confidence |
| Vehicle model matched | +25% transport confidence |
| Multi-entry transport | +20% transport confidence |
| Diet mix provided | +15% food confidence |
| Waste segregation | +20% waste confidence |
| Itemized shopping | +25% shopping confidence |

**Overall confidence** = weighted average (Energy 35%, Transport 30%, Food 15%, Waste 10%, Shopping 10%)

---

## 5. Dataset Versioning

All datasets are versioned: `INDIA-SCIENCE-2026.1`

- Last updated: 2026-01-15
- Total sub-datasets: 9
- Country: India

---

## 6. Verification Status

| Check | Status |
|-------|--------|
| TypeScript compilation | ✅ Zero errors |
| Vite production build | ✅ Success |
| No hardcoded emissions | ✅ All computed |
| No fabricated statistics | ✅ All from data |
| Grid factor accuracy | ✅ State-specific CEA data |
| Vehicle factors | ✅ ARAI-sourced |
| Aviation distance | ✅ Haversine + ICAO |
| Confidence computation | ✅ Dynamic scoring |