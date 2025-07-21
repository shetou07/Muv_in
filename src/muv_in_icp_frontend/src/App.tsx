import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import HotelsPage from './pages/HotelsPage';
import HotelDetailsPage from './pages/HotelDetailsPage';
import BookingsPage from './pages/BookingsPage';
import AdminPage from './pages/AdminPage';
import './App.css';

// Error Toast Component
const ErrorToast: React.FC = () => {
  const { error, clearError } = useApp();

  if (!error) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg border border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold">Error</h4>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="ml-4 text-white hover:text-gray-200 text-xl font-bold"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Content
const AppContent: React.FC = () => {
  const { isLoading, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Initializing...</h2>
          <p className="text-gray-400">Connecting to the decentralized network</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-100">
      <Header />
      <ErrorToast />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/hotels/:id" element={<HotelDetailsPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;
