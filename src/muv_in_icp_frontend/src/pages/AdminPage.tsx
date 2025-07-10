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
import { Hotel, HotelFormData } from '../types';
import { useApp } from '../context/AppContext';

const AdminPage: React.FC = () => {
  const { user, addHotel, isLoading } = useApp();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<HotelFormData>({
    name: '',
    description: '',
    location: '',
    pricePerNight: 0,
    totalRooms: 0,
    amenities: [],
    images: [],
  });
  const [newAmenity, setNewAmenity] = useState('');

  // Mock hotels owned by user
  useEffect(() => {
    if (user?.isHotelOwner) {
      const mockOwnedHotels: Hotel[] = [
        {
          id: '1',
          name: 'Cyber Palace Hotel',
          description: 'Luxury futuristic hotel in the heart of the digital district',
          location: 'Neo Tokyo, Japan',
          pricePerNight: 150,
          totalRooms: 50,
          availableRooms: 12,
          images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
          amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
          ownerId: user.id,
          rating: 4.8,
          reviews: 127,
        },
        {
          id: '2',
          name: 'Neon Nights Hotel',
          description: 'Vibrant urban hotel with immersive experiences',
          location: 'Los Angeles, USA',
          pricePerNight: 120,
          totalRooms: 60,
          availableRooms: 15,
          images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'],
          amenities: ['WiFi', 'Pool', 'Gaming Lounge', 'Restaurant'],
          ownerId: user.id,
          rating: 4.6,
          reviews: 156,
        },
      ];
      setHotels(mockOwnedHotels);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const hotelData: Omit<Hotel, 'id'> = {
      ...formData,
      ownerId: user.id,
      availableRooms: formData.totalRooms,
      rating: 0,
      reviews: 0,
    };

    await addHotel(hotelData);
    
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
    
    // In a real app, you'd refetch the hotels data
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

  if (!user?.isHotelOwner) {
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
            <h2 className="text-3xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-gray-400">
              This area is restricted to hotel owners only
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  const totalBookings = hotels.reduce((sum, hotel) => sum + (hotel.totalRooms - hotel.availableRooms), 0);
  const totalRevenue = hotels.reduce((sum, hotel) => sum + (hotel.pricePerNight * (hotel.totalRooms - hotel.availableRooms)), 0);
  const averageRating = hotels.reduce((sum, hotel) => sum + (hotel.rating || 0), 0) / hotels.length;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4">
              Hotel{' '}
              <span className="bg-gradient-to-r from-royal-500 to-neon-blue bg-clip-text text-transparent">
                Management
              </span>
            </h1>
            <p className="text-xl text-gray-400">
              Manage your properties and track performance
            </p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-cyber mt-4 lg:mt-0"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Hotel
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="card-cyber text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-royal-500 to-royal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{hotels.length}</div>
            <div className="text-gray-400">Total Properties</div>
          </div>
          
          <div className="card-cyber text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-cyan rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{totalBookings}</div>
            <div className="text-gray-400">Active Bookings</div>
          </div>
          
          <div className="card-cyber text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{totalRevenue}</div>
            <div className="text-gray-400">Revenue (ICP)</div>
          </div>
          
          <div className="card-cyber text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{averageRating.toFixed(1)}</div>
            <div className="text-gray-400">Avg Rating</div>
          </div>
        </motion.div>

        {/* Hotels List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Your Properties</h2>
          
          {hotels.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-dark-200 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">No hotels yet</h3>
              <p className="text-gray-400 mb-6">
                Add your first hotel to start accepting bookings
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-cyber"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Hotel
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {hotels.map((hotel, index) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card-cyber group"
                >
                  {/* Hotel Image */}
                  <div className="relative h-48 rounded-lg overflow-hidden mb-4">
                    <img
                      src={hotel.images[0]}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white font-medium">{hotel.rating}</span>
                      <span className="text-gray-300 text-sm">({hotel.reviews})</span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-royal-600 text-white px-2 py-1 rounded-lg text-sm font-medium">
                        {hotel.pricePerNight} ICP/night
                      </span>
                    </div>
                  </div>

                  {/* Hotel Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white mb-2">{hotel.name}</h3>
                    <div className="flex items-center space-x-1 text-gray-400 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{hotel.location}</span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">{hotel.description}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-white">{hotel.totalRooms}</div>
                      <div className="text-xs text-gray-400">Total Rooms</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-400">{hotel.availableRooms}</div>
                      <div className="text-xs text-gray-400">Available</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-neon-blue">
                        {hotel.totalRooms - hotel.availableRooms}
                      </div>
                      <div className="text-xs text-gray-400">Booked</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white transition-all duration-200">
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200">
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Hotel Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative glass-strong rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-cyber"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-white">
                  Add New Hotel
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hotel Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-cyber"
                      placeholder="Enter hotel name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="input-cyber"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-cyber resize-none"
                    placeholder="Describe your hotel"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price per Night (ICP) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.pricePerNight}
                      onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
                      className="input-cyber"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Total Rooms *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.totalRooms}
                      onChange={(e) => setFormData({ ...formData, totalRooms: Number(e.target.value) })}
                      className="input-cyber"
                      placeholder="0"
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
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                      className="input-cyber flex-1"
                      placeholder="Add amenity"
                    />
                    <button
                      type="button"
                      onClick={addAmenity}
                      className="btn-cyber"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="flex items-center space-x-1 px-2 py-1 bg-royal-600/20 text-royal-300 rounded-md text-sm"
                      >
                        <span>{amenity}</span>
                        <button
                          type="button"
                          onClick={() => removeAmenity(amenity)}
                          className="text-royal-400 hover:text-white"
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
                    className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-white transition-all duration-200 mb-3"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Add Image URL</span>
                  </button>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Hotel image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 btn-cyber-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 btn-cyber disabled:opacity-50"
                  >
                    {isLoading ? 'Adding...' : 'Add Hotel'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;
