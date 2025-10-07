import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import {
  getAdminRequestDetails,
  getPassengerDetails,
  addTravelOptions,
  bookTravelRequest,
} from "../../utils/api";

const DetailItem = ({ label, value, className = "" }) => (
  <div className={className}>
    <p className="text-sm text-base-content/70">{label}</p>
    <p className="font-semibold">{value || "N/A"}</p>
  </div>
);

const FileViewer = ({ fileUrl }) => {
  if (!fileUrl) return null;

  if (fileUrl.endsWith(".pdf")) {
    const fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
    return (
      <div className="space-y-2">
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="link link-primary"
        >
          {fileName}
        </a>
      </div>
    );
  } else {
    return (
      <img src={fileUrl} alt="document" className="max-w-[200px] rounded-lg" />
    );
  }
};

const BookedDetailsView = ({ booking }) => {
  if (!booking) {
    return (
      <p className="text-center text-info">
        No booking information available for this request.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-lg">Booking Confirmation</h4>

      {/* Flight Bookings */}
      {booking.flightBookings?.length > 0 && (
        <div className="p-4 bg-base-200 rounded-lg">
          <h5 className="font-semibold mb-2">Confirmed Flights</h5>
          <div className="space-y-3">
            {booking.flightBookings.map((flight, index) => (
              <div key={index} className="p-3 border rounded-lg bg-base-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">
                      PNR: {flight.pnrNumber || "N/A"}
                    </p>
                  </div>
                  {flight.ticketUrl && (
                    <a
                      href={flight.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline btn-primary"
                    >
                      Download Ticket
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hotel Bookings */}
      {booking.hotelBookings?.length > 0 && (
        <div className="p-4 bg-base-200 rounded-lg">
          <h5 className="font-semibold mb-2">Confirmed Hotels</h5>
          <div className="space-y-3">
            {booking.hotelBookings.map((hotel, index) => (
              <div key={index} className="p-3 border rounded-lg bg-base-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{hotel.hotelName || "N/A"}</p>
                    <p className="text-sm">{hotel.location || "N/A"}</p>
                  </div>
                  {hotel.confirmationUrl && (
                    <a
                      href={hotel.confirmationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline btn-primary"
                    >
                      Download Confirmation
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Remarks */}
      {booking.remarks && (
        <DetailItem label="Booking Remarks" value={booking.remarks} />
      )}
    </div>
  );
};

const BookingView = ({ request, onClose }) => {
  const queryClient = useQueryClient();
  const [flightBookings, setFlightBookings] = useState([
    { pnrNumber: "", file: null },
  ]);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [generalRemarks, setGeneralRemarks] = useState("");

  const { mutate: bookRequest, isPending: isBooking } = useMutation({
    mutationFn: bookTravelRequest,
    onSuccess: () => {
      toast.success("Request booked successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminTravelRequests"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      onClose();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to book request."),
  });

  // --- Flight Booking Handlers ---
  const handleFlightBookingChange = (index, field, value) => {
    const newFlightBookings = [...flightBookings];
    newFlightBookings[index][field] = value;
    setFlightBookings(newFlightBookings);
  };

  const addFlightBooking = () => {
    setFlightBookings([...flightBookings, { pnrNumber: "", file: null }]);
  };

  const removeFlightBooking = (index) => {
    const newFlightBookings = [...flightBookings];
    newFlightBookings.splice(index, 1);
    setFlightBookings(newFlightBookings);
  };

  // --- Hotel Booking Handlers ---
  const handleHotelBookingChange = (index, field, value) => {
    const newHotelBookings = [...hotelBookings];
    newHotelBookings[index][field] = value;
    setHotelBookings(newHotelBookings);
  };

  const addHotelBooking = () => {
    setHotelBookings([
      ...hotelBookings,
      { hotelName: "", location: "", file: null },
    ]);
  };

  const removeHotelBooking = (index) => {
    const newHotelBookings = [...hotelBookings];
    newHotelBookings.splice(index, 1);
    setHotelBookings(newHotelBookings);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (flightBookings.length > 0 && flightBookings.some((fb) => !fb.file)) {
      toast.error(
        "Please upload a ticket for each flight booking confirmation."
      );
      return;
    }

    // Create booking data without modifying the original arrays
    const bookingData = {
      remarks: generalRemarks,
      flightBookings: flightBookings.map(({ pnrNumber }) => ({ pnrNumber })),
      hotelBookings: hotelBookings.map(({ hotelName, location }) => ({
        hotelName,
        location,
      })),
    };

    bookRequest({
      requestId: request._id,
      bookingData,
      flightFiles: flightBookings.map((fb) => fb.file),
      hotelFiles: hotelBookings.map((hb) => hb.file),
    });
  };

  const { data: passengers, isLoading } = useQuery({
    queryKey: ["passengerDetails", request._id],
    queryFn: () =>
      getPassengerDetails(request.passengers.map((p) => p.employeeId)),
    enabled: !!request,
  });

  const selectedFlights =
    request.flightOptions.filter((opt) =>
      request.selectedFlightOptionIds.includes(opt._id)
    ) || [];

  const selectedHotels =
    request.hotelOptions.filter((opt) =>
      request.selectedHotelOptionIds.includes(opt._id)
    ) || [];

  if (isLoading) {
    return <span className="loading loading-spinner"></span>;
  }

  return (
    <div className="space-y-4">
      <h4 className="font-bold text-lg">Process Booking</h4>

      {/* Passenger Details */}
      <div className="p-4 bg-base-200 rounded-lg">
        <h5 className="font-semibold mb-2">Passenger Information</h5>
        {passengers?.map((pax) => (
          <div key={pax._id} className="text-sm border-b last:border-b-0 py-2">
            <p>
              <strong>{pax.name}</strong> ({pax.employeeId})
            </p>
            <p>
              {pax.email} | {pax.phoneNumber} | Age: {pax.age}
            </p>
          </div>
        ))}
      </div>

      {/* Selected Options */}
      <div className="p-4 bg-base-200 rounded-lg">
        <h5 className="font-semibold mb-2">Employee's Selected Options</h5>
        {selectedFlights.length > 0 && (
          <div className="mb-2">
            <h6 className="font-medium">Flights:</h6>
            <ul className="list-disc list-inside text-sm">
              {selectedFlights.map((f) => (
                <li key={f._id}>
                  {f.airline} {f.flightNumber} ({f.fromCity} to {f.toCity})
                </li>
              ))}
            </ul>
          </div>
        )}
        {selectedHotels.length > 0 && (
          <div>
            <h6 className="font-medium">Hotels:</h6>
            <ul className="list-disc list-inside text-sm">
              {selectedHotels.map((h) => (
                <li key={h._id}>
                  {h.name} in {h.location}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Employee Documents */}
      {request.employeeDocuments?.length > 0 && (
        <div className="p-4 bg-base-200 rounded-lg">
          <h5 className="font-semibold mb-2">Employee Documents</h5>
          <div className="flex flex-wrap gap-2">
            {request.employeeDocuments.map((doc, i) => (
              <a
                key={i}
                href={doc}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline"
              >
                View Document {i + 1}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Booking Form */}
      <form onSubmit={handleBookingSubmit}>
        <div className="divider">Enter Flight Confirmations</div>
        {flightBookings.map((booking, index) => (
          <div
            key={index}
            className="p-4 mb-4 bg-base-200 rounded-lg space-y-2 relative"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="PNR Number"
                className="input input-bordered"
                value={booking.pnrNumber}
                onChange={(e) =>
                  handleFlightBookingChange(index, "pnrNumber", e.target.value)
                }
              />
              <input
                type="file"
                className="file-input file-input-bordered"
                onChange={(e) =>
                  handleFlightBookingChange(index, "file", e.target.files[0])
                }
              />
            </div>
            {flightBookings.length > 1 && (
              <button
                type="button"
                className="btn btn-xs btn-error btn-circle absolute -top-2 -right-2"
                onClick={() => removeFlightBooking(index)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="btn btn-sm btn-outline w-full mb-4"
          onClick={addFlightBooking}
        >
          Add Another Flight Booking
        </button>

        <div className="divider">Enter Hotel Confirmations</div>
        {hotelBookings.map((booking, index) => (
          <div
            key={index}
            className="p-4 mb-4 bg-base-200 rounded-lg space-y-2 relative"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Hotel Name"
                className="input input-bordered"
                value={booking.hotelName}
                onChange={(e) =>
                  handleHotelBookingChange(index, "hotelName", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Location"
                className="input input-bordered"
                value={booking.location}
                onChange={(e) =>
                  handleHotelBookingChange(index, "location", e.target.value)
                }
              />
              <input
                type="file"
                className="file-input file-input-bordered"
                onChange={(e) =>
                  handleHotelBookingChange(index, "file", e.target.files[0])
                }
              />
            </div>
            <button
              type="button"
              className="btn btn-xs btn-error btn-circle absolute -top-2 -right-2"
              onClick={() => removeHotelBooking(index)}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-sm btn-outline w-full"
          onClick={addHotelBooking}
        >
          Add Hotel Booking
        </button>

        <div className="divider">General Remarks</div>
        <textarea
          placeholder="General booking remarks (optional)"
          className="textarea textarea-bordered w-full"
          value={generalRemarks}
          onChange={(e) => setGeneralRemarks(e.target.value)}
        ></textarea>

        <div className="text-right mt-6">
          <button
            type="submit"
            className="btn btn-success"
            disabled={isBooking}
          >
            {isBooking ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Confirm All Bookings"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const AdminRequestDetailsModal = ({ requestId, onClose }) => {
  const queryClient = useQueryClient();
  const [flightOptions, setFlightOptions] = useState([]);
  const [hotelOptions, setHotelOptions] = useState([]);
  const [cabOptions, setCabOptions] = useState([]);

  const initialFlightOption = {
    airline: "",
    flightNumber: "",
    fromCity: "",
    toCity: "",
    departure: "",
    arrival: "",
    price: "",
  };

  const initialHotelOption = {
    name: "",
    location: "",
    checkInDate: "",
    checkOutDate: "",
    price: "",
  };

  const initialCabOption = {
    provider: "",
    cabType: "",
    pickupLocation: "",
    dropLocation: "",
    pickupDateTime: "",
    price: "",
  };

  const { data: request, isLoading } = useQuery({
    queryKey: ["adminRequestDetails", requestId],
    queryFn: () => getAdminRequestDetails(requestId),
    enabled: !!requestId,
  });

  // --- Flight Option Handlers ---
  const addFlightOption = () => {
    setFlightOptions([...flightOptions, { ...initialFlightOption }]);
  };

  const removeFlightOption = (index) => {
    const newFlightOptions = [...flightOptions];
    newFlightOptions.splice(index, 1);
    setFlightOptions(newFlightOptions);
  };

  const handleFlightChange = (index, field, value) => {
    const newFlightOptions = [...flightOptions];
    newFlightOptions[index][field] = value;
    setFlightOptions(newFlightOptions);
  };

  // --- Hotel Option Handlers ---
  const addHotelOption = () => {
    setHotelOptions([...hotelOptions, { ...initialHotelOption }]);
  };

  const removeHotelOption = (index) => {
    const newHotelOptions = [...hotelOptions];
    newHotelOptions.splice(index, 1);
    setHotelOptions(newHotelOptions);
  };

  const handleHotelChange = (index, field, value) => {
    const newHotelOptions = [...hotelOptions];
    newHotelOptions[index][field] = value;
    setHotelOptions(newHotelOptions);
  };

  // --- Cab Option Handlers ---
  const addCabOption = () => {
    setCabOptions([...cabOptions, { ...initialCabOption }]);
  };

  const removeCabOption = (index) => {
    const newCabOptions = [...cabOptions];
    newCabOptions.splice(index, 1);
    setCabOptions(newCabOptions);
  };

  const handleCabChange = (index, field, value) => {
    const newCabOptions = [...cabOptions];
    newCabOptions[index][field] = value;
    setCabOptions(newCabOptions);
  };

  const { mutate: submitOptions, isPending } = useMutation({
    mutationFn: addTravelOptions,
    onSuccess: () => {
      toast.success("Options sent to employee successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminTravelRequests"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      onClose();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to submit options."),
  });

  const handleSubmit = () => {
    // Add currency field and ensure all required fields
    const validFlightOptions = flightOptions
      .filter(
        (flight) =>
          flight.airline &&
          flight.flightNumber &&
          flight.fromCity &&
          flight.toCity &&
          flight.departure &&
          flight.arrival &&
          flight.price
      )
      .map((flight) => ({
        ...flight,
        price: Number(flight.price),
        currency: "INR", // Add default currency
      }));

    const validHotelOptions = hotelOptions
      .filter(
        (hotel) =>
          hotel.name &&
          hotel.location &&
          hotel.checkInDate &&
          hotel.checkOutDate &&
          hotel.price
      )
      .map((hotel) => ({
        ...hotel,
        price: Number(hotel.price),
        currency: "INR", // Add default currency
      }));

    const validCabOptions = cabOptions
      .filter(
        (cab) =>
          cab.provider &&
          cab.pickupLocation &&
          cab.dropLocation &&
          cab.pickupDateTime &&
          cab.price
      )
      .map((cab) => ({
        ...cab,
        price: Number(cab.price),
        currency: "INR",
      }));

    // Log the data being sent
    console.log("Submitting options:", {
      requestId,
      flightOptions: validFlightOptions,
      hotelOptions: validHotelOptions,
      cabOptions: validCabOptions,
    });

    // Validate at least one option is present
    if (
      validFlightOptions.length === 0 &&
      validHotelOptions.length === 0 &&
      validCabOptions.length === 0
    ) {
      toast.error("Please add at least one complete flight or hotel option.");
      return;
    }

    // Check if all required fields have values
    const hasInvalidPrice = [
      ...validFlightOptions,
      ...validHotelOptions,
      ...validCabOptions,
    ].some((option) => !option.price || option.price <= 0);

    if (hasInvalidPrice) {
      toast.error("All prices must be greater than 0.");
      return;
    }

    submitOptions({
      requestId,
      flightOptions: validFlightOptions,
      hotelOptions: validHotelOptions,
      cabOptions: validCabOptions,
    });
  };

  const renderEmployeeRequest = () => (
    <div className="space-y-4">
      {/* Request Overview */}
      <div className="p-4 bg-base-200 rounded-lg">
        <h4 className="font-bold text-lg mb-2">Request Overview</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <DetailItem label="Requester" value={request.requesterId?.name} />
          <DetailItem
            label="Employee ID"
            value={request.requesterId?.employeeId}
          />
          <DetailItem label="Journey Type" value={request.journeyType} />
          <DetailItem label="Passengers" value={request.noOfPax} />
          <DetailItem
            label="Status"
            value={request.status}
            className="capitalize"
          />
        </div>
      </div>

      {/* Flight Preferences */}
      {request.flightDetails?.length > 0 && (
        <div className="p-4 bg-base-200 rounded-lg">
          <h4 className="font-bold text-lg mb-2">
            Employee's Flight Preferences
          </h4>
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Departure</th>
                  {request.journeyType === "return" && <th>Return</th>}
                  <th>Time Pref.</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {request.flightDetails.map((flight, index) => (
                  <tr key={index} className="hover">
                    <td>{flight.fromCity}</td>
                    <td>{flight.toCity}</td>
                    <td>
                      {flight.departureDate
                        ? format(new Date(flight.departureDate), "PP")
                        : "N/A"}
                    </td>
                    {request.journeyType === "return" && (
                      <td>
                        {flight.returnDate
                          ? format(new Date(flight.returnDate), "PP")
                          : "N/A"}
                      </td>
                    )}
                    <td>{flight.preferredTime || "Any"}</td>
                    <td className="capitalize">{flight.travelCategory}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hotel Preferences */}
      {request.hotelDetails?.length > 0 && (
        <div className="p-4 bg-base-200 rounded-lg">
          <h4 className="font-bold text-lg mb-2">
            Employee's Hotel Preferences
          </h4>
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Hotel Name (Optional)</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {request.hotelDetails.map((hotel, index) => (
                  <tr key={index} className="hover">
                    <td>{hotel.location}</td>
                    <td>
                      {hotel.checkInDate
                        ? format(new Date(hotel.checkInDate), "PP")
                        : "N/A"}
                    </td>
                    <td>
                      {hotel.checkOutDate
                        ? format(new Date(hotel.checkOutDate), "PP")
                        : "N/A"}
                    </td>
                    <td>{hotel.hotelName || "Any"}</td>
                    <td>{hotel.remarks || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cab Preferences */}
      {request.cabDetails?.length > 0 && (
        <div className="p-4 bg-base-200 rounded-lg">
          <h4 className="font-bold text-lg mb-2">Employee's Cab Preferences</h4>
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr>
                  <th>Pickup Location</th>
                  <th>Dropoff Location</th>
                  <th>Pickup Date</th>
                  <th>Pickup Time</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {request.cabDetails.map((cab, index) => (
                  <tr key={index} className="hover">
                    <td>{cab.pickupLocation}</td>
                    <td>{cab.dropLocation}</td>
                    <td>
                      {cab.pickupDate
                        ? format(new Date(cab.pickupDate), "PP")
                        : "N/A"}
                    </td>
                    <td>{cab.pickupTime || "N/A"}</td>
                    <td>{cab.remarks || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Employee Documents */}
      {request.employeeDocuments?.length > 0 && (
        <div className="p-4 bg-base-200 rounded-lg">
          <h4 className="font-bold text-lg mb-2">Employee Documents</h4>
          <div className="flex flex-wrap gap-4">
            {request.employeeDocuments.map((docUrl, index) => (
              <div
                key={index}
                className="p-2 bg-base-100 rounded-lg text-center"
              >
                <p className="text-sm font-medium mb-2">Document {index + 1}</p>
                <FileViewer fileUrl={docUrl} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Passenger List */}
      {request.passengerDetails?.length > 0 && (
        <div className="p-4 bg-base-200 rounded-lg">
          <h4 className="font-bold text-lg mb-2">Passenger List</h4>
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Employee ID</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {request.passengerDetails.map((pax) => (
                  <tr key={pax.employeeId} className="hover">
                    <td>{pax.name}</td>
                    <td>{pax.employeeId}</td>
                    <td>{pax.age}</td>
                    <td className="capitalize">{pax.gender}</td>
                    <td>{pax.phoneNumber}</td>
                    <td>{pax.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Remarks */}
      {request.remarks && (
        <div className="p-4 bg-base-200 rounded-lg">
          <h4 className="font-bold text-lg mb-2">Employee Remarks</h4>
          <p>{request.remarks}</p>
        </div>
      )}
    </div>
  );

  const renderOptionsForm = () => (
    <div className="space-y-4">
      <h4 className="font-bold text-lg">Provide Travel Options</h4>
      {/* Flight Options Form */}
      <div className="p-4 border rounded-lg space-y-4">
        <h5 className="font-semibold">Flight Options (Individual Segments)</h5>
        {flightOptions.map((flight, index) => (
          <div
            key={index}
            className="p-2 border-l-2 border-orange-500 space-y-2 relative"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Airline"
                className="input input-bordered input-sm"
                value={flight.airline}
                onChange={(e) =>
                  handleFlightChange(index, "airline", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Flight No."
                className="input input-bordered input-sm"
                value={flight.flightNumber}
                onChange={(e) =>
                  handleFlightChange(index, "flightNumber", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="From"
                className="input input-bordered input-sm"
                value={flight.fromCity}
                onChange={(e) =>
                  handleFlightChange(index, "fromCity", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="To"
                className="input input-bordered input-sm"
                value={flight.toCity}
                onChange={(e) =>
                  handleFlightChange(index, "toCity", e.target.value)
                }
              />
              <input
                type="datetime-local"
                placeholder="Departure"
                className="input input-bordered input-sm"
                value={flight.departure}
                onChange={(e) =>
                  handleFlightChange(index, "departure", e.target.value)
                }
              />
              <input
                type="datetime-local"
                placeholder="Arrival"
                className="input input-bordered input-sm"
                value={flight.arrival}
                onChange={(e) =>
                  handleFlightChange(index, "arrival", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="Price"
                className="input input-bordered input-sm"
                value={flight.price}
                onChange={(e) =>
                  handleFlightChange(index, "price", e.target.value)
                }
              />
            </div>
            {flightOptions.length > 0 && (
              <button
                type="button"
                className="btn btn-xs btn-error btn-circle absolute -top-1 -right-1"
                onClick={() => removeFlightOption(index)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button className="btn btn-sm btn-outline" onClick={addFlightOption}>
          Add Flight Option
        </button>
      </div>

      {/* Hotel Options Form */}
      <div className="p-4 border rounded-lg space-y-4">
        <h5 className="font-semibold">Hotel Options (Individual Stays)</h5>
        {hotelOptions.map((hotel, index) => (
          <div
            key={index}
            className="p-2 border-l-2 border-white space-y-2 relative"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Hotel Name"
                className="input input-bordered input-sm"
                value={hotel.name}
                onChange={(e) =>
                  handleHotelChange(index, "name", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Location"
                className="input input-bordered input-sm"
                value={hotel.location}
                onChange={(e) =>
                  handleHotelChange(index, "location", e.target.value)
                }
              />
              <input
                type="date"
                placeholder="Check-in"
                className="input input-bordered input-sm"
                value={hotel.checkInDate}
                onChange={(e) =>
                  handleHotelChange(index, "checkInDate", e.target.value)
                }
              />
              <input
                type="date"
                placeholder="Check-out"
                className="input input-bordered input-sm"
                value={hotel.checkOutDate}
                onChange={(e) =>
                  handleHotelChange(index, "checkOutDate", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="Price"
                className="input input-bordered input-sm"
                value={hotel.price}
                onChange={(e) =>
                  handleHotelChange(index, "price", e.target.value)
                }
              />
            </div>
            {hotelOptions.length > 0 && (
              <button
                type="button"
                className="btn btn-xs btn-error btn-circle absolute -top-1 -right-1"
                onClick={() => removeHotelOption(index)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button className="btn btn-sm btn-outline" onClick={addHotelOption}>
          Add Hotel
        </button>
      </div>

      {/* Cab Options Form */}
      <div className="p-4 border rounded-lg space-y-4">
        <h5 className="font-semibold">Cab Options</h5>
        {cabOptions.map((cab, index) => (
          <div
            key={index}
            className="p-2 border-l-2 border-green-500 space-y-2 relative"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Provider (e.g., Uber)"
                className="input input-bordered input-sm"
                value={cab.provider}
                onChange={(e) =>
                  handleCabChange(index, "provider", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Cab Type (e.g., Sedan)"
                className="input input-bordered input-sm"
                value={cab.cabType}
                onChange={(e) =>
                  handleCabChange(index, "cabType", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Pickup Location"
                className="input input-bordered input-sm"
                value={cab.pickupLocation}
                onChange={(e) =>
                  handleCabChange(index, "pickupLocation", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Dropoff Location"
                className="input input-bordered input-sm"
                value={cab.dropLocation}
                onChange={(e) =>
                  handleCabChange(index, "dropLocation", e.target.value)
                }
              />
              <input
                type="datetime-local"
                placeholder="Pickup Date & Time"
                className="input input-bordered input-sm"
                value={cab.pickupDateTime}
                onChange={(e) =>
                  handleCabChange(index, "pickupDateTime", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="Price"
                className="input input-bordered input-sm"
                value={cab.price}
                onChange={(e) =>
                  handleCabChange(index, "price", e.target.value)
                }
              />
            </div>
            <button
              type="button"
              className="btn btn-xs btn-error btn-circle absolute -top-1 -right-1"
              onClick={() => removeCabOption(index)}
            >
              ✕
            </button>
          </div>
        ))}
        <button className="btn btn-sm btn-outline" onClick={addCabOption}>
          Add Cab Option
        </button>
      </div>
    </div>
  );

  return (
    <dialog id="admin_request_details_modal" className="modal modal-open">
      <div className="modal-box w-11/12 max-w-5xl">
        <h3 className="font-bold text-xl">Travel Request Details</h3>
        <div className="py-4 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : request ? (
            <>
              {renderEmployeeRequest()}
              <div className="divider"></div>
              {request.status === "booked" && (
                <BookedDetailsView booking={request.booking} />
              )}
              {request.status === "managerApproved" && (
                <BookingView request={request} onClose={onClose} />
              )}
              {request.status === "submitted" && renderOptionsForm()}
              {request.status !== "submitted" &&
                request.status !== "booked" &&
                request.status !== "managerApproved" && (
                  <p className="text-center text-info">
                    This request is not awaiting options or booking.
                  </p>
                )}
            </>
          ) : (
            <p>Could not load request details.</p>
          )}
        </div>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
          {request?.status === "submitted" && (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Send Options to Employee"
              )}
            </button>
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default AdminRequestDetailsModal;
