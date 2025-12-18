/**
 * CLI Client for Distributed Chat System
 * =======================================
 * PDC Lab Exam - Parallel and Distributed Computing
 * 
 * This client communicates with the API Gateway using REST APIs.
 * It demonstrates:
 * - Sending text messages (translated via gRPC Translation Service)
 * - Sending audio messages (processed via gRPC Audio Service)
 * - Setting user language preferences
 * - Viewing performance metrics
 * 
 * Communication: Client → API Gateway via REST (JSON)
 */

const axios = require('axios');
const readline = require('readline-sync');

// ============================================================================
// CONFIGURATION
// ============================================================================
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Get a user-friendly error message from axios errors
 */
function getErrorMessage(error) {
  if (error.code === 'ECONNREFUSED') {
    return `Connection refused - API Gateway is not running at ${API_BASE_URL}. Please start the server first.`;
  }
  if (error.code === 'ENOTFOUND') {
    return `Cannot reach ${API_BASE_URL} - Check your network connection.`;
  }
  if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
    return `Connection timed out - Server is not responding.`;
  }
  if (error.response) {
    // Server responded with an error status
    const status = error.response.status;
    const data = error.response.data;
    if (data && data.error) {
      return `Server Error (${status}): ${data.error}${data.details ? ' - ' + data.details : ''}`;
    }
    return `Server Error (${status}): ${error.response.statusText}`;
  }
  if (error.request) {
    // Request was made but no response received
    return `No response from server - Is the API Gateway running?`;
  }
  // Something else happened
  return error.message || 'Unknown error occurred';
}

function printHeader() {
  console.log('\n' + '═'.repeat(60));
  log('   DISTRIBUTED CHAT SYSTEM - CLI CLIENT', 'cyan');
  log('   PDC Lab Exam - REST & gRPC Demo', 'cyan');
  console.log('═'.repeat(60));
  log(`   API Gateway: ${API_BASE_URL}`, 'yellow');
  console.log('═'.repeat(60) + '\n');
}

function printMenu() {
  console.log('\n' + '-'.repeat(40));
  log('MENU OPTIONS:', 'bright');
  console.log('-'.repeat(40));
  console.log('  1. Set User Language');
  console.log('  2. Send Text Message');
  console.log('  3. Send Audio Message');
  console.log('  4. View Chat History');
  console.log('  5. View Performance Metrics');
  console.log('  6. Get Supported Languages');
  console.log('  7. Test Concurrent Messages');
  console.log('  8. Health Check');
  console.log('  9. Run All Demo Tests');
  console.log('  0. Exit');
  console.log('-'.repeat(40));
}

function formatPerformance(perf) {
  return `
  ┌─────────────────────────────────────────┐
  │ PERFORMANCE METRICS                     │
  ├─────────────────────────────────────────┤
  │ Total Response Time: ${String(perf.totalResponseTime + 'ms').padEnd(17)}│
  │ gRPC Service Time:   ${String(perf.grpcServiceTime + 'ms').padEnd(17)}│
  │ Gateway Overhead:    ${String(perf.gatewayOverhead + 'ms').padEnd(17)}│
  │ REST Payload Size:   ${String(perf.restPayloadSize + ' bytes').padEnd(17)}│
  │ gRPC Payload Size:   ${String(perf.grpcPayloadSize + ' bytes').padEnd(17)}│
  │ Size Reduction:      ${String(perf.sizeReduction).padEnd(17)}│
  └─────────────────────────────────────────┘`;
}

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

/**
 * Set user's preferred language
 */
async function setUserLanguage(userId, language) {
  try {
    log('\n[REQUEST] Setting user language...', 'yellow');
    
    const response = await axios.post(`${API_BASE_URL}/api/users/language`, {
      userId,
      language
    });
    
    if (response.data.success) {
      log(`[SUCCESS] Language set to: ${language}`, 'green');
      log(`Response Time: ${response.data.responseTime}ms`, 'cyan');
    }
    return response.data;
  } catch (error) {
    const errorMsg = getErrorMessage(error);
    log(`[ERROR] ${errorMsg}`, 'red');
    throw error;
  }
}

/**
 * Send a text message
 */
