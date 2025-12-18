/**
 * Translation Service - gRPC Server
 * ==================================
 * PDC Lab Exam - Distributed Chat System
 * 
 * This service handles text translation using hardcoded mappings.
 * Communication: gRPC with Protocol Buffers (binary serialization)
 * 
 * IMPORTANT: This service is called by the API Gateway, NOT directly by clients.
 * This demonstrates proper microservices architecture with Server → Server gRPC.
 */

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================
const PORT = process.env.TRANSLATION_PORT || 50051;
const PROTO_PATH = path.join(__dirname, '../proto/translation.proto');

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

const translationProto = grpc.loadPackageDefinition(packageDefinition).translation;

// ============================================================================
// HARDCODED TRANSLATION MAPPINGS (No external APIs as per exam requirements)
// ============================================================================
const TRANSLATIONS = {
  // English to Spanish
  'en-es': {
    'hello': 'hola',
    'goodbye': 'adiós',
    'good morning': 'buenos días',
    'good night': 'buenas noches',
    'how are you': 'cómo estás',
    'thank you': 'gracias',
    'please': 'por favor',
    'yes': 'sí',
    'no': 'no',
    'welcome': 'bienvenido',
    'friend': 'amigo',
    'love': 'amor',
    'water': 'agua',
    'food': 'comida',
    'help': 'ayuda',
    'i am fine': 'estoy bien',
    'what is your name': 'cuál es tu nombre',
    'my name is': 'mi nombre es',
    'nice to meet you': 'mucho gusto',
    'see you later': 'hasta luego'
  },
  // English to French
  'en-fr': {
    'hello': 'bonjour',
    'goodbye': 'au revoir',
    'good morning': 'bonjour',
    'good night': 'bonne nuit',
    'how are you': 'comment allez-vous',
    'thank you': 'merci',
    'please': 's\'il vous plaît',
    'yes': 'oui',
    'no': 'non',
    'welcome': 'bienvenue',
    'friend': 'ami',
    'love': 'amour',
    'water': 'eau',
    'food': 'nourriture',
    'help': 'aide',
    'i am fine': 'je vais bien',
    'what is your name': 'comment vous appelez-vous',
    'my name is': 'je m\'appelle',
    'nice to meet you': 'enchanté',
    'see you later': 'à plus tard'
  },
  // English to German
  'en-de': {
    'hello': 'hallo',
    'goodbye': 'auf wiedersehen',
    'good morning': 'guten morgen',
    'good night': 'gute nacht',
    'how are you': 'wie geht es dir',
    'thank you': 'danke',
    'please': 'bitte',
    'yes': 'ja',
    'no': 'nein',
    'welcome': 'willkommen',
    'friend': 'freund',
    'love': 'liebe',
    'water': 'wasser',
    'food': 'essen',
    'help': 'hilfe',
    'i am fine': 'mir geht es gut',
    'what is your name': 'wie heißt du',
    'my name is': 'ich heiße',
    'nice to meet you': 'freut mich',
    'see you later': 'bis später'
  },
  // English to Urdu
  'en-ur': {
    'hello': 'السلام علیکم',
    'goodbye': 'خدا حافظ',
    'good morning': 'صبح بخیر',
    'good night': 'شب بخیر',
    'how are you': 'آپ کیسے ہیں',
    'thank you': 'شکریہ',
    'please': 'براہ کرم',
    'yes': 'ہاں',
    'no': 'نہیں',
    'welcome': 'خوش آمدید',
    'friend': 'دوست',
    'love': 'محبت',
    'water': 'پانی',
    'food': 'کھانا',
    'help': 'مدد',
    'i am fine': 'میں ٹھیک ہوں',
    'what is your name': 'آپ کا نام کیا ہے',
    'my name is': 'میرا نام ہے',
    'nice to meet you': 'آپ سے مل کر خوشی ہوئی',
    'see you later': 'پھر ملیں گے'
  },
  // Spanish to English
  'es-en': {
    'hola': 'hello',
    'adiós': 'goodbye',
    'buenos días': 'good morning',
    'buenas noches': 'good night',
    'cómo estás': 'how are you',
    'gracias': 'thank you',
    'por favor': 'please',
    'sí': 'yes',
    'no': 'no',
    'bienvenido': 'welcome'
  },
  // French to English
  'fr-en': {
    'bonjour': 'hello',
    'au revoir': 'goodbye',
    'bonne nuit': 'good night',
    'merci': 'thank you',
    'oui': 'yes',
    'non': 'no',
    'bienvenue': 'welcome'
  }
};

// Supported languages
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ur', name: 'Urdu' }
];

// ============================================================================
// TRANSLATION LOGIC
// ============================================================================

/**
 * Translate text using hardcoded mappings
 * Falls back to original text with marker if no translation found
 */
