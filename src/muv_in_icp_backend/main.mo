import Map "mo:base/HashMap";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Text "mo:base/Text";
import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";
import Hash "mo:base/Hash";

actor MuvInBackend {
  // Types
  public type Time = Time.Time;
  public type Result<Ok, Err> = Result.Result<Ok, Err>;

  // Error types
  public type ErrorType = {
    #NotFound;
    #Unauthorized;
    #InvalidInput;
    #InsufficientRooms;
    #BookingConflict;
    #AlreadyExists;
  };

  // Booking status
  public type BookingStatus = {
    #pending;
    #active;
    #completed;
    #cancelled;
  };

  // Data types
  public type Hotel = {
    id: Nat;
    name: Text;
    description: Text;
    location: Text;
    totalRooms: Nat;
    availableRooms: Nat;
    pricePerNight: Nat; // in e8s (1 ICP = 100_000_000 e8s)
    amenities: [Text];
    images: [Text];
    owner: Principal;
    rating: Float;
    reviewCount: Nat;
    createdAt: Time;
  };

  public type HotelInput = {
    name: Text;
    description: Text;
    location: Text;
    totalRooms: Nat;
    pricePerNight: Nat;
    amenities: [Text];
    images: [Text];
  };

  public type Booking = {
    id: Nat;
    hotelId: Nat;
    hotelName: Text;
    bookedBy: Principal;
    checkIn: Time;
    checkOut: Time;
    nights: Nat;
    roomsBooked: Nat;
    totalPrice: Nat; // in e8s
    status: BookingStatus;
    createdAt: Time;
  };

  public type BookingInput = {
    hotelId: Nat;
    checkIn: Time;
    checkOut: Time;
    roomsBooked: Nat;
  };

  public type User = {
    principal: Principal;
    isHotelOwner: Bool;
    totalBookings: Nat;
    joinedAt: Time;
  };

  public type Review = {
    id: Nat;
    hotelId: Nat;
    reviewedBy: Principal;
    rating: Nat; // 1-5 stars
    comment: Text;
    createdAt: Time;
  };

  public type HotelStats = {
    totalBookings: Nat;
    totalRevenue: Nat;
    avgRating: Float;
  };

  public type PlatformStats = {
    totalHotels: Nat;
    totalBookings: Nat;
    totalUsers: Nat;
  };

  // Stable storage for upgrades
  private stable var nextHotelId: Nat = 1;
  private stable var nextBookingId: Nat = 1;
  private stable var nextReviewId: Nat = 1;
  private stable var hotelsEntries: [(Nat, Hotel)] = [];
  private stable var bookingsEntries: [(Nat, Booking)] = [];
  private stable var usersEntries: [(Principal, User)] = [];
  private stable var reviewsEntries: [(Nat, Review)] = [];

  // Runtime storage
  private var hotels = Map.HashMap<Nat, Hotel>(10, Nat.equal, Hash.hash);
  private var bookings = Map.HashMap<Nat, Booking>(50, Nat.equal, Hash.hash);
  private var users = Map.HashMap<Principal, User>(50, Principal.equal, Principal.hash);
  private var reviews = Map.HashMap<Nat, Review>(100, Nat.equal, Hash.hash);

  // Initialize from stable storage
  private func init() {
    for ((id, hotel) in hotelsEntries.vals()) {
      hotels.put(id, hotel);
    };
    for ((id, booking) in bookingsEntries.vals()) {
      bookings.put(id, booking);
    };
    for ((principal, user) in usersEntries.vals()) {
      users.put(principal, user);
    };
    for ((id, review) in reviewsEntries.vals()) {
      reviews.put(id, review);
    };
  };

  // Call init on actor creation
  init();

  // Helper functions
  private func _getOrCreateUser(caller: Principal): User {
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

  private func _updateUser(caller: Principal, updates: {isHotelOwner: ?Bool; totalBookings: ?Nat}) {
    let currentUser = _getOrCreateUser(caller);
    let updatedUser: User = {
      principal = currentUser.principal;
      isHotelOwner = Option.get(updates.isHotelOwner, currentUser.isHotelOwner);
      totalBookings = Option.get(updates.totalBookings, currentUser.totalBookings);
      joinedAt = currentUser.joinedAt;
    };
    users.put(caller, updatedUser);
  };

  private func _isRoomAvailable(hotelId: Nat, checkIn: Time, checkOut: Time, roomsNeeded: Nat): Bool {
    switch (hotels.get(hotelId)) {
      case null return false;
      case (?hotel) {
        var bookedRooms: Nat = 0;
        
        // Check all active/pending bookings for conflicts
        for ((_, booking) in bookings.entries()) {
          if (booking.hotelId == hotelId and 
              (booking.status == #active or booking.status == #pending) and
              not (checkOut <= booking.checkIn or checkIn >= booking.checkOut)) {
            bookedRooms += booking.roomsBooked;
          };
        };
        
        hotel.totalRooms >= (bookedRooms + roomsNeeded);
      };
    };
  };

  private func _calculateNights(checkIn: Time, checkOut: Time): Nat {
    let diffNs = Int.abs(checkOut - checkIn);
    let diffDays = diffNs / (24 * 60 * 60 * 1_000_000_000); // Convert nanoseconds to days
    Nat.max(1, Int.abs(diffDays)); // Minimum 1 night
  };

  private func _updateHotelRating(hotelId: Nat) {
    switch (hotels.get(hotelId)) {
      case null return;
      case (?hotel) {
        var totalRating: Float = 0.0;
        var reviewCount: Nat = 0;
        
        for ((_, review) in reviews.entries()) {
          if (review.hotelId == hotelId) {
            totalRating += Float.fromInt(review.rating);
            reviewCount += 1;
          };
        };
        
        let avgRating = if (reviewCount > 0) totalRating / Float.fromInt(reviewCount) else 0.0;
        
        let updatedHotel: Hotel = {
          id = hotel.id;
          name = hotel.name;
          description = hotel.description;
          location = hotel.location;
          totalRooms = hotel.totalRooms;
          availableRooms = hotel.availableRooms;
          pricePerNight = hotel.pricePerNight;
          amenities = hotel.amenities;
          images = hotel.images;
          owner = hotel.owner;
          rating = avgRating;
          reviewCount = reviewCount;
          createdAt = hotel.createdAt;
        };
        
        hotels.put(hotelId, updatedHotel);
      };
    };
  };

  // User Management
  public shared(msg) func getMyProfile(): async User {
    _getOrCreateUser(msg.caller)
  };

  public shared(msg) func updateProfile(isHotelOwner: Bool): async Result<Text, ErrorType> {
    _updateUser(msg.caller, {isHotelOwner = ?isHotelOwner; totalBookings = null});
    #ok("Profile updated successfully")
  };

  public query func isHotelOwner(principal: Principal): async Bool {
    switch (users.get(principal)) {
      case (?user) user.isHotelOwner;
      case null false;
    };
  };

  // Hotel Management
  public shared(msg) func addHotel(input: HotelInput): async Result<Nat, ErrorType> {
    // Validate input
    if (Text.size(input.name) == 0 or Text.size(input.location) == 0 or input.totalRooms == 0) {
      return #err(#InvalidInput);
    };

    let hotelId = nextHotelId;
    nextHotelId += 1;

    let hotel: Hotel = {
      id = hotelId;
      name = input.name;
      description = input.description;
      location = input.location;
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

    hotels.put(hotelId, hotel);
    
    // Make user a hotel owner
    _updateUser(msg.caller, {isHotelOwner = ?true; totalBookings = null});
    
    #ok(hotelId)
  };

  public shared(msg) func updateHotel(hotelId: Nat, input: HotelInput): async Result<Text, ErrorType> {
    switch (hotels.get(hotelId)) {
      case null #err(#NotFound);
      case (?hotel) {
        if (hotel.owner != msg.caller) {
          return #err(#Unauthorized);
        };

        let updatedHotel: Hotel = {
          id = hotel.id;
          name = input.name;
          description = input.description;
          location = input.location;
          totalRooms = input.totalRooms;
          availableRooms = hotel.availableRooms; // Keep current availability
          pricePerNight = input.pricePerNight;
          amenities = input.amenities;
          images = input.images;
          owner = hotel.owner;
          rating = hotel.rating;
          reviewCount = hotel.reviewCount;
          createdAt = hotel.createdAt;
        };

        hotels.put(hotelId, updatedHotel);
        #ok("Hotel updated successfully")
      };
    };
  };

  public shared(msg) func deleteHotel(hotelId: Nat): async Result<Text, ErrorType> {
    switch (hotels.get(hotelId)) {
      case null #err(#NotFound);
      case (?hotel) {
        if (hotel.owner != msg.caller) {
          return #err(#Unauthorized);
        };

        // Check for active bookings
        for ((_, booking) in bookings.entries()) {
          if (booking.hotelId == hotelId and (booking.status == #active or booking.status == #pending)) {
            return #err(#BookingConflict);
          };
        };

        hotels.delete(hotelId);
        #ok("Hotel deleted successfully")
      };
    };
  };

  public query func getHotels(): async [Hotel] {
    Iter.toArray(hotels.vals())
  };

  public query func getHotel(id: Nat): async ?Hotel {
    hotels.get(id)
  };

  public shared(msg) func getMyHotels(): async [Hotel] {
    let myHotels = Buffer.Buffer<Hotel>(0);
    for ((_, hotel) in hotels.entries()) {
      if (hotel.owner == msg.caller) {
        myHotels.add(hotel);
      };
    };
    Buffer.toArray(myHotels)
  };

  public query func searchHotels(location: Text, minPrice: Nat, maxPrice: Nat): async [Hotel] {
    let results = Buffer.Buffer<Hotel>(0);
    for ((_, hotel) in hotels.entries()) {
      let locationMatch = Text.contains(hotel.location, #text location);
      let priceInRange = hotel.pricePerNight >= minPrice and hotel.pricePerNight <= maxPrice;
      
      if (locationMatch and priceInRange) {
        results.add(hotel);
      };
    };
    Buffer.toArray(results)
  };

  // Booking Management
  public shared(msg) func bookHotel(input: BookingInput): async Result<Nat, ErrorType> {
    // Validate hotel exists
    let hotel = switch (hotels.get(input.hotelId)) {
      case null return #err(#NotFound);
      case (?h) h;
    };

    // Validate dates
    if (input.checkIn >= input.checkOut or input.roomsBooked == 0) {
      return #err(#InvalidInput);
    };

    // Check room availability
    if (not _isRoomAvailable(input.hotelId, input.checkIn, input.checkOut, input.roomsBooked)) {
      return #err(#InsufficientRooms);
    };

    let bookingId = nextBookingId;
    nextBookingId += 1;

    let nights = _calculateNights(input.checkIn, input.checkOut);
    let totalPrice = hotel.pricePerNight * nights * input.roomsBooked;

    let booking: Booking = {
      id = bookingId;
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

    bookings.put(bookingId, booking);
    
    // Update user booking count
    let currentUser = _getOrCreateUser(msg.caller);
    _updateUser(msg.caller, {isHotelOwner = null; totalBookings = ?(currentUser.totalBookings + 1)});
    
    #ok(bookingId)
  };

  public shared(msg) func confirmBooking(bookingId: Nat): async Result<Text, ErrorType> {
    switch (bookings.get(bookingId)) {
      case null #err(#NotFound);
      case (?booking) {
        // Only hotel owner or booking creator can confirm
        let hotel = switch (hotels.get(booking.hotelId)) {
          case null return #err(#NotFound);
          case (?h) h;
        };

        if (hotel.owner != msg.caller and booking.bookedBy != msg.caller) {
          return #err(#Unauthorized);
        };

        let updatedBooking: Booking = {
          id = booking.id;
          hotelId = booking.hotelId;
          hotelName = booking.hotelName;
          bookedBy = booking.bookedBy;
          checkIn = booking.checkIn;
          checkOut = booking.checkOut;
          nights = booking.nights;
          roomsBooked = booking.roomsBooked;
          totalPrice = booking.totalPrice;
          status = #active;
          createdAt = booking.createdAt;
        };

        bookings.put(bookingId, updatedBooking);
        #ok("Booking confirmed successfully")
      };
    };
  };

  public shared(msg) func cancelBooking(bookingId: Nat): async Result<Text, ErrorType> {
    switch (bookings.get(bookingId)) {
      case null #err(#NotFound);
      case (?booking) {
        if (booking.bookedBy != msg.caller) {
          return #err(#Unauthorized);
        };

        let updatedBooking: Booking = {
          id = booking.id;
          hotelId = booking.hotelId;
          hotelName = booking.hotelName;
          bookedBy = booking.bookedBy;
          checkIn = booking.checkIn;
          checkOut = booking.checkOut;
          nights = booking.nights;
          roomsBooked = booking.roomsBooked;
          totalPrice = booking.totalPrice;
          status = #cancelled;
          createdAt = booking.createdAt;
        };

        bookings.put(bookingId, updatedBooking);
        #ok("Booking cancelled successfully")
      };
    };
  };

  public shared(msg) func completeBooking(bookingId: Nat): async Result<Text, ErrorType> {
    switch (bookings.get(bookingId)) {
      case null #err(#NotFound);
      case (?booking) {
        // Only hotel owner can mark as completed
        let hotel = switch (hotels.get(booking.hotelId)) {
          case null return #err(#NotFound);
          case (?h) h;
        };

        if (hotel.owner != msg.caller) {
          return #err(#Unauthorized);
        };

        let updatedBooking: Booking = {
          id = booking.id;
          hotelId = booking.hotelId;
          hotelName = booking.hotelName;
          bookedBy = booking.bookedBy;
          checkIn = booking.checkIn;
          checkOut = booking.checkOut;
          nights = booking.nights;
          roomsBooked = booking.roomsBooked;
          totalPrice = booking.totalPrice;
          status = #completed;
          createdAt = booking.createdAt;
        };

        bookings.put(bookingId, updatedBooking);
        #ok("Booking completed successfully")
      };
    };
  };

  public shared(msg) func getMyBookings(): async [Booking] {
    let myBookings = Buffer.Buffer<Booking>(0);
    for ((_, booking) in bookings.entries()) {
      if (booking.bookedBy == msg.caller) {
        myBookings.add(booking);
      };
    };
    Buffer.toArray(myBookings)
  };

  public shared(msg) func getHotelBookings(hotelId: Nat): async Result<[Booking], ErrorType> {
    // Verify hotel ownership
    switch (hotels.get(hotelId)) {
      case null return #err(#NotFound);
      case (?hotel) {
        if (hotel.owner != msg.caller) {
          return #err(#Unauthorized);
        };

        let hotelBookings = Buffer.Buffer<Booking>(0);
        for ((_, booking) in bookings.entries()) {
          if (booking.hotelId == hotelId) {
            hotelBookings.add(booking);
          };
        };
        #ok(Buffer.toArray(hotelBookings))
      };
    };
  };

  public query func getBooking(bookingId: Nat): async ?Booking {
    bookings.get(bookingId)
  };

  public query func checkRoomAvailability(hotelId: Nat, checkIn: Time, checkOut: Time, roomsNeeded: Nat): async Bool {
    _isRoomAvailable(hotelId, checkIn, checkOut, roomsNeeded)
  };

  // Review System
  public shared(msg) func addReview(hotelId: Nat, rating: Nat, comment: Text): async Result<Nat, ErrorType> {
    // Validate rating (1-5 stars)
    if (rating < 1 or rating > 5) {
      return #err(#InvalidInput);
    };

    // Verify hotel exists
    switch (hotels.get(hotelId)) {
      case null return #err(#NotFound);
      case (?_) {};
    };

    // Check if user has completed a booking at this hotel
    var hasCompletedBooking = false;
    for ((_, booking) in bookings.entries()) {
      if (booking.hotelId == hotelId and booking.bookedBy == msg.caller and booking.status == #completed) {
        hasCompletedBooking := true;
      };
    };

    if (not hasCompletedBooking) {
      return #err(#Unauthorized);
    };

    let reviewId = nextReviewId;
    nextReviewId += 1;

    let review: Review = {
      id = reviewId;
      hotelId = hotelId;
      reviewedBy = msg.caller;
      rating = rating;
      comment = comment;
      createdAt = Time.now();
    };

    reviews.put(reviewId, review);
    _updateHotelRating(hotelId);
    
    #ok(reviewId)
  };

  public query func getHotelReviews(hotelId: Nat): async [Review] {
    let hotelReviews = Buffer.Buffer<Review>(0);
    for ((_, review) in reviews.entries()) {
      if (review.hotelId == hotelId) {
        hotelReviews.add(review);
      };
    };
    Buffer.toArray(hotelReviews)
  };

  // Analytics
  public shared(msg) func getMyHotelStats(): async Result<HotelStats, ErrorType> {
    var totalBookings: Nat = 0;
    var totalRevenue: Nat = 0;
    var totalRating: Float = 0.0;
    var ratingCount: Nat = 0;

    // Find hotels owned by caller
    for ((_, hotel) in hotels.entries()) {
      if (hotel.owner == msg.caller) {
        // Count bookings and revenue for this hotel
        for ((_, booking) in bookings.entries()) {
          if (booking.hotelId == hotel.id and booking.status == #completed) {
            totalBookings += 1;
            totalRevenue += booking.totalPrice;
          };
        };

        // Add to rating calculation
        if (hotel.reviewCount > 0) {
          totalRating += hotel.rating;
          ratingCount += 1;
        };
      };
    };

    let avgRating = if (ratingCount > 0) totalRating / Float.fromInt(ratingCount) else 0.0;

    #ok({
      totalBookings = totalBookings;
      totalRevenue = totalRevenue;
      avgRating = avgRating;
    })
  };

  public query func getPlatformStats(): async PlatformStats {
    {
      totalHotels = hotels.size();
      totalBookings = bookings.size();
      totalUsers = users.size();
    }
  };

  // Admin/Debug functions
  public query func getAllBookings(): async [Booking] {
    Iter.toArray(bookings.vals())
  };

  public query func getAllUsers(): async [(Principal, User)] {
    Iter.toArray(users.entries())
  };

  public query func getAllReviews(): async [Review] {
    Iter.toArray(reviews.vals())
  };

  // System functions for canister upgrades
  system func preupgrade() {
    hotelsEntries := Iter.toArray(hotels.entries());
    bookingsEntries := Iter.toArray(bookings.entries());
    usersEntries := Iter.toArray(users.entries());
    reviewsEntries := Iter.toArray(reviews.entries());
  };

  system func postupgrade() {
    hotelsEntries := [];
    bookingsEntries := [];
    usersEntries := [];
    reviewsEntries := [];
  };
}
