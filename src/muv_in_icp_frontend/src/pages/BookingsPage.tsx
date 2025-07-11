import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  X as CancelIcon
} from 'lucide-react';
import { UIBooking } from '../types';
import { useApp } from '../context/AppContext';

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookings, isAuthenticated, cancelBooking, isLoading } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  const filteredBookings = bookings.filter(booking => 
    filter === 'all' || booking.status === filter
  );

  const getStatusIcon = (status: UIBooking['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: UIBooking['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'completed':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'cancelled':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      const success = await cancelBooking(bookingId);
      if (success) {
        // Refresh bookings will be handled by the context
        window.location.reload(); // Simple refresh for now
      } else {
        alert('Failed to cancel booking. Please try again.');
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="w-24 h-24 bg-dark-200 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Login Required</h2>
            <p className="text-gray-400 mb-8">
              Please login to view your bookings
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-cyber"
            >
              Go Home
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="h-8 bg-dark-200 rounded w-1/4 animate-pulse mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-dark-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            My{' '}
            <span className="bg-gradient-to-r from-royal-500 to-neon-blue bg-clip-text text-transparent">
              Bookings
            </span>
          </h1>
          <p className="text-xl text-gray-400">
            Manage and track all your hotel reservations
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Bookings' },
              { key: 'active', label: 'Active' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === key
                    ? 'bg-royal-600 text-white'
                    : 'bg-dark-200 text-gray-400 hover:text-white hover:bg-dark-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-dark-200 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No bookings found</h3>
            <p className="text-gray-400 mb-6">
              {filter === 'all' 
                ? "You haven't made any bookings yet"
                : `No ${filter} bookings found`
              }
            </p>
            <button
              onClick={() => navigate('/hotels')}
              className="btn-cyber"
            >
              Explore Hotels
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-cyber group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {booking.hotelName}
                        </h3>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">Booking ID: {booking.id}</span>
                        </div>
                      </div>
                      
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg border ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="text-sm font-medium capitalize">
                          {booking.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-neon-blue" />
                        <div>
                          <div className="text-gray-400">Check-in</div>
                          <div className="text-white font-medium">
                            {formatDate(booking.checkIn)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-neon-cyan" />
                        <div>
                          <div className="text-gray-400">Check-out</div>
                          <div className="text-white font-medium">
                            {formatDate(booking.checkOut)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-royal-500" />
                        <div>
                          <div className="text-gray-400">Total Paid</div>
                          <div className="text-white font-medium">
                            {booking.totalPrice} ICP
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center space-x-4 text-sm text-gray-400">
                      <span>{booking.nights} night{booking.nights > 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>{booking.roomsBooked} room{booking.roomsBooked > 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>Booked {formatDate(booking.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => navigate(`/hotels/${booking.hotelId}`)}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Hotel</span>
                    </button>
                    
                    {booking.status === 'active' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200"
                      >
                        <CancelIcon className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {bookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <div className="card-cyber text-center">
              <div className="text-2xl font-bold text-neon-blue mb-1">
                {bookings.length}
              </div>
              <div className="text-gray-400">Total Bookings</div>
            </div>
            
            <div className="card-cyber text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {bookings.filter(b => b.status === 'active').length}
              </div>
              <div className="text-gray-400">Active</div>
            </div>
            
            <div className="card-cyber text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {bookings.filter(b => b.status === 'completed').length}
              </div>
              <div className="text-gray-400">Completed</div>
            </div>
            
            <div className="card-cyber text-center">
              <div className="text-2xl font-bold text-royal-500 mb-1">
                {bookings.reduce((sum, booking) => sum + booking.totalPrice, 0)}
              </div>
              <div className="text-gray-400">Total Spent (ICP)</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;