async function sendTextMessage(userId, text, sourceLanguage, targetLanguage) {
  try {
    log('\n[REQUEST] Sending text message...', 'yellow');
    log(`Text: "${text}"`, 'cyan');
    log(`Translation: ${sourceLanguage} → ${targetLanguage}`, 'cyan');
    
    const startTime = Date.now();
    const requestPayload = { userId, text, sourceLanguage, targetLanguage };
    const requestSize = Buffer.byteLength(JSON.stringify(requestPayload), 'utf8');
    
    log(`Request Payload Size: ${requestSize} bytes`, 'magenta');
    
    const response = await axios.post(`${API_BASE_URL}/api/messages/text`, requestPayload);
    
    const totalTime = Date.now() - startTime;
    
    if (response.data.success) {
      log('\n[SUCCESS] Translation Complete!', 'green');
      console.log('-'.repeat(40));
      log(`Original (${response.data.original.language}): "${response.data.original.text}"`, 'yellow');
      log(`Translated (${response.data.translated.language}): "${response.data.translated.text}"`, 'green');
      console.log('-'.repeat(40));
      
      log(formatPerformance(response.data.performance), 'cyan');
    }
    return response.data;
  } catch (error) {
    const errorMsg = getErrorMessage(error);
    log(`[ERROR] ${errorMsg}`, 'red');
    throw error;
  }
}

/**
 * Send an audio message (using dummy audio data)
 */
async function sendAudioMessage(userId, sourceLanguage, targetLanguage) {
  try {
    log('\n[REQUEST] Sending audio message...', 'yellow');
    
    // Generate dummy audio data (simulating audio recording)
    const audioSize = 10240; // 10KB of dummy audio
    const dummyAudio = Buffer.alloc(audioSize);
    for (let i = 0; i < audioSize; i++) {
      dummyAudio[i] = Math.floor(128 + 127 * Math.sin(i * 0.1));
    }
    
    const audioBase64 = dummyAudio.toString('base64');
    
    log(`Audio Size: ${audioSize} bytes (raw)`, 'cyan');
    log(`Base64 Size: ${audioBase64.length} bytes (+${((audioBase64.length / audioSize - 1) * 100).toFixed(0)}% overhead)`, 'cyan');
    
    const startTime = Date.now();
    
    const response = await axios.post(`${API_BASE_URL}/api/messages/audio`, {
      userId,
      audioData: audioBase64,
      audioFormat: 'wav',
      sourceLanguage,
      targetLanguage
    });
    
    const totalTime = Date.now() - startTime;
    
    if (response.data.success) {
      log('\n[SUCCESS] Audio Processing Complete!', 'green');
      console.log('-'.repeat(40));
      log(`Original Size: ${response.data.original.size} bytes`, 'yellow');
      log(`Processed Size: ${response.data.processed.size} bytes`, 'green');
      console.log('-'.repeat(40));
      
      log(formatPerformance(response.data.performance), 'cyan');
      
      if (response.data.performance.note) {
        log(`\nNote: ${response.data.performance.note}`, 'magenta');
      }
    }
    return response.data;
  } catch (error) {
    const errorMsg = getErrorMessage(error);
    log(`[ERROR] ${errorMsg}`, 'red');
    throw error;
  }
}

/**
 * Get chat history
 */
async function getChatHistory(userId = null, limit = 10) {
  try {
    log('\n[REQUEST] Fetching chat history...', 'yellow');
    
    let url = `${API_BASE_URL}/api/messages/history?limit=${limit}`;
    if (userId) url += `&userId=${userId}`;
    
    const response = await axios.get(url);
    
    if (response.data.success) {
      log(`\n[SUCCESS] Found ${response.data.count} messages`, 'green');
      console.log('-'.repeat(50));
      
      response.data.messages.forEach((msg, i) => {
        console.log(`\n${i + 1}. [${msg.type.toUpperCase()}] ${msg.timestamp}`);
        console.log(`   User: ${msg.userId}`);
        if (msg.type === 'text') {
          console.log(`   Original: "${msg.originalText}"`);
          console.log(`   Translated: "${msg.translatedText}"`);
        } else {
          console.log(`   Audio Size: ${msg.audioSize} → ${msg.processedAudioSize} bytes`);
        }
        console.log(`   Language: ${msg.sourceLanguage} → ${msg.targetLanguage}`);
      });
      console.log('-'.repeat(50));
    }
    return response.data;
  } catch (error) {
    const errorMsg = getErrorMessage(error);
    log(`[ERROR] ${errorMsg}`, 'red');
    throw error;
  }
}

/**
 * Get performance metrics
 */
