import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Users, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Waves,
  Utensils,
  Check,
  X
} from 'lucide-react';
import { Hotel, BookingFormData } from '../types';
import { useApp } from '../context/AppContext';

const HotelDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { wallet, bookHotel, isLoading } = useApp();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    checkIn: '',
    checkOut: '',
    roomsCount: 1,
  });

  // Mock hotel data - in real app, this would come from your backend
  useEffect(() => {
    const mockHotel: Hotel = {
      id: id || '1',
      name: 'Cyber Palace Hotel',
      description: 'Experience the future of hospitality at Cyber Palace Hotel, where cutting-edge technology meets luxury accommodation. Located in the heart of Neo Tokyo\'s digital district, this architectural marvel features holographic concierge services, AI-powered room customization, and breathtaking views of the city\'s neon-lit skyline.',
      location: 'Neo Tokyo, Japan',
      pricePerNight: 150,
      totalRooms: 50,
      availableRooms: 12,
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
      ],
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Parking', 'Room Service', 'Concierge'],
      ownerId: 'owner1',
      rating: 4.8,
      reviews: 127,
    };
    setHotel(mockHotel);
  }, [id]);

  const nextImage = () => {
    if (hotel) {
      setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length);
    }
  };

  const prevImage = () => {
    if (hotel) {
      setCurrentImageIndex((prev) => (prev - 1 + hotel.images.length) % hotel.images.length);
    }
  };

  const handleBooking = async () => {
    if (!wallet.isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    const checkInDate = new Date(bookingData.checkIn);
    const checkOutDate = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * hotel!.pricePerNight * bookingData.roomsCount;

    await bookHotel(hotel!.id, {
      ...bookingData,
      nights,
      totalPrice,
    });

    setShowBookingModal(false);
    navigate('/bookings');
  };

  const getAmenityIcon = (amenity: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'WiFi': <Wifi className="w-5 h-5" />,
      'Pool': <Waves className="w-5 h-5" />,
      'Spa': <Star className="w-5 h-5" />,
      'Restaurant': <Utensils className="w-5 h-5" />,
      'Gym': <Dumbbell className="w-5 h-5" />,
      'Parking': <Car className="w-5 h-5" />,
      'Room Service': <Coffee className="w-5 h-5" />,
      'Concierge': <Users className="w-5 h-5" />,
    };
    return icons[amenity] || <Check className="w-5 h-5" />;
  };

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-royal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/hotels')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Hotels</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative h-96 rounded-2xl overflow-hidden mb-8"
            >
              <img
                src={hotel.images[currentImageIndex]}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Buttons */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-200"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-200"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {hotel.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Hotel Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-display font-bold text-white mb-2">
                    {hotel.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-gray-400">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{hotel.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white font-medium">{hotel.rating}</span>
                      <span>({hotel.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-neon-blue">
                    {hotel.pricePerNight} ICP
                  </div>
                  <div className="text-gray-400">per night</div>
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed">
                {hotel.description}
              </p>
            </motion.div>

            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="card-cyber"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {hotel.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg"
                  >
                    <div className="text-neon-blue">
                      {getAmenityIcon(amenity)}
                    </div>
                    <span className="text-white">{amenity}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Booking Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="card-cyber sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">Book Your Stay</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Check-in
                  </label>
                  <input
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                    className="input-cyber"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Check-out
                  </label>
                  <input
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                    className="input-cyber"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rooms
                  </label>
                  <select
                    value={bookingData.roomsCount}
                    onChange={(e) => setBookingData({ ...bookingData, roomsCount: Number(e.target.value) })}
                    className="input-cyber"
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num} Room{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center space-x-2 text-green-400 mb-6">
                <Users className="w-5 h-5" />
                <span>{hotel.availableRooms} rooms available</span>
              </div>

              {/* Booking Summary */}
              {bookingData.checkIn && bookingData.checkOut && (
                <div className="border border-white/10 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                    <span>Duration</span>
                    <span>
                      {Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                    <span>Price per night</span>
                    <span>{hotel.pricePerNight} ICP</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                    <span>Rooms</span>
                    <span>{bookingData.roomsCount}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2">
                    <div className="flex justify-between items-center text-lg font-bold text-white">
                      <span>Total</span>
                      <span className="text-neon-blue">
                        {Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24)) * hotel.pricePerNight * bookingData.roomsCount} ICP
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowBookingModal(true)}
                disabled={!bookingData.checkIn || !bookingData.checkOut || !wallet.isConnected}
                className="w-full btn-cyber disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!wallet.isConnected ? 'Connect Wallet to Book' : 'Book Now'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBookingModal(false)} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative glass-strong rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Confirm Booking</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Hotel</span>
                <span className="text-white">{hotel.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Check-in</span>
                <span className="text-white">{bookingData.checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Check-out</span>
                <span className="text-white">{bookingData.checkOut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rooms</span>
                <span className="text-white">{bookingData.roomsCount}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span className="text-white">Total</span>
                <span className="text-neon-blue">
                  {Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24)) * hotel.pricePerNight * bookingData.roomsCount} ICP
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 btn-cyber-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleBooking}
                disabled={isLoading}
                className="flex-1 btn-cyber disabled:opacity-50"
              >
                {isLoading ? 'Booking...' : 'Confirm'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default HotelDetailsPage;
