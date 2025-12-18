# TransLingo Chat - React Native Client

## PDC Lab Exam - Distributed Chat System

A professional React Native mobile app that demonstrates REST + gRPC architecture for a distributed chat translation system.

## 📱 Features

- **Chat & Translation**: Send text messages and get instant translations
- **Audio Processing**: Send dummy audio messages to test binary data handling
- **Performance Metrics**: Compare REST vs gRPC performance in real-time
- **Message History**: View all translated messages with filters
- **Connection Status**: Monitor backend services health

## 🏗️ Architecture

```
┌─────────────────┐
│  React Native   │  ← This app
│  Mobile App     │
└────────┬────────┘
         │ REST (JSON)
         ▼
┌─────────────────┐
│  API Gateway    │  Port: 3000
│  (Express.js)   │
└────────┬────────┘
         │ gRPC (Protobuf)
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│Trans. │ │Audio  │  Ports: 50051, 50052
│Service│ │Service│
└───────┘ └───────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Backend services running (API Gateway, Translation, Audio)

### Installation

```bash
# Navigate to client folder
cd client

# Install dependencies
npm install

# Start Expo development server
npm start
```

### Running on Device/Emulator

1. **Android Emulator**: Press `a` in terminal after `npm start`
2. **iOS Simulator**: Press `i` in terminal (Mac only)
3. **Physical Device**: Scan QR code with Expo Go app
4. **Web Browser**: Press `w` in terminal

### Backend URL Configuration

The app automatically detects the correct URL:
- **Android Emulator**: `http://10.0.2.2:3000`
- **iOS Simulator**: `http://localhost:3000`
- **Physical Device**: Update `src/constants/config.js` with your PC's IP

## 📁 Project Structure

```
client/
├── App.js                    # Main app with navigation
├── package.json              # Dependencies
├── app.json                  # Expo configuration
├── index.js                  # Entry point
├── babel.config.js           # Babel configuration
├── assets/                   # App icons and splash
└── src/
    ├── screens/
    │   ├── ChatScreen.js         # Main chat interface
    │   ├── PerformanceScreen.js  # REST vs gRPC metrics
    │   ├── HistoryScreen.js      # Message history
    │   └── SettingsScreen.js     # App settings
    ├── components/
    │   ├── MessageBubble.js      # Chat message display
    │   ├── PerformanceCard.js    # Metrics display
    │   └── LanguagePicker.js     # Language selector
    ├── services/
    │   └── api.js                # API client
    └── constants/
        └── config.js             # Configuration
```

## 📊 Screens

### 1. Chat Screen (Main)
- Language selection dropdowns
- Text input for translation
- Audio message button (dummy)
- Message list with performance metrics
- Tap messages to see detailed metrics

### 2. Performance Screen
- REST vs gRPC comparison tables
- Text and Audio metrics
- Run benchmark tests
- Refresh metrics button

### 3. History Screen
- Filter by All/Text/Audio
- Pull to refresh
- Clear history option
- Detailed message info

### 4. Settings Screen
- User ID display
- Default language settings
- Connection status
- API health check

## 🎨 Design

- **Primary Color**: #2563EB (Blue)
- **Success Color**: #10B981 (Green)
- **Background**: #F1F5F9 (Light Gray)
- **Cards**: White with shadows
- **Clean, modern UI with rounded corners

## 📡 API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/languages` | GET | Get languages |
| `/api/users/language` | POST | Set preference |
| `/api/messages/text` | POST | Translate text |
| `/api/messages/audio` | POST | Process audio |
| `/api/messages/history` | GET | Get history |
| `/api/performance/metrics` | GET | Get metrics |
| `/api/test/concurrent` | POST | Benchmark |

## ⚠️ Troubleshooting

### Connection Refused
- Ensure backend services are running
- Check API Gateway is on port 3000
- For physical device, use correct IP in config.js

### Android Emulator Can't Connect
- Use `http://10.0.2.2:3000` (already configured)
- Ensure firewall allows connections

### Slow Performance
- Clear Expo cache: `expo start -c`
- Restart Metro bundler

## 📝 For Lab Exam

Important things to demonstrate:
1. **Performance Screen** shows REST vs gRPC comparison
2. **Tap on messages** to see detailed metrics
3. **Run Benchmark** to show concurrent processing
4. **Settings** shows distributed services status

## 👨‍💻 Author

PDC Lab Exam - SP23-BCS
