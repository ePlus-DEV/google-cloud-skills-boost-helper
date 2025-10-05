# Firebase Remote Config Setup

This document explains how to configure Firebase Remote Config for the Google Cloud Skills Boost Helper extension.

## Overview

Firebase Remote Config has been integrated to allow dynamic configuration of the countdown timer without requiring extension updates. This enables remote control of:

- Countdown deadline time
- Timezone settings
- Enable/disable countdown display
- Countdown title (future use)

## Firebase Configuration

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Remote Config in your Firebase project

### 2. Environment Variables Setup

Copy `.env.example` to `.env` and update with your Firebase configuration:

```bash
cp .env.example .env
```

Edit `.env` file with your Firebase project configuration:

```env
# Firebase Configuration
WXT_FIREBASE_API_KEY=your-actual-firebase-api-key
WXT_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
WXT_FIREBASE_PROJECT_ID=your-actual-project-id
WXT_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
WXT_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
WXT_FIREBASE_APP_ID=your-actual-app-id

# Remote Config Settings (optional - defaults provided)
WXT_FIREBASE_FETCH_INTERVAL_MS=3600000
WXT_FIREBASE_FETCH_TIMEOUT_MS=60000

# Default Remote Config Values (optional - defaults provided)
WXT_COUNTDOWN_DEADLINE=2025-10-14T23:59:59+05:30
WXT_COUNTDOWN_TIMEZONE=+05:30
WXT_COUNTDOWN_ENABLED=true
```

**Important**: Add `.env` to your `.gitignore` file to avoid committing sensitive configuration.

### 3. Fallback Configuration

If environment variables are not provided, the service will use fallback values. This ensures the extension works even without proper environment setup, but you should configure environment variables for production use.

### 4. Remote Config Parameters

Set up these parameters in Firebase Console > Remote Config:

| Parameter | Type | Default Value | Description |
|-----------|------|---------------|-------------|
| `countdown_deadline` | String | `"2025-10-14T23:59:59+05:30"` | ISO 8601 datetime string for countdown deadline |
| `countdown_timezone` | String | `"+05:30"` | Timezone offset (IST in this case) |
| `countdown_enabled` | Boolean | `true` | Whether to show countdown timer (when `false`, hides entire countdown section) |

### 4. Parameter Examples

**countdown_deadline:**
```
2025-10-14T23:59:59+05:30
```

**countdown_timezone:**
```
+05:30
```

**countdown_enabled:**
```
true
```

## Implementation Details

### Service Structure

- **`services/firebaseService.ts`**: Main Firebase Remote Config service
- **`types/firebase.ts`**: TypeScript type definitions  
- **`services/popupUIService.ts`**: Updated to use Remote Config for countdown
- **`entrypoints/popup/main.tsx`**: Updated to use Firebase-powered countdown

### Key Methods

- `firebaseService.initialize()`: Initialize Firebase and Remote Config
- `firebaseService.getCountdownDeadline()`: Get countdown deadline from Remote Config
- `firebaseService.isCountdownEnabled()`: Check if countdown is enabled
- `firebaseService.refreshConfig()`: Manually refresh Remote Config

### Error Handling

The implementation includes graceful fallbacks:

- If Firebase initialization fails, default values are used
- If Remote Config fetch fails, cached/default values are used
- Console logging for debugging Firebase issues

## Testing

### Console Testing Commands

Open browser DevTools console and run:

```javascript
// Test Firebase initialization
await firebaseService.initialize();

// Get current config
(firebaseService.getAllParams());

// Check configuration source and settings
(firebaseService.getConfigInfo());

// Test countdown with current config
PopupUIService.startFacilitatorCountdown();

// Refresh Remote Config
await firebaseService.refreshConfig();

// Test remote countdown toggle functionality
firebaseService.testCountdownToggle();
```

### Local Development

For local development, you can:

1. **Use environment variables**: Create `.env` file with your configuration
2. **Check configuration source**: Use `firebaseService.getConfigInfo()` to verify which source is being used
3. **Set development cache interval**: Set `WXT_FIREBASE_FETCH_INTERVAL_MS=0` in `.env` to bypass caching

```env
# Development settings
WXT_FIREBASE_FETCH_INTERVAL_MS=0  # Immediate fetch for development
WXT_FIREBASE_FETCH_TIMEOUT_MS=10000  # Shorter timeout for development
```

## Deployment

### Production Settings

For production, use appropriate cache intervals:

```typescript
this.remoteConfig.settings = {
  minimumFetchIntervalMillis: 3600000, // 1 hour
  fetchTimeoutMillis: 60000, // 1 minute
};
```

### Publishing Changes

1. Update Remote Config parameters in Firebase Console
2. Changes take effect based on `minimumFetchIntervalMillis` setting
3. No extension update required for configuration changes

## Security Considerations

- Firebase config contains public API keys (this is normal for client-side apps)
- Use Firebase Security Rules if needed for additional protection
- Remote Config parameters are public (don't store sensitive data)

## Troubleshooting

### Common Issues

1. **Firebase not initialized**: Check console for initialization errors
2. **Wrong countdown time**: Verify `countdown_deadline` parameter format
3. **Countdown not showing**: Check `countdown_enabled` parameter
4. **Timezone issues**: Verify `countdown_timezone` format

### Debug Logging

Enable debug logging by checking browser console:

```javascript
// Check Firebase initialization status
('Firebase initialized:', firebaseService.isInitialized());

// Check current Remote Config values
('Config:', firebaseService.getAllParams());

// Check countdown configuration
('Countdown config:', firebaseService.getCountdownConfig());
```

## Future Enhancements

Potential future Remote Config parameters:

- `countdown_title`: Customizable countdown title
- `countdown_message`: Custom message when countdown ends
- `milestone_bonus_multiplier`: Dynamic bonus point multiplier
- `feature_flags`: Enable/disable specific features
- `notification_settings`: Control notification behavior

## Remote Countdown Toggle

### Dynamic Enable/Disable

The countdown timer can be remotely enabled or disabled through Firebase Remote Config without requiring users to update the extension.

#### How It Works

1. **Remote Config Parameter**: `countdown_enabled` (boolean)
2. **Real-time Updates**: Configuration is checked every 5 minutes automatically
3. **Immediate Effect**: Changes apply the next time the popup is opened or refreshed
4. **Graceful Fallback**: If Remote Config fails, uses environment variable or default value

#### Usage Scenarios

- **Disable countdown globally**: Set `countdown_enabled` to `false` in Firebase Console
- **Enable countdown for event**: Set `countdown_enabled` to `true` before event starts
- **Testing different deadlines**: Change `countdown_deadline` without extension updates
- **Emergency disable**: Quickly disable countdown if needed

#### Visual Feedback

- **Enabled**: Shows countdown timer with live updates
- **Disabled**: Shows "Countdown Disabled" message with pause icon
- **Loading**: Shows default state while Remote Config loads

#### Configuration Monitor

The extension automatically monitors Remote Config changes every 5 minutes and applies updates without user intervention.

## Migration from Hardcoded Values

The implementation automatically falls back to hardcoded values if Firebase fails, ensuring backward compatibility. Original hardcoded deadline was:

```javascript
const deadline = new Date('2025-10-14T23:59:59+05:30');
```

This is now the default value in Remote Config, maintaining the same behavior while enabling remote updates.