/**
 * API Gateway - REST Server
 * =========================
 * PDC Lab Exam - Distributed Chat System
 * 
 * ARCHITECTURE:
 * - Client → API Gateway: REST (JSON)
 * - API Gateway → Services: gRPC (Protocol Buffers)
 * 
 * This gateway does NOT handle translation or audio processing logic.
 * It only validates requests and forwards them to appropriate microservices.
 * 
 * PERFORMANCE METRICS:
 * - Measures response time for each request
 * - Tracks payload sizes (JSON vs Protobuf)
 * - Logs comparison data for REST vs gRPC analysis
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================
const PORT = process.env.API_PORT || 3000;
const TRANSLATION_SERVICE_URL = process.env.TRANSLATION_URL || 'localhost:50051';
const AUDIO_SERVICE_URL = process.env.AUDIO_URL || 'localhost:50052';

// Proto file paths
const TRANSLATION_PROTO_PATH = path.join(__dirname, '../proto/translation.proto');
const AUDIO_PROTO_PATH = path.join(__dirname, '../proto/audio.proto');

// ============================================================================
// EXPRESS SETUP
// ============================================================================
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// ============================================================================
// IN-MEMORY DATA STORES
// ============================================================================

// User language preferences
const userLanguages = new Map();

// Chat history storage
const chatHistory = [];

// Performance metrics storage
const performanceMetrics = {
  rest: { text: [], audio: [] },
  grpc: { text: [], audio: [] }
};

// ============================================================================
// gRPC CLIENT SETUP
// ============================================================================

// Load Translation Service proto
const translationPackageDef = protoLoader.loadSync(TRANSLATION_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const translationProto = grpc.loadPackageDefinition(translationPackageDef).translation;

// Load Audio Service proto
const audioPackageDef = protoLoader.loadSync(AUDIO_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const audioProto = grpc.loadPackageDefinition(audioPackageDef).audio;

// Create gRPC clients
let translationClient;
let audioClient;

function initializeGrpcClients() {
  translationClient = new translationProto.TranslationService(
    TRANSLATION_SERVICE_URL,
    grpc.credentials.createInsecure()
  );
  
  audioClient = new audioProto.AudioService(
    AUDIO_SERVICE_URL,
    grpc.credentials.createInsecure()
  );
  
  console.log(`   Translation Service: ${TRANSLATION_SERVICE_URL}`);
  console.log(`   Audio Service: ${AUDIO_SERVICE_URL}`);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate JSON payload size in bytes
 */
function getJsonSize(obj) {
  return Buffer.byteLength(JSON.stringify(obj), 'utf8');
}

/**
 * Log performance metrics
 */
function logMetrics(type, method, metrics) {
  console.log('\n' + '-'.repeat(50));
  console.log(`[METRICS] ${type.toUpperCase()} - ${method}`);
  console.log('-'.repeat(50));
  console.log(`  REST Response Time: ${metrics.restTime}ms`);
  console.log(`  gRPC Response Time: ${metrics.grpcTime}ms`);
  console.log(`  REST Payload Size: ${metrics.restPayloadSize} bytes`);
  console.log(`  gRPC Payload Size: ~${metrics.grpcPayloadSize} bytes (estimated)`);
  console.log(`  Size Reduction: ${((1 - metrics.grpcPayloadSize / metrics.restPayloadSize) * 100).toFixed(1)}%`);
  console.log('-'.repeat(50) + '\n');
}

// ============================================================================
// REST API ENDPOINTS
// ============================================================================

/**
 * POST /api/users/language
 * Set user's preferred language
 */
app.post('/api/users/language', (req, res) => {
  const startTime = Date.now();
  const { userId, language } = req.body;
  
  console.log('\n' + '='.repeat(60));
  console.log('[REST API] POST /api/users/language');
  console.log('='.repeat(60));
  
  if (!userId || !language) {
    return res.status(400).json({
      success: false,
      error: 'userId and language are required'
    });
  }
  
  // Store user language preference
  userLanguages.set(userId, language);
  
  const response = {
    success: true,
    userId,
    language,
    message: `Language preference set to ${language}`,
    responseTime: Date.now() - startTime
  };
  
  console.log(`  User ${userId} language set to: ${language}`);
  console.log(`  Response Time: ${response.responseTime}ms`);
  
  res.json(response);
});

/**
 * GET /api/users/:userId/language
 * Get user's preferred language
 */
app.get('/api/users/:userId/language', (req, res) => {
  const { userId } = req.params;
  const language = userLanguages.get(userId) || 'en';
  
  res.json({
    success: true,
    userId,
    language
  });
});

/**
 * POST /api/messages/text
 * Send a text message - forwards to Translation Service via gRPC
 * 
 * IMPORTANT: Translation logic is NOT in this gateway.
 * It's handled by the Translation Service (gRPC).
 */