async function getPerformanceMetrics() {
  try {
    log('\n[REQUEST] Fetching performance metrics...', 'yellow');
    
    const response = await axios.get(`${API_BASE_URL}/api/performance/metrics`);
    
    if (response.data.success) {
      const m = response.data.metrics;
      
      log('\n' + '═'.repeat(55), 'cyan');
      log(' PERFORMANCE COMPARISON: REST vs gRPC', 'bright');
      log('═'.repeat(55), 'cyan');
      
      log('\n TEXT MESSAGES:', 'yellow');
      console.log(' ┌───────────────────┬─────────────┬──────────────┐');
      console.log(' │ Metric            │ REST        │ gRPC         │');
      console.log(' ├───────────────────┼─────────────┼──────────────┤');
      console.log(` │ Avg Response Time │ ${m.text.rest.avgResponseTime.padStart(7)} ms │ ${m.text.grpc.avgResponseTime.padStart(8)} ms │`);
      console.log(` │ Avg Payload Size  │ ${m.text.rest.avgPayloadSize.padStart(6)} B  │ ${m.text.grpc.avgPayloadSize.padStart(7)} B  │`);
      console.log(` │ Sample Count      │ ${String(m.text.rest.sampleCount).padStart(11)} │ ${String(m.text.grpc.sampleCount).padStart(12)} │`);
      console.log(' └───────────────────┴─────────────┴──────────────┘');
      
      log('\n AUDIO MESSAGES:', 'yellow');
      console.log(' ┌───────────────────┬─────────────┬──────────────┐');
      console.log(' │ Metric            │ REST        │ gRPC         │');
      console.log(' ├───────────────────┼─────────────┼──────────────┤');
      console.log(` │ Avg Response Time │ ${m.audio.rest.avgResponseTime.padStart(7)} ms │ ${m.audio.grpc.avgResponseTime.padStart(8)} ms │`);
      console.log(` │ Avg Payload Size  │ ${m.audio.rest.avgPayloadSize.padStart(6)} B  │ ${m.audio.grpc.avgPayloadSize.padStart(7)} B  │`);
      console.log(` │ Sample Count      │ ${String(m.audio.rest.sampleCount).padStart(11)} │ ${String(m.audio.grpc.sampleCount).padStart(12)} │`);
      console.log(' └───────────────────┴─────────────┴──────────────┘');
      
      log('\n ANALYSIS:', 'green');
      console.log(` • Text: ${m.analysis.textSpeedImprovement}`);
      console.log(` • Audio: ${m.analysis.audioSpeedImprovement}`);
      console.log(` • ${m.analysis.recommendation}`);
      
      log('\n' + '═'.repeat(55), 'cyan');
    }
    return response.data;
  } catch (error) {
    const errorMsg = getErrorMessage(error);
    log(`[ERROR] ${errorMsg}`, 'red');
    throw error;
  }
}

/**
 * Get supported languages
 */
async function getSupportedLanguages() {
  try {
    log('\n[REQUEST] Fetching supported languages...', 'yellow');
    
    const response = await axios.get(`${API_BASE_URL}/api/languages`);
    
    if (response.data.success) {
      log('\n[SUCCESS] Supported Languages:', 'green');
      console.log('-'.repeat(30));
      response.data.languages.forEach(lang => {
        console.log(`  ${lang.code} - ${lang.name}`);
      });
      console.log('-'.repeat(30));
    }
    return response.data;
  } catch (error) {
    const errorMsg = getErrorMessage(error);
    log(`[ERROR] ${errorMsg}`, 'red');
    throw error;
  }
}

/**
 * Test concurrent message sending
 */
async function testConcurrentMessages(count = 5) {
  try {
    log(`\n[REQUEST] Testing ${count} concurrent messages...`, 'yellow');
    
    const response = await axios.post(`${API_BASE_URL}/api/test/concurrent`, {
      messages: count
    });
    
    if (response.data.success) {
      log('\n[SUCCESS] Concurrent Test Complete!', 'green');
      console.log('-'.repeat(50));
      console.log(`Messages Processed: ${response.data.messagesProcessed}`);
      console.log(`Total Time: ${response.data.totalTime}`);
      console.log(`Avg Time Per Message: ${response.data.avgTimePerMessage}`);
      console.log('-'.repeat(50));
      
      log('\nResults:', 'cyan');
      response.data.results.forEach(r => {
        console.log(`  Message ${r.message}: "${r.translated}" (${r.time}ms)`);
      });
    }
    return response.data;
  } catch (error) {
    const errorMsg = getErrorMessage(error);
    log(`[ERROR] ${errorMsg}`, 'red');
    throw error;
  }
}

/**
 * Health check
 */
async function healthCheck() {
  try {
    log('\n[REQUEST] Performing health check...', 'yellow');
    
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    
    if (response.data.success) {
      log('\n[SUCCESS] System Health:', 'green');
      console.log('-'.repeat(40));
      console.log(`  Status: ${response.data.status}`);
      console.log(`  API Gateway: ${response.data.services.apiGateway}`);
      console.log(`  Translation Service: ${response.data.services.translationService}`);
      console.log(`  Audio Service: ${response.data.services.audioService}`);
      console.log(`  Timestamp: ${response.data.timestamp}`);
      console.log('-'.repeat(40));
    }
    return response.data;
  } catch (error) {
    const errorMsg = getErrorMessage(error);
    log(`[ERROR] ${errorMsg}`, 'red');
    throw error;
  }
}

