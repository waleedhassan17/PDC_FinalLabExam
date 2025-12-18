# Screenshots

Add your Postman and performance test screenshots here.

## Required Screenshots:

1. **Set User Language** - POST /api/users/language
2. **Send Text Message** - POST /api/messages/text
3. **Send Audio Message** - POST /api/messages/audio
4. **Get Performance Metrics** - GET /api/performance/metrics
5. **Concurrent Messages Test** - POST /api/test/concurrent
6. **Chat History** - GET /api/messages/history
7. **Health Check** - GET /api/health

## How to Take Screenshots:

1. Open Postman
2. Make each API call
3. Press `Ctrl+Shift+S` (Windows) or `Cmd+Shift+S` (Mac) to save screenshot
4. Save in this folder with descriptive names like:
   - `01-set-language.png`
   - `02-send-text.png`
   - `03-send-audio.png`
   - etc.

## Console Logs:

Also take screenshots of the terminal showing:
- gRPC service logs during requests
- Performance metrics being logged
- Concurrent message processing
