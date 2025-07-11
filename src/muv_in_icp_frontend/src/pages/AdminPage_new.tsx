import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Building2, 
  Edit3, 
  Trash2, 
  Users, 
  Calendar,
  TrendingUp,
  DollarSign,
  X,
  Upload,
  MapPin,
  Star
} from 'lucide-react';
import { UIHotel, CreateHotelForm } from '../types';
import { useApp } from '../context/AppContext';

const AdminPage: React.FC = () => {
  const { userProfile, hotels, createHotel, isAuthenticated, loadPlatformStats, platformStats, isLoading } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<CreateHotelForm>({
    name: '',
    description: '',
    location: '',
    pricePerNight: 0,
    totalRooms: 0,
    amenities: [],
    images: [],
  });
  const [newAmenity, setNewAmenity] = useState('');

  // Load platform stats when component mounts
  useEffect(() => {
    loadPlatformStats();
  }, [loadPlatformStats]);

  // Filter hotels owned by current user
  const ownedHotels = hotels.filter(hotel => 
    userProfile && hotel.owner === userProfile.principal
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) return;

    const hotelId = await createHotel(formData);
    
    if (hotelId) {
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        location: '',
        pricePerNight: 0,
        totalRooms: 0,
        amenities: [],
        images: [],
      });
      setShowAddModal(false);
    } else {
      alert('Failed to create hotel. Please try again.');
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()],
      });
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(a => a !== amenity),
    });
  };

  const addImageUrl = () => {
    const url = prompt('Enter image URL:');
    if (url && url.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, url.trim()],
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
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
              <Building2 className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Admin Access Required</h2>
            <p className="text-gray-400 mb-8">
              Please login to access the admin panel
            </p>
          </motion.div>
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
          className="mb-8"
        >
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            Hotel{' '}
            <span className="bg-gradient-to-r from-royal-500 to-neon-blue bg-clip-text text-transparent">
              Management
            </span>
          </h1>
          <p className="text-xl text-gray-400">
            Manage your hotels and view platform analytics
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="card-cyber">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Hotels</p>
                <p className="text-2xl font-bold text-white">
                  {platformStats?.totalHotels || 0}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-royal-400" />
            </div>
          </div>

          <div className="card-cyber">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Bookings</p>
                <p className="text-2xl font-bold text-white">
                  {platformStats?.totalBookings || 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-neon-blue" />
            </div>
          </div>

          <div className="card-cyber">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">
                  {platformStats?.totalUsers || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="card-cyber">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Your Hotels</p>
                <p className="text-2xl font-bold text-white">{ownedHotels.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </motion.div>

        {/* Hotels Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Hotels</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-cyber flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Hotel</span>
            </button>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-dark-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : ownedHotels.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-dark-200 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No Hotels Yet</h3>
              <p className="text-gray-400 mb-6">
                Start by adding your first hotel to the platform
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-cyber"
              >
                Add Your First Hotel
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ownedHotels.map((hotel, index) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-cyber group"
                >
                  {/* Hotel Image */}
                  <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                    <img
                      src={hotel.images[0] || '/placeholder-hotel.jpg'}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white font-medium">{hotel.rating}</span>
                      <span className="text-gray-300 text-sm">({hotel.reviewCount})</span>
                    </div>
                  </div>

                  {/* Hotel Info */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{hotel.name}</h3>
                    <div className="flex items-center space-x-1 text-gray-400 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{hotel.location}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {hotel.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-neon-blue font-bold">
                        {hotel.pricePerNight} ICP/night
                      </div>
                      <div className="text-gray-400 text-sm">
                        {hotel.availableRooms}/{hotel.totalRooms} available
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 btn-secondary text-sm py-2">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button className="flex-1 btn-secondary text-sm py-2 text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Add Hotel Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Add New Hotel</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Hotel Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-cyber"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="input-cyber"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input-cyber min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Price per Night (ICP)
                      </label>
                      <input
                        type="number"
                        value={formData.pricePerNight}
                        onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
                        className="input-cyber"
                        min="0"
                        step="0.1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Total Rooms
                      </label>
                      <input
                        type="number"
                        value={formData.totalRooms}
                        onChange={(e) => setFormData({ ...formData, totalRooms: Number(e.target.value) })}
                        className="input-cyber"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amenities
                    </label>
                    <div className="flex space-x-2 mb-3">
                      <input
                        type="text"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        placeholder="Add amenity"
                        className="input-cyber flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                      />
                      <button
                        type="button"
                        onClick={addAmenity}
                        className="btn-secondary px-4"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="px-3 py-1 bg-royal-600/20 text-royal-400 rounded-full text-sm flex items-center space-x-2"
                        >
                          <span>{amenity}</span>
                          <button
                            type="button"
                            onClick={() => removeAmenity(amenity)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Images
                    </label>
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="btn-secondary mb-3 flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Add Image URL</span>
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Hotel ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 btn-cyber disabled:opacity-50"
                    >
                      {isLoading ? 'Creating...' : 'Create Hotel'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPage;
