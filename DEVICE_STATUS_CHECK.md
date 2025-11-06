# Device Status Check Implementation

## Overview

Implemented a device status check to handle the case where User A logs out, and User B opens the app on the same machine. The app now checks if the device has been deactivated (logged out) before proceeding with the existing registration.

## Problem Solved

**Scenario**:

1. User A registers and uses the app
2. User A logs out (device marked as `is_active: false` in backend)
3. User B opens the app on the same machine
4. **Old behavior**: User B sees User A's session (incorrect)
5. **New behavior**: App detects logout, clears localStorage, shows registration page ✅

## Implementation Details

### 1. Added New API Method to SchoolService

**File**: `src/app/services/school.service.ts`

```typescript
checkDeviceStatus(
  hardwareId: string,
  gigaId: string
): Observable<any>
```

**Endpoint**: `GET /dailycheckapp_schools/checkDeviceStatus/:device_hardware_id/:giga_id_school`

**Response**:

```typescript
{
  is_active: boolean; // true/false/null
  message: string;
  exists: boolean; // Whether device exists in database
}
```

### 2. Refactored HomePage Constructor

**File**: `src/app/home/home.page.ts`

**Before**:

```typescript
if (this.storage.get("schoolId")) {
  // Immediately proceed with existing registration
  getFlagsAndCheckGigaId();
}
```

**After**:

```typescript
if (this.storage.get("schoolId")) {
  // Check device status first
  this.checkDeviceStatusAndProceed();
}
```

### 3. New Method: `checkDeviceStatusAndProceed()`

This method:

1. ✅ Gets hardware ID (waits up to 5 seconds)
2. ✅ Calls backend API to check device status
3. ✅ Handles three cases:
   - **Device deactivated** (`exists: true, is_active: false`) → Clear localStorage
   - **Device active** (`exists: true, is_active: true`) → Proceed normally
   - **Device not found** (`exists: false`) → Proceed for backward compatibility

### 4. Extracted Method: `proceedWithExistingRegistration()`

Moved existing registration logic to a separate method for reusability and cleaner code structure.

## Flow Diagram

### User Has localStorage Data

```
App Opens
  ↓
Has schoolId in localStorage?
  ↓ YES
Get Hardware ID (5s timeout)
  ↓
Call API: checkDeviceStatus(hardwareId, gigaId)
  ↓
  ├─ exists: true, is_active: false
  │    → Clear localStorage
  │    → Stay on home page (show registration)
  │
  ├─ exists: true, is_active: true
  │    → Proceed with existing registration
  │    → Navigate to /starttest
  │
  ├─ exists: false (old registration)
  │    → Proceed with existing registration (backward compatibility)
  │    → Navigate to /starttest
  │
  └─ API Error
       → Fail open: Proceed with existing registration
       → Navigate to /starttest
```

## Console Log Examples

### Case 1: Device Still Active

```
🔍 [HomePage] Checking device status for existing registration...
⏳ [HardwareID] Waiting for hardware ID (timeout: 5000ms)...
✅ [HardwareID] Hardware ID found after 52ms: abc-123
Device status check response: { is_active: true, message: 'Device is active', exists: true }
📊 [HomePage] Device status: { is_active: true, ... }
✅ [HomePage] Device is active, proceeding with existing registration...
🚀 [HomePage] Navigating to /starttest...
```

### Case 2: Device Deactivated (Logged Out)

```
🔍 [HomePage] Checking device status for existing registration...
✅ [HardwareID] Hardware ID already available from storage: abc-123
Device status check response: { is_active: false, message: 'Device has been deactivated', exists: true }
📊 [HomePage] Device status: { is_active: false, ... }
🚫 [HomePage] Device has been deactivated (logged out)
   Clearing localStorage and forcing new registration...
```

### Case 3: Device Not Found (Old Registration)

```
🔍 [HomePage] Checking device status for existing registration...
✅ [HardwareID] Hardware ID found after 48ms: abc-123
Device status check response: { is_active: false, message: 'Device not found', exists: false }
📊 [HomePage] Device status: { is_active: false, exists: false, ... }
⚠️ [HomePage] Device not found in backend (may be old registration)
   Proceeding with existing registration for backward compatibility...
```

### Case 4: API Error (Fail Open)

