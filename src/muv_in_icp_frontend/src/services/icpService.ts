import { HttpAgent, Actor } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { IDL } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
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
  HotelStats,
  PlatformStats
} from './types';

// Environment configuration
const CANISTER_ID = process.env.REACT_APP_CANISTER_ID_MUV_IN_ICP_BACKEND || 'rrkah-fqaaa-aaaaa-aaaaq-cai';
const HOST = process.env.NODE_ENV === 'production' ? 'https://ic0.app' : 'http://127.0.0.1:4943';

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

    this.agent = new HttpAgent({
      host: HOST,
      identity: this._identity,
    });

    // Fetch root key for local development
    if (process.env.NODE_ENV !== 'production') {
      await this.agent.fetchRootKey();
    }

    this.actor = Actor.createActor<MuvInBackend>(idlFactory, {
      agent: this.agent,
      canisterId: CANISTER_ID,
    });
  }

  // Create anonymous actor for read-only operations
  private async createAnonymousActor(): Promise<void> {
    this.agent = new HttpAgent({ host: HOST });

    if (process.env.NODE_ENV !== 'production') {
      await this.agent.fetchRootKey();
    }

    this.actor = Actor.createActor<MuvInBackend>(idlFactory, {
      agent: this.agent,
      canisterId: CANISTER_ID,
    });
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
    if (!this.actor) await this.init();
    try {
      const hotels = await this.actor!.getHotels();
      return hotels.map(hotel => this.transformHotel(hotel));
    } catch (error) {
      console.error('Failed to get hotels:', error);
      return [];
    }
  }

  async getHotel(id: number): Promise<UIHotel | null> {
    if (!this.actor) await this.init();
    try {
      const hotel = await this.actor!.getHotel(BigInt(id));
      return hotel ? this.transformHotel(hotel) : null;
    } catch (error) {
      console.error('Failed to get hotel:', error);
      return null;
    }
  }

  async createHotel(hotel: CreateHotelForm): Promise<number | null> {
    if (!this.actor || !this._isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const input: HotelInput = {
        name: hotel.name,
        location: hotel.location,
        description: hotel.description,
        totalRooms: BigInt(hotel.totalRooms),
        pricePerNight: this.icpToE8s(hotel.pricePerNight),
        amenities: hotel.amenities,
        images: hotel.images,
      };

      const result = await this.actor.addHotel(input);
      
      if ('ok' in result) {
        return Number(result.ok);
      } else {
        console.error('Failed to create hotel:', result.err);
        return null;
      }
    } catch (error) {
      console.error('Failed to create hotel:', error);
      return null;
    }
  }

  async searchHotels(location: string, minPrice: number, maxPrice: number): Promise<UIHotel[]> {
    if (!this.actor) await this.init();
    try {
      const hotels = await this.actor!.searchHotels(
        location,
        this.icpToE8s(minPrice),
        this.icpToE8s(maxPrice)
      );
      return hotels.map(hotel => this.transformHotel(hotel));
    } catch (error) {
      console.error('Failed to search hotels:', error);
      return [];
    }
  }

  // Booking operations
  async createBooking(booking: CreateBookingForm): Promise<number | null> {
    if (!this.actor || !this._isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const input: BookingInput = {
        hotelId: BigInt(booking.hotelId),
        checkIn: BigInt(booking.checkIn.getTime() * 1_000_000), // milliseconds to nanoseconds
        checkOut: BigInt(booking.checkOut.getTime() * 1_000_000),
        roomsBooked: BigInt(booking.roomsBooked),
      };

      const result = await this.actor.bookHotel(input);
      
      if ('ok' in result) {
        return Number(result.ok);
      } else {
        console.error('Failed to create booking:', result.err);
        return null;
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
      return null;
    }
  }

  async getMyBookings(): Promise<UIBooking[]> {
    if (!this.actor || !this._isAuthenticated) return [];
    
    try {
      const bookings = await this.actor.getMyBookings();
      return bookings.map(booking => this.transformBooking(booking));
    } catch (error) {
      console.error('Failed to get bookings:', error);
      return [];
    }
  }

  async cancelBooking(bookingId: number): Promise<boolean> {
    if (!this.actor || !this._isAuthenticated) return false;
    
    try {
      const result = await this.actor.cancelBooking(BigInt(bookingId));
      return 'ok' in result;
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      return false;
    }
  }

  // Review operations
  async createReview(review: CreateReviewForm): Promise<number | null> {
    if (!this.actor || !this._isAuthenticated) {
      throw new Error('Not authenticated');
    }

    try {
      const result = await this.actor.addReview(
        BigInt(review.hotelId),
        BigInt(review.rating),
        review.comment
      );
      
      if ('ok' in result) {
        return Number(result.ok);
      } else {
        console.error('Failed to create review:', result.err);
        return null;
      }
    } catch (error) {
      console.error('Failed to create review:', error);
      return null;
    }
  }

  async getHotelReviews(hotelId: number): Promise<UIReview[]> {
    if (!this.actor) await this.init();
    try {
      const reviews = await this.actor!.getHotelReviews(BigInt(hotelId));
      return reviews.map(review => this.transformReview(review));
    } catch (error) {
      console.error('Failed to get reviews:', error);
      return [];
    }
  }

  // User operations
  async getMyProfile(): Promise<UIUser | null> {
    if (!this.actor || !this._isAuthenticated) return null;
    
    try {
      const user = await this.actor.getMyProfile();
      return this.transformUser(user);
    } catch (error) {
      console.error('Failed to get profile:', error);
      return null;
    }
  }

  // Analytics
  async getPlatformStats(): Promise<{ totalHotels: number; totalBookings: number; totalUsers: number } | null> {
    if (!this.actor) await this.init();
    try {
      const stats = await this.actor!.getPlatformStats();
      return {
        totalHotels: Number(stats.totalHotels),
        totalBookings: Number(stats.totalBookings),
        totalUsers: Number(stats.totalUsers),
      };
    } catch (error) {
      console.error('Failed to get platform stats:', error);
      return null;
    }
  }
}

// Create singleton instance
export const icpService = new ICPService();

// Initialize on import
icpService.init().catch(console.error);
