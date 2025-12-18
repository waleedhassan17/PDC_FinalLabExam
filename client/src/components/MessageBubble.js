/**
 * MessageBubble Component
 * =======================
 * PDC Lab Exam - Distributed Chat System
 * 
 * Displays chat messages with translation and performance info
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS } from '../constants/config';

const MessageBubble = ({ message, isOwn = true }) => {
  const [expanded, setExpanded] = useState(false);
  
  const isText = message.type === 'text';
  const isAudio = message.type === 'audio';
  
  return (
    <TouchableOpacity 
      style={[styles.container, isOwn ? styles.ownMessage : styles.otherMessage]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      {/* Message Type Icon */}
      <View style={styles.header}>
        <Text style={styles.typeIcon}>
          {isText ? '💬' : '🎵'}
        </Text>
        <Text style={styles.languageBadge}>
          {message.sourceLanguage?.toUpperCase()} → {message.targetLanguage?.toUpperCase()}
        </Text>
      </View>
      
      {/* Text Message Content */}
      {isText && (
        <View style={styles.textContent}>
          <Text style={styles.originalText}>
            {message.originalText || message.original?.text}
          </Text>
          <Text style={styles.translatedText}>
            {message.translatedText || message.translated?.text}
          </Text>
        </View>
      )}
      
      {/* Audio Message Content */}
      {isAudio && (
        <View style={styles.audioContent}>
          <Text style={styles.audioLabel}>🎵 Audio Message</Text>
          <Text style={styles.audioSize}>
            {message.audioSize || message.original?.size} bytes → {message.processedAudioSize || message.processed?.size} bytes
          </Text>
        </View>
      )}
      
      {/* Performance Info (Expandable) */}
      {expanded && message.performance && (
        <View style={styles.performanceContainer}>
          <Text style={styles.performanceTitle}>⚡ Performance Metrics</Text>
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Response Time:</Text>
            <Text style={styles.performanceValue}>{message.performance.totalResponseTime}ms</Text>
          </View>
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>gRPC Time:</Text>
            <Text style={styles.performanceValue}>{message.performance.grpcServiceTime}ms</Text>
          </View>
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Gateway Overhead:</Text>
            <Text style={styles.performanceValue}>{message.performance.gatewayOverhead}ms</Text>
          </View>
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Size Reduction:</Text>
            <Text style={[styles.performanceValue, styles.successText]}>
              {message.performance.sizeReduction}
            </Text>
          </View>
        </View>
      )}
      
      {/* Timestamp */}
      <Text style={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString()}
        {message.performance && !expanded && ' • Tap for metrics'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '85%',
    marginVertical: 6,
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
    backgroundColor: COLORS.primary,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  languageBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  textContent: {
    marginBottom: 4,
  },
  originalText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  translatedText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  audioContent: {
    marginBottom: 4,
  },
  audioLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  audioSize: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  performanceContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  performanceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 6,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  performanceLabel: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  performanceValue: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
  successText: {
    color: COLORS.success,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 6,
    textAlign: 'right',
  },
});

export default MessageBubble;
