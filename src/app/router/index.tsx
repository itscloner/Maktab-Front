import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "@/app/layouts/MainLayout";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import LoginPage from "@/features/auth/LoginPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import UsersPage from "@/features/users/UsersPage";
import PersonsPage from "@/features/persons/PersonsPage";
import RequestsPage from "@/features/requests/RequestsPage";
import CasesPage from "@/features/cases/CasesPage";
import { ForbiddenPage, NotFoundPage } from "@/components/common/ErrorPages";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "users", element: <UsersPage /> },
          { path: "persons", element: <PersonsPage /> },
          { path: "requests", element: <RequestsPage /> },
          { path: "cases", element: <CasesPage /> },
          { path: "403", element: <ForbiddenPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
