import React from "react";
import { format } from "date-fns";

const DetailItem = ({ label, value, className = "" }) => (
  <div className={className}>
    <p className="text-sm text-base-content/70">{label}</p>
    <p className="font-semibold">{value || "N/A"}</p>
  </div>
);

const EmployeeRequestDetailsModal = ({
  request,
  onClose,
  onSelectOption,
  isSelecting,
}) => {
  if (!request) return null;

  const bookingDetails = request.booking;

  return (
    <dialog id="employee_request_details_modal" className="modal modal-open">
      <div className="modal-box w-11/12 max-w-3xl">
        <h3 className="font-bold text-xl">Request Details</h3>

        <div className="py-4 space-y-6">
          {/* Request Overview */}
          <div className="p-4 bg-base-200 rounded-lg">
            <h4 className="font-bold text-lg mb-2">Request Overview</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <DetailItem label="Journey Type" value={request.journeyType} />
              <DetailItem
                label="Travel Date"
                value={
                  request.travelDate
                    ? format(new Date(request.travelDate), "PPP")
                    : "N/A"
                }
              />
              <DetailItem
                label="Status"
                value={request.status}
                className="capitalize"
              />
            </div>
          </div>

          {/* Options Section (Action Required) */}
          {request.status === "optionsSent" && (
            <div className="p-4 bg-info/20 rounded-lg">
              <h4 className="font-bold text-lg mb-2">
                Please Select an Option
              </h4>
              <div className="space-y-3">
                {request.options.map((opt) => (
                  <div key={opt._id} className="card bg-base-100 shadow-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">
                          {opt.name} ({opt.type})
                        </p>
                        <p className="text-sm">{opt.details}</p>
                        <p className="text-lg font-semibold mt-2">
                          ${opt.price.toLocaleString()}
                        </p>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onSelectOption(opt._id)}
                        disabled={isSelecting}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking Details (Booked) */}
          {request.status === "booked" && bookingDetails && (
            <div className="p-4 bg-success/20 rounded-lg">
              <h4 className="font-bold text-lg mb-2">Booking Confirmed!</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem
                  label="PNR Number"
                  value={bookingDetails.pnrNumber}
                />
                {bookingDetails.ticketUrl && (
                  <div>
                    <p className="text-sm text-base-content/70">Ticket</p>
                    <a
                      href={bookingDetails.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-primary"
                    >
                      View Ticket
                    </a>
                  </div>
                )}
                {bookingDetails.remarks && (
                  <DetailItem
                    label="Admin Remarks"
                    value={bookingDetails.remarks}
                    className="col-span-full"
                  />
                )}
              </div>
            </div>
          )}

          {/* Manager Rejection */}
          {request.status === "managerRejected" && (
            <div className="p-4 bg-error/20 rounded-lg">
              <h4 className="font-bold text-lg mb-2">Request Rejected</h4>
              <DetailItem label="Reason" value={request.remarks} />
            </div>
          )}
        </div>

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
