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
    location: Text;
    description: Text;
    totalRooms: Nat;
    availableRooms: Nat;
    pricePerNight: Nat; // in e8s (smallest unit of ICP)
    amenities: [Text];
    images: [Text];
    owner: Principal;
    rating: Float;
    reviewCount: Nat;
    createdAt: Int;
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

  type Booking = {
    id: Nat;
    hotelId: Nat;
    hotelName: Text;
    bookedBy: Principal;
    checkIn: Int;
    checkOut: Int;
    nights: Nat;
    roomsBooked: Nat;
    totalPrice: Nat;
    status: BookingStatus;
    createdAt: Int;
  };

  type BookingInput = {
    hotelId: Nat;
    checkIn: Int;
    checkOut: Int;
    roomsBooked: Nat;
  };

  type Review = {
    id: Nat;
    hotelId: Nat;
    reviewedBy: Principal;
    rating: Nat; // 1-5 stars
    comment: Text;
    createdAt: Int;
  };

  type ReviewInput = {
    hotelId: Nat;
    rating: Nat;
    comment: Text;
  };

  type User = {
    principal: Principal;
    isHotelOwner: Bool;
    totalBookings: Nat;
    joinedAt: Int;
  };

  type ErrorType = {
    #NotFound;
    #Unauthorized;
    #InvalidInput;
    #AlreadyExists;
    #InsufficientRooms;
  };

  type PlatformStats = {
    totalHotels: Nat;
    totalBookings: Nat;
    totalUsers: Nat;
  };

  // Storage
  private stable var hotelCounter : Nat = 0;
  private stable var bookingCounter : Nat = 0;
  private stable var reviewCounter : Nat = 0;

  private var hotels = Buffer.Buffer<Hotel>(0);
  private var bookings = Buffer.Buffer<Booking>(0);
  private var reviews = Buffer.Buffer<Review>(0);
  private var users = HashMap.HashMap<Principal, User>(0, Principal.equal, Principal.hash);

  // Helper functions
  private func _findHotel(id: Nat) : ?Hotel {
    for (hotel in hotels.vals()) {
      if (hotel.id == id) {
        return ?hotel;
      };
    };
    null
  };

  private func _findBooking(id: Nat) : ?Booking {
    for (booking in bookings.vals()) {
      if (booking.id == id) {
        return ?booking;
      };
    };
    null
  };

  private func _getOrCreateUser(principal: Principal) : User {
    switch (users.get(principal)) {
      case (?user) user;
      case null {
        let newUser: User = {
          principal = principal;
          isHotelOwner = false;
          totalBookings = 0;
          joinedAt = Time.now();
        };
        users.put(principal, newUser);
        newUser
      };
    };
  };

  private func _updateHotelRating(hotelId: Nat) {
    let hotelReviews = Buffer.Buffer<Review>(0);
    for (review in reviews.vals()) {
      if (review.hotelId == hotelId) {
        hotelReviews.add(review);
      };
    };

    if (hotelReviews.size() > 0) {
      var totalRating : Float = 0.0;
      for (review in hotelReviews.vals()) {
        totalRating += Float.fromInt(review.rating);
      };
      let avgRating = totalRating / Float.fromInt(hotelReviews.size());

      // Update hotel with new rating
      let updatedHotels = Buffer.Buffer<Hotel>(hotels.size());
      for (hotel in hotels.vals()) {
        if (hotel.id == hotelId) {
          let updatedHotel: Hotel = {
            id = hotel.id;
            name = hotel.name;
            location = hotel.location;
            description = hotel.description;
            totalRooms = hotel.totalRooms;
            availableRooms = hotel.availableRooms;
            pricePerNight = hotel.pricePerNight;
            amenities = hotel.amenities;
            images = hotel.images;
            owner = hotel.owner;
            rating = avgRating;
            reviewCount = hotelReviews.size();
            createdAt = hotel.createdAt;
          };
          updatedHotels.add(updatedHotel);
        } else {
          updatedHotels.add(hotel);
        };
      };
      hotels := updatedHotels;
    };
  };

  // Public functions

  // Hotel Management
  public shared(msg) func createHotel(input: HotelInput) : async Result.Result<Nat, ErrorType> {
    let user = _getOrCreateUser(msg.caller);
    
    let hotel: Hotel = {
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

    hotels.add(hotel);
    hotelCounter += 1;

    // Make user a hotel owner
    let updatedUser: User = {
      principal = user.principal;
      isHotelOwner = true;
      totalBookings = user.totalBookings;
      joinedAt = user.joinedAt;
    };
    users.put(msg.caller, updatedUser);

    #ok(hotel.id)
  };

  public query func getHotels() : async [Hotel] {
    Buffer.toArray(hotels)
  };

  public query func getHotel(id: Nat) : async ?Hotel {
    _findHotel(id)
  };

  public query func searchHotels(location: Text, minPrice: Nat, maxPrice: Nat) : async [Hotel] {
    let results = Buffer.Buffer<Hotel>(0);
    for (hotel in hotels.vals()) {
      let locationMatch = Text.contains(Text.toLowercase(hotel.location), #text Text.toLowercase(location));
      let priceMatch = hotel.pricePerNight >= minPrice and hotel.pricePerNight <= maxPrice;
      
      if (locationMatch and priceMatch) {
        results.add(hotel);
      };
    };
    Buffer.toArray(results)
  };

  // Booking System
  public shared(msg) func createBooking(input: BookingInput) : async Result.Result<Nat, ErrorType> {
    switch (_findHotel(input.hotelId)) {
      case null #err(#NotFound);
      case (?hotel) {
        if (hotel.availableRooms < input.roomsBooked) {
          return #err(#InsufficientRooms);
        };

        let nights = Int.abs(input.checkOut - input.checkIn) / (24 * 60 * 60 * 1000000000); // Convert nanoseconds to days
        let totalPrice = hotel.pricePerNight * input.roomsBooked * nights;

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
          status = #active;
          createdAt = Time.now();
        };

        bookings.add(booking);
        bookingCounter += 1;

        // Update hotel availability
        let updatedHotels = Buffer.Buffer<Hotel>(hotels.size());
        for (h in hotels.vals()) {
          if (h.id == input.hotelId) {
            let updatedHotel: Hotel = {
              id = h.id;
              name = h.name;
              location = h.location;
              description = h.description;
              totalRooms = h.totalRooms;
              availableRooms = h.availableRooms - input.roomsBooked;
              pricePerNight = h.pricePerNight;
              amenities = h.amenities;
              images = h.images;
              owner = h.owner;
              rating = h.rating;
              reviewCount = h.reviewCount;
              createdAt = h.createdAt;
            };
            updatedHotels.add(updatedHotel);
          } else {
            updatedHotels.add(h);
          };
        };
        hotels := updatedHotels;

        // Update user booking count
        let user = _getOrCreateUser(msg.caller);
        let updatedUser: User = {
          principal = user.principal;
          isHotelOwner = user.isHotelOwner;
          totalBookings = user.totalBookings + 1;
          joinedAt = user.joinedAt;
        };
        users.put(msg.caller, updatedUser);

        #ok(booking.id)
      };
    };
  };

  public shared(msg) func cancelBooking(bookingId: Nat) : async Result.Result<Bool, ErrorType> {
    let updatedBookings = Buffer.Buffer<Booking>(bookings.size());
    var found = false;
    var hotelId: Nat = 0;
    var roomsToRestore: Nat = 0;

    for (booking in bookings.vals()) {
      if (booking.id == bookingId and booking.bookedBy == msg.caller) {
        if (booking.status == #active) {
          let cancelledBooking: Booking = {
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
          updatedBookings.add(cancelledBooking);
          found := true;
          hotelId := booking.hotelId;
          roomsToRestore := booking.roomsBooked;
        } else {
          updatedBookings.add(booking);
        };
      } else {
        updatedBookings.add(booking);
      };
    };

    if (not found) {
      return #err(#NotFound);
    };

    bookings := updatedBookings;

    // Restore hotel room availability
    let updatedHotels = Buffer.Buffer<Hotel>(hotels.size());
    for (hotel in hotels.vals()) {
      if (hotel.id == hotelId) {
        let updatedHotel: Hotel = {
          id = hotel.id;
          name = hotel.name;
          location = hotel.location;
          description = hotel.description;
          totalRooms = hotel.totalRooms;
          availableRooms = hotel.availableRooms + roomsToRestore;
          pricePerNight = hotel.pricePerNight;
          amenities = hotel.amenities;
          images = hotel.images;
          owner = hotel.owner;
          rating = hotel.rating;
          reviewCount = hotel.reviewCount;
          createdAt = hotel.createdAt;
        };
        updatedHotels.add(updatedHotel);
      } else {
        updatedHotels.add(hotel);
      };
    };
    hotels := updatedHotels;

    #ok(true)
  };

  public shared(msg) func getMyBookings() : async [Booking] {
    let myBookings = Buffer.Buffer<Booking>(0);
    for (booking in bookings.vals()) {
      if (booking.bookedBy == msg.caller) {
        myBookings.add(booking);
      };
    };
    Buffer.toArray(myBookings)
  };

  // Review System
  public shared(msg) func addReview(input: ReviewInput) : async Result.Result<Nat, ErrorType> {
    // Validate rating (1-5 stars)
    if (input.rating < 1 or input.rating > 5) {
      return #err(#InvalidInput);
    };

    switch (_findHotel(input.hotelId)) {
      case null #err(#NotFound);
      case (?hotel) {
        // Check if user has completed a booking at this hotel
        var hasStayed = false;
        for (booking in bookings.vals()) {
          if (booking.hotelId == input.hotelId and booking.bookedBy == msg.caller and booking.status == #completed) {
            hasStayed := true;
          };
        };

        // For development, allow reviews without completed bookings
        // if (not hasStayed) {
        //   return #err(#Unauthorized);
        // };

        let review: Review = {
          id = reviewCounter;
          hotelId = input.hotelId;
          reviewedBy = msg.caller;
          rating = input.rating;
          comment = input.comment;
          createdAt = Time.now();
        };

        reviews.add(review);
        reviewCounter += 1;

        // Update hotel rating
        _updateHotelRating(input.hotelId);

        #ok(review.id)
      };
    };
  };

  public query func getHotelReviews(hotelId: Nat) : async [Review] {
    let hotelReviews = Buffer.Buffer<Review>(0);
    for (review in reviews.vals()) {
      if (review.hotelId == hotelId) {
        hotelReviews.add(review);
      };
    };
    Buffer.toArray(hotelReviews)
  };

  // User Management
  public shared(msg) func getUserProfile() : async User {
    _getOrCreateUser(msg.caller)
  };

  // Platform Analytics
  public query func getPlatformStats() : async PlatformStats {
    {
      totalHotels = hotels.size();
      totalBookings = bookings.size();
      totalUsers = users.size();
    }
  };

  // System functions for upgrade
  system func preupgrade() {
    // Stable variables are automatically persisted
  };

  system func postupgrade() {
    // Reinitialize data structures if needed
  };
}
