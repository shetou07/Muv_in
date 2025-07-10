import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Shield, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connectWallet, isLoading } = useApp();

  const walletOptions = [
    {
      id: 'internet-identity',
      name: 'Internet Identity',
      description: 'Secure, anonymous authentication',
      icon: Shield,
      color: 'from-royal-500 to-royal-600',
      features: ['Anonymous', 'Secure', 'Fast'],
    },
    {
      id: 'plug',
      name: 'Plug Wallet',
      description: 'Popular ICP wallet extension',
      icon: Zap,
      color: 'from-neon-blue to-neon-cyan',
      features: ['Easy to use', 'Feature rich', 'Popular'],
    },
  ] as const;

  const handleConnect = async (walletType: 'internet-identity' | 'plug') => {
    try {
      await connectWallet(walletType);
      onClose();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass-strong rounded-2xl p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-display font-bold text-white">
                  Connect Wallet
                </h2>
                <p className="text-gray-400 mt-1">
                  Choose your preferred wallet to continue
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wallet Options */}
            <div className="space-y-4">
              {walletOptions.map((wallet) => (
                <motion.button
                  key={wallet.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleConnect(wallet.id)}
                  disabled={isLoading}
                  className="w-full p-4 glass rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 bg-gradient-to-br ${wallet.color} rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all duration-200`}>
                      <wallet.icon className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-semibold text-white group-hover:text-neon-blue transition-colors duration-200">
                        {wallet.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {wallet.description}
                      </p>
                      
                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {wallet.features.map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-1 bg-white/10 text-xs text-gray-300 rounded-md"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Arrow */}
                    <div className="text-gray-400 group-hover:text-white transition-colors duration-200">
                      <Wallet className="w-5 h-5" />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 text-center">
                By connecting a wallet, you agree to Muv In's{' '}
                <span className="text-neon-blue hover:underline cursor-pointer">
                  Terms of Service
                </span>{' '}
                and{' '}
                <span className="text-neon-blue hover:underline cursor-pointer">
                  Privacy Policy
                </span>
              </p>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <div className="glass p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
                    <span className="text-white font-medium">Connecting...</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WalletModal;
