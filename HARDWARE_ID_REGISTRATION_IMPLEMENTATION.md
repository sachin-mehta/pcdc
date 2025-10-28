# Hardware ID Registration - Implementation Summary

## ✅ Frontend Implementation Complete

The frontend has been updated to support machine-level registration using hardware IDs. This allows multiple Windows users on the same machine to skip re-registration.

---

## 📝 Frontend Changes Made

### 1. **school.service.ts** - Added API Method

**File**: `src/app/services/school.service.ts`

**New Method**:

```typescript
checkRegistrationByHardwareId(hardwareId: string): Observable<any>
```

This method calls:

```
GET /api/dailycheckapp_schools/check-registration?hardware_id={hardwareId}
```

**Updated Method**:

- `registerSchoolDevice()` now accepts `hardware_id` in the request body

---

### 2. **confirmschool.page.ts** - Include Hardware ID in Registration

**File**: `src/app/confirmschool/confirmschool.page.ts`

**Changes**:

- Injected `HardwareIdService`
- Added `hardware_id` field to registration payload:

```typescript
schoolData = {
  giga_id_school: "...",
  mac_address: "...",
  os: "...",
  app_version: "...",
  created: "...",
  ip_address: "...",
  country_code: "...",
  hardware_id: "XXXX-XXXX-XXXX", // ← NEW
};
```

---

### 3. **home.page.ts** - Check for Existing Registration

**File**: `src/app/home/home.page.ts`

**Changes**:

- Injected `HardwareIdService`
- Added logic to check for existing registration when no local `schoolId` exists
- New private methods:
  - `checkMachineRegistration(hardwareId)` - Calls API to check registration
  - `applyExistingRegistration(data)` - Populates localStorage with existing data

**Flow**:

```typescript
if (localStorage has schoolId) {
  → Existing flow (unchanged)
} else if (hardware ID available) {
  → Check backend for existing registration
  → If found: populate localStorage → navigate to /starttest
  → If not found: dismiss loading (show register button)
} else {
  → Normal flow (no hardware ID available)
}
```

---

## 🔧 Backend Requirements

Your backend team needs to implement the following:

### 1. **Database Schema Changes**

**✅ COMPLETED** - Backend migration done:

```sql
-- AlterTable
ALTER TABLE "dailycheckapp_school" ADD COLUMN "device_hardware_id" TEXT;

-- AlterTable
ALTER TABLE "measurements" ADD COLUMN "device_hardware_id" TEXT;
```

**Note**:

- Column name: `device_hardware_id` (used in frontend and backend)
- Table name: `dailycheckapp_school` (singular)
- Also added to `measurements` table for tracking which device ran each test
- Frontend automatically sends `device_hardware_id` with every measurement upload

**Recommended**: Add index for performance:

```sql
CREATE INDEX idx_device_hardware_id ON dailycheckapp_school(device_hardware_id);
CREATE INDEX idx_measurements_device_hardware_id ON measurements(device_hardware_id);
```

---

### 2. **API Endpoint**

#### **GET** `/api/dailycheckapp_schools/checkExistingInstallation/:device_hardware_id`

**✅ IMPLEMENTED** - Backend endpoint ready

**Path Parameters**:

- `device_hardware_id` (required): The unique hardware identifier

**Response** (if registered):

```json
{
  "success": true,
  "data": {
    "user_id": "uuid-789",
    "school_id": "12345",
    "giga_id": "giga_12345",
    "school_info": {
      "name": "School Name",
      "...": "..."
    },
    "country_code": "US",
    "mac_address": "AA:BB:CC:DD:EE:FF",
    "os": "Windows 11",
    "ip_address": "192.168.1.1",
    "app_version": "2.0.2"
  },
  "timestamp": "2025-10-28T10:00:00.000Z",
  "message": "success"
}
```

**Response** (if NOT registered):

```json
{
  "success": true,
  "data": null,
  "timestamp": "2025-10-28T10:00:00.000Z",
  "message": "success"
}
```

**Error Response** (400):

```json
{
  "statusCode": 400,
  "message": "device_hardware_id is null/empty"
}
```

---

### 3. **Registration Endpoint**

#### **POST** `/api/dailycheckapp_schools`

**Modified to Accept New Field**:

```json
{
  "giga_id_school": "",
  "mac_address": "",
  "os": "",
  "app_version": "",
  "created": "",
  "ip_address": "",
  "country_code": "",
  "device_hardware_id": "XXXX-XXXX-XXXX" // ← NEW (optional)
}
```

**Logic**:

```javascript
if (request.device_hardware_id exists) {
  // Check if this device_hardware_id is already registered
  const existingRegistration = db.findOne({
    device_hardware_id: request.device_hardware_id
  });

  if (existingRegistration) {
    // Return existing user_id (same schoolUserId for same machine)
    return {
      data: {
        user_id: existingRegistration.user_id
      }
    };
  } else {
    // Create new registration with device_hardware_id
    const newRegistration = db.create({
      ...request,
      user_id: generateUUID(),
      device_hardware_id: request.device_hardware_id
    });

    return {
      data: {
        user_id: newRegistration.user_id
      }
    };
  }
} else {
  // Old flow - no device_hardware_id provided (backward compatibility)
  const newRegistration = db.create({
    ...request,
    user_id: generateUUID()
  });

  return {
    data: {
      user_id: newRegistration.user_id
    }
  };
}
```

**Key Point**: If `device_hardware_id` matches existing record, return the **existing `user_id`**, not create a new one.

---

## 🔄 User Flow Examples

