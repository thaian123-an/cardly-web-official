import type { ReactElement } from "react";
import { observer } from "mobx-react-lite";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { OtpPage } from "../features/auth/pages/OtpPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { ResetOtpPage } from "../features/auth/pages/ResetOtpPage";
import { ResetPasswordPage } from "../features/auth/pages/ResetPasswordPage";
import { authStore } from "../features/auth/stores/AuthStore";
import { AddContactPage } from "../features/contacts/pages/AddContactPage";
import { ContactDetailPage } from "../features/contacts/pages/ContactDetailPage";
import { ContactsPage } from "../features/contacts/pages/ContactsPage";
import { DashboardPage } from "../features/home/pages/DashboardPage";
import { DigitalCardPage } from "../features/profile/pages/DigitalCardPage";
import { EditProfilePage } from "../features/profile/pages/EditProfilePage";
import { SettingsPage } from "../features/profile/pages/SettingsPage";
import { ScanUploadPage } from "../features/upload/pages/ScanUploadPage";

const RootRedirect = observer(() => {
  return authStore.isAuthenticated ? (
    <Navigate to="/home" replace />
  ) : (
    <Navigate to="/login" replace />
  );
});

const ProtectedLayout = observer(() => {
  if (!authStore.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
});

const PublicOnlyRoute = observer(({ children }: { children: ReactElement }) => {
  if (authStore.isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
});

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicOnlyRoute>
        <RegisterPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <PublicOnlyRoute>
        <ForgotPasswordPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/otp",
    element: (
      <PublicOnlyRoute>
        <OtpPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/reset-otp",
    element: (
      <PublicOnlyRoute>
        <ResetOtpPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <PublicOnlyRoute>
        <ResetPasswordPage />
      </PublicOnlyRoute>
    ),
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "/home",
        element: <DashboardPage />,
      },
      {
        path: "/contacts",
        element: <ContactsPage />,
      },
      {
        path: "/contacts/new",
        element: <AddContactPage />,
      },
      {
        path: "/contacts/:contactId",
        element: <ContactDetailPage />,
      },
      {
        path: "/scan-upload",
        element: <ScanUploadPage />,
      },
      {
        path: "/digital-card",
        element: <DigitalCardPage />,
      },
      {
        path: "/edit-profile",
        element: <EditProfilePage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: "*",
    element: <RootRedirect />,
  },
]);