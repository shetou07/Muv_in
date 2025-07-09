import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Array "mo:base/Array";

actor MuvIn {

  // Types
  type Hotel = {
    id: Nat;
    name: Text;
    location: Text;
    description: Text;
    totalRooms: Nat;
    availableRooms: Nat;
    pricePerNight: Nat;
    owner: Principal;
  };

  type Booking = {
    id: Nat;
    hotelId: Nat;
    bookedBy: Principal;
    timestamp: Time.Time;
    nights: Nat;
    totalPrice: Nat;
  };

  // Storage - Buffers cannot be stable
  private var hotels = Buffer.Buffer<Hotel>(0);
  private var bookings = Buffer.Buffer<Booking>(0);
  private stable var hotelCounter: Nat = 0;
  private stable var bookingCounter: Nat = 0;

  // Stable storage for upgrade persistence
  private stable var stableHotels: [Hotel] = [];
  private stable var stableBookings: [Booking] = [];

  // System upgrade hooks
  system func preupgrade() {
    stableHotels := Buffer.toArray(hotels);
    stableBookings := Buffer.toArray(bookings);
  };

  system func postupgrade() {
    hotels := Buffer.fromArray<Hotel>(stableHotels);
    bookings := Buffer.fromArray<Booking>(stableBookings);
    stableHotels := [];
    stableBookings := [];
  };

  // Add a hotel
  public shared(msg) func addHotel(
    name: Text,
    location: Text,
    description: Text,
    totalRooms: Nat,
    pricePerNight: Nat
  ): async Nat {
    let newHotel: Hotel = {
      id = hotelCounter;
      name;
      location;
      description;
      totalRooms;
      availableRooms = totalRooms;
      pricePerNight;
      owner = msg.caller;
    };
    hotels.add(newHotel);
    hotelCounter += 1;
    return newHotel.id;
  };

  // View all hotels
  public query func getHotels(): async [Hotel] {
    return Buffer.toArray(hotels);
  };

  // View a single hotel by ID
  public query func getHotel(id: Nat): async ?Hotel {
    for (hotel in hotels.vals()) {
      if (hotel.id == id) return ?hotel;
    };
    return null;
  };

  // Book a room at a hotel
  public shared(msg) func bookHotel(hotelId: Nat, nights: Nat): async Text {
    // Input validation
    if (nights == 0) {
      return "Number of nights must be greater than 0";
    };

    // Find hotel by ID and update if available
    for (i in Iter.range(0, hotels.size() - 1)) {
      if (i < hotels.size()) {
        let hotel = hotels.get(i);
        if (hotel.id == hotelId and hotel.availableRooms > 0) {
          // Update available rooms
          let updatedHotel: Hotel = {
            id = hotel.id;
            name = hotel.name;
            location = hotel.location;
            description = hotel.description;
            totalRooms = hotel.totalRooms;
            availableRooms = hotel.availableRooms - 1;
            pricePerNight = hotel.pricePerNight;
            owner = hotel.owner;
          };
          hotels.put(i, updatedHotel);

          // Create booking
          let total = hotel.pricePerNight * nights;
          let booking: Booking = {
            id = bookingCounter;
            hotelId = hotelId;
            bookedBy = msg.caller;
            timestamp = Time.now();
            nights = nights;
            totalPrice = total;
          };
          bookings.add(booking);
          bookingCounter += 1;

          return "Booking successful";
        };
      };
    };

    return "Hotel not found or no rooms available";
  };

  // View your bookings
  public shared(msg) func getMyBookings(): async [Booking] {
    let result = Buffer.Buffer<Booking>(0);
    for (b in bookings.vals()) {
      if (b.bookedBy == msg.caller) {
        result.add(b);
      };
    };
    return Buffer.toArray(result);
  };

  // Cancel a booking
  public shared(msg) func cancelBooking(bookingId: Nat): async Text {
    var foundBooking: ?Booking = null;

    // Find the booking
    for (b in bookings.vals()) {
      if (b.id == bookingId and b.bookedBy == msg.caller) {
        foundBooking := ?b;
      };
    };

    switch (foundBooking) {
      case null return "Booking not found or not yours";
      case (?booking) {
        // Remove booking using filter approach
        let newBookings = Buffer.Buffer<Booking>(0);
        for (b in bookings.vals()) {
          if (b.id != bookingId) {
            newBookings.add(b);
          };
        };
        bookings := newBookings;

        // Restore room to hotel
        for (i in Iter.range(0, hotels.size() - 1)) {
          if (i < hotels.size()) {
            let hotel = hotels.get(i);
            if (hotel.id == booking.hotelId) {
              let updatedHotel: Hotel = {
                id = hotel.id;
                name = hotel.name;
                location = hotel.location;
                description = hotel.description;
                totalRooms = hotel.totalRooms;
                availableRooms = hotel.availableRooms + 1;
                pricePerNight = hotel.pricePerNight;
                owner = hotel.owner;
              };
              hotels.put(i, updatedHotel);
            };
          };
        };

        return "Booking cancelled";
      };
    };
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