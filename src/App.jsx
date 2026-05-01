import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PageTransition from './components/PageTransition';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import DashboardHome from './pages/Dashboard/DashboardHome';
import Customers from './pages/Dashboard/Customers';
import Suppliers from './pages/Dashboard/Suppliers';
import Purchases from './pages/Dashboard/Purchases';
import Items from './pages/Dashboard/Items';
import Sales from './pages/Dashboard/Sales';
import SaleForm from './pages/Dashboard/SaleForm';
import PurchaseForm from './pages/Dashboard/PurchaseForm';
import Settings from './pages/Dashboard/Settings';
import Expenses from './pages/Dashboard/Expenses';
import StockReport from './pages/Dashboard/StockReport';
import ProfitLoss from './pages/Dashboard/ProfitLoss';
import Ledger from './pages/Dashboard/Ledger';
import Notifications from './pages/Dashboard/Notifications';
import Profile from './pages/Dashboard/Profile';
import Security from './pages/Dashboard/Security';
import SaleInvoice from './pages/Dashboard/Print/SaleInvoice';
import PurchaseInvoice from './pages/Dashboard/Print/PurchaseInvoice';

function AppContent() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Main Entry Point - Login Page */}
          <Route path="/" element={<PageTransition key="login"><Login /></PageTransition>} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
          <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
          <Route path="/purchase-form" element={<ProtectedRoute><PurchaseForm /></ProtectedRoute>} />
          <Route path="/edit-purchase/:id" element={<ProtectedRoute><PurchaseForm /></ProtectedRoute>} />
          <Route path="/items" element={<ProtectedRoute><Items /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
          <Route path="/sale-form" element={<ProtectedRoute><SaleForm /></ProtectedRoute>} />
          <Route path="/edit-sale/:id" element={<ProtectedRoute><SaleForm /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
          <Route path="/stock-report" element={<ProtectedRoute><StockReport /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ProfitLoss /></ProtectedRoute>} />
          <Route path="/ledger" element={<ProtectedRoute><Ledger /></ProtectedRoute>} />
          <Route path="/dashboard/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
          <Route path="/sales/print/:id" element={<ProtectedRoute><SaleInvoice /></ProtectedRoute>} />
          <Route path="/purchases/print/:id" element={<ProtectedRoute><PurchaseInvoice /></ProtectedRoute>} />

          {/* Catch-all redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <AppContent />
    </AuthProvider>
  );
}

export default App;
