/**
 * SettingsScreen - App Settings & Configuration
 * ==============================================
 * PDC Lab Exam - Distributed Chat System
 * 
 * Shows:
 * - User ID
 * - Default language settings
 * - Connection status
 * - API health check
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, LANGUAGES, generateUserId, API_BASE_URL } from '../constants/config';
import { api } from '../services/api';
import LanguagePicker from '../components/LanguagePicker';

const SettingsScreen = () => {
  const [userId] = useState(generateUserId());
  const [defaultSourceLang, setDefaultSourceLang] = useState('en');
  const [defaultTargetLang, setDefaultTargetLang] = useState('es');
  const [healthStatus, setHealthStatus] = useState(null);
  const [checking, setChecking] = useState(false);
  const [languages, setLanguages] = useState(LANGUAGES);

  // Check health on mount
  useEffect(() => {
    checkConnection();
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      const response = await api.getLanguages();
      if (response.success && response.languages) {
        // Add flags to languages from API
        const withFlags = response.languages.map(lang => {
          const match = LANGUAGES.find(l => l.code === lang.code);
          return {
            ...lang,
            flag: match?.flag || '🌐'
          };
        });
        setLanguages(withFlags);
      }
    } catch (error) {
      console.log('Using default languages');
    }
  };

  const checkConnection = async () => {
    setChecking(true);
    try {
      const response = await api.healthCheck();
      setHealthStatus(response);
    } catch (error) {
      setHealthStatus({
        success: false,
        error: error.message
      });
    } finally {
      setChecking(false);
    }
  };

  const saveLanguagePreference = async () => {
    try {
      const response = await api.setUserLanguage(userId, defaultTargetLang);
      if (response.success) {
        Alert.alert('Success', 'Language preference saved!');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
        <Text style={styles.headerSubtitle}>App Configuration</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 User Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID:</Text>
            <Text style={styles.infoValue}>{userId}</Text>
          </View>
          
          <Text style={styles.infoNote}>
            💡 This ID is auto-generated for this session
          </Text>
        </View>

        {/* Language Settings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌐 Default Languages</Text>
          
          <View style={styles.languageSettings}>
            <LanguagePicker
              label="Default Source Language"
              selectedLanguage={defaultSourceLang}
              onSelectLanguage={setDefaultSourceLang}
              languages={languages}
            />
          </View>
          
          <View style={styles.languageSettings}>
            <LanguagePicker
              label="Default Target Language"
              selectedLanguage={defaultTargetLang}
              onSelectLanguage={setDefaultTargetLang}
              languages={languages}
            />
          </View>

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={saveLanguagePreference}
          >
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          </TouchableOpacity>
        </View>

        {/* Connection Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🔌 Connection Status</Text>
            <View style={[
              styles.statusDot,
              healthStatus?.success ? styles.statusOnline : styles.statusOffline
            ]} />
          </View>

          <View style={styles.connectionInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>API Gateway:</Text>
              <Text style={styles.infoValue}>{API_BASE_URL}</Text>
            </View>
          </View>

          {healthStatus && (
            <View style={styles.healthDetails}>
              {healthStatus.success ? (
                <>
                  <View style={styles.serviceRow}>
                    <Text style={styles.serviceLabel}>Status:</Text>
                    <Text style={[styles.serviceStatus, styles.online]}>
                      ✅ {healthStatus.status}
                    </Text>
                  </View>
                  <View style={styles.serviceRow}>
                    <Text style={styles.serviceLabel}>API Gateway:</Text>
                    <Text style={[styles.serviceStatus, styles.online]}>
                      ✅ {healthStatus.services?.apiGateway}
                    </Text>
                  </View>
                  <View style={styles.serviceRow}>
                    <Text style={styles.serviceLabel}>Translation Service:</Text>
                    <Text style={styles.serviceStatus}>
                      📡 {healthStatus.services?.translationService}
                    </Text>
                  </View>
                  <View style={styles.serviceRow}>
                    <Text style={styles.serviceLabel}>Audio Service:</Text>
                    <Text style={styles.serviceStatus}>
                      📡 {healthStatus.services?.audioService}
                    </Text>
                  </View>
                  <Text style={styles.timestamp}>
                    Last checked: {new Date(healthStatus.timestamp).toLocaleTimeString()}
                  </Text>
                </>
              ) : (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>❌ Connection Failed</Text>
                  <Text style={styles.errorMessage}>{healthStatus.error}</Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity 
            style={[styles.testButton, checking && styles.buttonDisabled]}
            onPress={checkConnection}
            disabled={checking}
          >
            {checking ? (
              <ActivityIndicator color={COLORS.primary} size="small" />
            ) : (
              <Text style={styles.testButtonText}>🔄 Test Connection</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* About Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ℹ️ About</Text>
          
          <View style={styles.aboutContent}>
            <Text style={styles.appName}>TransLingo Chat</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
            <Text style={styles.appDescription}>
              PDC Lab Exam - Distributed Chat System{'\n'}
              Demonstrates REST + gRPC Architecture
            </Text>
          </View>

          <View style={styles.techStack}>
            <Text style={styles.techTitle}>Technology Stack:</Text>
            <View style={styles.techItem}>
              <Text style={styles.techIcon}>📱</Text>
              <Text style={styles.techText}>React Native (Expo)</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techIcon}>🌐</Text>
              <Text style={styles.techText}>REST API (Express.js)</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techIcon}>⚡</Text>
              <Text style={styles.techText}>gRPC (Protocol Buffers)</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techIcon}>🔧</Text>
              <Text style={styles.techText}>Node.js Microservices</Text>
            </View>
          </View>
        </View>

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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusOnline: {
    backgroundColor: COLORS.success,
  },
  statusOffline: {
    backgroundColor: COLORS.error,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flexShrink: 1,
    textAlign: 'right',
    maxWidth: '60%',
  },
  infoNote: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: 8,
  },
  languageSettings: {
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  connectionInfo: {
    marginBottom: 12,
  },
  healthDetails: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  serviceLabel: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  serviceStatus: {
    fontSize: 13,
    color: COLORS.text,
  },
  online: {
    color: COLORS.success,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 8,
    textAlign: 'right',
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: COLORS.background,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  aboutContent: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 12,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  appVersion: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  techStack: {
    marginTop: 8,
  },
  techTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  techIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  techText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
});

export default SettingsScreen;