### Scenario 1: First User (User A) Registers

```
1. User A launches app on fresh machine
   ↓
2. hardware_id: ABC-123 (retrieved from systeminformation)
   localStorage.schoolId: null
   ↓
3. GET /check-registration?hardware_id=ABC-123
   Response: { registered: false }
   ↓
4. User clicks "Register" → normal registration flow
   ↓
5. POST /dailycheckapp_schools with hardware_id=ABC-123
   Backend creates new record with user_id=UUID-789
   ↓
6. localStorage populated:
   - schoolId: 12345
   - schoolUserId: UUID-789
   - gigaId: giga_12345
   - ...
   ↓
7. Navigate to /starttest
```

---

### Scenario 2: Second User (User B) on Same Machine

```
1. User B logs into Windows (same machine as User A)
   ↓
2. User B launches app
   hardware_id: ABC-123 (same as User A's machine)
   localStorage.schoolId: null (UserB's profile is empty)
   ↓
3. GET /check-registration?hardware_id=ABC-123
   Response: {
     registered: true,
     data: { user_id: "UUID-789", school_id: "12345", ... }
   }
   ↓
4. Frontend populates localStorage with existing data:
   - schoolId: 12345
   - schoolUserId: UUID-789 (SAME as User A)
   - gigaId: giga_12345
   - ...
   ↓
5. Navigate directly to /starttest

✨ No registration needed!
```

---

### Scenario 3: User Re-opens App

```
1. User launches app
   ↓
2. localStorage.schoolId exists
   ↓
3. Existing flow (unchanged)
   Skip hardware ID check
   ↓
4. Navigate to /starttest

✨ Fast startup, no API calls
```

---

## 📊 Expected Behavior

| Scenario                  | hardware_id | localStorage | Backend API Call                 | Result                |
| ------------------------- | ----------- | ------------ | -------------------------------- | --------------------- |
| First user, fresh install | Available   | Empty        | `check-registration` → not found | Normal registration   |
| Second user, same machine | Available   | Empty        | `check-registration` → **found** | **Skip registration** |
| User re-opens app         | Available   | Has data     | None (skip check)                | Direct to /starttest  |
| Hardware ID unavailable   | null        | Empty        | None                             | Normal registration   |
| API error                 | Available   | Empty        | Fails gracefully                 | Normal registration   |

---

## 🔍 Console Output

### First User (Registration):

```
Checking for existing registration with hardware ID: ABC-123-XYZ
ℹ️ No existing registration found
[User registers]
```

### Second User (Skip Registration):

```
Checking for existing registration with hardware ID: ABC-123-XYZ
Hardware ID check response: { registered: true, data: {...} }
✅ Found existing registration for this machine
✅ Registration data loaded from hardware ID
[Navigate to /starttest]
```

### User with Existing localStorage:

```
[No hardware ID check, direct navigation]
```

---

## 🧪 Testing Checklist

### Frontend Testing:

- [ ] Fresh install, User A registers → hardware_id sent to backend
- [ ] User B launches on same machine → auto-populates from backend
- [ ] User clears localStorage → re-fetches from backend via hardware_id
- [ ] API returns error → gracefully fallback to registration
- [ ] Hardware ID unavailable → normal registration flow
- [ ] Verify all localStorage fields populated correctly

### Backend Testing:

- [ ] `check-registration` endpoint returns correct data
- [ ] `check-registration` handles missing hardware_id
- [ ] `registerSchoolDevice` returns existing `user_id` for duplicate hardware_id
- [ ] Database stores hardware_id correctly
- [ ] Index on hardware_id performs well
- [ ] API handles null/invalid hardware_id gracefully

---

## 🎯 Key Points

1. ✅ **One machine = One `schoolUserId`**: All users on same machine share same registration
2. ✅ **Backward compatible**: Old clients without hardware_id still work
3. ✅ **Graceful fallback**: If API fails, user can still register manually
4. ✅ **No breaking changes**: Existing users unaffected
5. ✅ **Simple logic**: Backend just checks if hardware_id exists

---

## 📞 Backend API Contract Summary

### Required Endpoints:

| Method   | Endpoint                                                               | Purpose                                                 | Status  |
| -------- | ---------------------------------------------------------------------- | ------------------------------------------------------- | ------- |
| **GET**  | `/dailycheckapp_schools/checkExistingInstallation/:device_hardware_id` | Check if machine registered                             | ✅ Done |
| **POST** | `/dailycheckapp_schools`                                               | Register device (modified to accept device_hardware_id) | ✅ Done |

### Required Database Changes:

**✅ COMPLETED**

| Table                  | Column               | Type | Notes                              |
| ---------------------- | -------------------- | ---- | ---------------------------------- |
| `dailycheckapp_school` | `device_hardware_id` | TEXT | For device registration            |
| `measurements`         | `device_hardware_id` | TEXT | For tracking which device ran test |

**Recommended**: Add index on `device_hardware_id` for performance

```sql
CREATE INDEX idx_device_hardware_id ON dailycheckapp_school(device_hardware_id);
```

---

## 🚀 Deployment Notes

1. **Backend first**: Deploy backend changes before frontend
2. **Test endpoint**: Verify `check-registration` endpoint works
3. **Deploy frontend**: New frontend is backward compatible
4. **Monitor logs**: Check console for hardware ID check responses
5. **Sentry**: Monitor for any API errors

---

## ✅ Implementation Complete

Frontend is ready! Once backend implements the endpoints, the feature will work automatically.

**Questions?** Contact the development team.
