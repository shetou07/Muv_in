import type { Principal } from '@dfinity/principal';
import type {
  Hotel,
  HotelInput,
  Booking,
  BookingInput,
  User,
  Review,
  Result,
  ErrorType,
  HotelStats,
  PlatformStats
} from './types';

export interface MuvInBackend {
  // User management
  getMyProfile(): Promise<User>;
  updateProfile(isHotelOwner: boolean): Promise<Result<string>>;
  isHotelOwner(principal: Principal): Promise<boolean>;
  
  // Hotel management
  addHotel(input: HotelInput): Promise<Result<bigint>>;
  updateHotel(hotelId: bigint, input: HotelInput): Promise<Result<string>>;
  deleteHotel(hotelId: bigint): Promise<Result<string>>;
  getHotels(): Promise<Hotel[]>;
  getHotel(id: bigint): Promise<Hotel | undefined>;
  getMyHotels(): Promise<Hotel[]>;
  searchHotels(location: string, minPrice: bigint, maxPrice: bigint): Promise<Hotel[]>;
  
  // Booking management
  bookHotel(input: BookingInput): Promise<Result<bigint>>;
  confirmBooking(bookingId: bigint): Promise<Result<string>>;
  cancelBooking(bookingId: bigint): Promise<Result<string>>;
  completeBooking(bookingId: bigint): Promise<Result<string>>;
  getMyBookings(): Promise<Booking[]>;
  getHotelBookings(hotelId: bigint): Promise<Result<Booking[]>>;
  getBooking(bookingId: bigint): Promise<Booking | undefined>;
  getAllBookings(): Promise<Booking[]>;
  checkRoomAvailability(
    hotelId: bigint,
    checkIn: bigint,
    checkOut: bigint,
    roomsNeeded: bigint
  ): Promise<boolean>;
  
  // Review system
  addReview(hotelId: bigint, rating: bigint, comment: string): Promise<Result<bigint>>;
  getHotelReviews(hotelId: bigint): Promise<Review[]>;
  getAllReviews(): Promise<Review[]>;
  
  // Analytics
  getMyHotelStats(): Promise<Result<HotelStats>>;
  getPlatformStats(): Promise<PlatformStats>;
  
  // Admin functions
  getAllUsers(): Promise<[Principal, User][]>;
}