```
🔍 [HomePage] Checking device status for existing registration...
✅ [HardwareID] Hardware ID found after 51ms: abc-123
❌ [HomePage] Error checking device status: HttpErrorResponse { ... }
   Proceeding with existing registration (fail open)...
🚀 [HomePage] Navigating to /starttest...
```

### Case 5: Missing Hardware ID or Giga ID

```
🔍 [HomePage] Checking device status for existing registration...
❌ [HardwareID] Timeout after 5002ms
⚠️ [HomePage] Missing hardwareId or gigaId, proceeding with existing registration
```

## Error Handling Strategy: Fail Open

**Design Decision**: On API errors, the app proceeds with existing registration rather than blocking the user.

**Rationale**:

- ✅ Better user experience (don't block users if backend is down)
- ✅ Prevents false logouts due to network issues
- ✅ Backend availability doesn't affect app functionality
- ⚠️ Small risk: Deactivated device might proceed if API is unreachable

**Alternative**: Fail closed (clear localStorage on error) - Too aggressive, poor UX

## Backward Compatibility

### Old Registrations (Before Hardware ID Tracking)

When `exists: false` (device not found in backend):

- ✅ **Don't clear localStorage**
- ✅ Proceed with existing registration
- ✅ Supports old installations without hardware ID

This ensures:

- Old users can continue using the app
- Migration to new hardware ID system is seamless
- No manual re-registration required

## Security Considerations

### Race Condition Prevention

- Device status check happens **before** proceeding with registration
- Hardware ID must be present to check status
- API response is authoritative (overrides localStorage)

### Data Integrity

- Only clears localStorage if explicitly told by backend (`exists: true, is_active: false`)
- Never clears on uncertainty (missing data, API errors)
- Preserves old registrations (backward compatibility)

## Performance Impact

### Additional Overhead on App Startup

- **Hardware ID fetch**: ~50-100ms (or use cached)
- **API call**: ~100-300ms (network dependent)
- **Total added delay**: ~200-400ms

### Trade-off

- ✅ **Benefit**: Prevents wrong user sessions (critical for data integrity)
- ⚠️ **Cost**: Slight delay on app startup (acceptable)

## Files Modified

1. **`src/app/services/school.service.ts`**

   - Added `checkDeviceStatus()` method

2. **`src/app/home/home.page.ts`**
   - Refactored constructor to call `checkDeviceStatusAndProceed()`
   - Added `checkDeviceStatusAndProceed()` method
   - Extracted `proceedWithExistingRegistration()` method

## Testing Checklist

### Manual Testing Scenarios

- [ ] **Test 1: Normal active device**

  1. Register and use app normally
  2. Close and reopen app
  3. Should proceed to /starttest without issues

- [ ] **Test 2: Logged out device**

  1. User A registers and logs out (logout modal)
  2. User B opens app on same machine
  3. Should clear localStorage and show home page

- [ ] **Test 3: Backend API down**

  1. Disconnect network or stop backend
  2. Open app with existing localStorage
  3. Should proceed to /starttest (fail open)

- [ ] **Test 4: Old registration (no hardware ID)**

  1. Simulate old installation (device not in backend)
  2. Open app
  3. Should proceed to /starttest (backward compatibility)

- [ ] **Test 5: Missing hardware ID**
  1. Simulate hardware ID timeout
  2. Open app with localStorage
  3. Should proceed to /starttest

### Backend API Testing

Ensure backend endpoint returns correct responses:

- `{ exists: true, is_active: true }` - Active device
- `{ exists: true, is_active: false }` - Deactivated device
- `{ exists: false }` - Device not found

## Future Enhancements

### Potential Improvements

1. **Periodic Status Checks** (Optional)

   - Check device status every 5 minutes while app is running
   - Log user out immediately if device is deactivated remotely

2. **User Notification** (Optional)

   - Show toast/modal: "This device has been logged out by another user"
   - Better UX than silent clear

3. **Retry Logic** (Optional)

   - Retry API call once if it fails
   - Improves reliability on poor network

4. **Analytics** (Optional)
   - Track how often devices are deactivated
   - Monitor fail open scenarios (API errors)

## Related Documentation

- `HARDWARE_ID_IMPROVEMENTS.md` - Event-based hardware ID system
- `HARDWARE_ID_POLLING_FIX.md` - Polling optimization

## No Breaking Changes

All changes are backward compatible:

- ✅ Old registrations continue to work
- ✅ API errors don't block users
- ✅ Missing hardware ID doesn't break flow
- ✅ Existing localStorage format unchanged
