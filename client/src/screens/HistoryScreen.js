/**
 * HistoryScreen - Message History
 * ================================
 * PDC Lab Exam - Distributed Chat System
 * 
 * Shows all translated messages with filtering options
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/config';
import { api } from '../services/api';

const HistoryScreen = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'text', 'audio'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Apply filter when messages or filter changes
  useEffect(() => {
    if (filter === 'all') {
      setFilteredMessages(messages);
    } else {
      setFilteredMessages(messages.filter(m => m.type === filter));
    }
  }, [messages, filter]);

  const loadHistory = async () => {
    try {
      const response = await api.getChatHistory(null, 100);
      if (response.success) {
        // Sort by newest first
        const sorted = (response.messages || []).sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setMessages(sorted);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHistory();
  }, []);

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'This will clear the local display. Server data remains.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            setMessages([]);
            setFilteredMessages([]);
          }
        },
      ]
    );
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Render message item
  const renderMessage = ({ item }) => (
    <View style={styles.messageCard}>
      {/* Header Row */}
      <View style={styles.messageHeader}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeIcon}>
            {item.type === 'text' ? '💬' : '🎵'}
          </Text>
          <Text style={styles.typeBadge}>
            {item.type.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.languageBadge}>
          {item.sourceLanguage?.toUpperCase()} → {item.targetLanguage?.toUpperCase()}
        </Text>
      </View>

      {/* Content */}
      {item.type === 'text' ? (
        <View style={styles.textContent}>
          <View style={styles.textRow}>
            <Text style={styles.label}>Original:</Text>
            <Text style={styles.originalText}>"{item.originalText}"</Text>
          </View>
          <View style={styles.textRow}>
            <Text style={styles.label}>Translated:</Text>
            <Text style={styles.translatedText}>"{item.translatedText}"</Text>
          </View>
        </View>
      ) : (
        <View style={styles.audioContent}>
          <Text style={styles.audioInfo}>
            📦 Original: {item.audioSize} bytes
          </Text>
          <Text style={styles.audioInfo}>
            ✅ Processed: {item.processedAudioSize} bytes
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.messageFooter}>
        <Text style={styles.userId}>👤 {item.userId}</Text>
        <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
      </View>
    </View>
  );

  // Filter buttons
  const FilterButton = ({ label, value, icon }) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === value && styles.filterButtonActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={styles.filterIcon}>{icon}</Text>
      <Text style={[
        styles.filterText,
        filter === value && styles.filterTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>No Messages</Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'all' 
          ? 'Send some messages in the Chat tab to see them here'
          : `No ${filter} messages found`}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📜 History</Text>
          <Text style={styles.headerSubtitle}>Message History</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>📜 History</Text>
            <Text style={styles.headerSubtitle}>
              {messages.length} messages total
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearHistory}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <FilterButton label="All" value="all" icon="📋" />
        <FilterButton label="Text" value="text" icon="💬" />
        <FilterButton label="Audio" value="audio" icon="🎵" />
      </View>

      {/* Messages List */}
      <FlatList
        data={filteredMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  clearButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clearButtonText: {
    color: COLORS.textWhite,
    fontWeight: '600',
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: COLORS.background,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.textWhite,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  typeBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  languageBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  textContent: {
    marginBottom: 8,
  },
  textRow: {
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  originalText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  translatedText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  audioContent: {
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  audioInfo: {
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 2,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  userId: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textLight,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default HistoryScreen;
