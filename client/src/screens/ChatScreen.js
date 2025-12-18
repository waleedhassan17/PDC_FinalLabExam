/**
 * ChatScreen - Main Chat & Translation Screen
 * ============================================
 * PDC Lab Exam - Distributed Chat System
 * 
 * Features:
 * - Language selection (source & target)
 * - Send text messages for translation
 * - Send dummy audio messages
 * - View translated messages with performance metrics
 * 
 * Demonstrates: Client → REST → API Gateway → gRPC → Translation Service
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, generateUserId } from '../constants/config';
import { api, generateDummyAudio } from '../services/api';
import LanguagePicker from '../components/LanguagePicker';
import MessageBubble from '../components/MessageBubble';

const ChatScreen = () => {
  // State
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [loading, setLoading] = useState(false);
  const [userId] = useState(generateUserId());
  
  const flatListRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await api.getChatHistory(userId, 50);
      if (response.success && response.messages) {
        setMessages(response.messages.reverse());
      }
    } catch (error) {
      console.log('No existing chat history');
    }
  };

  // Send text message
  const sendTextMessage = async () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter a message to translate');
      return;
    }

    setLoading(true);
    try {
      const response = await api.sendTextMessage(
        userId,
        inputText.trim(),
        sourceLanguage,
        targetLanguage
      );

      if (response.success) {
        const newMessage = {
          id: response.messageId,
          type: 'text',
          userId,
          originalText: response.original.text,
          translatedText: response.translated.text,
          sourceLanguage: response.original.language,
          targetLanguage: response.translated.language,
          performance: response.performance,
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, newMessage]);
        setInputText('');
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  // Send audio message (dummy)
  const sendAudioMessage = async () => {
    setLoading(true);
    try {
      const audioBase64 = generateDummyAudio();
      
      const response = await api.sendAudioMessage(
        userId,
        audioBase64,
        sourceLanguage,
        targetLanguage
      );

      if (response.success) {
        const newMessage = {
          id: response.messageId,
          type: 'audio',
          userId,
          audioSize: response.original.size,
          processedAudioSize: response.processed.size,
          sourceLanguage: response.original.language,
          targetLanguage: response.processed.language,
          performance: response.performance,
          timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, newMessage]);
        
        Alert.alert(
          '🎵 Audio Processed!',
          `Size: ${response.original.size} → ${response.processed.size} bytes\n` +
          `Time: ${response.performance.totalResponseTime}ms\n` +
          `gRPC saved ${response.performance.sizeReduction} bandwidth!`
        );
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send audio');
    } finally {
      setLoading(false);
    }
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyTitle}>Start Translating!</Text>
      <Text style={styles.emptySubtitle}>
        Type a message below and it will be translated using our distributed gRPC services.
      </Text>
      <Text style={styles.emptyTip}>
        💡 Tip: Tap on messages to see performance metrics
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TransLingo Chat</Text>
        <Text style={styles.headerSubtitle}>PDC Lab Exam • REST + gRPC Demo</Text>
      </View>

      {/* Language Selectors */}
      <View style={styles.languageContainer}>
        <LanguagePicker
          label="From:"
          selectedLanguage={sourceLanguage}
          onSelectLanguage={setSourceLanguage}
        />
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>→</Text>
        </View>
        <LanguagePicker
          label="To:"
          selectedLanguage={targetLanguage}
          onSelectLanguage={setTargetLanguage}
        />
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={({ item }) => <MessageBubble message={item} isOwn={true} />}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputContainer}>
          {/* Mic Button */}
          <TouchableOpacity
            style={styles.micButton}
            onPress={sendAudioMessage}
            disabled={loading}
          >
            <Text style={styles.micIcon}>🎤</Text>
          </TouchableOpacity>

          {/* Text Input */}
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message to translate..."
            placeholderTextColor={COLORS.textLight}
            multiline
            maxLength={500}
            editable={!loading}
          />

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={sendTextMessage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.textWhite} size="small" />
            ) : (
              <Text style={styles.sendIcon}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  arrowContainer: {
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  arrow: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
  messagesList: {
    flexGrow: 1,
    paddingVertical: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  emptyTip: {
    fontSize: 12,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  micIcon: {
    fontSize: 22,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: COLORS.background,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  sendIcon: {
    fontSize: 20,
    color: COLORS.textWhite,
  },
});

export default ChatScreen;
