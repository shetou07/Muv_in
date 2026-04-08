import { HttpAgent, Actor } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { IDL } from '@dfinity/candid';
import type { MuvInBackend } from './actor';
import type {
  Hotel,
  HotelInput,
  Booking,
  BookingInput,
  User,
  Review,
  UIHotel,
  UIBooking,
  UIReview,
  UIUser,
  CreateHotelForm,
  CreateBookingForm,
  CreateReviewForm,
  Result,
  ErrorType,
  PlatformStats
} from './types';

// Environment configuration
const CANISTER_ID = process.env.REACT_APP_CANISTER_ID_MUV_IN_ICP_BACKEND || 'uxrrr-q7777-77774-qaaaq-cai';

// Smart host detection for different environments
const getHost = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://ic0.app';
  }
  
  // In development, check if we're running through React dev server
  if (typeof window !== 'undefined' && window.location.port === '3000') {
    // Use current origin to leverage the proxy setup
    return window.location.origin;
  }
  
  // If REACT_APP_HOST is set, use it
  if (process.env.REACT_APP_HOST) {
    return process.env.REACT_APP_HOST;
  }
  
  // Default local development
  return 'http://127.0.0.1:4943';
};

const HOST = getHost();

console.log('ICP Service Configuration:', {
  CANISTER_ID,
  HOST,
  NODE_ENV: process.env.NODE_ENV,
  location: typeof window !== 'undefined' ? window.location.href : 'server'
});

