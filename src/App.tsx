import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/teachers" element={<MainLayout><Teachers /></MainLayout>} />
          <Route path="/students" element={<MainLayout><Students /></MainLayout>} />
          <Route path="/documents" element={<MainLayout><Documents /></MainLayout>} />
          <Route path="/anecdotes" element={<MainLayout><Anecdotes /></MainLayout>} />
          <Route path="/progress-reports" element={<MainLayout><ProgressReports /></MainLayout>} />
          <Route path="/ape" element={<MainLayout><APE /></MainLayout>} />
          <Route path="/report-templates" element={<MainLayout><ReportTemplates /></MainLayout>} />
          <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