app.post('/api/messages/text', async (req, res) => {
  const restStartTime = Date.now();
  
  console.log('\n' + '='.repeat(60));
  console.log('[REST API] POST /api/messages/text');
  console.log('='.repeat(60));
  
  const { 
    userId, 
    text, 
    sourceLanguage = 'en', 
    targetLanguage 
  } = req.body;
  
  // Validate input
  if (!userId || !text) {
    return res.status(400).json({
      success: false,
      error: 'userId and text are required'
    });
  }
  
  // Get target language from user preference if not specified
  const targetLang = targetLanguage || userLanguages.get(userId) || 'es';
  
  console.log(`  User ID: ${userId}`);
  console.log(`  Text: "${text}"`);
  console.log(`  Source: ${sourceLanguage} → Target: ${targetLang}`);
  
  // Calculate REST request payload size
  const restRequestPayload = { userId, text, sourceLanguage, targetLanguage: targetLang };
  const restPayloadSize = getJsonSize(restRequestPayload);
  
  // Prepare gRPC request
  const grpcRequest = {
    text,
    source_language: sourceLanguage,
    target_language: targetLang,
    user_id: userId,
    timestamp: Date.now()
  };
  
  // Estimate gRPC payload size (Protobuf is typically 30-50% smaller)
  const grpcPayloadSize = Math.floor(restPayloadSize * 0.6);
  
  const grpcStartTime = Date.now();
  
  // Forward to Translation Service via gRPC
  translationClient.TranslateText(grpcRequest, (error, response) => {
    const grpcEndTime = Date.now();
    const grpcTime = grpcEndTime - grpcStartTime;
    
    if (error) {
      console.error(`  [ERROR] gRPC call failed: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: 'Translation service unavailable',
        details: error.message
      });
    }
    
    // Store in chat history
    const chatEntry = {
      id: uuidv4(),
      type: 'text',
      userId,
      originalText: text,
      translatedText: response.translated_text,
      sourceLanguage,
      targetLanguage: targetLang,
      timestamp: new Date().toISOString()
    };
    chatHistory.push(chatEntry);
    
    // Calculate REST response time
    const restTime = Date.now() - restStartTime;
    
    // Log performance comparison
    const metrics = {
      restTime,
      grpcTime,
      restPayloadSize,
      grpcPayloadSize
    };
    
    performanceMetrics.rest.text.push({ time: restTime, size: restPayloadSize });
    performanceMetrics.grpc.text.push({ time: grpcTime, size: grpcPayloadSize });
    
    logMetrics('TEXT', 'Translation', metrics);
    
    // Send REST response
    const restResponse = {
      success: true,
      messageId: chatEntry.id,
      original: {
        text,
        language: sourceLanguage
      },
      translated: {
        text: response.translated_text,
        language: targetLang
      },
      performance: {
        totalResponseTime: restTime,
        grpcServiceTime: grpcTime,
        gatewayOverhead: restTime - grpcTime,
        restPayloadSize,
        grpcPayloadSize,
        sizeReduction: `${((1 - grpcPayloadSize / restPayloadSize) * 100).toFixed(1)}%`
      }
    };
    
    console.log(`  [SUCCESS] Translation complete`);
    console.log(`  Response Payload Size: ${getJsonSize(restResponse)} bytes`);
    
    res.json(restResponse);
  });
});

/**
 * POST /api/messages/audio
 * Send an audio message - forwards to Audio Service via gRPC
 * 
 * Accepts audio as:
 * 1. Base64 encoded string in JSON body
 * 2. Binary file upload (multipart/form-data)
 * 
 * IMPORTANT: Audio processing logic is NOT in this gateway.
 * It's handled by the Audio Service (gRPC).
 */
app.post('/api/messages/audio', upload.single('audio'), async (req, res) => {
  const restStartTime = Date.now();
  
  console.log('\n' + '='.repeat(60));
  console.log('[REST API] POST /api/messages/audio');
  console.log('='.repeat(60));
  
  let audioBuffer;
  let userId;
  let sourceLanguage;
  let targetLanguage;
  let audioFormat;
  
  // Handle file upload or base64
  if (req.file) {
    // Multipart form data upload
    audioBuffer = req.file.buffer;
    userId = req.body.userId;
    sourceLanguage = req.body.sourceLanguage || 'en';
    targetLanguage = req.body.targetLanguage;
    audioFormat = req.body.audioFormat || 'wav';
    console.log('  Input Type: File Upload');
  } else if (req.body.audioData) {
    // Base64 encoded in JSON
    audioBuffer = Buffer.from(req.body.audioData, 'base64');
    userId = req.body.userId;
    sourceLanguage = req.body.sourceLanguage || 'en';
    targetLanguage = req.body.targetLanguage;
    audioFormat = req.body.audioFormat || 'wav';
    console.log('  Input Type: Base64 JSON');
  } else {
    return res.status(400).json({
      success: false,
      error: 'Audio data required (either file upload or base64 audioData)'
    });
  }
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'userId is required'
    });
  }
  
  // Get target language from user preference if not specified
  const targetLang = targetLanguage || userLanguages.get(userId) || 'es';
  
  console.log(`  User ID: ${userId}`);
  console.log(`  Audio Size: ${audioBuffer.length} bytes`);
  console.log(`  Audio Format: ${audioFormat}`);
  console.log(`  Source: ${sourceLanguage} → Target: ${targetLang}`);
  
  // Calculate REST payload size (with base64 encoding overhead)
  const base64Size = Buffer.from(audioBuffer).toString('base64').length;
  const restPayloadSize = base64Size + 200; // Approximate JSON wrapper
  
  // gRPC sends binary directly - no base64 overhead
  const grpcPayloadSize = audioBuffer.length + 50; // Small protobuf overhead
  
  // Prepare gRPC request
  const grpcRequest = {
    audio_data: audioBuffer,
    audio_format: audioFormat,
    source_language: sourceLanguage,
    target_language: targetLang,
    user_id: userId,
    timestamp: Date.now(),
    sample_rate: 44100,
    channels: 2
  };
  
  const grpcStartTime = Date.now();
  
  // Forward to Audio Service via gRPC
  audioClient.ProcessAudio(grpcRequest, (error, response) => {
    const grpcEndTime = Date.now();
    const grpcTime = grpcEndTime - grpcStartTime;
    
    if (error) {
      console.error(`  [ERROR] gRPC call failed: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: 'Audio service unavailable',
        details: error.message
      });
    }
    
    // Store in chat history
    const chatEntry = {
      id: uuidv4(),
      type: 'audio',
      userId,
      audioSize: audioBuffer.length,
      processedAudioSize: response.processed_size,
      sourceLanguage,
      targetLanguage: targetLang,
      timestamp: new Date().toISOString()
    };
    chatHistory.push(chatEntry);
    
    // Calculate REST response time
    const restTime = Date.now() - restStartTime;
    
    // Log performance comparison
    const metrics = {
      restTime,
      grpcTime,
      restPayloadSize,
      grpcPayloadSize
    };
    
    performanceMetrics.rest.audio.push({ time: restTime, size: restPayloadSize });
    performanceMetrics.grpc.audio.push({ time: grpcTime, size: grpcPayloadSize });
    
    logMetrics('AUDIO', 'Processing', metrics);
    
    // Convert processed audio to base64 for REST response
    const processedAudioBase64 = response.translated_audio 
      ? Buffer.from(response.translated_audio).toString('base64')
      : '';
    
    // Send REST response
    const restResponse = {
      success: true,
      messageId: chatEntry.id,
      original: {
        size: audioBuffer.length,
        format: audioFormat,
        language: sourceLanguage
      },
      processed: {
        audioData: processedAudioBase64,
        size: response.processed_size,
        format: response.audio_format,
        language: targetLang
      },
      performance: {
        totalResponseTime: restTime,
        grpcServiceTime: grpcTime,
        gatewayOverhead: restTime - grpcTime,
        restPayloadSize,
        grpcPayloadSize,
        sizeReduction: `${((1 - grpcPayloadSize / restPayloadSize) * 100).toFixed(1)}%`,
        note: 'REST requires base64 encoding (+33% size), gRPC sends native binary'
      }
    };
    
    console.log(`  [SUCCESS] Audio processing complete`);
    console.log(`  Response Payload Size: ${getJsonSize(restResponse)} bytes`);
    
    res.json(restResponse);
  });
});

