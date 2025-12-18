/**
 * Configuration Constants
 * =======================
 * PDC Lab Exam - Distributed Chat System
 * 
 * Contains API URLs and app-wide constants
 */

import { Platform } from 'react-native';

/**
 * Get the appropriate base URL based on platform and environment
 * - Android Emulator: Uses 10.0.2.2 (special alias for host machine)
 * - iOS Simulator: Uses localhost
 * - Physical Device: Use your PC's IP address
 */
export const getBaseUrl = () => {
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'android') {
      // Android Emulator uses 10.0.2.2 to reach host machine
      return 'http://10.0.2.2:3000';
    }
    // iOS Simulator or Web
    return 'http://localhost:3000';
  }
  // Production - replace with your server IP
  return 'http://YOUR_SERVER_IP:3000';
};

export const API_BASE_URL = getBaseUrl();

// App Colors - Modern Blue Theme
export const COLORS = {
  primary: '#2563EB',       // Blue
  primaryDark: '#1D4ED8',   // Darker blue
  primaryLight: '#3B82F6',  // Lighter blue
  success: '#10B981',       // Green
  warning: '#F59E0B',       // Orange
  error: '#EF4444',         // Red
  background: '#F1F5F9',    // Light gray
  card: '#FFFFFF',          // White
  text: '#1E293B',          // Dark text
  textLight: '#64748B',     // Gray text
  textWhite: '#FFFFFF',     // White text
  border: '#E2E8F0',        // Light border
  shadow: '#000000',        // Shadow color
};

// Supported Languages
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
];

// Generate unique user ID
export const generateUserId = () => {
  return 'user-' + Math.random().toString(36).substr(2, 9);
};
