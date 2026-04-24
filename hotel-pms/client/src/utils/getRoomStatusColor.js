export const getRoomStatusColor = (status) =>
  ({
    OCCUPIED:     { bg: "#1a6b6b", text: "#ffffff" },
    VACANT:       { bg: "#f1f5f9", text: "#64748b" },
    DIRTY:        { bg: "#f59e0b", text: "#ffffff" },
    DUE_IN:       { bg: "#3b82f6", text: "#ffffff" },
    DUE_OUT:      { bg: "#f97316", text: "#ffffff" },
    OUT_OF_ORDER: { bg: "#ef4444", text: "#ffffff" },
    CLEAN:        { bg: "#10b981", text: "#ffffff" },
  })[status] ?? { bg: "#f1f5f9", text: "#64748b" };
