# 🏥 Health Tracker (Local-First)

> **Private, Offline-First Personal Health Dashboard.**
> No servers. No tracking. Your data stays on your device.

## � Vision
A comprehensive health tracking application combining nutrition, fitness, sleep monitoring, and **Intermittent Fasting** without compromising user privacy. The application operates **100% offline** using a local SQLite database, with optional user-controlled backups to Google Drive.

## 🛠 Tech Stack (SSOT)

### Core
-   **Framework**: [React Native](https://reactnative.dev/) via **[Expo SDK](https://expo.dev/)** (Managed Workflow).
-   **Language**: **TypeScript**.
-   **Navigation**: **Expo Router** (File-based routing). *To be implemented*.

### Backend & Database (Local)
-   **Database Engine**: **SQLite** (via `expo-sqlite`).
-   **ORM**: **[Drizzle ORM](https://orm.drizzle.team/)** (Type-safe, fast, lightweight).
-   **Storage**: `expo-file-system` (For database backups).

### UI & UX
-   **UI Library**: **[Tamagui](https://tamagui.dev/)** (Headless + styled components for max performance).
-   **Icons**: Lucide React Native.
-   **Maps**: `react-native-maps` with **OpenStreetMap** (OSM) Tiles.

### Features & Libraries
-   **Pedometer**: `expo-sensors`.
-   **GPS Tracking**: `expo-location` (Background Location).
-   **Bluetooth**: `react-native-ble-plx` (Heart Rate Monitor).
-   **Food Data**: **OpenFoodFacts API** (Cached locally).

---

## ✨ Features Roadmap

### Phase 1: Foundation (MVP) 🏗️
-   [x] Project Initialization (Expo + TypeScript).
-   [ ] **Architecture**: Setup Monorepo-like structure (optional) or sleek folder structure.
-   [x] **UI Setup**: Configure Tamagui provider & Theme.
-   [x] **DB Setup**: Initialize Drizzle ORM with SQLite.
-   [x] **Feature**: Basic Pedometer (Step Counter).

### Phase 2: Nutrition Tracker 🍎
-   [x] **Database**: Design `FoodLogs` and `Products` schema.
-   [x] **API**: Integrate OpenFoodFacts for search.
-   [x] **UI**: Daily Calorie/Sugar/Salt dashboard.
-   [x] **Fasting**: Intermittent Fasting Timer & History (16:8, 20:4).

### Phase 3: Maps & Activity 🏃
-   [x] **Map**: Setup `react-native-maps` with OSM tiles.
-   [x] **Tracking**: Implement `expo-location` background service.
-   [ ] **Stats**: Calculate Pace, Duration, and Speed during activity.
-   [ ] **Storage**: Save route coordinates (GeoJSON) to SQLite.

### Phase 4: Body Metrics ⚖️
-   [x] **Schema**: Add Weight, Height, Waist to database.
-   [x] **UI**: Input screen for Body Metrics.
-   [x] **Dashboard**: Display BMI and Weight on Home.

### Phase 5: Wearables (Pending) ⌚
-   [ ] **BLE**: Scan & Connect to standard Heart Rate monitors (Paused for Expo Go).
-   [ ] **Sync**: Real-time heart rate graph.

---

## 📂 Project Structure

```
/
├── assets/          # Static assets (images, fonts)
├── src/
│   ├── app/         # Expo Router pages (migrating from App.tsx)
│   ├── components/  # Reusable UI components (Tamagui)
│   ├── db/          # Drizzle Schema & Client
│   ├── services/    # Logic for Sensors, BLE, API
│   └── store/       # Global State (Zustand/React Context)
├── App.tsx          # Entry point (will be replaced by app/_layout.tsx)
└── package.json
```

## 🚀 Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Run Development Server**
    ```bash
    npx expo start
    ```

3.  **Run on Device**
    -   Scanning the QR code with **Expo Go** (Android/iOS).
    -   Or `npx expo run:android` / `npx expo run:ios` (Prebuild).

---

## 🔒 Privacy Manifest
This app collects:
-   **Location**: Only during active tracking sessions. Stored locally.
-   **Health Data**: Steps & Heart Rate. Stored locally.
-   **No data is sent to our servers.** (We don't even have a server).
