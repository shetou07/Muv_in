import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Float "mo:base/Float";
import Int "mo:base/Int";

actor MuvIn {

  // Types
  type BookingStatus = {
    #active;
    #completed;
    #cancelled;
    #pending;
  };

  type Hotel = {
    id: Nat;
    name: Text;
    location: T  // Review System
  public shared(msg) func addReview(hotelId: Nat, rating: Nat, comment: Text): async Result.Result<Nat, ErrorType> {
    // Validate rating (1-5 stars)
    if (rating < 1 or rating > 5) {
      return #err(#InvalidInput);
    };

    switch (_findHotel(hotelId)) {
      case null #err(#NotFound);
      case (?hotel) {
        // Check if user has completed a booking at this hotel
        var hasStayed = false;
        for (booking in bookings.vals()) {
          if (booking.hotelId == hotelId and booking.bookedBy == msg.caller and booking.status == #completed) {
            hasStayed := true;
          };
        };

        if (not hasStayed) {
          return #err(#Unauthorized);
        };

        let review: Review = {
          id = reviewCounter;
          hotelId = hotelId;
          reviewedBy = msg.caller;
          rating = rating;
          comment = comment;
          createdAt = Time.now();
        };

        reviews.add(review);
        reviewCounter += 1;

        // Update hotel rating
        await _updateHotelRating(hotelId);

        #ok(review.id);
      };
    };
  };

  public query func getHotelReviews(hotelId: Nat): async [Review] {
    let result = Buffer.Buffer<Review>(0);
    for (review in reviews.vals()) {
      if (review.hotelId == hotelId) {
        result.add(review);
      };
    };
    Buffer.toArray(result);
  };

  // Analytics and Statistics
  public shared(msg) func getMyHotelStats(): async Result.Result<{totalBookings: Nat; totalRevenue: Nat; avgRating: Float}, ErrorType> {
    let myHotels = Buffer.Buffer<Nat>(0);
    for (hotel in hotels.vals()) {
      if (hotel.owner == msg.caller) {
        myHotels.add(hotel.id);
      };
    };

    if (myHotels.size() == 0) {
      return #err(#NotFound);
    };

    var totalBookings: Nat = 0;
    var totalRevenue: Nat = 0;
    var totalRating: Float = 0;
    var ratingCount: Nat = 0;

    for (booking in bookings.vals()) {
      for (hotelId in myHotels.vals()) {
        if (booking.hotelId == hotelId and booking.status == #completed) {
          totalBookings += 1;
          totalRevenue += booking.totalPrice;
        };
      };
    };

    for (hotel in hotels.vals()) {
      if (hotel.owner == msg.caller and hotel.reviewCount > 0) {
        totalRating += hotel.rating;
        ratingCount += 1;
      };
    };

    let avgRating = if (ratingCount > 0) totalRating / Float.fromInt(ratingCount) else 0.0;

    #ok({
      totalBookings = totalBookings;
      totalRevenue = totalRevenue;
      avgRating = avgRating;
    });
  };

  public query func getPlatformStats(): async {totalHotels: Nat; totalBookings: Nat; totalUsers: Nat} {
    {
      totalHotels = hotels.size();
      totalBookings = bookings.size();
      totalUsers = users.size();
    };
  };

  // Admin functions (for debugging)
  public query func getAllBookings(): async [Booking] {
    Buffer.toArray(bookings);
  };

  public query func getAllUsers(): async [(Principal, User)] {
    Iter.toArray(users.entries());
  };

  public query func getAllReviews(): async [Review] {
    Buffer.toArray(reviews);
  };

  // Utility functions for frontend integration
  public query func isHotelOwner(principal: Principal): async Bool {
    switch (users.get(principal)) {
      case (?user) user.isHotelOwner;
      case null false;
    };
  };

  public query func checkRoomAvailability(hotelId: Nat, checkIn: Time.Time, checkOut: Time.Time, roomsNeeded: Nat): async Bool {
    _isRoomAvailable(hotelId, checkIn, checkOut, roomsNeeded);
  };

};ion: Text;
    totalRooms: Nat;
    availableRooms: Nat;
    pricePerNight: Nat; // in e8s (1 ICP = 100_000_000 e8s)
    amenities: [Text];
    images: [Text];
    owner: Principal;
    rating: Float;
    reviewCount: Nat;
    createdAt: Time.Time;
  };

  type Booking = {
    id: Nat;
    hotelId: Nat;
    hotelName: Text;
    bookedBy: Principal;
    checkIn: Time.Time;
    checkOut: Time.Time;
    nights: Nat;
    roomsBooked: Nat;
    totalPrice: Nat; // in e8s
    status: BookingStatus;
    createdAt: Time.Time;
  };

  type User = {
    principal: Principal;
    isHotelOwner: Bool;
    totalBookings: Nat;
    joinedAt: Time.Time;
  };

  type Review = {
    id: Nat;
    hotelId: Nat;
    reviewedBy: Principal;
    rating: Nat; // 1-5 stars
    comment: Text;
    createdAt: Time.Time;
  };

  type HotelInput = {
    name: Text;
    location: Text;
    description: Text;
    totalRooms: Nat;
    pricePerNight: Nat;
    amenities: [Text];
    images: [Text];
  };

  type BookingInput = {
    hotelId: Nat;
    checkIn: Time.Time;
    checkOut: Time.Time;
    roomsBooked: Nat;
  };

  type ErrorType = {
    #NotFound;
    #Unauthorized;
    #InvalidInput;
    #InsufficientRooms;
    #BookingConflict;
  };

  // Storage
  private var hotels = Buffer.Buffer<Hotel>(0);
  private var bookings = Buffer.Buffer<Booking>(0);
  private var users = HashMap.HashMap<Principal, User>(0, Principal.equal, Principal.hash);
  private var reviews = Buffer.Buffer<Review>(0);
  
  private stable var hotelCounter: Nat = 0;
  private stable var bookingCounter: Nat = 0;
  private stable var reviewCounter: Nat = 0;

  // Stable storage for upgrade persistence
  private stable var stableHotels: [Hotel] = [];
  private stable var stableBookings: [Booking] = [];
  private stable var stableUsers: [(Principal, User)] = [];
  private stable var stableReviews: [Review] = [];

  // System upgrade hooks
  system func preupgrade() {
    stableHotels := Buffer.toArray(hotels);
    stableBookings := Buffer.toArray(bookings);
    stableUsers := Iter.toArray(users.entries());
    stableReviews := Buffer.toArray(reviews);
  };

  system func postupgrade() {
    hotels := Buffer.fromArray<Hotel>(stableHotels);
    bookings := Buffer.fromArray<Booking>(stableBookings);
    users := HashMap.fromIter<Principal, User>(stableUsers.vals(), stableUsers.size(), Principal.equal, Principal.hash);
    reviews := Buffer.fromArray<Review>(stableReviews);
    
    stableHotels := [];
    stableBookings := [];
    stableUsers := [];
    stableReviews := [];
  };

  // Helper functions
  private func _getUser(caller: Principal): User {
    switch (users.get(caller)) {
      case (?user) user;
      case null {
        let newUser: User = {
          principal = caller;
          isHotelOwner = false;
          totalBookings = 0;
          joinedAt = Time.now();
        };
        users.put(caller, newUser);
        newUser;
      };
    };
  };

  private func _updateUser(caller: Principal, updates: User): () {
    users.put(caller, updates);
  };

  private func _findHotel(id: Nat): ?Hotel {
    for (hotel in hotels.vals()) {
      if (hotel.id == id) return ?hotel;
    };
    null;
  };

  private func _findHotelIndex(id: Nat): ?Nat {
    var index = 0;
    for (hotel in hotels.vals()) {
      if (hotel.id == id) return ?index;
      index += 1;
    };
    null;
  };

  private func _calculateNights(checkIn: Time.Time, checkOut: Time.Time): Nat {
    let diffNanos = Int.abs(checkOut - checkIn);
    let nightsFloat = Float.fromInt(diffNanos) / Float.fromInt(86_400_000_000_000); // nanoseconds in a day
    let nights = Float.toInt(Float.nearest(nightsFloat));
    Int.abs(nights);
  };

  private func _isRoomAvailable(hotelId: Nat, checkIn: Time.Time, checkOut: Time.Time, roomsNeeded: Nat): Bool {
    switch (_findHotel(hotelId)) {
      case null false;
      case (?hotel) {
        if (hotel.availableRooms < roomsNeeded) return false;
        
        // Check for booking conflicts
        var bookedRooms = 0;
        for (booking in bookings.vals()) {
          if (booking.hotelId == hotelId and booking.status == #active) {
            // Check for date overlap
            if ((checkIn >= booking.checkIn and checkIn < booking.checkOut) or
                (checkOut > booking.checkIn and checkOut <= booking.checkOut) or
                (checkIn <= booking.checkIn and checkOut >= booking.checkOut)) {
              bookedRooms += booking.roomsBooked;
            };
          };
        };
        
        (hotel.totalRooms - bookedRooms) >= roomsNeeded;
      };
    };
  };

  private func _updateHotelRating(hotelId: Nat): async () {
    switch (_findHotelIndex(hotelId)) {
      case null {};
      case (?index) {
        let hotel = hotels.get(index);
        var totalRating: Float = 0;
        var count: Nat = 0;
        
        for (review in reviews.vals()) {
          if (review.hotelId == hotelId) {
            totalRating += Float.fromInt(review.rating);
            count += 1;
          };
        };
        
        let newRating = if (count > 0) totalRating / Float.fromInt(count) else 0.0;
        let updatedHotel: Hotel = {
          hotel with
          rating = newRating;
          reviewCount = count;
        };
        hotels.put(index, updatedHotel);
      };
    };
  };

  // Public functions

  // User Management
  public shared(msg) func getMyProfile(): async User {
    _getUser(msg.caller);
  };

  public shared(msg) func updateProfile(isHotelOwner: Bool): async Result.Result<Text, ErrorType> {
    let user = _getUser(msg.caller);
    let updatedUser: User = {
      user with isHotelOwner = isHotelOwner;
    };
    _updateUser(msg.caller, updatedUser);
    #ok("Profile updated successfully");
  };

  // Hotel Management
  public shared(msg) func addHotel(input: HotelInput): async Result.Result<Nat, ErrorType> {
    // Validate input
    if (Text.size(input.name) == 0 or Text.size(input.location) == 0) {
      return #err(#InvalidInput);
    };

    if (input.totalRooms == 0 or input.pricePerNight == 0) {
      return #err(#InvalidInput);
    };

    let user = _getUser(msg.caller);
    let updatedUser: User = { user with isHotelOwner = true; };
    _updateUser(msg.caller, updatedUser);

    let newHotel: Hotel = {
      id = hotelCounter;
      name = input.name;
      location = input.location;
      description = input.description;
      totalRooms = input.totalRooms;
      availableRooms = input.totalRooms;
      pricePerNight = input.pricePerNight;
      amenities = input.amenities;
      images = input.images;
      owner = msg.caller;
      rating = 0.0;
      reviewCount = 0;
      createdAt = Time.now();
    };
    
    hotels.add(newHotel);
    hotelCounter += 1;
    #ok(newHotel.id);
  };

  public shared(msg) func updateHotel(hotelId: Nat, input: HotelInput): async Result.Result<Text, ErrorType> {
    switch (_findHotelIndex(hotelId)) {
      case null #err(#NotFound);
      case (?index) {
        let hotel = hotels.get(index);
        if (hotel.owner != msg.caller) {
          return #err(#Unauthorized);
        };

        let updatedHotel: Hotel = {
          hotel with
          name = input.name;
          location = input.location;
          description = input.description;
          totalRooms = input.totalRooms;
          pricePerNight = input.pricePerNight;
          amenities = input.amenities;
          images = input.images;
        };
        hotels.put(index, updatedHotel);
        #ok("Hotel updated successfully");
      };
    };
  };

  public shared(msg) func deleteHotel(hotelId: Nat): async Result.Result<Text, ErrorType> {
    switch (_findHotel(hotelId)) {
      case null #err(#NotFound);
      case (?hotel) {
        if (hotel.owner != msg.caller) {
          return #err(#Unauthorized);
        };

        // Check for active bookings
        for (booking in bookings.vals()) {
          if (booking.hotelId == hotelId and booking.status == #active) {
            return #err(#BookingConflict);
          };
        };

        // Remove hotel
        let newHotels = Buffer.Buffer<Hotel>(0);
        for (h in hotels.vals()) {
          if (h.id != hotelId) {
            newHotels.add(h);
          };
        };
        hotels := newHotels;
        #ok("Hotel deleted successfully");
      };
    };
  };

  // Hotel Queries
  public query func getHotels(): async [Hotel] {
    Buffer.toArray(hotels);
  };

  public query func getHotel(id: Nat): async ?Hotel {
    _findHotel(id);
  };

  public shared(msg) func getMyHotels(): async [Hotel] {
    let result = Buffer.Buffer<Hotel>(0);
    for (h in hotels.vals()) {
      if (h.owner == msg.caller) {
        result.add(h);
      };
    };
    Buffer.toArray(result);
  };

  public query func searchHotels(location: Text, minPrice: Nat, maxPrice: Nat): async [Hotel] {
    let result = Buffer.Buffer<Hotel>(0);
    for (hotel in hotels.vals()) {
      let locationMatch = Text.size(location) == 0 or Text.contains(hotel.location, #text location);
      let priceMatch = hotel.pricePerNight >= minPrice and hotel.pricePerNight <= maxPrice;
      
      if (locationMatch and priceMatch) {
        result.add(hotel);
      };
    };
    Buffer.toArray(result);
  };

  // Booking Management
  public shared(msg) func bookHotel(input: BookingInput): async Result.Result<Nat, ErrorType> {
    // Validate input
    if (input.checkIn >= input.checkOut) {
      return #err(#InvalidInput);
    };

    if (input.roomsBooked == 0) {
      return #err(#InvalidInput);
    };

    switch (_findHotel(input.hotelId)) {
      case null #err(#NotFound);
      case (?hotel) {
        // Check room availability
        if (not _isRoomAvailable(input.hotelId, input.checkIn, input.checkOut, input.roomsBooked)) {
          return #err(#InsufficientRooms);
        };

        let nights = _calculateNights(input.checkIn, input.checkOut);
        let totalPrice = hotel.pricePerNight * nights * input.roomsBooked;

        let booking: Booking = {
          id = bookingCounter;
          hotelId = input.hotelId;
          hotelName = hotel.name;
          bookedBy = msg.caller;
          checkIn = input.checkIn;
          checkOut = input.checkOut;
          nights = nights;
          roomsBooked = input.roomsBooked;
          totalPrice = totalPrice;
          status = #pending;
          createdAt = Time.now();
        };

        bookings.add(booking);
        bookingCounter += 1;

        // Update user booking count
        let user = _getUser(msg.caller);
        let updatedUser: User = {
          user with totalBookings = user.totalBookings + 1;
        };
        _updateUser(msg.caller, updatedUser);

        #ok(booking.id);
      };
    };
  };

  public shared(msg) func confirmBooking(bookingId: Nat): async Result.Result<Text, ErrorType> {
    var foundIndex: ?Nat = null;
    var index = 0;
    
    for (booking in bookings.vals()) {
      if (booking.id == bookingId and booking.bookedBy == msg.caller) {
        foundIndex := ?index;
      };
      index += 1;
    };

    switch (foundIndex) {
      case null #err(#NotFound);
      case (?idx) {
        let booking = bookings.get(idx);
        if (booking.status != #pending) {
          return #err(#InvalidInput);
        };

        let updatedBooking: Booking = {
          booking with status = #active;
        };
        bookings.put(idx, updatedBooking);
        #ok("Booking confirmed successfully");
      };
    };
  };

  public shared(msg) func cancelBooking(bookingId: Nat): async Result.Result<Text, ErrorType> {
    var foundIndex: ?Nat = null;
    var index = 0;
    
    for (booking in bookings.vals()) {
      if (booking.id == bookingId and booking.bookedBy == msg.caller) {
        foundIndex := ?index;
      };
      index += 1;
    };

    switch (foundIndex) {
      case null #err(#NotFound);
      case (?idx) {
        let booking = bookings.get(idx);
        if (booking.status == #completed or booking.status == #cancelled) {
          return #err(#InvalidInput);
        };

        let updatedBooking: Booking = {
          booking with status = #cancelled;
        };
        bookings.put(idx, updatedBooking);
        #ok("Booking cancelled successfully");
      };
    };
  };

  public shared(msg) func completeBooking(bookingId: Nat): async Result.Result<Text, ErrorType> {
    var foundIndex: ?Nat = null;
    var index = 0;
    
    for (booking in bookings.vals()) {
      if (booking.id == bookingId) {
        switch (_findHotel(booking.hotelId)) {
          case null {};
          case (?hotel) {
            if (hotel.owner == msg.caller) {
              foundIndex := ?index;
            };
          };
        };
      };
      index += 1;
    };

    switch (foundIndex) {
      case null #err(#Unauthorized);
      case (?idx) {
        let booking = bookings.get(idx);
        let updatedBooking: Booking = {
          booking with status = #completed;
        };
        bookings.put(idx, updatedBooking);
        #ok("Booking marked as completed");
      };
    };
  };

  // Booking Queries
  public shared(msg) func getMyBookings(): async [Booking] {
    let result = Buffer.Buffer<Booking>(0);
    for (booking in bookings.vals()) {
      if (booking.bookedBy == msg.caller) {
        result.add(booking);
      };
    };
    Buffer.toArray(result);
  };

  public shared(msg) func getHotelBookings(hotelId: Nat): async Result.Result<[Booking], ErrorType> {
    switch (_findHotel(hotelId)) {
      case null #err(#NotFound);
      case (?hotel) {
        if (hotel.owner != msg.caller) {
          return #err(#Unauthorized);
        };

        let result = Buffer.Buffer<Booking>(0);
        for (booking in bookings.vals()) {
          if (booking.hotelId == hotelId) {
            result.add(booking);
          };
        };
        #ok(Buffer.toArray(result));
      };
    };
  };

  public query func getBooking(bookingId: Nat): async ?Booking {
    for (booking in bookings.vals()) {
      if (booking.id == bookingId) {
        return ?booking;
      };
    };
    null;
  };

  // Get all bookings (for debugging/admin purposes)
  public query func getAllBookings(): async [Booking] {
    return Buffer.toArray(bookings);
  };

  // Get hotel by owner
  public shared(msg) func getMyHotels(): async [Hotel] {
    let result = Buffer.Buffer<Hotel>(0);
    for (h in hotels.vals()) {
      if (h.owner == msg.caller) {
        result.add(h);
      };
    };
    return Buffer.toArray(result);
  };

}