import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  Home, 
  Building2, 
  Calendar, 
  Settings, 
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import WalletModal from './WalletModal';

const Header: React.FC = () => {
  const { wallet, user, disconnectWallet } = useApp();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/hotels', label: 'Hotels', icon: Building2 },
    { path: '/bookings', label: 'My Bookings', icon: Calendar },
    ...(user?.isHotelOwner ? [{ path: '/admin', label: 'Admin', icon: Settings }] : []),
  ];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 glass border-b border-white/10"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-royal-500 to-neon-blue rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-royal-500/20 to-neon-blue/20 rounded-lg blur opacity-75" />
              </motion.div>
              <div>
                <h1 className="text-xl font-display font-bold text-white">
                  Muv In
                </h1>
                <p className="text-xs text-gray-400">Decentralized Hotels</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive(path)
                      ? 'text-neon-blue bg-neon-blue/10 border border-neon-blue/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
            </nav>

            {/* Wallet Section */}
            <div className="flex items-center space-x-4">
              {wallet.isConnected ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-white">
                      {formatAddress(wallet.principal!)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {wallet.balance.toFixed(2)} ICP
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-full flex items-center justify-center"
                    >
                      <Wallet className="w-4 h-4 text-white" />
                    </motion.div>
                    <button
                      onClick={disconnectWallet}
                      className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                      title="Disconnect Wallet"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="btn-cyber"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <motion.nav 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden py-4 border-t border-white/10"
            >
              <div className="flex flex-col space-y-2">
                {navigationItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(path)
                        ? 'text-neon-blue bg-neon-blue/10 border border-neon-blue/30'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </Link>
                ))}
              </div>
            </motion.nav>
          )}
        </div>
      </motion.header>

      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
    </>
  );
};

export default Header;
