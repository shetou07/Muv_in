import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";

actor class MuvIn() = this {

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

  // Storage
  stable var hotels = Buffer.Buffer<Hotel>(0);
  stable var bookings = Buffer.Buffer<Booking>(0);
  stable var hotelCounter: Nat = 0;
  stable var bookingCounter: Nat = 0;

  // Add a hotel
  public func addHotel(
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
      owner = caller;
    };
    hotels.add(newHotel);
    hotelCounter += 1;
    return newHotel.id;
  };

  // View all hotels
  public query func getHotels(): async [Hotel] {
    return Buffer.toArray(hotels)
  };

  // View a single hotel by ID
  public query func getHotel(id: Nat): async ?Hotel {
    for (hotel in hotels.vals()) {
      if (hotel.id == id) return ?hotel;
    };
    return null;
  };

  // Book a room at a hotel
  public func bookHotel(hotelId: Nat, nights: Nat): async Text {
    var found = false;

    for (i in Iter.range(0, hotels.size() - 1)) {
      let hotel = hotels.get(i);
      if (hotel.id == hotelId and hotel.availableRooms > 0) {
        // Update available rooms
        let updatedHotel = {
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
          bookedBy = caller;
          timestamp = Time.now();
          nights = nights;
          totalPrice = total;
        };
        bookings.add(booking);
        bookingCounter += 1;

        found := true;
        break;
      };
    };

    if (found) {
      return "Booking successful";
    } else {
      return "Hotel not found or no rooms available";
    };
  };

  // View your bookings
  public query func getMyBookings(): async [Booking] {
    let result = Buffer.Buffer<Booking>(0);
    for (b in bookings.vals()) {
      if (b.bookedBy == caller) {
        result.add(b);
      };
    };
    return Buffer.toArray(result)
  };

  // Cancel a booking
  public func cancelBooking(bookingId: Nat): async Text {
    var bookingOpt: ?Booking = null;
    var bookingIndex: Nat = 0;

    // Find the booking
    for (i in Iter.range(0, bookings.size() - 1)) {
      let b = bookings.get(i);
      if (b.id == bookingId and b.bookedBy == caller) {
        bookingOpt := ?b;
        bookingIndex := i;
        break;
      };
    };

    switch (bookingOpt) {
      case null return "Booking not found or not yours";
      case (?booking) {
        // Remove booking (overwrite with last element)
        let lastIndex = bookings.size() - 1;
        if (bookingIndex != lastIndex) {
          let last = bookings.get(lastIndex);
          bookings.put(bookingIndex, last);
        };
        bookings.removeLast();

        // Restore room to hotel
        for (i in Iter.range(0, hotels.size() - 1)) {
          let h = hotels.get(i);
          if (h.id == booking.hotelId) {
            let updatedHotel = {
              id = h.id;
              name = h.name;
              location = h.location;
              description = h.description;
              totalRooms = h.totalRooms;
              availableRooms = h.availableRooms + 1;
              pricePerNight = h.pricePerNight;
              owner = h.owner;
            };
            hotels.put(i, updatedHotel);
            break;
          };
        };

        return "Booking cancelled";
      };
    };
  };

};
