# EcoTrack AI
An AI-powered Carbon Footprint Tracking and Sustainability Recommendation Platform.

---

## Project Overview

EcoTrack AI is a comprehensive web application designed to help individuals and organizations understand, track, and reduce their environmental impact. As climate change continues to be a pressing global issue, understanding one's personal carbon footprint is the first crucial step toward sustainability.

This project solves the problem of environmental awareness by providing users with an intuitive, data-driven platform to calculate their greenhouse gas emissions across various lifestyle factors such as transportation, energy usage, and diet. Beyond simple calculation, EcoTrack AI leverages intelligent algorithms to offer personalized sustainability recommendations, empowering users to make actionable, eco-friendly lifestyle changes.

Intended for environmentally conscious individuals and developed within an academic context as a Software Engineering Mini Project, EcoTrack AI serves as both a practical tool for carbon management and a demonstration of modern, full-stack web development practices.

---

## Features

- **Email & Password Authentication**: Secure user registration and login functionality.
- **User Registration**: Create personal accounts to track data over time.
- **Secure Login**: Protected routes ensuring privacy of user data.
- **Carbon Footprint Calculator**: Detailed assessment of emissions from daily activities.
- **AI Sustainability Recommendations**: Personalized suggestions to reduce environmental impact based on user data.
- **Dashboard**: A centralized hub for tracking progress and reviewing metrics.
- **User Profile**: Management of personal settings and historical data.
- **Carbon Emission Breakdown**: Visual categorization of emissions using interactive charts.
- **Download PDF Report**: Generate and download comprehensive sustainability reports.
- **Newsletter Subscription**: Keep users informed on the latest sustainability tips and platform updates.
- **Firebase Authentication**: Robust and secure user identity management.
- **Firestore Database**: Real-time cloud database for storing user profiles and calculation history.
- **Responsive Design**: Flawless user experience across desktop, tablet, and mobile devices.

---

## Technology Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, React Router DOM |
| **Backend & Database** | Firebase (Firestore) |
| **Authentication** | Firebase Authentication |
| **Data Visualization** | Chart.js, react-chartjs-2 |
| **Document Generation** | jsPDF, jsPDF AutoTable |
| **Styling & Animation** | Tailwind CSS, Framer Motion, Lucide React |
| **Build Tool** | Vite |
| **Programming Language** | TypeScript, JavaScript, HTML, CSS |

---

## Project Structure

```text
src/
├── components/      # Reusable UI components organized by feature (auth, calculator, dashboard, layout, ui)
├── constants/       # Application-wide constants, configuration values, and fixed data
├── context/         # React Context providers for global state management (AuthContext, CalculatorContext)
├── firebase/        # Firebase initialization, configuration, and service modules (auth, firestore)
├── pages/           # Top-level route components representing full pages (Home, Dashboard, Calculator, etc.)
└── utils/           # Helper functions and core business logic (carbon calculator math, PDF report generator)
```

- **`components/`**: Modular, reusable pieces of the UI (e.g., buttons, form fields, layout wrappers) to maintain DRY principles.
- **`context/`**: Manages global application state, ensuring user authentication and calculator data are accessible throughout the app without prop drilling.
- **`firebase/`**: Contains the setup and wrapper functions for interacting with Firebase Authentication and Firestore Database.
- **`pages/`**: The main views of the application, assembled from various components and mapped to specific routes.
- **`utils/`**: Pure functions handling complex calculations (like carbon emission math) and external integrations (like PDF generation).

---

## Installation Guide

Follow the instructions below to set up EcoTrack AI on your local machine.

### Method 1 — Clone Repository

#### Windows

```cmd
git clone https://github.com/HireVedant/Carbon_Footprint
cd Carbon_Footprint
npm install
npm run dev
```

#### Linux

```bash
git clone https://github.com/HireVedant/Carbon_Footprint
cd Carbon_Footprint
npm install
npm run dev
```

#### macOS

```bash
git clone https://github.com/HireVedant/Carbon_Footprint
cd Carbon_Footprint
npm install
npm run dev
```
