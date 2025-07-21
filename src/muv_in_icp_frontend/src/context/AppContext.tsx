import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { icpService } from '../services/icpService';
import { useAuth } from '../hooks/useAuth';
import type { 
  UIHotel, 
  UIBooking, 
  UIReview, 
  UIUser,
  CreateHotelForm,
  CreateBookingForm,
  CreateReviewForm
} from '../services/types';

interface AppState {
  hotels: UIHotel[];
  bookings: UIBooking[];
  reviews: UIReview[];
  userProfile: UIUser | null;
  platformStats: { totalHotels: number; totalBookings: number; totalUsers: number } | null;
  isLoading: boolean;
  error: string | null;
}

type AppAction = 
  | { type: 'SET_HOTELS'; payload: UIHotel[] }
  | { type: 'ADD_HOTEL'; payload: UIHotel }
  | { type: 'SET_BOOKINGS'; payload: UIBooking[] }
  | { type: 'ADD_BOOKING'; payload: UIBooking }
  | { type: 'UPDATE_BOOKING'; payload: { id: number; status: UIBooking['status'] } }
  | { type: 'SET_REVIEWS'; payload: UIReview[] }
  | { type: 'ADD_REVIEW'; payload: UIReview }
  | { type: 'SET_USER_PROFILE'; payload: UIUser | null }
  | { type: 'SET_PLATFORM_STATS'; payload: { totalHotels: number; totalBookings: number; totalUsers: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

const initialState: AppState = {
  hotels: [],
  bookings: [],
  reviews: [],
  userProfile: null,
  platformStats: null,
  isLoading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_HOTELS':
      return { ...state, hotels: action.payload };
    case 'ADD_HOTEL':
      return { ...state, hotels: [...state.hotels, action.payload] };
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.payload };
    case 'ADD_BOOKING':
      return { ...state, bookings: [...state.bookings, action.payload] };
    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(booking =>
          booking.id === action.payload.id
            ? { ...booking, status: action.payload.status }
            : booking
        ),
      };
    case 'SET_REVIEWS':
      return { ...state, reviews: action.payload };
    case 'ADD_REVIEW':
      return { ...state, reviews: [...state.reviews, action.payload] };
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: action.payload };
    case 'SET_PLATFORM_STATS':
      return { ...state, platformStats: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

interface AppContextType extends AppState {
  // Authentication
  isAuthenticated: boolean;
  principal: string;
  authLoading: boolean;
  authError: string | null;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  
  // Hotels
  loadHotels: () => Promise<void>;
  getHotel: (id: number) => Promise<UIHotel | null>;
  createHotel: (hotel: CreateHotelForm) => Promise<number | null>;
  searchHotels: (location: string, minPrice: number, maxPrice: number) => Promise<UIHotel[]>;
  
  // Bookings
  loadMyBookings: () => Promise<void>;
  createBooking: (booking: CreateBookingForm) => Promise<number | null>;
  cancelBooking: (bookingId: number) => Promise<boolean>;
  
  // Reviews
  loadHotelReviews: (hotelId: number) => Promise<UIReview[]>;
  createReview: (review: CreateReviewForm) => Promise<number | null>;
  
  // User
  loadUserProfile: () => Promise<void>;
  
  // Analytics
  loadPlatformStats: () => Promise<void>;
  
  // Utilities
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const auth = useAuth();

  // Load initial data when authentication state changes
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });
        
        // Always load hotels (public data)
        await loadHotels();
        
        // Load user-specific data if authenticated
        if (auth.isAuthenticated && !auth.isLoading) {
          await Promise.all([
            loadUserProfile(),
            loadMyBookings(),
            loadPlatformStats()
          ]);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load application data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    // Only load data when auth state is stable (not loading)
    if (!auth.isLoading) {
      loadInitialData();
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  // Hotel operations
  const loadHotels = async (): Promise<void> => {
    try {
      const hotels = await icpService.getHotels();
      dispatch({ type: 'SET_HOTELS', payload: hotels });
    } catch (error) {
      console.error('Failed to load hotels:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load hotels' });
    }
  };

  const getHotel = async (id: number): Promise<UIHotel | null> => {
    try {
      return await icpService.getHotel(id);
    } catch (error) {
      console.error('Failed to get hotel:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to get hotel details' });
      return null;
    }
  };

  const createHotel = async (hotel: CreateHotelForm): Promise<number | null> => {
    if (!auth.isAuthenticated) {
      dispatch({ type: 'SET_ERROR', payload: 'Please login to create a hotel' });
      return null;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const hotelId = await icpService.createHotel(hotel);
      
      if (hotelId !== null) {
        // Reload hotels to get the new one
        await loadHotels();
        dispatch({ type: 'CLEAR_ERROR' });
      }
      
      return hotelId;
    } catch (error) {
      console.error('Failed to create hotel:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create hotel' });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const searchHotels = async (location: string, minPrice: number, maxPrice: number): Promise<UIHotel[]> => {
    try {
      return await icpService.searchHotels(location, minPrice, maxPrice);
    } catch (error) {
      console.error('Failed to search hotels:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to search hotels' });
      return [];
    }
  };

  // Booking operations
  const loadMyBookings = async (): Promise<void> => {
    if (!auth.isAuthenticated) return;

    try {
      const bookings = await icpService.getMyBookings();
      dispatch({ type: 'SET_BOOKINGS', payload: bookings });
    } catch (error) {
      console.error('Failed to load bookings:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load bookings' });
    }
  };

  const createBooking = async (booking: CreateBookingForm): Promise<number | null> => {
    if (!auth.isAuthenticated) {
      dispatch({ type: 'SET_ERROR', payload: 'Please login to make a booking' });
      return null;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const bookingId = await icpService.createBooking(booking);
      
      if (bookingId !== null) {
        // Reload bookings to get the new one
        await loadMyBookings();
        dispatch({ type: 'CLEAR_ERROR' });
      }
      
      return bookingId;
    } catch (error) {
      console.error('Failed to create booking:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create booking' });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const cancelBooking = async (bookingId: number): Promise<boolean> => {
    if (!auth.isAuthenticated) {
      dispatch({ type: 'SET_ERROR', payload: 'Please login to cancel booking' });
      return false;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const success = await icpService.cancelBooking(bookingId);
      
      if (success) {
        // Update the booking status locally
        dispatch({ type: 'UPDATE_BOOKING', payload: { id: bookingId, status: 'cancelled' } });
        dispatch({ type: 'CLEAR_ERROR' });
      }
      
      return success;
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to cancel booking' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Review operations
  const loadHotelReviews = async (hotelId: number): Promise<UIReview[]> => {
    try {
      const reviews = await icpService.getHotelReviews(hotelId);
      return reviews;
    } catch (error) {
      console.error('Failed to load reviews:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load reviews' });
      return [];
    }
  };

  const createReview = async (review: CreateReviewForm): Promise<number | null> => {
    if (!auth.isAuthenticated) {
      dispatch({ type: 'SET_ERROR', payload: 'Please login to write a review' });
      return null;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const reviewId = await icpService.createReview(review);
      
      if (reviewId !== null) {
        // Reload hotels to update ratings
        await loadHotels();
        dispatch({ type: 'CLEAR_ERROR' });
      }
      
      return reviewId;
    } catch (error) {
      console.error('Failed to create review:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create review' });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // User operations
  const loadUserProfile = async (): Promise<void> => {
    if (!auth.isAuthenticated) return;

    try {
      const profile = await icpService.getMyProfile();
      dispatch({ type: 'SET_USER_PROFILE', payload: profile });
    } catch (error) {
      console.error('Failed to load user profile:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load user profile' });
    }
  };

  // Analytics
  const loadPlatformStats = async (): Promise<void> => {
    try {
      const stats = await icpService.getPlatformStats();
      if (stats) {
        dispatch({ type: 'SET_PLATFORM_STATS', payload: stats });
      }
    } catch (error) {
      console.error('Failed to load platform stats:', error);
      // Don't show error for stats as it's not critical
    }
  };

  // Utility functions
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Load hotels and platform stats (available without auth)
        await Promise.all([
          loadHotels(),
          loadPlatformStats(),
        ]);
        
        // Load user-specific data if authenticated
        if (auth.isAuthenticated) {
          await Promise.all([
            loadMyBookings(),
            loadUserProfile(),
          ]);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load application data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    if (!auth.isLoading) {
      loadInitialData();
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  const contextValue: AppContextType = {
    // State
    ...state,
    
    // Auth
    isAuthenticated: auth.isAuthenticated,
    principal: auth.principal,
    authLoading: auth.isLoading,
    authError: auth.error,
    login: auth.login,
    logout: auth.logout,
    
    // Hotels
    loadHotels,
    getHotel,
    createHotel,
    searchHotels,
    
    // Bookings
    loadMyBookings,
    createBooking,
    cancelBooking,
    
    // Reviews
    loadHotelReviews,
    createReview,
    
    // User
    loadUserProfile,
    
    // Analytics
    loadPlatformStats,
    
    // Utilities
    clearError,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
