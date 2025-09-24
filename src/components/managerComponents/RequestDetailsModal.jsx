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

  // Safe check for selectedOption
  const selectedOption = request?.options?.find(
    (opt) => opt._id?.toString() === request?.selectedOptionId?.toString()
  );

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
            <DetailItem label="Journey Type" value={request.journeyType} />
            <DetailItem
              label="Travel Date"
              value={
                request.flightDetails?.[0]?.departureDate
                  ? format(
                      new Date(request.flightDetails[0].departureDate),
                      "PPP"
                    )
                  : request.travelDate
                  ? format(new Date(request.travelDate), "PPP")
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

        {/* Journey Details */}
        {request.flightDetails?.length > 0 && (
          <div className="p-4 bg-base-200 rounded-lg">
            <h4 className="font-bold text-lg mb-2">Journey Details</h4>
            <div className="space-y-2">
              {request.flightDetails.map((flight, index) => (
                <div key={index} className="text-sm">
                  <span className="font-semibold">
                    {flight.fromCity} &rarr; {flight.toCity}
                  </span>
                  <span className="text-base-content/70 ml-2">
                    ({flight.travelCategory})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Option Details */}
        {selectedOption && (
          <div className="p-4 bg-base-200 rounded-lg">
            <h4 className="font-bold text-lg mb-2">Employee Selected Option</h4>
            <DetailItem
              label="Total Cost"
              value={`${selectedOption.currency} ${
                selectedOption.totalCost?.toLocaleString() ?? "N/A"
              }`}
            />
            {selectedOption.remarks && (
              <DetailItem
                label="Admin Remarks"
                value={selectedOption.remarks}
              />
            )}
          </div>
        )}

        {/* Passengers */}
        {request.passengers?.length > 0 && (
          <div className="p-4 bg-base-200 rounded-lg">
            <h4 className="font-bold text-lg mb-2">Passenger List</h4>
            <ul className="list-disc list-inside">
              {request.passengers.map((pax, index) => (
                <li key={index}>
                  {pax.employeeId} {pax.remake && `(${pax.remake})`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Employee Documents */}
        {request.employeeDocuments?.length > 0 && (
          <div className="p-4 bg-base-200 rounded-lg">
            <h4 className="font-bold text-lg mb-2">Employee Documents</h4>
            <ul className="list-disc list-inside">
              {request.employeeDocuments.map((docUrl, index) => (
                <li key={index}>
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary"
                  >
                    View Document {index + 1}
                  </a>
                </li>
              ))}
            </ul>
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
