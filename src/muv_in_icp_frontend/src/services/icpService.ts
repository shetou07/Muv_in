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

  // Dummy data for development
  private getDummyHotels(): UIHotel[] {
    return [
      {
        id: 1,
        name: "Grand Luxury Resort",
        location: "Miami Beach, Florida",
        description: "A stunning beachfront resort with world-class amenities and breathtaking ocean views. Perfect for luxury travelers seeking the ultimate relaxation experience.",
        totalRooms: 150,
        availableRooms: 45,
        pricePerNight: 299.99,
        amenities: ["Pool", "Spa", "Restaurant", "Beach Access", "Fitness Center", "Concierge"],
        images: [
          "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
        ],
        owner: "owner1",
        rating: 4.8,
        reviewCount: 128,
        createdAt: new Date('2024-01-15')
      },
      {
        id: 2,
        name: "Urban Boutique Hotel",
        location: "New York City, New York",
        description: "Modern boutique hotel in the heart of Manhattan. Perfect for business travelers and urban explorers with contemporary design and premium location.",
        totalRooms: 80,
        availableRooms: 12,
        pricePerNight: 189.99,
        amenities: ["WiFi", "Business Center", "Restaurant", "Fitness Center", "Rooftop Bar"],
        images: [
          "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"
        ],
        owner: "owner2",
        rating: 4.5,
        reviewCount: 89,
        createdAt: new Date('2024-02-20')
      },
      {
        id: 3,
        name: "Mountain View Lodge",
        location: "Aspen, Colorado",
        description: "Cozy mountain lodge with spectacular views and rustic charm. Ideal for ski enthusiasts and nature lovers seeking adventure and tranquility.",
        totalRooms: 60,
        availableRooms: 28,
        pricePerNight: 159.99,
        amenities: ["Ski Storage", "Fireplace", "Restaurant", "Hot Tub", "Mountain Views"],
        images: [
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"
        ],
        owner: "owner3",
        rating: 4.7,
        reviewCount: 64,
        createdAt: new Date('2024-03-10')
      },
      {
        id: 4,
        name: "Coastal Paradise Resort",
        location: "Malibu, California",
        description: "Exclusive coastal resort offering luxury accommodations with private beach access and stunning Pacific Ocean views.",
        totalRooms: 120,
        availableRooms: 35,
        pricePerNight: 399.99,
        amenities: ["Private Beach", "Spa", "Pool", "Tennis Court", "Fine Dining", "Valet Service"],
        images: [
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
          "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800"
        ],
        owner: "owner4",
        rating: 4.9,
        reviewCount: 156,
        createdAt: new Date('2024-01-05')
      },
      {
        id: 5,
        name: "Historic Downtown Inn",
        location: "Charleston, South Carolina",
        description: "Charming historic inn in the heart of Charleston's historic district. Experience Southern hospitality with modern comforts.",
        totalRooms: 40,
        availableRooms: 8,
        pricePerNight: 149.99,
        amenities: ["Historic Architecture", "Courtyard", "Restaurant", "WiFi", "Concierge"],
        images: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
          "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800"
        ],
        owner: "owner5",
        rating: 4.6,
        reviewCount: 92,
        createdAt: new Date('2024-04-12')
      }
    ];
  }

  private getDummyBookings(): UIBooking[] {
    return [
      {
        id: 1,
        hotelId: 1,
        hotelName: "Grand Luxury Resort",
        bookedBy: "user123",
        checkIn: new Date('2024-08-15'),
        checkOut: new Date('2024-08-20'),
        nights: 5,
        roomsBooked: 1,
        totalPrice: 1499.95,
        status: 'active',
        createdAt: new Date('2024-07-10')
      },
      {
        id: 2,
        hotelId: 3,
        hotelName: "Mountain View Lodge",
        bookedBy: "user123",
        checkIn: new Date('2024-09-01'),
        checkOut: new Date('2024-09-05'),
        nights: 4,
        roomsBooked: 1,
        totalPrice: 639.96,
        status: 'pending',
        createdAt: new Date('2024-07-15')
      },
      {
        id: 3,
        hotelId: 2,
        hotelName: "Urban Boutique Hotel",
        bookedBy: "user123",
        checkIn: new Date('2024-06-20'),
        checkOut: new Date('2024-06-25'),
        nights: 5,
        roomsBooked: 1,
        totalPrice: 949.95,
        status: 'completed',
        createdAt: new Date('2024-06-01')
      }
    ];
  }

  private getDummyReviews(hotelId: number): UIReview[] {
    const allReviews = [
      {
        id: 1,
        hotelId: 1,
        reviewedBy: "user456",
        rating: 5,
        comment: "Absolutely amazing experience! The staff was incredibly friendly and the ocean view was breathtaking. Will definitely come back!",
        createdAt: new Date('2024-07-01')
      },
      {
        id: 2,
        hotelId: 1,
        reviewedBy: "user789",
        rating: 4,
        comment: "Great location and beautiful facilities. The pool area was fantastic. Only minor issue was the WiFi speed in some areas.",
        createdAt: new Date('2024-06-28')
      },
      {
        id: 3,
        hotelId: 2,
        reviewedBy: "user321",
        rating: 5,
        comment: "Perfect for business trip! Central location, excellent service, and the rooftop bar has amazing city views.",
        createdAt: new Date('2024-07-05')
      },
      {
        id: 4,
        hotelId: 3,
        reviewedBy: "user654",
        rating: 4,
        comment: "Loved the mountain views and cozy atmosphere. Great for a weekend getaway. The hot tub was a nice touch after skiing.",
        createdAt: new Date('2024-06-30')
      },
      {
        id: 5,
        hotelId: 4,
        reviewedBy: "user987",
        rating: 5,
        comment: "Luxury at its finest! Private beach access was incredible and the spa treatments were world-class. Worth every penny!",
        createdAt: new Date('2024-07-03')
      }
    ];
    
    return allReviews.filter(review => review.hotelId === hotelId);
  }

  // Hotel operations
  async getHotels(): Promise<UIHotel[]> {
    // Return dummy data for now
    console.log('Returning dummy hotel data');
    return new Promise(resolve => {
      setTimeout(() => resolve(this.getDummyHotels()), 500); // Simulate network delay
    });
  }

  async getHotel(id: number): Promise<UIHotel | null> {
    // Return dummy data for now
    console.log('Returning dummy hotel data for ID:', id);
    return new Promise(resolve => {
      setTimeout(() => {
        const hotels = this.getDummyHotels();
        const hotel = hotels.find(h => h.id === id) || null;
        resolve(hotel);
      }, 300);
    });
  }

  async createHotel(hotel: CreateHotelForm): Promise<number | null> {
    if (!this._isAuthenticated) {
      throw new Error('Not authenticated');
    }

    // Simulate creating hotel with dummy data
    console.log('Creating hotel (dummy):', hotel);
    return new Promise(resolve => {
      setTimeout(() => {
        const newId = Math.floor(Math.random() * 1000) + 100;
        resolve(newId);
      }, 800);
    });
  }

  async searchHotels(location: string, minPrice: number, maxPrice: number): Promise<UIHotel[]> {
    // Return filtered dummy data
    console.log('Searching hotels (dummy):', { location, minPrice, maxPrice });
    return new Promise(resolve => {
      setTimeout(() => {
        const hotels = this.getDummyHotels();
        let filtered = hotels;
        
        if (location) {
          filtered = filtered.filter(hotel => 
            hotel.location.toLowerCase().includes(location.toLowerCase()) ||
            hotel.name.toLowerCase().includes(location.toLowerCase())
          );
        }
        
        if (minPrice > 0) {
          filtered = filtered.filter(hotel => hotel.pricePerNight >= minPrice);
        }
        
        if (maxPrice > 0) {
          filtered = filtered.filter(hotel => hotel.pricePerNight <= maxPrice);
        }
        
        resolve(filtered);
      }, 400);
    });
  }

  // Booking operations
  async createBooking(booking: CreateBookingForm): Promise<number | null> {
    if (!this._isAuthenticated) {
      throw new Error('Not authenticated');
    }

    // Simulate creating booking with dummy data
    console.log('Creating booking (dummy):', booking);
    return new Promise(resolve => {
      setTimeout(() => {
        const newId = Math.floor(Math.random() * 1000) + 200;
        resolve(newId);
      }, 600);
    });
  }

  async getMyBookings(): Promise<UIBooking[]> {
    if (!this._isAuthenticated) return [];
    
    // Return dummy bookings data
    console.log('Returning dummy bookings data');
    return new Promise(resolve => {
      setTimeout(() => resolve(this.getDummyBookings()), 400);
    });
  }

  async cancelBooking(bookingId: number): Promise<boolean> {
    if (!this._isAuthenticated) return false;
    
    // Simulate cancelling booking
    console.log('Cancelling booking (dummy):', bookingId);
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 500);
    });
  }

  // Review operations
  async createReview(review: CreateReviewForm): Promise<number | null> {
    if (!this._isAuthenticated) {
      throw new Error('Not authenticated');
    }

    // Simulate creating review
    console.log('Creating review (dummy):', review);
    return new Promise(resolve => {
      setTimeout(() => {
        const newId = Math.floor(Math.random() * 1000) + 300;
        resolve(newId);
      }, 500);
    });
  }

  async getHotelReviews(hotelId: number): Promise<UIReview[]> {
    // Return dummy reviews for the specific hotel
    console.log('Returning dummy reviews for hotel:', hotelId);
    return new Promise(resolve => {
      setTimeout(() => resolve(this.getDummyReviews(hotelId)), 300);
    });
  }

  // User operations
  async getMyProfile(): Promise<UIUser | null> {
    if (!this._isAuthenticated) return null;
    
    // Return dummy user profile
    console.log('Returning dummy user profile');
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          principal: this.principal || 'dummy-principal-123',
          isHotelOwner: false,
          totalBookings: 3,
          joinedAt: new Date('2024-01-10')
        });
      }, 300);
    });
  }

  // Analytics
  async getPlatformStats(): Promise<{ totalHotels: number; totalBookings: number; totalUsers: number } | null> {
    // Return dummy platform stats
    console.log('Returning dummy platform stats');
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          totalHotels: 5,
          totalBookings: 47,
          totalUsers: 156
        });
      }, 400);
    });
  }
}

// Create singleton instance
export const icpService = new ICPService();

// Initialize on import
icpService.init().catch(console.error);
