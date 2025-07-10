import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Building2, 
  Shield, 
  Zap, 
  Globe,
  Wallet,
  Star,
  Users,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import WalletModal from '../components/WalletModal';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { wallet } = useApp();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const features = [
    {
      icon: Shield,
      title: 'Decentralized & Secure',
      description: 'Your bookings are secured by blockchain technology with full transparency.',
      color: 'text-neon-blue',
    },
    {
      icon: Zap,
      title: 'Instant Payments',
      description: 'Pay with ICP tokens for fast, low-cost transactions worldwide.',
      color: 'text-neon-cyan',
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Access hotels worldwide through our decentralized platform.',
      color: 'text-royal-500',
    },
  ];

  const stats = [
    { icon: Building2, label: 'Hotels Listed', value: '500+' },
    { icon: Users, label: 'Happy Travelers', value: '2,500+' },
    { icon: Star, label: 'Average Rating', value: '4.8' },
    { icon: TrendingUp, label: 'Growth Rate', value: '300%' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-cyber">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-royal-500/30 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-blue/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-neon-cyan/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          </div>
        </div>

        <div className="relative container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl lg:text-7xl font-display font-bold text-white mb-6"
            >
              Book Smart.{' '}
              <span className="bg-gradient-to-r from-neon-blue to-neon-cyan bg-clip-text text-transparent">
                Travel Free.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl lg:text-2xl text-gray-300 mb-12 leading-relaxed"
            >
              Experience the future of hotel booking with complete decentralization, 
              transparent pricing, and secure blockchain transactions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={() => navigate('/hotels')}
                className="btn-cyber text-lg px-8 py-4"
              >
                <Building2 className="w-5 h-5 mr-2" />
                Explore Hotels
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>

              {!wallet.isConnected && (
                <button
                  onClick={() => setIsWalletModalOpen(true)}
                  className="btn-neon text-lg px-8 py-4"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Wallet
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-dark-200/50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-royal-500 to-neon-blue rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-6">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-royal-500 to-neon-blue bg-clip-text text-transparent">
                Muv In?
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Built on the Internet Computer Protocol for maximum security, 
              transparency, and user control.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="card-cyber group"
              >
                <div className={`w-16 h-16 ${feature.color} bg-current/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-royal-600/20 to-neon-blue/20">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of travelers who have discovered the future of hotel booking.
            </p>
            <button
              onClick={() => navigate('/hotels')}
              className="btn-cyber text-lg px-8 py-4"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Start Exploring
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </motion.div>
        </div>
      </section>

      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
    </div>
  );
};

export default LandingPage;
