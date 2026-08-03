/**
 * Maps a Firebase Callable Functions error into friendly, user-facing copy.
 * Used by every service that calls a callable (wallet, games, offers) so
 * error handling — including network failures — is consistent everywhere,
 * not reimplemented per-screen.
 */
export function mapFunctionsError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";
  const serverMessage = (error as { message?: string })?.message;

  switch (code) {
    case "already-exists":
      return serverMessage || "You've already claimed this reward.";
    case "failed-precondition":
      return serverMessage || "This isn't available right now.";
    case "not-found":
      return serverMessage || "This item could not be found. It may have been removed.";
    case "invalid-argument":
      return serverMessage || "Something about this request wasn't valid.";
    case "unauthenticated":
      return "Please log in again to continue.";
    case "permission-denied":
      return "You don't have permission to do that.";
    case "resource-exhausted":
      return "Too many requests. Please wait a moment and try again.";
    case "unavailable":
    case "deadline-exceeded":
      return "Network error. Check your connection and try again.";
    default:
      return serverMessage || "Something went wrong. Please try again.";
  }
}
