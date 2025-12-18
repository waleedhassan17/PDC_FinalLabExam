/**
 * API Service
 * ===========
 * PDC Lab Exam - Distributed Chat System
 * 
 * Handles all REST API calls to the API Gateway.
 * The API Gateway then communicates with gRPC services.
 * 
 * Architecture:
 * React Native App → REST → API Gateway → gRPC → Microservices
 */

import { API_BASE_URL } from '../constants/config';

/**
 * Generic fetch wrapper with error handling
 */
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    if (error.message === 'Network request failed') {
      throw new Error('Cannot connect to server. Please check if the API Gateway is running.');
    }
    throw error;
  }
};

/**
 * API Methods
 */
export const api = {
  /**
   * Health Check - Verify all services are running
   * GET /api/health
   */
  healthCheck: async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/health`);
  },

  /**
   * Get Supported Languages from Translation Service
   * GET /api/languages
   */
  getLanguages: async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/languages`);
  },

  /**
   * Set User's Preferred Language
   * POST /api/users/language
   */
  setUserLanguage: async (userId, language) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/users/language`, {
      method: 'POST',
      body: JSON.stringify({ userId, language }),
    });
  },

  /**
   * Send Text Message for Translation
   * POST /api/messages/text
   * 
   * This is the main feature - demonstrates:
   * - REST (JSON) from client to API Gateway
   * - gRPC (Protobuf) from API Gateway to Translation Service
   */
  sendTextMessage: async (userId, text, sourceLanguage, targetLanguage) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/messages/text`, {
      method: 'POST',
      body: JSON.stringify({ userId, text, sourceLanguage, targetLanguage }),
    });
  },

  /**
   * Send Audio Message for Processing
   * POST /api/messages/audio
   * 
   * Demonstrates binary data handling:
   * - REST requires base64 encoding (+33% overhead)
   * - gRPC sends native binary (more efficient)
   */
  sendAudioMessage: async (userId, audioBase64, sourceLanguage, targetLanguage) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/messages/audio`, {
      method: 'POST',
      body: JSON.stringify({
        userId,
        audioData: audioBase64,
        audioFormat: 'wav',
        sourceLanguage,
        targetLanguage,
      }),
    });
  },

  /**
   * Get Chat History
   * GET /api/messages/history
   */
  getChatHistory: async (userId, limit = 50) => {
    const url = userId 
      ? `${API_BASE_URL}/api/messages/history?userId=${userId}&limit=${limit}`
      : `${API_BASE_URL}/api/messages/history?limit=${limit}`;
    return fetchWithErrorHandling(url);
  },

  /**
   * Get Performance Metrics - REST vs gRPC Comparison
   * GET /api/performance/metrics
   * 
   * IMPORTANT FOR EXAM: Shows why gRPC is faster than REST
   */
  getPerformanceMetrics: async () => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/performance/metrics`);
  },

  /**
   * Test Concurrent Message Processing
   * POST /api/test/concurrent
   * 
   * Demonstrates parallel processing capability
   */
  testConcurrent: async (messageCount = 5) => {
    return fetchWithErrorHandling(`${API_BASE_URL}/api/test/concurrent`, {
      method: 'POST',
      body: JSON.stringify({ messages: messageCount }),
    });
  },
};

/**
 * Generate dummy audio data for testing
 * Creates a fake WAV-like binary pattern encoded as base64
 * 
 * In production, this would be real recorded audio
 */
export const generateDummyAudio = () => {
  const size = 10240; // 10KB of dummy audio
  const bytes = new Uint8Array(size);
  
  // Generate sine wave pattern to simulate audio
  for (let i = 0; i < size; i++) {
    bytes[i] = Math.floor(128 + 127 * Math.sin(i * 0.1));
  }
  
  // Convert to base64
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  // Use btoa for base64 encoding (available in React Native)
  return btoa(binary);
};

// Helper function for btoa (base64 encoding)
const btoa = (str) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  
  for (let i = 0; i < str.length; i += 3) {
    const a = str.charCodeAt(i);
    const b = str.charCodeAt(i + 1);
    const c = str.charCodeAt(i + 2);
    
    const index1 = a >> 2;
    const index2 = ((a & 3) << 4) | (b >> 4);
    const index3 = isNaN(b) ? 64 : ((b & 15) << 2) | (c >> 6);
    const index4 = isNaN(c) ? 64 : c & 63;
    
    output += chars[index1] + chars[index2] + chars[index3] + chars[index4];
  }
  
  return output;
};

export default api;
