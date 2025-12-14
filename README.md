# Vishnu Student Service Center (VSSC)

Welcome to the **Vishnu Student Success Center (VSSC)** project! This application allows students of the Vishnu Educational Society to access various student services, manage their profiles, and book appointments.

**URL**: [vishnussc.in](https://vishnussc.in)

## 🚀 Features

*   **Authentication & Security**:
    *   Secure Email/Password Login & Registration.
    *   College email verification required.
    *   Password Reset & Account Deletion.
*   **Student Profile**:
    *   Manage personal details, bio, and social links.
    *   Add skills, experiences, and clubs.
    *   Custom Avatar uploader with zoom/pan.
*   **Services**:
    *   **Academic Advising**: Book sessions with advisors.
    *   **Counseling**: Confidential student counseling appointments.
    *   **Tutoring**: Peer-to-peer tutoring scheduling.
    *   **Reservations**: Facility and resource booking.
*   **Admin Dashboard**: Manage users, appointments, and content.
*   **Feedback & Testimonials**: Submit reviews and view student experiences.

## 🛠️ Tech Stack

This project is built with modern web technologies:

*   **Frontend**: React (TypeScript), Vite
*   **Styling**: Tailwind CSS, Shadcn UI
*   **Backend / BaaS**: Firebase (Authentication, Firestore, Storage)
*   **State Management**: React Hooks
*   **Routing**: React Router DOM
*   **Icons**: Lucide React

## 💻 Getting Started

### Prerequisites

*   Node.js & npm installed - [Install Node.js](https://nodejs.org/)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/madhu967/vssc.git
    cd vssc
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory and add your Firebase credentials:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

4.  **Run Development Server:**
    ```sh
    npm run dev
    ```
    The app should be running at `http://localhost:5173`.

## 📦 Build for Production

To build the project for deployment:

```sh
npm run build
```

## 📄 License

This project is licensed under the [ISC License](LICENSE).
