import React from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getManagerRequestDetails } from "../../utils/api";

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
        <iframe
          src={fileUrl}
          width="100%"
          height="500px"
          title="PDF Viewer"
          className="rounded-lg"
        ></iframe>
      </div>
    );
  } else {
    return (
      <img src={fileUrl} alt="document" className="max-w-[400px] rounded-lg" />
    );
  }
};

const RequestDetailsModal = ({
  requestId,
  onClose,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}) => {
  const {
    data: request,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["managerRequestDetails", requestId],
    queryFn: () => getManagerRequestDetails(requestId),
    enabled: !!requestId,
  });
  console.log(request);

  // Find selected flight options
  const selectedFlightOptions = request?.selectedFlightOptionIds
    ?.map((id) =>
      request.flightOptions?.find(
        (opt) => opt._id?.toString() === id.toString()
      )
    )
    .filter(Boolean); // Filter out any undefined if ID not found

  // Find selected hotel options
  const selectedHotelOptions = request?.selectedHotelOptionIds
    ?.map((id) =>
      request.hotelOptions?.find((opt) => opt._id?.toString() === id.toString())
    )
    .filter(Boolean); // Filter out any undefined if ID not found

  const totalSelectedCost =
    (selectedFlightOptions?.reduce((sum, opt) => sum + opt.price, 0) || 0) +
    (selectedHotelOptions?.reduce((sum, opt) => sum + opt.price, 0) || 0);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-48">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      );
    }

    if (error) {
      return (
        <div role="alert" className="alert alert-error">
          <span>Error: {error.message}</span>
        </div>
      );
    }

    if (!request) return <p>No request details found.</p>;

    return (
      <div className="space-y-6">
        {/* Requester & Journey Info */}
        <div className="p-4 bg-base-200 rounded-lg">
          <h4 className="font-bold text-lg mb-2">Request Overview</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <DetailItem label="Requester" value={request.requesterId?.name} />
            <DetailItem
              label="Employee ID"
              value={request.requesterId?.employeeId}
            />
            <DetailItem
              label="Travel Date"
              value={
                request.flightDetails?.[0]?.departureDate
                  ? format(
                      new Date(request.flightDetails[0].departureDate),
                      "PPP"
                    )
                  : "N/A"
              }
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

        {/* Journey Details */}
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

        {request.cabDetails?.length > 0 && (
          <div className="p-4 bg-base-200 rounded-lg">
            <h4 className="font-bold text-lg mb-2">
              Employee's Cab Preferences
            </h4>
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

        {/* Employee Selected Options */}
        {(selectedFlightOptions?.length > 0 ||
          selectedHotelOptions?.length > 0) && (
          <div className="p-4 bg-base-200 rounded-lg">
            <h4 className="font-bold text-lg mb-2">
              Employee's Selected Options
            </h4>
            {selectedFlightOptions?.length > 0 && (
              <div className="mb-2">
                <h5 className="font-semibold text-sm">Flights:</h5>
                <ul className="list-disc list-inside text-sm">
                  {selectedFlightOptions.map((opt) => (
                    <li key={opt._id}>
                      {opt.airline} {opt.flightNumber} ({opt.fromCity} &rarr;
                      {opt.toCity}) - ₹{opt.price?.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {selectedHotelOptions?.length > 0 && (
              <div className="mb-2">
                <h5 className="font-semibold text-sm">Hotels:</h5>
                <ul className="list-disc list-inside text-sm">
                  {selectedHotelOptions.map((opt) => (
                    <li key={opt._id}>
                      {opt.name} ({opt.location}) - $ ₹
                      {opt.price?.toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="font-bold text-right mt-2">
              Total Selected Cost: ₹{totalSelectedCost.toLocaleString()}
            </p>
          </div>
        )}

        {/* Passengers */}
        {request?.passengerDetails?.length > 0 && (
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

        {/* Employee Documents */}
        {request.employeeDocuments?.length > 0 && (
          <div className="p-4 bg-base-200 rounded-lg">
            <h4 className="font-bold text-lg mb-2">Employee Documents</h4>
            <div className="space-y-4">
              {request.employeeDocuments.map((docUrl, index) => (
                <div key={index} className="p-2 bg-base-100 rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    Document {index + 1}
                  </p>
                  <FileViewer fileUrl={docUrl} />
                </div>
              ))}
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
  };

  return (
    <dialog id="request_details_modal" className="modal modal-open">
      <div className="modal-box w-11/12 max-w-3xl">
        <h3 className="font-bold text-xl">Travel Request Details</h3>
        <div className="py-4">{renderContent()}</div>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
          {request?.status === "employeeConfirmed" && (
            <>
              <button
                className="btn btn-error"
                onClick={() => onReject(requestId)}
                disabled={isRejecting || isApproving}
              >
                {isRejecting ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Reject"
                )}
              </button>
              <button
                className="btn btn-success"
                onClick={() => onApprove(requestId)}
                disabled={isApproving || isRejecting}
              >
                {isApproving ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Approve"
                )}
              </button>
            </>
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default RequestDetailsModal;
