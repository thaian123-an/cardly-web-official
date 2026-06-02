import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { ForgotPasswordPage } from "../features/auth/pages/ForgotPasswordPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { OtpPage } from "../features/auth/pages/OtpPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { ResetPasswordPage } from "../features/auth/pages/ResetPasswordPage";
import { AddContactPage } from "../features/contacts/pages/AddContactPage";
import { ContactDetailPage } from "../features/contacts/pages/ContactDetailPage";
import { ContactsPage } from "../features/contacts/pages/ContactsPage";
import { DashboardPage } from "../features/home/pages/DashboardPage";
import { DigitalCardPage } from "../features/profile/pages/DigitalCardPage";
import { EditProfilePage } from "../features/profile/pages/EditProfilePage";
import { SettingsPage } from "../features/profile/pages/SettingsPage";
import { ScanUploadPage } from "../features/upload/pages/ScanUploadPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/otp",
    element: <OtpPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    element: <AppLayout />,
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
    element: <Navigate to="/login" replace />,
  },
]);