export function formatMessageTime(date: string) {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

export function getStoredTokens() {
    const tokens = localStorage.getItem("token");
    return tokens;
}