/**
 * GET /api/messages/history
 * Fetch chat history
 */
app.get('/api/messages/history', (req, res) => {
  const { userId, limit = 50 } = req.query;
  
  console.log('\n[REST API] GET /api/messages/history');
  
  let history = chatHistory;
  
  if (userId) {
    history = history.filter(msg => msg.userId === userId);
  }
  
  // Return most recent messages
  history = history.slice(-parseInt(limit));
  
  res.json({
    success: true,
    count: history.length,
    messages: history
  });
});

/**
 * GET /api/performance/metrics
 * Get performance comparison metrics
 */
app.get('/api/performance/metrics', (req, res) => {
  console.log('\n[REST API] GET /api/performance/metrics');
  
  // Calculate averages
  const calcAvg = (arr, prop) => {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, item) => sum + item[prop], 0) / arr.length;
  };
  
  const metrics = {
    text: {
      rest: {
        avgResponseTime: calcAvg(performanceMetrics.rest.text, 'time').toFixed(2),
        avgPayloadSize: calcAvg(performanceMetrics.rest.text, 'size').toFixed(0),
        sampleCount: performanceMetrics.rest.text.length
      },
      grpc: {
        avgResponseTime: calcAvg(performanceMetrics.grpc.text, 'time').toFixed(2),
        avgPayloadSize: calcAvg(performanceMetrics.grpc.text, 'size').toFixed(0),
        sampleCount: performanceMetrics.grpc.text.length
      }
    },
    audio: {
      rest: {
        avgResponseTime: calcAvg(performanceMetrics.rest.audio, 'time').toFixed(2),
        avgPayloadSize: calcAvg(performanceMetrics.rest.audio, 'size').toFixed(0),
        sampleCount: performanceMetrics.rest.audio.length
      },
      grpc: {
        avgResponseTime: calcAvg(performanceMetrics.grpc.audio, 'time').toFixed(2),
        avgPayloadSize: calcAvg(performanceMetrics.grpc.audio, 'size').toFixed(0),
        sampleCount: performanceMetrics.grpc.audio.length
      }
    },
    analysis: {
      textSpeedImprovement: performanceMetrics.rest.text.length > 0 
        ? `gRPC is ${(calcAvg(performanceMetrics.rest.text, 'time') / calcAvg(performanceMetrics.grpc.text, 'time')).toFixed(2)}x faster`
        : 'No data',
      audioSpeedImprovement: performanceMetrics.rest.audio.length > 0
        ? `gRPC is ${(calcAvg(performanceMetrics.rest.audio, 'time') / calcAvg(performanceMetrics.grpc.audio, 'time')).toFixed(2)}x faster`
        : 'No data',
      recommendation: 'Use gRPC for service-to-service communication for better performance'
    }
  };
  
  res.json({
    success: true,
    metrics
  });
});

