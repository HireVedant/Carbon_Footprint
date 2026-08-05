# EcoTrack AI Deployment Guide

## Prerequisites
- Node.js v20.x
- Firebase CLI (`npm install -g firebase-tools`)
- Authorized Firebase Project

## Deployment Steps

### 1. Build Frontend Bundle
```bash
npm run build
```
Verifies Vite bundle generation in `/dist`.

### 2. Deploy Cloud Functions & Firestore Rules
```bash
# Login to Firebase
firebase login

# Deploy Firestore Security Rules
firebase deploy --only firestore:rules

# Deploy Cloud Functions
firebase deploy --only functions
```

### 3. Deploy Frontend (Firebase Hosting / Vercel)
```bash
firebase deploy --only hosting
```
Or connect the repository to Vercel/Netlify for automated CI/CD deployment.
