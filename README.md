# BudgetFlow 💸

BudgetFlow is a modern, intuitive, and feature-rich budget and expense tracking mobile application built with **React Native** and **Expo**. It is designed specifically to help users organize, monitor, and streamline event budgets, category-wise expenses, funders, and helper tasks, with real-time cloud synchronization powered by **Firebase Firestore**.

---

## 🚀 Key Features

*   **Financial Overview Dashboard**: Get real-time stats including **Total Budget**, **Received Funds**, and color-coded status breakdowns (**Pending**, **Took Over**, **Done**, and **Utilized**).
*   **Expense Management**: Create, view, update, and delete expenses. Track which helper is assigned to each expense and transition statuses seamlessly.
*   **Category Organization**: Group expenses into custom categories (e.g., Catering, Logistics, Venue) to monitor category-specific allocations.
*   **Funder Tracking**: Track who is funding your event or project, how much they have committed, and their overall contribution status.
*   **Helper Assignments**: Add volunteers or helpers, assigning tasks and expense tracking to specific individuals.
*   **Theme Engine**: Beautiful, custom **Dark Mode** and **Light Mode** integrations using React Native contexts.
*   **PDF Export & Sharing**: Generate a comprehensive financial report PDF of all categories and expenses directly from the app and share it instantly via native sharing (using `expo-print` & `expo-sharing`).
*   **Cloud Synchronized**: Fast and secure operations using a structured **Firebase Firestore** backend.

---

## 🛠️ Tech Stack & Dependencies

*   **Framework**: [React Native](https://reactnative.dev/) (v0.76.x) via [Expo](https://expo.dev/) (v52)
*   **Routing & Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (v4 - file-system-based routing)
*   **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) (Web SDK v11)
*   **Styles & Theme**: Customized Theme Providers using vanilla React Native `StyleSheet` & safe area views
*   **Icons**: `@expo/vector-icons` (FontAwesome5, MaterialIcons)
*   **Reports**: `expo-print` (HTML to PDF) and `expo-sharing` (native file sharing)
*   **Gesture Management**: `react-native-gesture-handler` & `react-native-reanimated`

---

## 📂 Project Structure

Here is a quick overview of how the codebase is structured:

```text
budget-flow/
├── app/                       # Expo Router File-System-Based Routes
│   ├── (tabs)/                # Main Bottom-Tab Navigation Screens
│   │   ├── _layout.js         # Tab Navigation config (Dashboard, Expenses, Funders, Settings, etc.)
│   │   ├── index.js           # Home / Budget Summary Screen
│   │   ├── category.js        # Categories list
│   │   ├── funders.js         # Funders listing
│   │   ├── dashboard.js       # Reports & PDF Export Dashboard
│   │   └── settings.js        # Theme switches & helper utilities
│   ├── (screens)/             # Stack Navigation Modals and Detail Pages
│   │   ├── _layout.js         # Modal/Stack Navigator configuration
│   │   ├── all-expenses.js    # Filterable expense list view
│   │   ├── new-category.js    # Create Category Modal
│   │   ├── new-expense.js     # Create Expense Modal
│   │   ├── category/          # Dynamic route for Category Details [id]
│   │   ├── edit-category/     # Edit Category screen
│   │   ├── edit-expense/      # Edit Expense screen
│   │   └── expense/           # Dynamic route for Expense Details [id]
│   └── _layout.js             # Root stack navigator with Theme and Confirm Dialog Providers
├── components/                # Reusable Core UI Components
│   ├── BudgetSummary.js       # Progress tracker card for Total Budget vs Received Funds
│   ├── Button.js              # Standard stylized Buttons (solid, outline, danger)
│   ├── Card.js                # Custom container card with shadows/borders matching theme
│   ├── CategoryItem.js        # Individual category listing row
│   ├── ExpenseItem.js         # Individual expense listing with colored status pill
│   ├── CustomConfirmDialog.js # Custom alert modal wrapper for confirmations
│   └── Themed.js              # UI components aware of Dark/Light theme colors
├── context/                   # React Contexts for global state
│   ├── auth.js                # Authentication state context wrapper
│   └── theme.js               # Theme state context (light/dark mode)
├── firebase/                  # Firebase configuration
│   └── config.js              # Firestore client initialization details
├── services/                  # Firestore database functions
│   └── firebaseService.js     # CRUD APIs for categories, expenses, funders, & budget summaries
├── assets/                    # Static image files, splash icons, and favicons
├── App.js                     # Root entry wrapper setting up gesture/safe area/theme roots
├── index.js                   # Application bootstrap entry point
├── package.json               # Project dependencies and script runner config
└── eas.json                   # EAS Build profiles (Android APKs, iOS builds, App Bundles)
```

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### 📋 Prerequisites

1.  Make sure you have **Node.js** (v18 or higher recommended) installed.
2.  Install the **Expo Go** app on your iOS/Android device, or set up an emulator.

### 🔌 Setup Instructions

1.  **Clone the repository** (or navigate to the project directory):
    ```bash
    cd budget-flow
    ```

2.  **Install project dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Firebase Credentials**:
    Open [firebase/config.js](file:///c:/Users/pathu/Desktop/budget%20flow/budget-flow/firebase/config.js) and update the configuration object with your actual Firebase project settings:
    ```javascript
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT_ID.appspot.com",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
    ```

4.  **Start the Expo Development Server**:
    ```bash
    npm run start
    ```
    This will start the Expo CLI server. Scan the generated QR code with your Expo Go app (on Android) or use the Camera app (on iOS) to launch the app on your physical device.

    *   Press `a` to run on an Android emulator/device.
    *   Press `i` to run on an iOS simulator.
    *   Press `w` to run in the web browser.

---

## 📦 Building and Deploying with EAS

This project has [eas.json](file:///c:/Users/pathu/Desktop/budget%20flow/budget-flow/eas.json) set up for **Expo Application Services (EAS)** builds.

1.  Ensure you have the EAS CLI installed globally:
    ```bash
    npm install -g eas-cli
    ```
2.  Log in to your Expo account:
    ```bash
    eas login
    ```
3.  Configure your project:
    ```bash
    eas build:configure
    ```
4.  Run a build (e.g., an Android preview APK):
    ```bash
    eas build --profile preview --platform android
    ```

---

## 🤝 Contribution & License

This project is configured as a private event planning helper app. For any custom modifications, feel free to submit pull requests or update the firestore database schemas as needed!
