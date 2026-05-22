import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Faculty from './pages/Faculty';
import Subjects from './pages/Subjects';
import Rooms from './pages/Rooms';
import Batches from './pages/Batches';
import Timetable from './pages/Timetable';

import SignUp from './pages/SignUp';

const pageTransition = {
  initial:   { opacity: 0, y: 12 },
  animate:   { opacity: 1, y: 0,  transition: { duration: 0.3, ease: 'easeOut' } },
  exit:      { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

function AnimatedPage({ children }) {
  return (
    <motion.div {...pageTransition}>
      {children}
    </motion.div>
  );
}

function RequireAuth() {
  const token = localStorage.getItem('tt_token');
  if (!token) return <Navigate to="/" replace />;
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><Login /></AnimatedPage>} />
        <Route path="/signup" element={<AnimatedPage><SignUp /></AnimatedPage>} />
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<AnimatedPage><Dashboard /></AnimatedPage>} />
          <Route path="/faculty"   element={<AnimatedPage><Faculty /></AnimatedPage>} />
          <Route path="/subjects"  element={<AnimatedPage><Subjects /></AnimatedPage>} />
          <Route path="/rooms"     element={<AnimatedPage><Rooms /></AnimatedPage>} />
          <Route path="/batches"   element={<AnimatedPage><Batches /></AnimatedPage>} />
          <Route path="/timetable" element={<AnimatedPage><Timetable /></AnimatedPage>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            fontSize: 13,
            boxShadow: '0 8px 28px rgba(0,0,0,0.10)',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#ffffff' },
            style: { borderLeft: '3px solid #10b981' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
            style: { borderLeft: '3px solid #ef4444' },
          },
          loading: {
            style: { borderLeft: '3px solid #4f46e5' },
          },
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  );
}
