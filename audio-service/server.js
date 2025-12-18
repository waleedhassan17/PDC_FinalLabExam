/**
 * Audio Processing Service - gRPC Server
 * =======================================
 * PDC Lab Exam - Distributed Chat System
 * 
 * This service handles audio message processing using binary Protocol Buffers.
 * Returns dummy translated audio data (no real speech processing as per exam requirements).
 * 
 * KEY BENEFIT: gRPC with Protobuf is ideal for binary data like audio because:
 * - Native binary support (no base64 encoding overhead)
 * - Smaller payload sizes
 * - Lower latency
 * - HTTP/2 multiplexing
 */

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================
const PORT = process.env.AUDIO_PORT || 50052;
const PROTO_PATH = path.join(__dirname, '../proto/audio.proto');

// ============================================================================
// LOAD PROTO DEFINITION
// ============================================================================
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const audioProto = grpc.loadPackageDefinition(packageDefinition).audio;

// ============================================================================
// DUMMY AUDIO GENERATION (No real audio processing as per exam requirements)
// ============================================================================

/**
 * Generate dummy "translated" audio data
 * In a real system, this would involve:
 * 1. Speech-to-text conversion
 * 2. Text translation
 * 3. Text-to-speech in target language
 * 
 * For this exam, we generate dummy binary data with language markers
 */
function generateTranslatedAudio(originalAudio, sourceLang, targetLang) {
  const startTime = Date.now();
  
  // Create a header indicating the "translation"
  const header = Buffer.from(`TRANSLATED_AUDIO:${sourceLang}->${targetLang}|`);
  
  // Generate dummy audio data (simulated processed audio)
  // In reality, this would be actual translated speech audio
  const dummyAudioSize = Math.max(originalAudio.length, 1024);
  const dummyAudio = Buffer.alloc(dummyAudioSize);
  
  // Fill with pattern to simulate audio waveform
  for (let i = 0; i < dummyAudioSize; i++) {
    // Create a simple wave pattern
    dummyAudio[i] = Math.floor(128 + 127 * Math.sin(i * 0.01));
  }
  
  // Combine header with dummy audio
  const result = Buffer.concat([header, dummyAudio]);
  
  const processingTime = Date.now() - startTime;
  
  return {
    translatedAudio: result,
    processingTime,
    originalSize: originalAudio.length,
    processedSize: result.length
  };
}

/**
 * Analyze audio data (dummy implementation)
 */
function analyzeAudio(audioData) {
  return {
    format: 'wav',
    duration_ms: Math.floor(audioData.length / 44.1), // Rough estimate at 44.1kHz
    sample_rate: 44100,
    channels: 2,
    bit_depth: 16,
    size_bytes: audioData.length
  };
}

// ============================================================================
// gRPC SERVICE IMPLEMENTATIONS
// ============================================================================

/**
 * ProcessAudio - Main audio processing RPC
 * Receives audio bytes and returns "translated" audio bytes
 * 
 * This demonstrates why gRPC is preferred for binary data:
 * - Audio is sent as native bytes (not base64 encoded)
 * - Protocol Buffers handle binary data efficiently
 * - Lower overhead compared to REST JSON
 */
