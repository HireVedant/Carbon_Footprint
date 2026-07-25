# EcoTrack AI

EcoTrack AI is a modern carbon footprint assessment platform that enables individuals to measure, understand, and reduce their environmental impact through scientifically derived emission calculations, adaptive assessments, historical analytics, and personalized sustainability recommendations.

The platform combines a data-driven carbon calculation engine with an intuitive user experience to transform complex environmental data into practical actions for everyday users.

---

## Live Demo

<https://eco-track-platform.vercel.app/>

---

## Overview

Climate change mitigation begins with understanding personal emissions. EcoTrack AI provides an accessible way for users to estimate their annual carbon footprint across major lifestyle categories while maintaining transparency in the underlying calculations.

Unlike simple calculators that provide only a single emissions number, EcoTrack AI offers:

- Category-wise emission analysis
- Scientific confidence estimation
- Historical assessment tracking
- AI-generated sustainability recommendations
- Interactive "What-If" simulations
- Downloadable assessment reports

The project was developed as a Software Engineering Mini Project and demonstrates the application of modern frontend engineering, cloud services, data visualization, and sustainable computing concepts.

---

## Core Features

### Carbon Footprint Assessment

A guided adaptive questionnaire collects lifestyle information and estimates annual greenhouse gas emissions across multiple categories including:

- Transportation
- Household Energy
- Food & Diet
- Waste Management
- Consumer Shopping

The questionnaire dynamically adapts based on previous responses, reducing unnecessary inputs and improving user experience.

---

### Scientific Calculation Engine

EcoTrack AI implements a modular calculation engine that combines multiple emission factors and scientific datasets to estimate annual CO₂ equivalent emissions.

Features include:

- Category-based emission modelling
- Regional electricity emission factors
- Transportation-specific calculations
- Household energy estimation
- Food impact modelling
- Confidence scoring
- Versioned calculation engine

---

### Personalized Dashboard

Every completed assessment generates a comprehensive dashboard containing:

- Annual Carbon Footprint
- Eco Score
- Scientific Confidence Score
- Indian Average Comparison
- Category Breakdown
- Historical Trend Analysis
- AI Sustainability Insights
- What-If Simulator
- Action Recommendations

---

### AI Sustainability Coach

EcoTrack AI provides contextual sustainability recommendations generated from assessment results.

Recommendations focus on:

- Transportation improvements
- Energy optimization
- Household efficiency
- Sustainable food choices
- Waste reduction

The AI system operates only on assessment data and never requires unnecessary personal information.

---

### Historical Tracking

Authenticated users can maintain a complete history of previous assessments.

Features include:

- Chronological assessment history
- Previous assessment comparison
- Historical trend visualization
- Emission progression tracking

---

### Interactive Visualizations

Assessment data is presented using multiple visualization techniques including:

- Bar Charts
- Doughnut Charts
- Line Charts
- Confidence Distribution
- Category Comparisons

These visualizations provide intuitive insight into the user's largest emission sources.

---

### Scientific PDF Reports

Users can export assessment results as professionally formatted PDF reports containing:

- Executive Summary
- Emission Breakdown
- Category Analysis
- AI Recommendations
- Scientific Metadata
- Confidence Information

---

### Community Features

EcoTrack AI also includes community-focused functionality including:

- Community Statistics
- Leaderboards
- Sustainability Participation Metrics

---

## Technology Stack

| Category | Technologies |
|-----------|--------------|
| Frontend | React 19, TypeScript |
| Routing | React Router |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Charts | Chart.js, react-chartjs-2 |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| PDF Generation | jsPDF, jsPDF-AutoTable |
| Build Tool | Vite |
| Language | TypeScript |

---

## Architecture

```
User
   │
   ▼
Adaptive Assessment
   │
   ▼
Scientific Calculation Engine
   │
   ├────────► Confidence Engine
   │
   ├────────► Dataset Registry
   │
   ▼
Assessment Result
   │
   ├────────► Dashboard
   ├────────► AI Coach
   ├────────► What-If Simulator
   ├────────► History
   └────────► PDF Report
```

---

## Project Structure

```text
src/
├── components/
│   ├── assessment/
│   ├── dashboard/
│   ├── charts/
│   ├── layout/
│   └── ui/
│
├── context/
│   ├── AuthContext
│   └── AssessmentContext
│
├── data/
│   └── datasets/
│
├── firebase/
│
├── hooks/
│
├── pages/
│
├── services/
│
├── types/
│
└── utils/
```

The project follows a modular architecture that separates user interface components, business logic, scientific calculations, Firebase services, datasets, and application state management.

---

## Installation

Clone the repository

```bash
git clone https://github.com/HireVedant/Carbon_Footprint.git
```

Navigate into the project

```bash
cd Carbon_Footprint
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
...
```

Start the development server

```bash
npm run dev
```

---

## Available Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
npm run test       # Execute test suite
```

---

## Key Capabilities

- Adaptive assessment workflow
- Scientific emission calculations
- Versioned calculation engine
- Dataset-driven architecture
- Historical assessment management
- Interactive analytics
- AI-powered sustainability guidance
- PDF report generation
- Community engagement features
- Responsive interface

---

## Project Status

Current Version

```
Architecture            2.0.0
Calculation Engine      2.0.0
Dataset Registry        1.0.0
```

Implemented Components

- Adaptive Assessment
- Scientific Calculation Engine
- Dataset Registry
- Dashboard
- Historical Tracking
- AI Coach
- Community Features
- PDF Report Generation
- Newsletter System
- Administrative Dashboard

---

## Contributors

Developed as part of the Software Engineering Mini Project.

Primary Contributors

- Jeevan Sagale
- Tanay Daware
- Vedant Hire

---

## License

This project is intended for educational and research purposes.
