/**
 * PerformanceCard Component
 * =========================
 * PDC Lab Exam - Distributed Chat System
 * 
 * Displays REST vs gRPC performance comparison in a card format
 * IMPORTANT: This demonstrates why gRPC is preferred for service-to-service communication
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/config';

const PerformanceCard = ({ 
  title, 
  icon, 
  restData, 
  grpcData, 
  improvement 
}) => {
  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      {/* Comparison Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.headerCell, styles.labelCell]}>Metric</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>REST</Text>
          <Text style={[styles.tableCell, styles.headerCell, styles.grpcCell]}>gRPC</Text>
        </View>
        
        {/* Avg Response Time Row */}
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.labelCell]}>Avg Response</Text>
          <Text style={styles.tableCell}>{restData?.avgResponseTime || '0'} ms</Text>
          <Text style={[styles.tableCell, styles.grpcCell]}>{grpcData?.avgResponseTime || '0'} ms</Text>
        </View>
        
        {/* Avg Payload Size Row */}
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.labelCell]}>Avg Payload</Text>
          <Text style={styles.tableCell}>{restData?.avgPayloadSize || '0'} B</Text>
          <Text style={[styles.tableCell, styles.grpcCell]}>{grpcData?.avgPayloadSize || '0'} B</Text>
        </View>
        
        {/* Sample Count Row */}
        <View style={[styles.tableRow, styles.lastRow]}>
          <Text style={[styles.tableCell, styles.labelCell]}>Samples</Text>
          <Text style={styles.tableCell}>{restData?.sampleCount || 0}</Text>
          <Text style={[styles.tableCell, styles.grpcCell]}>{grpcData?.sampleCount || 0}</Text>
        </View>
      </View>
      
      {/* Improvement Badge */}
      {improvement && (
        <View style={styles.improvementBadge}>
          <Text style={styles.improvementText}>⚡ {improvement}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  tableCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 13,
    textAlign: 'center',
    color: COLORS.text,
  },
  headerCell: {
    backgroundColor: COLORS.background,
    fontWeight: '700',
    fontSize: 12,
    color: COLORS.textLight,
  },
  labelCell: {
    textAlign: 'left',
    fontWeight: '500',
  },
  grpcCell: {
    backgroundColor: '#E8F5E9',
    color: COLORS.success,
    fontWeight: '600',
  },
  improvementBadge: {
    marginTop: 12,
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
  },
  improvementText: {
    color: COLORS.success,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default PerformanceCard;
