# Community Statistics Pipeline

## Architecture

Community statistics are aggregated from real Firestore data using the `useCommunityStats` hook.

## Data Sources

### Live Data (Firestore)
- `useCommunityStats()` hook queries Firestore in real-time
- Aggregates: users, reports, CO2 tracked, eco scores, emission breakdown
- Leaderboard computed from actual assessment submissions

### SEI Survey Dataset
- 50+ participants, 10 detailed case studies
- Stored in `src/data/` and served via `src/services/seiDatasetService.ts`
- Used for historical comparison and educational content

## Statistics Displayed

| Statistic | Source | Fallback |
|-----------|--------|----------|
| Total Users | Firestore `users` collection | "—" |
| Total Reports | Firestore `calculations` + `assessments` | "—" |
| Total CO₂ Tracked | Sum of all calculations | "—" |
| Average Annual CO₂ | Mean of all reports | "—" |
| Average Eco Score | Mean of all scores | "—" |
| Emission Breakdown | Aggregate transport/energy/food/waste | Empty chart |
| Leaderboard | Top scores from calculations | Empty state |

## Anti-Patterns Eliminated

- ❌ Hardcoded "50K+" users
- ❌ Hardcoded "2.4M kg CO₂e"
- ❌ Hardcoded "180K Trees"
- ❌ Fake testimonials
- ❌ Fabricated marketing numbers
- ✅ Real-time Firestore aggregation
- ✅ "—" or loading states when data unavailable
- ✅ SEI survey data clearly labeled as "Historical Data"