import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Users, 
  Calendar,
  ArrowRight,
  Grid3X3,
  List,
  SlidersHorizontal
} from 'lucide-react';
import { Hotel, FilterOptions } from '../types';

const HotelsPage: React.FC = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGridView, setIsGridView] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    location: '',
    minPrice: 0,
    maxPrice: 1000,
    availableRooms: true,
  });

  // Mock hotel data
  useEffect(() => {
    const mockHotels: Hotel[] = [
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
        ownerId: 'owner1',
        rating: 4.8,
        reviews: 127,
      },
      {
        id: '2',
        name: 'Blockchain Heights',
        description: 'High-tech accommodation with stunning city views',
        location: 'Singapore',
        pricePerNight: 200,
        totalRooms: 30,
        availableRooms: 8,
        images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'],
        amenities: ['WiFi', 'Rooftop Bar', 'Business Center', 'Concierge'],
        ownerId: 'owner2',
        rating: 4.9,
        reviews: 89,
      },
      {
        id: '3',
        name: 'Quantum Resort',
        description: 'Peaceful retreat with cutting-edge amenities',
        location: 'Zurich, Switzerland',
        pricePerNight: 300,
        totalRooms: 75,
        availableRooms: 25,
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
        amenities: ['WiFi', 'Spa', 'Ski Access', 'Fine Dining', 'Wellness Center'],
        ownerId: 'owner3',
        rating: 4.7,
        reviews: 203,
      },
      {
        id: '4',
        name: 'Neon Nights Hotel',
        description: 'Vibrant urban hotel with immersive experiences',
        location: 'Los Angeles, USA',
        pricePerNight: 120,
        totalRooms: 60,
        availableRooms: 15,
        images: ['https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'],
        amenities: ['WiFi', 'Pool', 'Gaming Lounge', 'Restaurant', 'Event Spaces'],
        ownerId: 'owner4',
        rating: 4.6,
        reviews: 156,
      },
    ];
    
    setHotels(mockHotels);
    setFilteredHotels(mockHotels);
  }, []);

  // Filter hotels based on search and filters
  useEffect(() => {
    let filtered = hotels.filter(hotel => {
      const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = !filters.location || 
                            hotel.location.toLowerCase().includes(filters.location.toLowerCase());
      const matchesPrice = hotel.pricePerNight >= filters.minPrice && 
                         hotel.pricePerNight <= filters.maxPrice;
      const matchesAvailability = !filters.availableRooms || hotel.availableRooms > 0;

      return matchesSearch && matchesLocation && matchesPrice && matchesAvailability;
    });

    setFilteredHotels(filtered);
  }, [searchTerm, filters, hotels]);

  const HotelCard: React.FC<{ hotel: Hotel; index: number }> = ({ hotel, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="card-cyber group cursor-pointer"
      onClick={() => navigate(`/hotels/${hotel.id}`)}
    >
      {/* Image */}
      <div className="relative h-48 rounded-lg overflow-hidden mb-4">
        <img
          src={hotel.images[0]}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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

      {/* Content */}
      <div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-neon-blue transition-colors duration-200">
          {hotel.name}
        </h3>
        
        <div className="flex items-center space-x-1 text-gray-400 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{hotel.location}</span>
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {hotel.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1 text-gray-400">
            <Users className="w-4 h-4" />
            <span className="text-sm">{hotel.availableRooms} rooms available</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {hotel.amenities.slice(0, 3).map((amenity) => (
            <span
              key={amenity}
              className="px-2 py-1 bg-white/10 text-xs text-gray-300 rounded-md"
            >
              {amenity}
            </span>
          ))}
          {hotel.amenities.length > 3 && (
            <span className="text-xs text-gray-400">+{hotel.amenities.length - 3} more</span>
          )}
        </div>

        <button className="w-full btn-cyber group">
          View Details
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </motion.div>
  );

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
            Discover Amazing{' '}
            <span className="bg-gradient-to-r from-royal-500 to-neon-blue bg-clip-text text-transparent">
              Hotels
            </span>
          </h1>
          <p className="text-xl text-gray-400">
            Find your perfect stay from our curated collection of premium properties
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search hotels or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-cyber pl-10"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  showFilters 
                    ? 'border-royal-500 bg-royal-500/20 text-royal-400' 
                    : 'border-dark-300 text-gray-400 hover:border-royal-500 hover:text-royal-400'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
              
              <div className="flex bg-dark-200 rounded-lg p-1">
                <button
                  onClick={() => setIsGridView(true)}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    isGridView ? 'bg-royal-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsGridView(false)}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    !isGridView ? 'bg-royal-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-lg p-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Any location"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="input-cyber"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Min Price (ICP)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                    className="input-cyber"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Price (ICP)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                    className="input-cyber"
                  />
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center space-x-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={filters.availableRooms}
                      onChange={(e) => setFilters({ ...filters, availableRooms: e.target.checked })}
                      className="w-4 h-4 text-royal-600 bg-dark-200 border-dark-300 rounded focus:ring-royal-500"
                    />
                    <span>Available rooms only</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6"
        >
          <p className="text-gray-400">
            Found {filteredHotels.length} hotel{filteredHotels.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* Hotels Grid */}
        <div className={`grid gap-6 ${
          isGridView 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredHotels.map((hotel, index) => (
            <HotelCard key={hotel.id} hotel={hotel} index={index} />
          ))}
        </div>

        {/* No Results */}
        {filteredHotels.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-dark-200 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No hotels found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  location: '',
                  minPrice: 0,
                  maxPrice: 1000,
                  availableRooms: true,
                });
              }}
              className="btn-cyber"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HotelsPage;
