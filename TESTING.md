# EcoTrack AI Testing Guide

## Test Suite Overview
EcoTrack AI utilizes **Vitest** and **React Testing Library** for fast, unit and integration testing.

## Running Tests
```bash
# Run tests in watch mode
npm run test

# Run tests once
npx vitest run

# Run coverage report
npm run test:coverage
```

## Critical Test Paths
1. **Calculation Engine:** Verify GHG emission factor multipliers produce accurate kg CO₂ totals.
2. **Security Rules:** Test Firestore security rules against unauthenticated/unauthorized client writes.
3. **Component Rendering:** Ensure key components render without throwing runtime exceptions.