// IDL (Interface Definition Language) for the backend canister
const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const BookingStatus = IDL.Variant({
    'active': IDL.Null,
    'completed': IDL.Null,
    'cancelled': IDL.Null,
    'pending': IDL.Null,
  });

  const ErrorType = IDL.Variant({
    'NotFound': IDL.Null,
    'Unauthorized': IDL.Null,
    'InvalidInput': IDL.Null,
    'InsufficientRooms': IDL.Null,
    'BookingConflict': IDL.Null,
  });

  const Result = (T: any) => IDL.Variant({ 'ok': T, 'err': ErrorType });

  const Hotel = IDL.Record({
    'id': IDL.Nat,
    'name': IDL.Text,
    'location': IDL.Text,
    'description': IDL.Text,
    'totalRooms': IDL.Nat,
    'availableRooms': IDL.Nat,
    'pricePerNight': IDL.Nat,
    'amenities': IDL.Vec(IDL.Text),
    'images': IDL.Vec(IDL.Text),
    'owner': IDL.Principal,
    'rating': IDL.Float64,
    'reviewCount': IDL.Nat,
    'createdAt': IDL.Int,
  });

  const HotelInput = IDL.Record({
    'name': IDL.Text,
    'location': IDL.Text,
    'description': IDL.Text,
    'totalRooms': IDL.Nat,
    'pricePerNight': IDL.Nat,
    'amenities': IDL.Vec(IDL.Text),
    'images': IDL.Vec(IDL.Text),
  });

  const Booking = IDL.Record({
    'id': IDL.Nat,
    'hotelId': IDL.Nat,
    'hotelName': IDL.Text,
    'bookedBy': IDL.Principal,
    'checkIn': IDL.Int,
    'checkOut': IDL.Int,
    'nights': IDL.Nat,
    'roomsBooked': IDL.Nat,
    'totalPrice': IDL.Nat,
    'status': BookingStatus,
    'createdAt': IDL.Int,
  });

  const BookingInput = IDL.Record({
    'hotelId': IDL.Nat,
    'checkIn': IDL.Int,
    'checkOut': IDL.Int,
    'roomsBooked': IDL.Nat,
  });

  const User = IDL.Record({
    'principal': IDL.Principal,
    'isHotelOwner': IDL.Bool,
    'totalBookings': IDL.Nat,
    'joinedAt': IDL.Int,
  });

  const Review = IDL.Record({
    'id': IDL.Nat,
    'hotelId': IDL.Nat,
    'reviewedBy': IDL.Principal,
    'rating': IDL.Nat,
    'comment': IDL.Text,
    'createdAt': IDL.Int,
  });

  const HotelStats = IDL.Record({
    'totalBookings': IDL.Nat,
    'totalRevenue': IDL.Nat,
    'avgRating': IDL.Float64,
  });

  const PlatformStats = IDL.Record({
    'totalHotels': IDL.Nat,
    'totalBookings': IDL.Nat,
    'totalUsers': IDL.Nat,
  });

  return IDL.Service({
    // User management
    'getMyProfile': IDL.Func([], [User], ['query']),
    'updateProfile': IDL.Func([IDL.Bool], [Result(IDL.Text)], []),
    'isHotelOwner': IDL.Func([IDL.Principal], [IDL.Bool], ['query']),

    // Hotel management
    'addHotel': IDL.Func([HotelInput], [Result(IDL.Nat)], []),
    'updateHotel': IDL.Func([IDL.Nat, HotelInput], [Result(IDL.Text)], []),
    'deleteHotel': IDL.Func([IDL.Nat], [Result(IDL.Text)], []),
    'getHotels': IDL.Func([], [IDL.Vec(Hotel)], ['query']),
    'getHotel': IDL.Func([IDL.Nat], [IDL.Opt(Hotel)], ['query']),
    'getMyHotels': IDL.Func([], [IDL.Vec(Hotel)], []),
    'searchHotels': IDL.Func([IDL.Text, IDL.Nat, IDL.Nat], [IDL.Vec(Hotel)], ['query']),

    // Booking management
    'bookHotel': IDL.Func([BookingInput], [Result(IDL.Nat)], []),
    'confirmBooking': IDL.Func([IDL.Nat], [Result(IDL.Text)], []),
    'cancelBooking': IDL.Func([IDL.Nat], [Result(IDL.Text)], []),
    'completeBooking': IDL.Func([IDL.Nat], [Result(IDL.Text)], []),
    'getMyBookings': IDL.Func([], [IDL.Vec(Booking)], []),
    'getHotelBookings': IDL.Func([IDL.Nat], [Result(IDL.Vec(Booking))], []),
    'getBooking': IDL.Func([IDL.Nat], [IDL.Opt(Booking)], ['query']),
    'getAllBookings': IDL.Func([], [IDL.Vec(Booking)], ['query']),
    'checkRoomAvailability': IDL.Func([IDL.Nat, IDL.Int, IDL.Int, IDL.Nat], [IDL.Bool], ['query']),

    // Review system
    'addReview': IDL.Func([IDL.Nat, IDL.Nat, IDL.Text], [Result(IDL.Nat)], []),
    'getHotelReviews': IDL.Func([IDL.Nat], [IDL.Vec(Review)], ['query']),
    'getAllReviews': IDL.Func([], [IDL.Vec(Review)], ['query']),

    // Analytics
    'getMyHotelStats': IDL.Func([], [Result(HotelStats)], []),
    'getPlatformStats': IDL.Func([], [PlatformStats], ['query']),

    // Admin functions
    'getAllUsers': IDL.Func([], [IDL.Vec(IDL.Tuple(IDL.Principal, User))], ['query']),
  });
};

class ICPService {
  private authClient: AuthClient | null = null;
  private actor: MuvInBackend | null = null;
  private agent: HttpAgent | null = null;
  private _isAuthenticated = false;
  private _identity: any = null;

  // Initialize the service
  async init(): Promise<void> {
    try {
      this.authClient = await AuthClient.create();
      this._isAuthenticated = await this.authClient.isAuthenticated();
      
      if (this._isAuthenticated) {
        this._identity = this.authClient.getIdentity();
        await this.createActor();
      } else {
        await this.createAnonymousActor();
      }
    } catch (error) {
      console.error('Failed to initialize ICP service:', error);
      await this.createAnonymousActor();
    }
  }

