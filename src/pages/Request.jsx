import { useEffect, useState } from "react";
import { message, Popconfirm, Skeleton, Tabs, Tag } from "antd";
import { RefreshCw } from "lucide-react";

import {
  approveWithdrawalApi,
  rejectWithdrawalApi,
  fetchAllWithdrawalsApi,
} from "../api/withdrawalApi";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case "approved":
    case "active":
      return "success";
    case "rejected":
    case "inactive":
      return "error";
    case "pending":
      return "warning";
    default:
      return "default";
  }
};

const getAvailableBalance = (allocation) => {
  return Number(
    allocation?.remainingWithdrawable ??
      allocation?.availableToWithdraw ??
      0,
  );
};

const Requests = () => {
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // States for your custom Investor Details Modal
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchAllWithdrawalsApi();
      setAllRequests(response?.requests || []);
    } catch (error) {
      console.error(
        "Fetch withdrawals error:",
        error?.response?.data || error.message,
      );
      message.error("Failed to load withdrawal requests.");
      setAllRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openUserDetailsModal = (request) => {
    setSelectedRequest(request);
    
    // Simulating minor layout load times or setup structure mapping
    setDetailsLoading(true);
    setIsUserDetailsModalOpen(true);

    // Map the user portfolio info derived from the current request payload context
    setSelectedUser({
      name: request.user?.name,
      email: request.user?.email,
      phone: request.user?.phone,
      role: request.user?.role || "user",
      withdrawableLimit: getAvailableBalance(request.allocation),
      createdAt: request.user?.createdAt || request.createdAt,
      allocations: request.user?.allocations || (request.allocation ? [request.allocation] : []),
    });
    
    setDetailsLoading(false);
  };

  const closeUserDetailsModal = () => {
    setIsUserDetailsModalOpen(false);
    setSelectedRequest(null);
    setSelectedUser(null);
  };

  const handleResetPassword = () => {
    message.info("Password reset logic triggered successfully.");
  };

  const editUser = () => {
    message.info("Edit user path triggered.");
  };

  const handleAction = async (requestId, action) => {
    try {
      setActionLoadingId(requestId);

      if (action === "approve") {
        const result = await approveWithdrawalApi(requestId);
        message.success(
          result?.message || "Withdrawal approved successfully.",
        );
      } else {
        await rejectWithdrawalApi(requestId);
        message.success("Withdrawal rejected successfully.");
      }

      closeUserDetailsModal();
      await loadData();
    } catch (error) {
      message.error(
        error?.response?.data?.message ||
          `Failed to ${action} withdrawal request.`,
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingData = allRequests.filter(
    (request) => request.status === "pending",
  );

  const approvedData = allRequests.filter(
    (request) => request.status === "approved",
  );

  const rejectedData = allRequests.filter(
    (request) => request.status === "rejected",
  );

  const stats = {
    total: allRequests.length,
    pending: pendingData.length,
    approved: approvedData.length,
    rejected: rejectedData.length,
  };

  const renderTable = (data) => (
    <div className="border border-slate-800 bg-[#1F2937] overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead className="bg-[#090A0F] text-slate-400 border-b border-slate-800">
          <tr>
            <th className="p-4 uppercase tracking-wider font-semibold text-[10px]">
              Investment
            </th>
            <th className="p-4 uppercase tracking-wider font-semibold text-[10px]">
              Investor
            </th>
            <th className="p-4 text-right uppercase tracking-wider font-semibold text-[10px]">
              Requested
            </th>
            <th className="p-4 text-right uppercase tracking-wider font-semibold text-[10px]">
              Available Balance
            </th>
            <th className="p-4 uppercase tracking-wider font-semibold text-[10px]">
              Requested On
            </th>
            <th className="p-4 uppercase tracking-wider font-semibold text-[10px]">
              Status
            </th>
            <th className="p-4 text-center uppercase tracking-wider font-semibold text-[10px]">
              View
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-800/70 text-slate-300">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="p-10 text-center text-[#9CA3AF] italic"
              >
                No withdrawal requests found.
              </td>
            </tr>
          ) : (
            data.map((request) => {
              const availableBalance = getAvailableBalance(request.allocation);

              return (
                <tr
                  key={request._id}
                  className="hover:bg-[#090A0F]/30 transition-colors"
                >
                  <td className="p-4">
                    <p className="font-semibold capitalize text-white">
                      {request.investment?.title || "Unknown investment"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#9CA3AF]">
                      {request.investment?.reference || "No reference"}
                    </p>
                  </td>

                  <td className="p-4">
                    <p className="font-semibold capitalize text-white whitespace-nowrap">
                      {request.user?.name || "Unknown user"}
                    </p>
                  </td>

                  <td className="p-4 text-right font-mono font-bold text-white whitespace-nowrap">
                    {formatCurrency(request.amount)}
                  </td>

                  <td className="p-4 text-right font-mono font-bold text-[#34D399] whitespace-nowrap">
                    {formatCurrency(availableBalance)}
                  </td>

                  <td className="p-4 text-[#9CA3AF] whitespace-nowrap">
                    {formatDate(request.createdAt)}
                  </td>

                  <td className="p-4">
                    <Tag
                      color={getStatusColor(request.status)}
                      className="m-0 text-[10px] font-bold uppercase"
                    >
                      {request.status || "unknown"}
                    </Tag>

                    {/* {request.approvedAt && (
                      <p className="mt-1 text-[10px] text-[#9CA3AF]">
                        {formatDate(request.approvedAt)}
                      </p>
                    )} */}
                  </td>

                  <td className="p-4 text-center">
                    <button
                      onClick={() => openUserDetailsModal(request)}
                      className="px-3 py-1 text-xs bg-[#34D399] text-black font-semibold hover:opacity-90 cursor-pointer transition-opacity"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Withdrawal Requests</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            Review, approve, or reject investor withdrawal requests.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 border border-slate-700 bg-[#1F2937] px-3 py-2 text-xs font-bold text-[#9CA3AF] hover:text-white hover:bg-[#090A0F] disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-white" },
          { label: "Pending", value: stats.pending, color: "text-amber-400" },
          {
            label: "Approved",
            value: stats.approved,
            color: "text-[#34D399]",
          },
          { label: "Rejected", value: stats.rejected, color: "text-rose-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-slate-800 bg-[#1F2937] p-5"
          >
            <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-bold">
              {stat.label}
            </span>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="border border-slate-800 bg-[#1F2937] p-5">
        <Tabs
          className="custom-tabs"
          items={[
            {
              key: "pending",
              label: `Pending (${stats.pending})`,
              children: loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : (
                renderTable(pendingData)
              ),
            },
            {
              key: "approved",
              label: `Approved (${stats.approved})`,
              children: loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : (
                renderTable(approvedData)
              ),
            },
            {
              key: "rejected",
              label: `Rejected (${stats.rejected})`,
              children: loading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : (
                renderTable(rejectedData)
              ),
            },
          ]}
        />
      </div>

      {/* Requested Custom User Details Profile Modal Structure */}
      {isUserDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={closeUserDetailsModal}
            className="absolute inset-0 bg-[#090A0F]/70 backdrop-blur-xs"
          />

          <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-slate-800 bg-[#1F2937] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-base text-white">
                  Withdrawal Details
                </h3>
               
              </div>

              <button
                type="button"
                onClick={closeUserDetailsModal}
                className="text-[#9CA3AF] hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-12 text-center text-sm text-[#9CA3AF]">
                Loading investor information...
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#090A0F] border border-slate-800 p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 shrink-0 rounded-full bg-[#1F2937] border border-slate-700 text-[#34D399] flex items-center justify-center text-lg font-bold">
                      {selectedUser?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-white capitalize">
                        {selectedUser?.name || "Unknown user"}
                      </h3>
                      <p className="truncate text-xs text-[#9CA3AF]">
                        {selectedUser?.email || "No email"}
                      </p>
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="border border-slate-800 bg-[#090A0F] p-3">
                    <p className="text-[10px] uppercase font-bold text-[#9CA3AF]">
                      Phone Number
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {selectedUser?.phone || "—"}
                    </p>
                  </div>

                  <div className="border border-slate-800 bg-[#090A0F] p-3">
                    <p className="text-[10px] uppercase font-bold text-[#9CA3AF]">
                      Withdrawable Balance
                    </p>
                    <p className="mt-1 text-sm font-mono font-bold text-[#34D399]">
                      {formatCurrency(selectedUser?.withdrawableLimit)}
                    </p>
                  </div>

                  <div className="border border-slate-800 bg-[#090A0F] p-3">
                    <p className="text-[10px] uppercase font-bold text-[#9CA3AF]">
                      Registered
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {formatDate(selectedUser?.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Specific details of targeted item transaction */}
                {selectedRequest && (
                  <div className="border border-slate-800 bg-[#090A0F] p-4 space-y-3">
                    <h4 className="text-xs uppercase font-bold text-white border-b border-slate-800 pb-2">
                      Active Withdrawal Request Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-[#9CA3AF]">Requested Amount</p>
                        <p className="text-lg font-bold text-[#34D399] font-mono mt-0.5">
                          {formatCurrency(selectedRequest.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#9CA3AF]">Bank/Account Name</p>
                        <p className="text-white font-medium mt-0.5">
                          {selectedRequest.bankName} — {selectedRequest.accountName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#9CA3AF]">Account Number</p>
                        <p className="text-white font-mono font-medium mt-0.5">
                          {selectedRequest.accountNumber}
                        </p>
                      </div>
                    </div>

                    {/* Operational Action triggers embedded for processing pending requests */}
                    {selectedRequest.status === "pending" && (
                      <div className="flex justify-end gap-3 pt-3">
                        <Popconfirm
                          title="Reject withdrawal request?"
                          onConfirm={() => handleAction(selectedRequest._id, "reject")}
                          okText="Reject"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                        >
                          <button
                            disabled={actionLoadingId === selectedRequest._id}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase disabled:opacity-50 cursor-pointer"
                          >
                            Reject Request
                          </button>
                        </Popconfirm>

                        <Popconfirm
                          title="Approve withdrawal request?"
                          description={
                            Number(selectedRequest.amount || 0) >
                            getAvailableBalance(selectedRequest.allocation)
                              ? "This request exceeds the available balance and cannot be approved."
                              : "The amount will be deducted from the user's available balance."
                          }
                          onConfirm={() => handleAction(selectedRequest._id, "approve")}
                          okText="Approve"
                          cancelText="Cancel"
                          okButtonProps={{ className: "bg-emerald-600" }}
                        >
                          <button
                            disabled={
                              actionLoadingId === selectedRequest._id ||
                              Number(selectedRequest.amount || 0) >
                                getAvailableBalance(
                                  selectedRequest.allocation,
                                )
                            }
                            className="px-4 py-2 bg-[#34D399] hover:bg-emerald-400 text-black text-xs font-bold uppercase disabled:opacity-50 cursor-pointer"
                          >
                            Approve Request
                          </button>
                        </Popconfirm>
                      </div>
                    )}
                  </div>
                )}

              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
