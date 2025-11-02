# React Native Check-In Contest Implementation

This document provides a comprehensive guide for the React Native implementation of the check-in contest feature in the GymForce mobile app.

## Overview

The React Native check-in contest system allows users to participate in weekly and monthly check-in competitions, view leaderboards, and track their rankings in real-time. This implementation integrates seamlessly with the existing GymForce app architecture.

## Architecture

### Core Components

- **ContestContext** - Manages contest state and data
- **ContestService** - Firebase service layer for contest operations
- **CheckInContest Components** - UI components for contest display
- **ContestLeaderboardScreen** - Full-screen leaderboard view

### Integration Points

- **GymCard Component** - Shows contest banners and integrates check-in flow
- **CheckInContext** - Enhanced with contest features
- **App.tsx** - ContestProvider added to root

## Features

### ✅ Implemented Features

1. **Contest Management**

   - Real-time contest data synchronization
   - Weekly/Monthly contest periods
   - Feature flag system for easy enable/disable

2. **User Participation**

   - Automatic contest joining on first check-in
   - Point scoring system (configurable)
   - Real-time rank calculation

3. **Leaderboard System**

   - Live leaderboard updates
   - User position tracking
   - Contest period switching

4. **UI Components**

   - Contest banner in GymCard
   - Modal leaderboard view
   - Dedicated leaderboard screen
   - Native animations and styling

5. **Firebase Integration**
   - Firestore real-time subscriptions
   - Efficient data queries
   - User participation tracking

## Usage Guide

### Enabling/Disabling Contests

The contest feature can be easily toggled using the feature flag system:

```typescript
// In Firebase Console, update the feature flags document
{
  "contestEnabled": true,  // Set to false to disable
  "contestCheckInPoints": 10,
  "maxDailyPoints": 50
}
```

### Contest Data Structure

```typescript
interface ContestData {
  id: string;
  period: "weekly" | "monthly";
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

interface ContestUser {
  uid: string;
  displayName: string;
  totalPoints: number;
  checkInCount: number;
  lastCheckIn: Date;
  rank?: number;
}
```

### Component Integration

#### GymCard Integration

The `GymCard` component automatically shows contest banners when contests are active:

```typescript
<ContestBanner gym={gym} onPress={handleContestPress} />
```

#### Modal Usage

Contest modal can be triggered from any component:

```typescript
<CheckInContestModal
  isVisible={isContestModalVisible}
  onClose={() => setContestModalVisible(false)}
/>
```

#### Screen Navigation

Full leaderboard screen for dedicated viewing:

```typescript
navigation.navigate("ContestLeaderboard");
```

## File Structure

```
../GymForceApp/src/
├── types/
│   └── contest.ts                     # TypeScript interfaces
├── services/
│   └── contestService.ts              # Firebase service layer
├── context/
│   ├── ContestContext.tsx             # Contest state management
│   └── CheckInContext.tsx             # Enhanced with contest features
├── components/CheckInContest/
│   ├── index.ts                       # Component exports
│   ├── CheckInContestModal.tsx        # Modal wrapper
│   ├── ContestLeaderboard.tsx         # Main leaderboard
│   ├── ContestUserCard.tsx            # User rank display
│   ├── ContestPeriodToggle.tsx        # Period switcher
│   └── styles/
│       └── contestStyles.ts           # Native styling
├── screens/
│   └── ContestLeaderboardScreen.tsx   # Full-screen leaderboard
└── components/
    └── GymCard.tsx                    # Enhanced with contest integration
```

## Firebase Setup

### Required Collections

1. **contests** - Contest definitions
2. **contestParticipation** - User participation data
3. **featureFlags** - Feature toggle configuration

### Security Rules

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Contest data - read only
    match /contests/{contestId} {
      allow read: if request.auth != null;
    }

    // User participation - read own, write own
    match /contestParticipation/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Feature flags - read only
    match /featureFlags/{document} {
      allow read: if request.auth != null;
    }
  }
}
```

## Testing

### Manual Testing Steps

1. **Contest Banner Display**

   - Verify contest banner appears in GymCard when contest is active
   - Test banner tap functionality

2. **Check-In Flow**

   - Perform check-in and verify contest participation
   - Check point accumulation
   - Verify rank updates

3. **Leaderboard Functionality**

   - Test modal leaderboard display
   - Verify period toggle (weekly/monthly)
   - Test full-screen leaderboard navigation

4. **Feature Toggle**
   - Disable contest feature and verify banner disappears
   - Re-enable and verify functionality returns

### Performance Considerations

- Real-time subscriptions are optimized with proper cleanup
- Leaderboard queries use efficient Firestore indexes
- Component rendering is optimized with React.memo where appropriate

## Troubleshooting

### Common Issues

1. **Contest banner not showing**

   - Check if contest is active in Firestore
   - Verify feature flag is enabled
   - Ensure ContestProvider is properly set up

2. **Leaderboard not updating**

   - Check Firebase real-time connection
   - Verify user permissions
   - Check network connectivity

3. **TypeScript errors**
   - Ensure all contest types are properly imported
   - Verify ContestContext is available in component tree

### Debug Tools

Enable debug logging in ContestService:

```typescript
const DEBUG_CONTEST = true; // Set to true for detailed logging
```

## Future Enhancements

### Potential Features

1. **Contest Types**

   - Different contest categories (strength, cardio, etc.)
   - Team-based competitions
   - Streak-based challenges

2. **Rewards System**

   - Badge achievements
   - Prize distributions
   - Leaderboard rewards

3. **Analytics**

   - Contest participation metrics
   - User engagement tracking
   - Performance analytics

4. **Social Features**
   - Contest sharing
   - Achievement announcements
   - Friend competitions

## Support

For implementation questions or issues:

1. Check this documentation
2. Review TypeScript interfaces in `contest.ts`
3. Examine existing component implementations
4. Test with Firebase console data

The React Native implementation provides a robust, scalable contest system that enhances user engagement while maintaining the GymForce app's performance and user experience standards.