function translateText(text, sourceLang, targetLang) {
  const startTime = Date.now();
  
  // If same language, return as-is
  if (sourceLang === targetLang) {
    return {
      translated: text,
      processingTime: Date.now() - startTime
    };
  }

  const key = `${sourceLang}-${targetLang}`;
  const mappings = TRANSLATIONS[key] || {};
  
  // Normalize text for lookup
  const normalizedText = text.toLowerCase().trim();
  
  // Check for exact match
  if (mappings[normalizedText]) {
    return {
      translated: mappings[normalizedText],
      processingTime: Date.now() - startTime
    };
  }
  
  // Word-by-word translation for phrases
  const words = normalizedText.split(' ');
  const translatedWords = words.map(word => {
    return mappings[word] || word;
  });
  
  const result = translatedWords.join(' ');
  
  // If no translation found, add marker
  const translated = result === normalizedText 
    ? `[${targetLang.toUpperCase()}] ${text}` 
    : result;
  
  return {
    translated,
    processingTime: Date.now() - startTime
  };
}

// ============================================================================
// gRPC SERVICE IMPLEMENTATIONS
// ============================================================================

/**
 * TranslateText - Main translation RPC
 * Receives text and returns translated text using hardcoded mappings
 */
function handleTranslateText(call, callback) {
  const startTime = Date.now();
  const request = call.request;
  
  console.log('\n' + '='.repeat(60));
  console.log('[TRANSLATION SERVICE] Received TranslateText Request');
  console.log('='.repeat(60));
  console.log(`  User ID: ${request.user_id}`);
  console.log(`  Text: "${request.text}"`);
  console.log(`  Source Language: ${request.source_language}`);
  console.log(`  Target Language: ${request.target_language}`);
  console.log(`  Timestamp: ${new Date(parseInt(request.timestamp)).toISOString()}`);
  
  try {
    const { translated, processingTime } = translateText(
      request.text,
      request.source_language,
      request.target_language
    );
    
    const response = {
      original_text: request.text,
      translated_text: translated,
      source_language: request.source_language,
      target_language: request.target_language,
      success: true,
      error_message: '',
      processing_time_ms: Date.now() - startTime
    };
    
    console.log(`\n  [RESULT] Translated: "${translated}"`);
    console.log(`  [PERF] Processing Time: ${response.processing_time_ms}ms`);
    console.log('='.repeat(60) + '\n');
    
    callback(null, response);
  } catch (error) {
    console.error(`  [ERROR] Translation failed: ${error.message}`);
    callback(null, {
      original_text: request.text,
      translated_text: '',
      source_language: request.source_language,
      target_language: request.target_language,
      success: false,
      error_message: error.message,
      processing_time_ms: Date.now() - startTime
    });
  }
}

/**
 * TranslateBatch - Batch translation RPC
 * Processes multiple translation requests at once
 */
function handleTranslateBatch(call, callback) {
  const startTime = Date.now();
  const requests = call.request.requests;
  
  console.log('\n' + '='.repeat(60));
  console.log('[TRANSLATION SERVICE] Received Batch Translation Request');
  console.log(`  Number of texts: ${requests.length}`);
  console.log('='.repeat(60));
  
  const responses = requests.map(req => {
    const { translated, processingTime } = translateText(
      req.text,
      req.source_language,
      req.target_language
    );
    
    return {
      original_text: req.text,
      translated_text: translated,
      source_language: req.source_language,
      target_language: req.target_language,
      success: true,
      error_message: '',
      processing_time_ms: processingTime
    };
  });
  
  const totalTime = Date.now() - startTime;
  console.log(`  [PERF] Total Batch Processing Time: ${totalTime}ms`);
  console.log('='.repeat(60) + '\n');
  
  callback(null, {
    responses,
    total_processing_time_ms: totalTime
  });
}

/**
 * GetSupportedLanguages - Returns list of supported languages
 */
function handleGetSupportedLanguages(call, callback) {
  console.log('[TRANSLATION SERVICE] GetSupportedLanguages called');
  callback(null, {
    languages: SUPPORTED_LANGUAGES
  });
}

// ============================================================================
// SERVER SETUP
// ============================================================================

function startServer() {
  const server = new grpc.Server();
  
  // Register service handlers
  server.addService(translationProto.TranslationService.service, {
    TranslateText: handleTranslateText,
    TranslateBatch: handleTranslateBatch,
    GetSupportedLanguages: handleGetSupportedLanguages
  });
  
  // Bind and start server
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Failed to start Translation Service:', error);
        process.exit(1);
      }
      
      console.log('\n' + '═'.repeat(60));
      console.log('   TRANSLATION SERVICE (gRPC) STARTED');
      console.log('═'.repeat(60));
      console.log(`   Port: ${port}`);
      console.log(`   Protocol: gRPC with Protocol Buffers`);
      console.log(`   Supported Languages: ${SUPPORTED_LANGUAGES.map(l => l.code).join(', ')}`);
      console.log('═'.repeat(60));
      console.log('\n   Waiting for requests from API Gateway...\n');
    }
  );
}

// Start the server
startServer();