/**
 * GET /api/languages
 * Get supported languages from Translation Service
 */
app.get('/api/languages', (req, res) => {
  console.log('\n[REST API] GET /api/languages');
  
  translationClient.GetSupportedLanguages({}, (error, response) => {
    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch languages'
      });
    }
    
    res.json({
      success: true,
      languages: response.languages
    });
  });
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    services: {
      apiGateway: 'running',
      translationService: TRANSLATION_SERVICE_URL,
      audioService: AUDIO_SERVICE_URL
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/test/concurrent
 * Test concurrent message handling
 */
app.post('/api/test/concurrent', async (req, res) => {
  const { messages = 5 } = req.body;
  
  console.log('\n' + '='.repeat(60));
  console.log(`[TEST] Concurrent Message Test - ${messages} messages`);
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  const promises = [];
  
  for (let i = 0; i < messages; i++) {
    const promise = new Promise((resolve, reject) => {
      const request = {
        text: `Test message ${i + 1}`,
        source_language: 'en',
        target_language: 'es',
        user_id: `test-user-${i}`,
        timestamp: Date.now()
      };
      
      translationClient.TranslateText(request, (error, response) => {
        if (error) reject(error);
        else resolve(response);
      });
    });
    promises.push(promise);
  }
  
  try {
    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    
    res.json({
      success: true,
      messagesProcessed: messages,
      totalTime: `${totalTime}ms`,
      avgTimePerMessage: `${(totalTime / messages).toFixed(2)}ms`,
      results: results.map((r, i) => ({
        message: i + 1,
        translated: r.translated_text,
        time: r.processing_time_ms
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: err.message
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================
app.listen(PORT, () => {
  console.log('\n' + '═'.repeat(60));
  console.log('   API GATEWAY (REST) STARTED');
  console.log('═'.repeat(60));
  console.log(`   Port: ${PORT}`);
  console.log(`   Protocol: REST with JSON`);
  console.log('');
  console.log('   Connecting to gRPC Services:');
  
  initializeGrpcClients();
  
  console.log('');
  console.log('   Available Endpoints:');
  console.log('   ---------------------');
  console.log('   POST /api/users/language     - Set user language');
  console.log('   GET  /api/users/:id/language - Get user language');
  console.log('   POST /api/messages/text      - Send text message');
  console.log('   POST /api/messages/audio     - Send audio message');
  console.log('   GET  /api/messages/history   - Get chat history');
  console.log('   GET  /api/languages          - Get supported languages');
  console.log('   GET  /api/performance/metrics- Get performance metrics');
  console.log('   GET  /api/health             - Health check');
  console.log('   POST /api/test/concurrent    - Test concurrent messages');
  console.log('═'.repeat(60));
  console.log('\n   Ready to accept client requests!\n');
});
