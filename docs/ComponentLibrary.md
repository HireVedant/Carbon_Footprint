# EcoTrack Component Library

## UI Primitives (`src/components/ui/`)

### Button
- **Purpose**: Reusable button with variants and sizes
- **Variants**: `primary`, `secondary`, `danger`, `ghost`
- **Sizes**: `sm`, `md`, `lg`
- **Props**: `variant`, `size`, `loading`, `icon`, `iconPosition`, `children`, `className`
- **Usage**: `<Button variant="primary" size="md">Submit</Button>`

### Card
- **Purpose**: Glassmorphism card with optional icon and hover effects
- **Variants**: Default glass card with `bg-card`, `border-default`
- **Props**: `icon`, `iconColor`, `title`, `description`, `hover`
- **Usage**: `<Card icon={Leaf} title="Title" description="Desc" />`

### SectionHeading
- **Purpose**: Consistent section header with badge, title, and description
- **Props**: `badge`, `title`, `highlight`, `description`
- **Usage**: `<SectionHeading badge="Features" title="Why" highlight="EcoTrack" />`

### StatCard
- **Purpose**: Statistic display with icon, value, and label
- **Props**: `icon`, `value`, `label`, `color`, `delay`
- **Usage**: `<StatCard icon={Users} value="1.2K" label="Users" />`

### FeatureCard
- **Purpose**: Feature showcase with icon, title, description
- **Props**: `icon`, `title`, `description`, `color`
- **Usage**: `<FeatureCard icon={Leaf} title="Carbon" description="Track..." />`

### CommunityInsightCard
- **Purpose**: Community insight display
- **Props**: `insight` object
- **Usage**: `<CommunityInsightCard insight={data} />`

### EmissionsBreakdownCard
- **Purpose**: Carbon emissions breakdown chart
- **Props**: `data`
- **Usage**: `<EmissionsBreakdownCard data={chartData} />`

### ContributionCard
- **Purpose**: User contribution display
- **Props**: `data`
- **Usage**: `<ContributionCard data={userData} />`

## Dashboard Components (`src/components/dashboard/`)

### DashboardHeader
- **Purpose**: Dashboard page header with title and date
- **Props**: `date`

### StatCard
- **Purpose**: Dashboard metric card with icon, value, unit, trend
- **Props**: `icon`, `iconColor`, `label`, `value`, `unit`, `trend`, `trendUp`

### InsightCard
- **Purpose**: AI insight display with glass-eco styling
- **Props**: `insight` object (type, title, description, severity)

### CategoryCard
- **Purpose**: Emission category breakdown card
- **Props**: `category`, `emissions`, `percentage`, `icon`, `color`

### EquivalentCard
- **Purpose**: CO2 equivalent visualization
- **Props**: `equivalent` object (value, unit, description, icon, color)

### ActionButtons
- **Purpose**: Dashboard action buttons (PDF, recalculate)
- **Props**: `onRecalculate`, `onExportPDF`, `hasHistory`, `isExporting`

### ImprovementPreview
- **Purpose**: AI improvement recommendations
- **Props**: `results`, `answers`

### WhatIfSimulator
- **Purpose**: Scenario simulator with toggles
- **Props**: `baseAnswers`, `baseTotalKg`

### EmptyDashboard
- **Purpose**: Empty state for dashboard
- **Props**: None

## Design System (`src/design/`)

### Tokens
- `surface` - Background, panel, text colors
- `emerald` - Emerald color scale (50-900)
- `water` - Blue/cyan accent colors
- `solar` - Warm accent colors (amber, yellow)
- `semantic` - Success, info, warning, danger
- `carbon` - Carbon level colors (safe to danger)
- `ecoScore` - Eco score grade colors
- `fontFamily` - Display, body, mono fonts
- `radius` - Border radius scale
- `spacing` - Container and section spacing
- `motion` - Animation presets