import type { ReactNode } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Teachers from "./pages/Teachers";
import Students from "./pages/Students";
import Documents from "./pages/Documents";
import Anecdotes from "./pages/Anecdotes";
import ProgressReports from "./pages/ProgressReports";
import APE from "./pages/APE";
import ReportTemplates from "./pages/ReportTemplates";
import Soal from "./pages/Soal";
import ActivityLogs from "./pages/ActivityLogs";
import NotFound from "./pages/NotFound";
import { canAccess, getCurrentRole } from '@/lib/roles';

const queryClient = new QueryClient();

const ProtectedRoute = ({
  allowedRoles,
  children,
}: {
  allowedRoles: string[];
  children: ReactNode;
}) => {
  const role = getCurrentRole();

  if (!role) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route
            path="/"
            element={
              <MainLayout>
                <ProtectedRoute allowedRoles={['admin', 'kepala_sekolah', 'guru']}>
                  <Dashboard />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/teachers"
            element={
              <MainLayout>
                <ProtectedRoute allowedRoles={['admin']}>
                  <Teachers />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/students"
            element={
              <MainLayout>
                <ProtectedRoute allowedRoles={['admin', 'kepala_sekolah', 'guru']}>
                  <Students />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/documents"
            element={
              <MainLayout>
                <ProtectedRoute allowedRoles={['admin', 'kepala_sekolah']}>
                  <Documents />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/anecdotes"
            element={
              <MainLayout>
                <ProtectedRoute allowedRoles={['admin', 'kepala_sekolah', 'guru']}>
                  <Anecdotes />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/progress-reports"
            element={
              <MainLayout>
                <ProtectedRoute allowedRoles={['admin', 'guru']}>
                  <ProgressReports />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/ape"
            element={
              <MainLayout>
                <ProtectedRoute allowedRoles={['admin', 'kepala_sekolah', 'guru']}>
                  <APE />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/report-templates"
            element={
              <MainLayout>
                <ProtectedRoute allowedRoles={['admin', 'kepala_sekolah']}>
                  <ReportTemplates />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/soal"
            element={
              <MainLayout>
                <ProtectedRoute allowedRoles={['admin', 'kepala_sekolah', 'guru']}>
                  <Soal />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/activity-logs"
            element={
              <MainLayout>
                <ProtectedRoute allowedRoles={['admin']}>
                  <ActivityLogs />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          {/* <Route
            path="/settings"
            element={
              <MainLayout>
                <ProtectedRoute allowedRoles={['admin']}>
                  <Settings />
                </ProtectedRoute>
              </MainLayout>
            }
          /> */}
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
