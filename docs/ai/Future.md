# EcoTrack AI Future Architectural Roadmap

> **IMPORTANT:** This document outlines planned future features for architecture preparedness. None of these features should be prematurely implemented without explicit request.

## 1. AI Sustainability Agent (100% Confirmed)
- **Objective:** Integrate an LLM-driven sustainability advisor (e.g. Gemini API / Antigravity SDK).
- **Architecture Idea:** Create an `AIService` module that reads assessment state from `CalculatorContext` and generates contextual reduction advice.
- **Preparation Work Done:** Added cached `aiAdvice` and `aiAdviceCachedAt` fields to `firestore.rules` assessment schema.

## 2. Advanced B2B Supply Chain & Scope 3 Module
- **Objective:** Allow enterprise users to upload CSV/ERP spend data for Scope 3 emissions.
- **Architecture Idea:** Add a web-worker parser for processing heavy CSVs without blocking the main UI thread.

## 3. Offline-First PWA Capabilities
- **Objective:** Enable assessment entry while offline.
- **Architecture Idea:** Use Service Workers with IndexedDB fallback, syncing to Firestore upon reconnection via standard background sync.

## 4. Internationalization (i18n) & Regional Grid Intensity
- **Objective:** Dynamic emission factor adjustments based on exact regional electric grid data (e.g. WattTime API).
- **Architecture Idea:** Expand dataset registry to support region-specific CO₂/kWh lookup tables.
