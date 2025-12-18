/**
 * TransLingo Chat - React Native App
 * ===================================
 * PDC Lab Exam - Distributed Chat System
 * 
 * This mobile app demonstrates:
 * - REST API communication (Client → API Gateway)
 * - gRPC performance benefits (shown in metrics)
 * - Distributed microservices architecture
 * 
 * Architecture:
 * ┌─────────────────┐
 * │  React Native   │
 * │  Mobile App     │
 * └────────┬────────┘
 *          │ REST (JSON)
 *          ▼
 * ┌─────────────────┐
 * │  API Gateway    │
 * │  (Express.js)   │
 * └────────┬────────┘
 *          │ gRPC (Protobuf)
 *     ┌────┴────┐
 *     ▼         ▼
 * ┌───────┐ ┌───────┐
 * │Trans. │ │Audio  │
 * │Service│ │Service│
 * └───────┘ └───────┘
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, StyleSheet } from 'react-native';

// Screens
import ChatScreen from './src/screens/ChatScreen';
import PerformanceScreen from './src/screens/PerformanceScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Constants
import { COLORS } from './src/constants/config';

const Tab = createBottomTabNavigator();

/**
 * Custom Tab Bar Icon Component
 */
const TabIcon = ({ icon, label, focused }) => (
  <View style={styles.tabIconContainer}>
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      {icon}
    </Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
      {label}
    </Text>
  </View>
);

/**
 * Main App Component
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarShowLabel: false,
          }}
        >
          {/* Chat Tab */}
          <Tab.Screen
            name="Chat"
            component={ChatScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon icon="💬" label="Chat" focused={focused} />
              ),
            }}
          />

          {/* Performance Tab */}
          <Tab.Screen
            name="Performance"
            component={PerformanceScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon icon="📊" label="Metrics" focused={focused} />
              ),
            }}
          />

          {/* History Tab */}
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon icon="📜" label="History" focused={focused} />
              ),
            }}
          />

          {/* Settings Tab */}
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon icon="⚙️" label="Settings" focused={focused} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    paddingBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabIconFocused: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  tabLabelFocused: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
