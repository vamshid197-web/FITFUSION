/**
 * Maps Firebase Authentication error codes to user-friendly messages.
 * Prevents technical jargon or raw error strings from reaching the UI.
 *
 * @param {Error|Object} error - Firebase error object
 * @returns {string} Human-friendly error message
 */
export function getFriendlyAuthErrorMessage(error) {
  if (!error) return 'An unexpected authentication error occurred. Please try again.';

  const code = error.code || '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect. Please check your details and try again.';

    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';

    case 'auth/invalid-email':
      return 'Please enter a valid email address.';

    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters with letters and numbers.';

    case 'auth/too-many-requests':
      return 'Access temporarily blocked due to multiple failed attempts. Please reset your password or wait a few minutes.';

    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact customer care.';

    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in the Firebase Console. Please verify Authentication settings.';

    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection and try again.';

    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing authentication.';

    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Authentication settings.';

    case 'auth/requires-recent-login':
      return 'This action requires recent authentication. Please sign in again.';

    default:
      // If error.message exists but is a raw Firebase message, sanitize it
      if (error.message && !error.message.includes('Firebase:')) {
        return error.message;
      }
      return 'Authentication failed. Please verify your credentials or check your connection.';
  }
}