  // Create authenticated actor
  private async createActor(): Promise<void> {
    if (!this._identity) return;

    console.log('Creating authenticated actor with HOST:', HOST);
    
    try {
      this.agent = new HttpAgent({
        host: HOST,
        identity: this._identity,
      });

      // Fetch root key for local development
      if (process.env.NODE_ENV !== 'production') {
        try {
          await this.agent.fetchRootKey();
          console.log('Root key fetched successfully');
        } catch (error) {
          console.error('Failed to fetch root key:', error);
          
          // Try alternative hosts if current one fails
          const alternativeHosts = [
            'http://127.0.0.1:4943',
            'http://localhost:4943',
            `${window.location.origin}/api`
          ];

          let connected = false;
          for (const altHost of alternativeHosts) {
            if (altHost === HOST) continue; // Skip the one we already tried
            
            try {
              console.log(`Trying alternative host: ${altHost}`);
              const altAgent = new HttpAgent({
                host: altHost,
                identity: this._identity,
              });
              
              await altAgent.fetchRootKey();
              console.log(`Successfully connected to ${altHost}`);
              this.agent = altAgent;
              connected = true;
              break;
            } catch (altError) {
              console.log(`Failed to connect to ${altHost}:`, altError instanceof Error ? altError.message : String(altError));
            }
          }

          if (!connected) {
            console.error('All connection attempts failed. Using fallback mode.');
            // Continue without root key for offline development
            console.warn('Running in fallback mode - some features may not work');
          }
        }
      }

      this.actor = Actor.createActor<MuvInBackend>(idlFactory, {
        agent: this.agent,
        canisterId: CANISTER_ID,
      });
      
      console.log('Authenticated actor created successfully');
    } catch (error) {
      console.error('Failed to create authenticated actor:', error);
      throw error;
    }
  }

