import type { Principal } from '@dfinity/principal';

// ICP Backend Types (matching Motoko definitions)
export interface Hotel {
  id: bigint;
  name: string;
  location: string;
  description: string;
  totalRooms: bigint;
  availableRooms: bigint;
  pricePerNight: bigint; // in e8s
  amenities: string[];
  images: string[];
  owner: Principal;
  rating: number;
  reviewCount: bigint;
  createdAt: bigint;
}

export interface HotelInput {
  name: string;
  location: string;
  description: string;
  totalRooms: bigint;
  pricePerNight: bigint;
  amenities: string[];
  images: string[];
}

export interface Booking {
  id: bigint;
  hotelId: bigint;
  hotelName: string;
  bookedBy: Principal;
  checkIn: bigint;
  checkOut: bigint;
  nights: bigint;
  roomsBooked: bigint;
  totalPrice: bigint;
  status: BookingStatus;
  createdAt: bigint;
}

export interface BookingInput {
  hotelId: bigint;
  checkIn: bigint;
  checkOut: bigint;
  roomsBooked: bigint;
}

export interface User {
  principal: Principal;
  isHotelOwner: boolean;
  totalBookings: bigint;
  joinedAt: bigint;
}

export interface Review {
  id: bigint;
  hotelId: bigint;
  reviewedBy: Principal;
  rating: bigint;
  comment: string;
  createdAt: bigint;
}

export type BookingStatus = 
  | { active: null }
  | { completed: null }
  | { cancelled: null }
  | { pending: null };

export type ErrorType = 
  | { NotFound: null }
  | { Unauthorized: null }
  | { InvalidInput: null }
  | { InsufficientRooms: null }
  | { BookingConflict: null };

export type Result<T> = 
  | { ok: T }
  | { err: ErrorType };

export interface HotelStats {
  totalBookings: bigint;
  totalRevenue: bigint;
  avgRating: number;
}

export interface PlatformStats {
  totalHotels: bigint;
  totalBookings: bigint;
  totalUsers: bigint;
}

// Frontend UI Types (transformed from backend types)
export interface UIHotel {
  id: number;
  name: string;
  location: string;
  description: string;
  totalRooms: number;
  availableRooms: number;
  pricePerNight: number; // in ICP
  amenities: string[];
  images: string[];
  owner: string;
  rating: number;
  reviewCount: number;
  createdAt: Date;
}

export interface UIBooking {
  id: number;
  hotelId: number;
  hotelName: string;
  bookedBy: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  roomsBooked: number;
  totalPrice: number;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  createdAt: Date;
}

export interface UIReview {
  id: number;
  hotelId: number;
  reviewedBy: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface UIUser {
  principal: string;
  isHotelOwner: boolean;
  totalBookings: number;
  joinedAt: Date;
}

// Utility types for form handling
export interface CreateHotelForm {
  name: string;
  location: string;
  description: string;
  totalRooms: number;
  pricePerNight: number;
  amenities: string[];
  images: string[];
}

export interface CreateBookingForm {
  hotelId: number;
  checkIn: Date;
  checkOut: Date;
  roomsBooked: number;
}

export interface CreateReviewForm {
  hotelId: number;
  rating: number;
  comment: string;
}
