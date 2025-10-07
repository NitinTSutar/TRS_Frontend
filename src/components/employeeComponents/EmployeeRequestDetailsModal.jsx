import React from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getEmployeeRequestDetails } from "../../utils/api";

const DetailItem = ({ label, value, className = "" }) => (
  <div className={className}>
    <p className="text-sm text-base-content/70">{label}</p>
    <p className="font-semibold">{value || "N/A"}</p>
  </div>
);

const FileViewer = ({ fileUrl }) => {
  if (!fileUrl) return null;

  const fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="link link-primary"
    >
      {fileName}
    </a>
  );
};

const EmployeeRequestDetailsModal = ({ requestId, onClose }) => {
  const {
    data: request,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["employeeRequestDetails", requestId],
    queryFn: () => getEmployeeRequestDetails(requestId),
    enabled: !!requestId,
  });

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
            <DetailItem
              label="Approving Manager"
              value={request.assignedManagerId?.name}
            />
            <DetailItem label="Journey Type" value={request.journeyType} />
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
            <h4 className="font-bold text-lg mb-2">Flight Preferences</h4>
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
            <h4 className="font-bold text-lg mb-2">Hotel Preferences</h4>
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
            <h4 className="font-bold text-lg mb-2">Cab Preferences</h4>
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
            <h4 className="font-bold text-lg mb-2">My Uploaded Documents</h4>
            <div className="space-y-2">
              {request.employeeDocuments.map((docUrl, index) => (
                <div key={index}>
                  <FileViewer fileUrl={docUrl} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin Documents */}
        {request.adminDocuments?.length > 0 && (
          <div className="p-4 bg-base-200 rounded-lg">
            <h4 className="font-bold text-lg mb-2">
              Documents from Admin (Tickets, etc.)
            </h4>
            <div className="space-y-2">
              {request.adminDocuments.map((docUrl, index) => (
                <div key={index}>
                  <FileViewer fileUrl={docUrl} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remarks */}
        {request.remarks && (
          <div className="p-4 bg-base-200 rounded-lg">
            <h4 className="font-bold text-lg mb-2">My Remarks</h4>
            <p>{request.remarks}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <dialog id="employee_request_details_modal" className="modal modal-open">
      <div className="modal-box w-11/12 max-w-3xl">
        <h3 className="font-bold text-xl">Travel Request Details</h3>
        <div className="py-4">{renderContent()}</div>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default EmployeeRequestDetailsModal;
