/**
 * PerformanceScreen - REST vs gRPC Comparison
 * ============================================
 * PDC Lab Exam - Distributed Chat System
 * 
 * IMPORTANT FOR EXAM: This screen demonstrates why gRPC is preferred
 * for service-to-service communication over REST.
 * 
 * Shows:
 * - Response time comparison
 * - Payload size comparison
 * - Size reduction percentage
 * - Concurrent message processing benchmarks
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/config';
import { api } from '../services/api';
import PerformanceCard from '../components/PerformanceCard';

const PerformanceScreen = () => {
  const [metrics, setMetrics] = useState(null);
  const [benchmarkResults, setBenchmarkResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [benchmarking, setBenchmarking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load metrics on mount
  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await api.getPerformanceMetrics();
      if (response.success) {
        setMetrics(response.metrics);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMetrics();
  }, []);

  // Run benchmark test
  const runBenchmark = async () => {
    setBenchmarking(true);
    try {
      const response = await api.testConcurrent(10);
      if (response.success) {
        setBenchmarkResults(response);
        // Refresh metrics after benchmark
        await loadMetrics();
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Benchmark failed');
    } finally {
      setBenchmarking(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📊 Performance</Text>
          <Text style={styles.headerSubtitle}>REST vs gRPC Comparison</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading metrics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Performance</Text>
        <Text style={styles.headerSubtitle}>REST vs gRPC Comparison</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Text Messages Card */}
        <PerformanceCard
          title="Text Messages"
          icon="📝"
          restData={metrics?.text?.rest}
          grpcData={metrics?.text?.grpc}
          improvement={metrics?.analysis?.textSpeedImprovement}
        />

        {/* Audio Messages Card */}
        <PerformanceCard
          title="Audio Messages"
          icon="🎵"
          restData={metrics?.audio?.rest}
          grpcData={metrics?.audio?.grpc}
          improvement={metrics?.analysis?.audioSpeedImprovement}
        />

        {/* Analysis Card */}
        <View style={styles.analysisCard}>
          <View style={styles.analysisHeader}>
            <Text style={styles.analysisIcon}>💡</Text>
            <Text style={styles.analysisTitle}>Analysis & Recommendations</Text>
          </View>
          
          <View style={styles.analysisContent}>
            <Text style={styles.analysisText}>
              {metrics?.analysis?.recommendation || 'Run some tests to see analysis'}
            </Text>
          </View>

          <View style={styles.keyPoints}>
            <Text style={styles.keyPointTitle}>Key Benefits of gRPC:</Text>
            <View style={styles.keyPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.keyPointText}>Binary Protocol Buffers (smaller payload)</Text>
            </View>
            <View style={styles.keyPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.keyPointText}>HTTP/2 multiplexing (faster connections)</Text>
            </View>
            <View style={styles.keyPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.keyPointText}>Native binary support (no base64 for audio)</Text>
            </View>
            <View style={styles.keyPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.keyPointText}>Strong typing with proto definitions</Text>
            </View>
          </View>
        </View>

        {/* Benchmark Section */}
        <View style={styles.benchmarkCard}>
          <Text style={styles.benchmarkTitle}>🚀 Run Benchmark</Text>
          <Text style={styles.benchmarkDescription}>
            Send 10 concurrent messages to test parallel processing performance
          </Text>
          
          <TouchableOpacity
            style={[styles.benchmarkButton, benchmarking && styles.buttonDisabled]}
            onPress={runBenchmark}
            disabled={benchmarking}
          >
            {benchmarking ? (
              <>
                <ActivityIndicator color={COLORS.textWhite} size="small" />
                <Text style={styles.buttonText}>  Running...</Text>
              </>
            ) : (
              <Text style={styles.buttonText}>Run Benchmark (10 Messages)</Text>
            )}
          </TouchableOpacity>

          {/* Benchmark Results */}
          {benchmarkResults && (
            <View style={styles.benchmarkResults}>
              <Text style={styles.resultsTitle}>📈 Benchmark Results</Text>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Messages Processed:</Text>
                <Text style={styles.resultValue}>{benchmarkResults.messagesProcessed}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Total Time:</Text>
                <Text style={styles.resultValue}>{benchmarkResults.totalTime}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Avg Time/Message:</Text>
                <Text style={[styles.resultValue, styles.successText]}>
                  {benchmarkResults.avgTimePerMessage}
                </Text>
              </View>

              <Text style={styles.resultsSubtitle}>Individual Results:</Text>
              {benchmarkResults.results?.map((result, index) => (
                <View key={index} style={styles.messageResult}>
                  <Text style={styles.messageNumber}>#{result.message}</Text>
                  <Text style={styles.messageTranslated}>{result.translated}</Text>
                  <Text style={styles.messageTime}>{result.time}ms</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Refresh Button */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadMetrics}
        >
          <Text style={styles.refreshButtonText}>🔄 Refresh Metrics</Text>
        </TouchableOpacity>

      </ScrollView>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
  analysisCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  analysisContent: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  analysisText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  keyPoints: {
    marginTop: 8,
  },
  keyPointTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  keyPoint: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    color: COLORS.success,
    marginRight: 8,
    fontWeight: '700',
  },
  keyPointText: {
    fontSize: 13,
    color: COLORS.textLight,
    flex: 1,
  },
  benchmarkCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  benchmarkTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  benchmarkDescription: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 16,
  },
  benchmarkButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  buttonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  benchmarkResults: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  resultLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  successText: {
    color: COLORS.success,
  },
  resultsSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 8,
  },
  messageResult: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    marginBottom: 4,
  },
  messageNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    width: 24,
  },
  messageTranslated: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text,
  },
  messageTime: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  refreshButton: {
    backgroundColor: COLORS.card,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  refreshButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PerformanceScreen;
