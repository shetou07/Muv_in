# Muv In Backend - Enhanced Motoko Contract

## 🚀 Overview

The enhanced Motoko backend provides a complete Web3 hotel booking system with advanced features including user management, sophisticated booking system, review system, and analytics.

## 📊 Key Enhancements

### 1. **Enhanced Data Models**
- **Hotel**: Added amenities, images, rating, review count, creation timestamp
- **Booking**: Added check-in/out dates, multiple rooms, booking status, hotel name
- **User**: User profiles with hotel owner status and booking history
- **Review**: 5-star rating system with comments
- **Booking Status**: active, completed, cancelled, pending

### 2. **Advanced Booking System**
- **Date-based bookings** with check-in/check-out times
- **Multiple room support** per booking
- **Room availability checking** with conflict detection
- **Booking status management** (pending → active → completed)
- **Smart pricing calculation** based on nights and rooms

### 3. **User Management**
- **User profiles** with registration tracking
- **Hotel owner permissions** system
- **Booking history** and statistics tracking
- **Role-based access control**

### 4. **Hotel Management**
- **Full CRUD operations** (Create, Read, Update, Delete)
- **Image and amenity management**
- **Owner-only editing** permissions
- **Search and filtering** capabilities
- **Automatic rating updates**

### 5. **Review & Rating System**
- **5-star rating system** for hotels
- **Comment-based reviews**
- **Only completed guests can review**
- **Automatic rating calculation** and updates
- **Review history** per hotel

### 6. **Analytics & Statistics**
- **Hotel owner dashboard** stats (bookings, revenue, ratings)
- **Platform-wide statistics**
- **Revenue tracking** in ICP tokens
- **Performance metrics**

### 7. **Error Handling**
- **Result types** for proper error handling
- **Comprehensive error types**: NotFound, Unauthorized, InvalidInput, etc.
- **Input validation** for all operations
- **Security checks** for ownership and permissions

## 🔧 Core Functions

### Hotel Management
```motoko
addHotel(input: HotelInput) -> Result<Nat, ErrorType>
updateHotel(hotelId: Nat, input: HotelInput) -> Result<Text, ErrorType>
deleteHotel(hotelId: Nat) -> Result<Text, ErrorType>
getHotels() -> [Hotel]
getHotel(id: Nat) -> ?Hotel
searchHotels(location: Text, minPrice: Nat, maxPrice: Nat) -> [Hotel]
```

### Booking Management
```motoko
bookHotel(input: BookingInput) -> Result<Nat, ErrorType>
confirmBooking(bookingId: Nat) -> Result<Text, ErrorType>
cancelBooking(bookingId: Nat) -> Result<Text, ErrorType>
completeBooking(bookingId: Nat) -> Result<Text, ErrorType>
getMyBookings() -> [Booking]
checkRoomAvailability(...) -> Bool
```

### User Management
```motoko
getMyProfile() -> User
updateProfile(isHotelOwner: Bool) -> Result<Text, ErrorType>
isHotelOwner(principal: Principal) -> Bool
```

### Review System
```motoko
addReview(hotelId: Nat, rating: Nat, comment: Text) -> Result<Nat, ErrorType>
getHotelReviews(hotelId: Nat) -> [Review]
```

### Analytics
```motoko
getMyHotelStats() -> Result<{totalBookings: Nat; totalRevenue: Nat; avgRating: Float}, ErrorType>
getPlatformStats() -> {totalHotels: Nat; totalBookings: Nat; totalUsers: Nat}
```

## 🛡️ Security Features

1. **Ownership Verification**: Only hotel owners can modify their properties
2. **Booking Authorization**: Users can only manage their own bookings
3. **Review Permissions**: Only guests who completed stays can review
4. **Input Validation**: All inputs are validated before processing
5. **Error Handling**: Comprehensive error types and handling

## 💰 Token Economics

- Prices stored in **e8s** (1 ICP = 100,000,000 e8s)
- Automatic **revenue calculation** for hotel owners
- **Total platform revenue** tracking
- Support for **multi-room bookings** with proper pricing

## 🔄 State Management

- **Stable storage** for canister upgrades
- **HashMap** for efficient user lookups
- **Buffer** collections for dynamic data
- **Proper upgrade hooks** (preupgrade/postupgrade)

## 📈 Future Integration Points

### With Frontend
- Seamless integration with React components
- Real-time availability checking
- User authentication with Internet Identity
- Transaction handling with ICP tokens

### With ICP Ecosystem
- **Internet Identity** for authentication
- **ICP Ledger** for payments
- **Canister upgrades** with preserved state
- **Inter-canister calls** for complex operations

## 🧪 Testing Functions

```motoko
getAllBookings() -> [Booking]  // Admin/debug
getAllUsers() -> [(Principal, User)]  // Admin/debug
getAllReviews() -> [Review]  // Admin/debug
```

## 🚀 Deployment Ready

The contract is production-ready with:
- ✅ Comprehensive error handling
- ✅ Security permissions
- ✅ State persistence
- ✅ Scalable data structures
- ✅ Rich functionality matching frontend
- ✅ Real-world business logic

This enhanced backend provides a solid foundation for your decentralized hotel booking platform with enterprise-grade features and security! 🎉