  // Create anonymous actor for read-only operations
  private async createAnonymousActor(): Promise<void> {
    console.log('Creating anonymous actor with HOST:', HOST, 'CANISTER_ID:', CANISTER_ID);
    
    try {
      this.agent = new HttpAgent({ host: HOST });

      if (process.env.NODE_ENV !== 'production') {
        try {
          await this.agent.fetchRootKey();
          console.log('Root key fetched successfully for anonymous actor');
        } catch (error) {
          console.error('Failed to fetch root key for anonymous actor:', error);
          
          // Try alternative hosts if current one fails
          const alternativeHosts = [
            'http://127.0.0.1:4943',
            'http://localhost:4943',
            `${window.location.origin}/api`
          ];

          let connected = false;
          for (const altHost of alternativeHosts) {
            if (altHost === HOST) continue; // Skip the one we already tried
            
            try {
              console.log(`Trying alternative host for anonymous actor: ${altHost}`);
              const altAgent = new HttpAgent({ host: altHost });
              
              await altAgent.fetchRootKey();
              console.log(`Successfully connected anonymous actor to ${altHost}`);
              this.agent = altAgent;
              connected = true;
              break;
            } catch (altError) {
              console.log(`Failed to connect anonymous actor to ${altHost}:`, altError instanceof Error ? altError.message : String(altError));
            }
          }

          if (!connected) {
            console.error('All connection attempts failed for anonymous actor. Using fallback mode.');
            // Continue without root key for offline development
            console.warn('Anonymous actor running in fallback mode - some features may not work');
          }
        }
      }

      this.actor = Actor.createActor<MuvInBackend>(idlFactory, {
        agent: this.agent,
        canisterId: CANISTER_ID,
      });
      
      console.log('Anonymous actor created successfully');
    } catch (error) {
      console.error('Failed to create anonymous actor:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(): Promise<boolean> {
    if (!this.authClient) await this.init();
    
    return new Promise((resolve) => {
      this.authClient?.login({
        identityProvider: 'https://identity.ic0.app',
        onSuccess: async () => {
          this._isAuthenticated = true;
          this._identity = this.authClient?.getIdentity();
          await this.createActor();
          resolve(true);
        },
        onError: (error) => {
          console.error('Login failed:', error);
          resolve(false);
        },
      });
    });
  }

  async logout(): Promise<void> {
    if (this.authClient) {
      await this.authClient.logout();
      this._isAuthenticated = false;
      this._identity = null;
      await this.createAnonymousActor();
    }
  }

  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  get principal(): string {
    return this._identity?.getPrincipal()?.toString() || '';
  }

  private async ensureActor(requireAuth = false): Promise<MuvInBackend> {
    if (!this.actor) {
      await this.init();
    }

    if (requireAuth && !this._isAuthenticated) {
      throw new Error('Not authenticated');
    }

    if (!this.actor) {
      throw new Error('ICP actor is not initialized');
    }

    return this.actor;
  }

  private getErrorMessage(errorType: ErrorType): string {
    if ('NotFound' in errorType) return 'Resource not found';
    if ('Unauthorized' in errorType) return 'Unauthorized';
    if ('InvalidInput' in errorType) return 'Invalid input';
    if ('InsufficientRooms' in errorType) return 'Not enough rooms available';
    if ('BookingConflict' in errorType) return 'Booking conflict detected';
    return 'Unexpected backend error';
  }

  private unwrapResult<T>(result: Result<T>): T {
    if ('ok' in result) {
      return result.ok;
    }

    throw new Error(this.getErrorMessage(result.err));
  }

  private dateToNanoseconds(date: Date): bigint {
    return BigInt(date.getTime()) * BigInt(1_000_000);
  }

  private transformPlatformStats(stats: PlatformStats): {
    totalHotels: number;
    totalBookings: number;
    totalUsers: number;
  } {
    return {
      totalHotels: Number(stats.totalHotels),
      totalBookings: Number(stats.totalBookings),
      totalUsers: Number(stats.totalUsers),
    };
  }

  // Data transformation utilities
  private e8sToICP(e8s: bigint): number {
    return Number(e8s) / 100_000_000;
  }

  private icpToE8s(icp: number): bigint {
    return BigInt(Math.round(icp * 100_000_000));
  }

  private transformHotel(hotel: Hotel): UIHotel {
    return {
      id: Number(hotel.id),
      name: hotel.name,
      location: hotel.location,
      description: hotel.description,
      totalRooms: Number(hotel.totalRooms),
      availableRooms: Number(hotel.availableRooms),
      pricePerNight: this.e8sToICP(hotel.pricePerNight),
      amenities: hotel.amenities,
      images: hotel.images,
      owner: hotel.owner.toString(),
      rating: hotel.rating,
      reviewCount: Number(hotel.reviewCount),
      createdAt: new Date(Number(hotel.createdAt) / 1_000_000), // nanoseconds to milliseconds
    };
  }

  private transformBooking(booking: Booking): UIBooking {
    let status: 'active' | 'completed' | 'cancelled' | 'pending';
    if ('active' in booking.status) status = 'active';
    else if ('completed' in booking.status) status = 'completed';
    else if ('cancelled' in booking.status) status = 'cancelled';
    else status = 'pending';

    return {
      id: Number(booking.id),
      hotelId: Number(booking.hotelId),
      hotelName: booking.hotelName,
      bookedBy: booking.bookedBy.toString(),
      checkIn: new Date(Number(booking.checkIn) / 1_000_000),
      checkOut: new Date(Number(booking.checkOut) / 1_000_000),
      nights: Number(booking.nights),
      roomsBooked: Number(booking.roomsBooked),
      totalPrice: this.e8sToICP(booking.totalPrice),
      status,
      createdAt: new Date(Number(booking.createdAt) / 1_000_000),
    };
  }

  private transformReview(review: Review): UIReview {
    return {
      id: Number(review.id),
      hotelId: Number(review.hotelId),
      reviewedBy: review.reviewedBy.toString(),
      rating: Number(review.rating),
      comment: review.comment,
      createdAt: new Date(Number(review.createdAt) / 1_000_000),
    };
  }

  private transformUser(user: User): UIUser {
    return {
      principal: user.principal.toString(),
      isHotelOwner: user.isHotelOwner,
      totalBookings: Number(user.totalBookings),
      joinedAt: new Date(Number(user.joinedAt) / 1_000_000),
    };
  }

  // Hotel operations
  async getHotels(): Promise<UIHotel[]> {
    const actor = await this.ensureActor();
    const hotels = await actor.getHotels();
    return hotels.map(hotel => this.transformHotel(hotel));
  }

  async getHotel(id: number): Promise<UIHotel | null> {
    const actor = await this.ensureActor();
    const result = await actor.getHotel(BigInt(id));
    const hotel = Array.isArray(result) ? result[0] : result;
    return hotel ? this.transformHotel(hotel) : null;
  }

  async createHotel(hotel: CreateHotelForm): Promise<number | null> {
    const actor = await this.ensureActor(true);
    const payload: HotelInput = {
      name: hotel.name,
      location: hotel.location,
      description: hotel.description,
      totalRooms: BigInt(hotel.totalRooms),
      pricePerNight: this.icpToE8s(hotel.pricePerNight),
      amenities: hotel.amenities,
      images: hotel.images,
    };

    const hotelId = this.unwrapResult(await actor.addHotel(payload));
    return Number(hotelId);
  }

  async searchHotels(location: string, minPrice: number, maxPrice: number): Promise<UIHotel[]> {
    const actor = await this.ensureActor();
    const hotels = await actor.searchHotels(
      location,
      this.icpToE8s(minPrice),
      this.icpToE8s(maxPrice)
    );

    return hotels.map(hotel => this.transformHotel(hotel));
  }

  // Booking operations
  async createBooking(booking: CreateBookingForm): Promise<number | null> {
    const actor = await this.ensureActor(true);
    const payload: BookingInput = {
      hotelId: BigInt(booking.hotelId),
      checkIn: this.dateToNanoseconds(booking.checkIn),
      checkOut: this.dateToNanoseconds(booking.checkOut),
      roomsBooked: BigInt(booking.roomsBooked),
    };

    const bookingId = this.unwrapResult(await actor.bookHotel(payload));
    return Number(bookingId);
  }

  async getMyBookings(): Promise<UIBooking[]> {
    if (!this._isAuthenticated) return [];

    const actor = await this.ensureActor(true);
    const bookings = await actor.getMyBookings();
    return bookings.map(booking => this.transformBooking(booking));
  }

  async cancelBooking(bookingId: number): Promise<boolean> {
    const actor = await this.ensureActor(true);
    this.unwrapResult(await actor.cancelBooking(BigInt(bookingId)));
    return true;
  }

  // Review operations
  async createReview(review: CreateReviewForm): Promise<number | null> {
    const actor = await this.ensureActor(true);
    const reviewId = this.unwrapResult(
      await actor.addReview(BigInt(review.hotelId), BigInt(review.rating), review.comment)
    );
    return Number(reviewId);
  }

  async getHotelReviews(hotelId: number): Promise<UIReview[]> {
    const actor = await this.ensureActor();
    const reviews = await actor.getHotelReviews(BigInt(hotelId));
    return reviews.map(review => this.transformReview(review));
  }

  // User operations
  async getMyProfile(): Promise<UIUser | null> {
    if (!this._isAuthenticated) return null;

    const actor = await this.ensureActor(true);
    const profile = await actor.getMyProfile();
    return this.transformUser(profile);
  }

  // Analytics
  async getPlatformStats(): Promise<{ totalHotels: number; totalBookings: number; totalUsers: number } | null> {
    const actor = await this.ensureActor();
    const stats = await actor.getPlatformStats();
    return this.transformPlatformStats(stats);
  }
}

// Create singleton instance
export const icpService = new ICPService();

// Initialize on import
icpService.init().catch(console.error);
