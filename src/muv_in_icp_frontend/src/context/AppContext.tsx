import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { WalletConnection, User, Hotel, Booking } from '../types';

interface AppState {
  wallet: WalletConnection;
  user: User | null;
  hotels: Hotel[];
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
}

type AppAction = 
  | { type: 'SET_WALLET'; payload: WalletConnection }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_HOTELS'; payload: Hotel[] }
  | { type: 'ADD_HOTEL'; payload: Hotel }
  | { type: 'SET_BOOKINGS'; payload: Booking[] }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'UPDATE_BOOKING'; payload: { id: string; status: Booking['status'] } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'DISCONNECT_WALLET' };

const initialState: AppState = {
  wallet: {
    isConnected: false,
    walletType: null,
    principal: null,
    balance: 0,
  },
  user: null,
  hotels: [],
  bookings: [],
  isLoading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_WALLET':
      return { ...state, wallet: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
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
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'DISCONNECT_WALLET':
      return {
        ...state,
        wallet: initialState.wallet,
        user: null,
      };
    default:
      return state;
  }
}

interface AppContextType extends AppState {
  connectWallet: (walletType: 'internet-identity' | 'plug') => Promise<void>;
  disconnectWallet: () => void;
  addHotel: (hotel: Omit<Hotel, 'id'>) => Promise<void>;
  bookHotel: (hotelId: string, bookingData: any) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Mock wallet connection functions
  const connectWallet = async (walletType: 'internet-identity' | 'plug') => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockWallet: WalletConnection = {
        isConnected: true,
        walletType,
        principal: `${walletType}-principal-${Math.random().toString(36).substr(2, 9)}`,
        balance: Math.random() * 100,
      };
      
      dispatch({ type: 'SET_WALLET', payload: mockWallet });
      
      // Create mock user
      const mockUser: User = {
        id: mockWallet.principal!,
        walletAddress: mockWallet.principal!,
        isHotelOwner: Math.random() > 0.5,
        bookings: [],
        ownedHotels: [],
      };
      
      dispatch({ type: 'SET_USER', payload: mockUser });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to connect wallet' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const disconnectWallet = () => {
    dispatch({ type: 'DISCONNECT_WALLET' });
  };

  const addHotel = async (hotelData: Omit<Hotel, 'id'>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const newHotel: Hotel = {
        ...hotelData,
        id: `hotel-${Date.now()}`,
      };
      
      dispatch({ type: 'ADD_HOTEL', payload: newHotel });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add hotel' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const bookHotel = async (hotelId: string, bookingData: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const hotel = state.hotels.find(h => h.id === hotelId);
      if (!hotel) throw new Error('Hotel not found');
      
      const newBooking: Booking = {
        id: `booking-${Date.now()}`,
        hotelId,
        hotelName: hotel.name,
        userId: state.user!.id,
        checkIn: new Date(bookingData.checkIn),
        checkOut: new Date(bookingData.checkOut),
        nights: bookingData.nights,
        totalPrice: bookingData.totalPrice,
        status: 'pending',
        roomsBooked: bookingData.roomsCount,
        createdAt: new Date(),
      };
      
      dispatch({ type: 'ADD_BOOKING', payload: newBooking });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to book hotel' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const cancelBooking = async (bookingId: string) => {
    dispatch({ type: 'UPDATE_BOOKING', payload: { id: bookingId, status: 'cancelled' } });
  };

  const contextValue: AppContextType = {
    ...state,
    connectWallet,
    disconnectWallet,
    addHotel,
    bookHotel,
    cancelBooking,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
