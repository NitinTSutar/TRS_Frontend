import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Navigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { createTravelRequest, uploadEmployeeDocuments } from "../../utils/api";
import useUserStore from "../../store/userStore";

const CreateRequest = () => {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    journeyType: "oneway",
    noOfPax: 1,
    passengers: [{ employeeId: user?.employeeId || "", remake: "Self" }],
    flightDetails: [
      {
        fromCity: "",
        toCity: "",
        departureDate: "",
        returnDate: "",
        travelCategory: "domestic",
        visaRequired: false,
        returnPreferredTime: "Any",
        preferredTime: "Any",
        seatPreference: "Any",
      },
    ],
    hotelDetails: [],
    cabDetails: [],
    remarks: "",
  });
  const [files, setFiles] = useState([]);

  // Generate time slots for dropdowns
  const timeSlots = ["Any"];
  for (let i = 0; i < 24; i++) {
    const start = i.toString().padStart(2, "0");
    const end = ((i + 1) % 24).toString().padStart(2, "0");
    timeSlots.push(`${start}:00 - ${end}:00`);
  }

  const seatPreferences = ["Any", "Window", "Aisle", "Middle"];

  // Generate guest count for dropdown
  const guestOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: createTravelRequest,
    onSuccess: async (data) => {
      if (files.length > 0) {
        const docFormData = new FormData();
        files.forEach((file) => docFormData.append("documents", file));
        await uploadDocsMutate({ requestId: data._id, formData: docFormData });
      } else {
        toast.success("Travel request created successfully!");
        navigate("/my-requests");
      }
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to create request."),
  });

  const { mutateAsync: uploadDocsMutate, isPending: isUploading } = useMutation(
    {
      mutationFn: uploadEmployeeDocuments,
      onSuccess: () => {
        toast.success("Travel request and documents submitted successfully!");
        navigate("/my-requests");
      },
      onError: (err) =>
        toast.error(
          err?.response?.data?.message || "Failed to upload documents."
        ),
    }
  );

  const handlePaxChange = (e) => {
    const count = parseInt(e.target.value, 10);
    const newPassengers = Array.from({ length: count }, (_, i) =>
      i === 0
        ? { employeeId: user?.employeeId || "", remake: "Self" }
        : { employeeId: "", remake: "" }
    );
    setFormData((prev) => ({
      ...prev,
      noOfPax: count,
      passengers: newPassengers,
    }));
  };

  const handlePassengerIdChange = (index, value) => {
    const newPassengers = [...formData.passengers];
    newPassengers[index].employeeId = value;
    setFormData((prev) => ({ ...prev, passengers: newPassengers }));
  };

  const handleFlightDetailChange = (index, field, value) => {
    const newFlightDetails = [...formData.flightDetails];
    newFlightDetails[index][field] = value;
    setFormData((prev) => ({ ...prev, flightDetails: newFlightDetails }));
  };

  const addFlightSegment = () => {
    setFormData((prev) => ({
      ...prev,
      flightDetails: [
        ...prev.flightDetails,
        {
          fromCity: "",
          toCity: "",
          departureDate: "",
          travelCategory: "domestic",
          visaRequired: false,
          preferredTime: "Any",
          returnPreferredTime: "Any",
          seatPreference: "Any",
        },
      ],
    }));
  };

  const removeFlightSegment = (index) => {
    if (formData.flightDetails.length <= 1) return; // Don't remove the last one
    const newFlightDetails = [...formData.flightDetails];
    newFlightDetails.splice(index, 1);
    setFormData((prev) => ({ ...prev, flightDetails: newFlightDetails }));
  };

  const handleJourneyTypeChange = (e) => {
    const newJourneyType = e.target.value;
    setFormData((p) => ({
      ...p,
      journeyType: newJourneyType,
      flightDetails: [
        {
          fromCity: "",
          toCity: "",
          departureDate: "",
          returnDate: "",
          travelCategory: "domestic",
          visaRequired: false,
          preferredTime: "Any",
          seatPreference: "Any",
        },
      ],
    }));
  };

  const handleHotelDetailChange = (index, field, value) => {
    const newHotelDetails = [...formData.hotelDetails];
    newHotelDetails[index][field] = value;
    setFormData((prev) => ({ ...prev, hotelDetails: newHotelDetails }));
  };

  const addHotel = () => {
    setFormData((prev) => ({
      ...prev,
      hotelDetails: [
        ...prev.hotelDetails,
        {
          city: "",
          checkInDate: "",
          checkOutDate: "",
          guests: 1,
          remarks: "",
        },
      ],
    }));
  };

  const removeHotel = (index) => {
    const newHotelDetails = [...formData.hotelDetails];
    newHotelDetails.splice(index, 1);
    setFormData((prev) => ({ ...prev, hotelDetails: newHotelDetails }));
  };

  const handleCabDetailChange = (index, field, value) => {
    const newCabDetails = [...formData.cabDetails];
    newCabDetails[index][field] = value;
    setFormData((prev) => ({ ...prev, cabDetails: newCabDetails }));
  };

  const addCab = () => {
    setFormData((prev) => ({
      ...prev,
      cabDetails: [
        ...prev.cabDetails,
        {
          pickupLocation: "",
          dropLocation: "",
          pickupDate: "",
          pickupTime: "",
        },
      ],
    }));
  };

  const removeCab = (index) => {
    const newCabDetails = [...formData.cabDetails];
    newCabDetails.splice(index, 1);
    setFormData((prev) => ({ ...prev, cabDetails: newCabDetails }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Helper to format dates safely
    const formatDate = (dateString) => {
      return dateString ? format(new Date(dateString), "dd/MM/yyyy") : "";
    };

    // Format all dates to dd/MM/yyyy for the backend
    const formattedFlightDetails = formData.flightDetails.map((flight) => ({
      ...flight,
      departureDate: formatDate(flight.departureDate),
      returnDate: formatDate(flight.returnDate),
    }));

    const formattedHotelDetails = formData.hotelDetails.map((hotel) => ({
      ...hotel,
      checkInDate: formatDate(hotel.checkInDate),
      checkOutDate: formatDate(hotel.checkOutDate),
    }));

    const formattedCabDetails = formData.cabDetails.map((cab) => ({
      ...cab,
      pickupDate: formatDate(cab.pickupDate),
    }));

    const finalData = {
      ...formData,
      flightDetails: formattedFlightDetails,
      hotelDetails: formattedHotelDetails,
      cabDetails: formattedCabDetails,
      // Use the formatted date for the main travelDate field
      travelDate: formattedFlightDetails[0]?.departureDate
        ? formattedFlightDetails[0].departureDate
        : "",
      // Consolidate visa details into the root field for the backend
      visaDetails: formData.flightDetails
        .filter((f) => f.visaRequired && f.visaCountry)
        .map((f) => f.visaCountry)
        .join(", "),
    };

    finalData.flightDetails.forEach((f) => {
      delete f.visaCountry; // Don't send this temporary field to the backend
    });

    createMutate(finalData);
  };

  if (!user) return <Navigate to="/login" replace />;

  const isPending = isCreating || isUploading;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Travel Request</h1>

        <ul className="steps w-full mb-8">
          <li className={`step ${step >= 1 ? "step-primary" : ""}`}>
            Basic Details
          </li>
          <li className={`step ${step >= 2 ? "step-primary" : ""}`}>
            Itinerary
          </li>
          <li className={`step ${step >= 3 ? "step-primary" : ""}`}>
            Documents & Submit
          </li>
        </ul>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1 */}
          {step === 1 && (
            <div className="card bg-base-100 shadow-lg p-6">
              <div className="space-y-4">
                {" "}
                {/* Added container with vertical spacing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {" "}
                  {/* Increased gap */}
                  <div className="form-control w-full">
                    {" "}
                    {/* Added w-full */}
                    <label className="label block mb-2">
                      {" "}
                      {/* Added block and margin */}
                      <span className="label-text font-medium">
                        Journey Type
                      </span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={formData.journeyType}
                      onChange={handleJourneyTypeChange}
                    >
                      <option value="oneway">One Way</option>
                      <option value="return">Round Trip</option>
                      <option value="multi-city">Multi-city</option>
                    </select>
                  </div>
                  <div className="form-control w-full">
                    {" "}
                    {/* Added w-full */}
                    <label className="label block mb-2">
                      {" "}
                      {/* Added block and margin */}
                      <span className="label-text font-medium">
                        Number of Passengers
                      </span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="input input-bordered w-full"
                      value={formData.noOfPax}
                      onChange={handlePaxChange}
                    />
                  </div>
                </div>
                <div className="divider">Passenger Details</div>
                {formData.passengers.map((pax, index) => (
                  <div key={index} className="form-control w-full">
                    {" "}
                    {/* Added w-full */}
                    <label className="label block mb-2">
                      {" "}
                      {/* Added block and margin */}
                      <span className="label-text font-medium">
                        Passenger {index + 1} Employee ID
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={pax.employeeId}
                      onChange={(e) =>
                        handlePassengerIdChange(index, e.target.value)
                      }
                      disabled={index === 0}
                    />
                  </div>
                ))}
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setStep(2)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="card bg-base-100 shadow-lg p-6">
              {/* Flight Details */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Flight Details</h3>
                  {formData.journeyType === "multi-city" && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={addFlightSegment}
                    >
                      Add Segment
                    </button>
                  )}
                </div>

                {formData.flightDetails.map((flight, index) => (
                  <div
                    key={index}
                    className="space-y-4 border-b pb-6 last:border-b-0 last:pb-0 relative"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="form-control w-full">
                        <label className="label block mb-2">
                          <span className="label-text font-medium">
                            From City
                          </span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={flight.fromCity}
                          onChange={(e) =>
                            handleFlightDetailChange(
                              index,
                              "fromCity",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-control w-full">
                        <label className="label block mb-2">
                          <span className="label-text font-medium">
                            To City
                          </span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={flight.toCity}
                          onChange={(e) =>
                            handleFlightDetailChange(
                              index,
                              "toCity",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-control w-full">
                        <label className="label block mb-2">
                          <span className="label-text font-medium">
                            Departure Date
                          </span>
                        </label>
                        <input
                          type="date"
                          className="input input-bordered w-full"
                          value={flight.departureDate}
                          onChange={(e) =>
                            handleFlightDetailChange(
                              index,
                              "departureDate",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="form-control w-full">
                        <label className="label block mb-2">
                          <span className="label-text font-medium">
                            Travel Category
                          </span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={flight.travelCategory}
                          onChange={(e) =>
                            handleFlightDetailChange(
                              index,
                              "travelCategory",
                              e.target.value
                            )
                          }
                        >
                          <option value="domestic">Domestic</option>
                          <option value="international">International</option>
                        </select>
                      </div>
                      <div className="form-control w-full">
                        <label className="label block mb-2">
                          <span className="label-text font-medium">
                            Time Preference
                          </span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={flight.preferredTime}
                          onChange={(e) =>
                            handleFlightDetailChange(
                              index,
                              "preferredTime",
                              e.target.value
                            )
                          }
                        >
                          {timeSlots.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formData.journeyType === "return" && (
                        <div className="form-control w-full">
                          <label className="label block mb-2">
                            <span className="label-text font-medium">
                              Return Date
                            </span>
                          </label>
                          <input
                            type="date"
                            className="input input-bordered w-full"
                            value={flight.returnDate}
                            onChange={(e) =>
                              handleFlightDetailChange(
                                index,
                                "returnDate",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      )}
                      {formData.journeyType === "return" && (
                        <div className="form-control w-full">
                          <label className="label block mb-2">
                            <span className="label-text font-medium">
                              Return Time Preference
                            </span>
                          </label>
                          <select
                            className="select select-bordered w-full"
                            value={flight.returnPreferredTime}
                            onChange={(e) =>
                              handleFlightDetailChange(
                                index,
                                "returnPreferredTime",
                                e.target.value
                              )
                            }
                          >
                            {timeSlots.map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="form-control w-full">
                        <label className="label block mb-2">
                          <span className="label-text font-medium">
                            Seat Preference
                          </span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={flight.seatPreference}
                          onChange={(e) =>
                            handleFlightDetailChange(
                              index,
                              "seatPreference",
                              e.target.value
                            )
                          }
                        >
                          {seatPreferences.map((pref) => (
                            <option key={pref} value={pref}>
                              {pref}
                            </option>
                          ))}
                        </select>
                      </div>

                      {flight.travelCategory === "international" && (
                        <>
                          <div className="form-control items-start pt-9">
                            <label className="label cursor-pointer gap-2">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-primary"
                                checked={flight.visaRequired}
                                onChange={(e) =>
                                  handleFlightDetailChange(
                                    index,
                                    "visaRequired",
                                    e.target.checked
                                  )
                                }
                              />
                              <span className="label-text">Visa Required?</span>
                            </label>
                          </div>
                          <div className="form-control w-full">
                            <label className="label block mb-2">
                              <span className="label-text font-medium">
                                Visa For (Country)
                              </span>
                            </label>
                            <input
                              type="text"
                              className="input input-bordered w-full"
                              placeholder="Enter country name"
                              disabled={!flight.visaRequired}
                              value={flight.visaCountry || ""}
                              onChange={(e) =>
                                handleFlightDetailChange(
                                  index,
                                  "visaCountry",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {formData.journeyType === "multi-city" &&
                      formData.flightDetails.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-xs btn-error btn-circle absolute top-0 right-0"
                          onClick={() => removeFlightSegment(index)}
                        >
                          ✕
                        </button>
                      )}
                  </div>
                ))}

                <div className="divider"></div>

                {/* Hotel Details */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">
                      Hotel Details (Optional)
                    </h3>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={addHotel}
                    >
                      Add Hotel
                    </button>
                  </div>

                  {formData.hotelDetails.map((hotel, index) => (
                    <div
                      key={index}
                      className="space-y-4 border-b pb-6 last:border-b-0 last:pb-0 relative"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="form-control w-full">
                          <label className="label block mb-2">
                            <span className="label-text font-medium">City</span>
                          </label>
                          <input
                            type="text"
                            className="input input-bordered w-full"
                            value={hotel.city}
                            onChange={(e) =>
                              handleHotelDetailChange(
                                index,
                                "city",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="form-control w-full">
                          <label className="label block mb-2">
                            <span className="label-text font-medium">
                              Check-in Date
                            </span>
                          </label>
                          <input
                            type="date"
                            className="input input-bordered w-full"
                            value={hotel.checkInDate}
                            onChange={(e) =>
                              handleHotelDetailChange(
                                index,
                                "checkInDate",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="form-control w-full">
                          <label className="label block mb-2">
                            <span className="label-text font-medium">
                              Check-out Date
                            </span>
                          </label>
                          <input
                            type="date"
                            className="input input-bordered w-full"
                            value={hotel.checkOutDate}
                            onChange={(e) =>
                              handleHotelDetailChange(
                                index,
                                "checkOutDate",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="form-control w-full">
                          <label className="label block mb-2">
                            <span className="label-text font-medium">
                              Number of Guests
                            </span>
                          </label>
                          <select
                            className="select select-bordered w-full"
                            value={hotel.guests}
                            onChange={(e) =>
                              handleHotelDetailChange(
                                index,
                                "guests",
                                parseInt(e.target.value, 10)
                              )
                            }
                          >
                            {guestOptions.map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="form-control w-full">
                        <label className="label block mb-2">
                          <span className="label-text font-medium">
                            Hotel Remarks (Optional)
                          </span>
                        </label>
                        <textarea
                          className="textarea textarea-bordered w-full"
                          placeholder="e.g., specific room type, early check-in"
                          value={hotel.remarks}
                          onChange={(e) =>
                            handleHotelDetailChange(
                              index,
                              "remarks",
                              e.target.value
                            )
                          }
                        ></textarea>
                      </div>

                      <button
                        type="button"
                        className="btn btn-xs btn-error btn-circle absolute top-0 right-0"
                        onClick={() => removeHotel(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="divider"></div>

                {/* Cab Details */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">
                      Cab Details (Optional)
                    </h3>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={addCab}
                    >
                      Add Cab
                    </button>
                  </div>

                  {formData.cabDetails.map((cab, index) => (
                    <div
                      key={index}
                      className="space-y-4 border-b pb-6 last:border-b-0 last:pb-0 relative"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control w-full">
                          <label className="label block mb-2">
                            <span className="label-text font-medium">
                              Pickup Location
                            </span>
                          </label>
                          <input
                            type="text"
                            className="input input-bordered w-full"
                            value={cab.pickupLocation}
                            onChange={(e) =>
                              handleCabDetailChange(
                                index,
                                "pickupLocation",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="form-control w-full">
                          <label className="label block mb-2">
                            <span className="label-text font-medium">
                              Dropoff Location
                            </span>
                          </label>
                          <input
                            type="text"
                            className="input input-bordered w-full"
                            value={cab.dropLocation}
                            onChange={(e) =>
                              handleCabDetailChange(
                                index,
                                "dropLocation",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="form-control w-full">
                          <label className="label block mb-2">
                            <span className="label-text font-medium">
                              Pickup Date
                            </span>
                          </label>
                          <input
                            type="date"
                            className="input input-bordered w-full"
                            value={cab.pickupDate}
                            onChange={(e) =>
                              handleCabDetailChange(
                                index,
                                "pickupDate",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="form-control w-full">
                          <label className="label block mb-2">
                            <span className="label-text font-medium">
                              Pickup Time
                            </span>
                          </label>
                          <input
                            type="time"
                            className="input input-bordered w-full"
                            value={cab.pickupTime}
                            onChange={(e) =>
                              handleCabDetailChange(
                                index,
                                "pickupTime",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-xs btn-error btn-circle absolute top-0 right-0"
                        onClick={() => removeCab(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setStep(3)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="card bg-base-100 shadow-lg p-6">
              <div className="space-y-6">
                <div className="form-control w-full">
                  <label className="label block mb-2">
                    <span className="label-text font-medium">
                      Remarks (Optional)
                    </span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full h-32"
                    placeholder="Any special instructions or notes..."
                    value={formData.remarks}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, remarks: e.target.value }))
                    }
                  ></textarea>
                </div>

                <div className="form-control w-full">
                  <label className="label block mb-2">
                    <span className="label-text font-medium">
                      Upload Documents (Optional)
                    </span>
                  </label>
                  <input
                    type="file"
                    multiple
                    className="file-input file-input-bordered w-full"
                    onChange={handleFileChange}
                  />
                  <div className="text-xs text-base-content/60 mt-2">
                    You can upload up to 3 files (PDF, JPG, PNG).
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setStep(2)}
                    disabled={isPending}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      "Submit Request"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateRequest;
