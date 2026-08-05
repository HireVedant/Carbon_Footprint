# Calculation Inventory

## Calculation Modules (`src/core/calculation/`)

### 1. `transport.ts`
- **Purpose:** Calculates CO2e for flights, cars, public transit, and walking/cycling.
- **Inputs:** Mileage, fuel type, carpool details, flight distances.
- **Outputs:** Total transport kgCO2e.

### 2. `energy.ts`
- **Purpose:** Household energy calculations.
- **Inputs:** Electricity usage (kWh), grid region (for specific emission factors), heating types.
- **Outputs:** Total energy kgCO2e.

### 3. `food.ts`
- **Purpose:** Diet-based calculations.
- **Inputs:** Diet type (vegan, vegetarian, meat-heavy, average).
- **Outputs:** Total food kgCO2e.

### 4. `waste.ts`
- **Purpose:** Recycling and disposal impacts.
- **Inputs:** Waste volume, recycling percentage.
- **Outputs:** Total waste kgCO2e.

### 5. `shopping.ts`
- **Purpose:** Consumer goods impact.

## Legacy Wrappers
- **File:** `src/utils/calculationEngine.ts`
- **Purpose:** Previously acted as the monolith calculator before `core/calculation/` was introduced.
- **Risk:** Having both present can lead to components calling outdated logic.

## Dataset Sources
- Values are derived from external dataset logic (ARAI, ICAO, CEA, BEE) mapped inside the `DatasetRegistry`.
- Deterministic, pure functions ensure the UI gets exact, replicable data.

*Note: Core calculation algorithms must not be modified.*
