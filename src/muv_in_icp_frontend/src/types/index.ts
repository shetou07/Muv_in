// Data types for the Muv In dApp

export interface Hotel {
  id: string;
  name: string;
  description: string;
  location: string;
  pricePerNight: number; // in ICP
  totalRooms: number;
  availableRooms: number;
  images: string[];
  amenities: string[];
  ownerId: string;
  rating?: number;
  reviews?: number;
}

export interface Booking {
  id: string;
  hotelId: string;
  hotelName: string;
  userId: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  totalPrice: number; // in ICP
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  roomsBooked: number;
  createdAt: Date;
}

export interface User {
  id: string;
  walletAddress: string;
  isHotelOwner: boolean;
  bookings: Booking[];
  ownedHotels: Hotel[];
}

export interface WalletConnection {
  isConnected: boolean;
  walletType: 'internet-identity' | 'plug' | null;
  principal: string | null;
  balance: number; // in ICP
}

export interface BookingFormData {
  checkIn: string;
  checkOut: string;
  roomsCount: number;
}

export interface HotelFormData {
  name: string;
  description: string;
  location: string;
  pricePerNight: number;
  totalRooms: number;
  amenities: string[];
  images: string[];
}

export interface FilterOptions {
  location: string;
  minPrice: number;
  maxPrice: number;
  availableRooms: boolean;
}
