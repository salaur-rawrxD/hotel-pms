export const getChannelColor = (source) =>
  ({
    BOOKING:   { bg: "#dbeafe", text: "#1d4ed8" },
    EXPEDIA:   { bg: "#fef3c7", text: "#92400e" },
    DIRECT:    { bg: "#d1fae5", text: "#065f46" },
    AIRBNB:    { bg: "#fee2e2", text: "#991b1b" },
    CORPORATE: { bg: "#ede9fe", text: "#5b21b6" },
    WALKIN:    { bg: "#f1f5f9", text: "#475569" },
  })[source] ?? { bg: "#f1f5f9", text: "#475569" };