/**
 * Run all demo tests
 */
async function runAllDemoTests() {
  const userId = 'demo-user-' + Date.now();
  
  log('\n' + '═'.repeat(60), 'cyan');
  log(' RUNNING COMPLETE DEMO TEST SUITE', 'bright');
  log('═'.repeat(60), 'cyan');
  log(`User ID: ${userId}`, 'yellow');
  
  try {
    // 1. Health Check
    log('\n\n[TEST 1/8] Health Check', 'bright');
    await healthCheck();
    
    // 2. Get Languages
    log('\n\n[TEST 2/8] Get Supported Languages', 'bright');
    await getSupportedLanguages();
    
    // 3. Set Language
    log('\n\n[TEST 3/8] Set User Language', 'bright');
    await setUserLanguage(userId, 'es');
    
    // 4. Send Text - English to Spanish
    log('\n\n[TEST 4/8] Send Text Message (EN → ES)', 'bright');
    await sendTextMessage(userId, 'hello', 'en', 'es');
    
    // 5. Send Text - English to French
    log('\n\n[TEST 5/8] Send Text Message (EN → FR)', 'bright');
    await sendTextMessage(userId, 'thank you', 'en', 'fr');
    
    // 6. Send Audio
    log('\n\n[TEST 6/8] Send Audio Message', 'bright');
    await sendAudioMessage(userId, 'en', 'es');
    
    // 7. Concurrent Test
    log('\n\n[TEST 7/8] Concurrent Message Test', 'bright');
    await testConcurrentMessages(5);
    
    // 8. Performance Metrics
    log('\n\n[TEST 8/8] Performance Metrics', 'bright');
    await getPerformanceMetrics();
    
    // Final Chat History
    log('\n\n[FINAL] Chat History', 'bright');
    await getChatHistory(userId);
    
    log('\n' + '═'.repeat(60), 'green');
    log(' ALL TESTS COMPLETED SUCCESSFULLY!', 'bright');
    log('═'.repeat(60), 'green');
    
  } catch (error) {
    const errorMsg = getErrorMessage(error);
    log('\n[TEST FAILED] ' + errorMsg, 'red');
  }
}

// ============================================================================
// INTERACTIVE MODE
// ============================================================================

async function interactiveMode() {
  let userId = 'user-' + Math.random().toString(36).substr(2, 6);
  let running = true;
  
  printHeader();
  log(`Your User ID: ${userId}`, 'green');
  
  while (running) {
    printMenu();
    const choice = readline.question('\nEnter your choice: ');
    
    try {
      switch (choice) {
        case '1':
          const lang = readline.question('Enter language code (en/es/fr/de/ur): ');
          await setUserLanguage(userId, lang);
          break;
          
        case '2':
          const text = readline.question('Enter text to translate: ');
          const srcLang = readline.question('Source language (default: en): ') || 'en';
          const tgtLang = readline.question('Target language (default: es): ') || 'es';
          await sendTextMessage(userId, text, srcLang, tgtLang);
          break;
          
        case '3':
          const audioSrc = readline.question('Source language (default: en): ') || 'en';
          const audioTgt = readline.question('Target language (default: es): ') || 'es';
          await sendAudioMessage(userId, audioSrc, audioTgt);
          break;
          
        case '4':
          const histLimit = readline.question('Number of messages (default: 10): ') || '10';
          await getChatHistory(userId, parseInt(histLimit));
          break;
          
        case '5':
          await getPerformanceMetrics();
          break;
          
        case '6':
          await getSupportedLanguages();
          break;
          
        case '7':
          const msgCount = readline.question('Number of concurrent messages (default: 5): ') || '5';
          await testConcurrentMessages(parseInt(msgCount));
          break;
          
        case '8':
          await healthCheck();
          break;
          
        case '9':
          await runAllDemoTests();
          break;
          
        case '0':
          running = false;
          log('\nGoodbye! Thanks for using the Distributed Chat System.', 'cyan');
          break;
          
        default:
          log('Invalid option. Please try again.', 'red');
      }
    } catch (error) {
      // Error already logged in function
    }
    
    if (running && choice !== '9') {
      readline.question('\nPress Enter to continue...');
    }
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

const args = process.argv.slice(2);

if (args.includes('--demo') || args.includes('-d')) {
  // Run demo tests
  runAllDemoTests().then(() => process.exit(0)).catch(() => process.exit(1));
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Distributed Chat System - CLI Client
=====================================
Usage: node client.js [options]

Options:
  --demo, -d        Run all demo tests automatically
  --interactive, -i Interactive mode (default)
  --help, -h        Show this help message

Environment Variables:
  API_URL           API Gateway URL (default: http://localhost:3000)
  `);
} else {
  // Interactive mode (default)
  interactiveMode();
}
