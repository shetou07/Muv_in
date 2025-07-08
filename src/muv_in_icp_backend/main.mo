import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Debug "mo:base/Debug";

actor MuvIn {

  type Hotel = {
    id: Nat;
    name: Text;
    location: Text;
    description: Text;
    totalRooms: Nat;
    pricePerNight: Nat;
    availableRooms: Nat;
    owner: Principal;
  };

  type Booking = {
    hotelId: Nat;
    bookedBy: Principal;
    date: Time.Time;
    nights: Nat;
    totalPrice: Nat;
  };

  stable var hotels: [Hotel] = [];
  stable var bookings: [Booking] = [];
  stable var hotelCounter: Nat = 0;

  // Add a new hotel
  public func addHotel(
    name: Text,
    location: Text,
    description: Text,
    totalRooms: Nat,
    pricePerNight: Nat
  ): async Nat {
    let id = hotelCounter;
    hotelCounter += 1;

    let hotel: Hotel = {
      id = id;
      name = name;
      location = location;
      description = description;
      totalRooms = totalRooms;
      availableRooms = totalRooms;
      pricePerNight = pricePerNight;
      owner = caller;
    };

    hotels := Array.append(hotels, [hotel]);
    return id;
  };

  // Get all hotels
  public query func getHotels(): async [Hotel] {
    return hotels;
  };

  // Get hotel by ID
  public query func getHotel(id: Nat): async ?Hotel {
    hotels.find(func (h) { h.id == id });
  };

  // Book a hotel
  public func bookHotel(hotelId: Nat, nights: Nat): async Text {
    let optHotel = hotels.find(func (h) { h.id == hotelId });

    switch (optHotel) {
      case (null) return "Hotel not found";
      case (?hotel) {
        if (hotel.availableRooms == 0) {
          return "No rooms available";
        };

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

        hotels := hotels.map(func (h) {
          if (h.id == hotelId) { updatedHotel } else { h }
        });

        let booking: Booking = {
          hotelId = hotelId;
          bookedBy = caller;
          date = Time.now();
          nights = nights;
          totalPrice = nights * hotel.pricePerNight;
        };

        bookings := Array.append(bookings, [booking]);
        return "Booking successful";
      }
    }
  };

  // Get bookings for the caller
  public query func getMyBookings(): async [Booking] {
    bookings.filter(func (b) { b.bookedBy == caller });
  };

  // Cancel a booking (simple version — no refund, just frees a room)
  public func cancelBooking(hotelId: Nat): async Text {
    let maybeBookingIndex = bookings.findIndex(func (b) {
      b.hotelId == hotelId and b.bookedBy == caller
    });

    switch (maybeBookingIndex) {
      case (null) return "No such booking";
      case (?index) {
        bookings := Array.filter<Bookings.Booking>(bookings, func (b, i) {
          i != index
        });

        hotels := hotels.map(func (h) {
          if (h.id == hotelId) {
            {
              id = h.id;
              name = h.name;
              location = h.location;
              description = h.description;
              totalRooms = h.totalRooms;
              availableRooms = h.availableRooms + 1;
              pricePerNight = h.pricePerNight;
              owner = h.owner;
            }
          } else {
            h
          }
        });

        return "Booking cancelled";
      }
    }
  };
};