function handleProcessAudio(call, callback) {
  const startTime = Date.now();
  const request = call.request;
  
  console.log('\n' + '='.repeat(60));
  console.log('[AUDIO SERVICE] Received ProcessAudio Request');
  console.log('='.repeat(60));
  console.log(`  User ID: ${request.user_id}`);
  console.log(`  Audio Format: ${request.audio_format}`);
  console.log(`  Source Language: ${request.source_language}`);
  console.log(`  Target Language: ${request.target_language}`);
  console.log(`  Audio Size: ${request.audio_data.length} bytes`);
  console.log(`  Sample Rate: ${request.sample_rate || 'not specified'}`);
  console.log(`  Channels: ${request.channels || 'not specified'}`);
  
  try {
    // Process audio (dummy translation)
    const {
      translatedAudio,
      processingTime,
      originalSize,
      processedSize
    } = generateTranslatedAudio(
      request.audio_data,
      request.source_language,
      request.target_language
    );
    
    const response = {
      translated_audio: translatedAudio,
      audio_format: request.audio_format || 'wav',
      source_language: request.source_language,
      target_language: request.target_language,
      success: true,
      error_message: '',
      processing_time_ms: Date.now() - startTime,
      original_size: originalSize,
      processed_size: processedSize
    };
    
    console.log('\n  [RESULT]');
    console.log(`    Original Size: ${originalSize} bytes`);
    console.log(`    Processed Size: ${processedSize} bytes`);
    console.log(`    Processing Time: ${response.processing_time_ms}ms`);
    console.log('='.repeat(60) + '\n');
    
    callback(null, response);
  } catch (error) {
    console.error(`  [ERROR] Audio processing failed: ${error.message}`);
    callback(null, {
      translated_audio: Buffer.alloc(0),
      audio_format: request.audio_format,
      source_language: request.source_language,
      target_language: request.target_language,
      success: false,
      error_message: error.message,
      processing_time_ms: Date.now() - startTime,
      original_size: request.audio_data.length,
      processed_size: 0
    });
  }
}

/**
 * ProcessAudioStream - Streaming audio processing RPC
 * Handles large audio files by receiving chunks
 */
function handleProcessAudioStream(call, callback) {
  const startTime = Date.now();
  const chunks = [];
  let userId = '';
  let targetLanguage = '';
  
  console.log('\n' + '='.repeat(60));
  console.log('[AUDIO SERVICE] Receiving Audio Stream');
  console.log('='.repeat(60));
  
  call.on('data', (chunk) => {
    console.log(`  Received chunk ${chunk.chunk_index}, size: ${chunk.data.length} bytes`);
    chunks.push(chunk.data);
    userId = chunk.user_id || userId;
    targetLanguage = chunk.target_language || targetLanguage;
  });
  
  call.on('end', () => {
    const fullAudio = Buffer.concat(chunks);
    console.log(`  Total audio size: ${fullAudio.length} bytes`);
    
    const {
      translatedAudio,
      processingTime,
      originalSize,
      processedSize
    } = generateTranslatedAudio(fullAudio, 'en', targetLanguage);
    
    const response = {
      translated_audio: translatedAudio,
      audio_format: 'wav',
      source_language: 'en',
      target_language: targetLanguage,
      success: true,
      error_message: '',
      processing_time_ms: Date.now() - startTime,
      original_size: originalSize,
      processed_size: processedSize
    };
    
    console.log(`  Stream processing complete: ${response.processing_time_ms}ms`);
    console.log('='.repeat(60) + '\n');
    
    callback(null, response);
  });
  
  call.on('error', (error) => {
    console.error(`  Stream error: ${error.message}`);
    callback(error);
  });
}

/**
 * GetAudioInfo - Get information about audio data
 */
function handleGetAudioInfo(call, callback) {
  const audioData = call.request.audio_data;
  
  console.log('[AUDIO SERVICE] GetAudioInfo called');
  console.log(`  Audio size: ${audioData.length} bytes`);
  
  const info = analyzeAudio(audioData);
  callback(null, info);
}

// ============================================================================
// SERVER SETUP
// ============================================================================

function startServer() {
  const server = new grpc.Server();
  
  // Register service handlers
  server.addService(audioProto.AudioService.service, {
    ProcessAudio: handleProcessAudio,
    ProcessAudioStream: handleProcessAudioStream,
    GetAudioInfo: handleGetAudioInfo
  });
  
  // Bind and start server
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Failed to start Audio Service:', error);
        process.exit(1);
      }
      
      console.log('\n' + '═'.repeat(60));
      console.log('   AUDIO PROCESSING SERVICE (gRPC) STARTED');
      console.log('═'.repeat(60));
      console.log(`   Port: ${port}`);
      console.log(`   Protocol: gRPC with Protocol Buffers`);
      console.log(`   Features: Binary audio processing, streaming support`);
      console.log('═'.repeat(60));
      console.log('\n   Waiting for requests from API Gateway...\n');
    }
  );
}

// Start the server
startServer();
