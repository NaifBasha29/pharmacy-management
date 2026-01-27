# Pharmacy Management Mobile App

This is the Android mobile application for the Pharmacy Management System, built with Expo (React Native).

## Prerequisites

- Node.js installed.
- Android Emulator (via Android Studio) or a physical Android device with **Expo Go** app installed.
- The Backend Server must be running (`npm run dev` in `server/`).

## Setup

1. Navigate to the `mobile` directory:

    ```bash
    cd mobile
    ```

2. Install dependencies (if not already done):

    ```bash
    npm install
    ```

## Running the App

Start the Expo development server:

```bash
npx expo start
```

- **Android Emulator**: Press `a` in the terminal to open in Android Emulator.
- **Physical Device**: Scan the QR code with the Expo Go app.

## Configuration

- **API URL**: The app is configured to connect to `http://10.0.2.2:5000` (Android Emulator default to localhost).
  - If running on a physical device, update `src/config/api.js` and `src/screens/DashboardScreen.js` with your computer's LAN IP address (e.g., `http://192.168.1.5:5000`).

## Features

- **Authentication**: Login with email and password.
- **Dashboard**: View sales, orders, and medicines stats.
- **Analytics**: Sales overview chart.
- **Real-time Notifications**: Alerts for low stock and order updates via Socket.IO.
- **Profile**: View user details and logout.
