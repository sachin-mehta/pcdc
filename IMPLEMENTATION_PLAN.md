# Implementation Plan: New Registration Flow

## Overview

Replace the current 3-step success page flow with a direct redirect to dashboard and show registration status notifications on first visit.

## Current Flow Analysis

1. User confirms school → `/confirmschool` → `this.router.navigate(['/schoolsuccess'])`
2. SchoolSuccess page shows 3-step onboarding slides
3. User manually navigates to start test from success page

## New Flow Requirements

1. Direct redirect from school confirmation to dashboard (`/starttest`)
2. Set flag for first-time visit after registration
3. Show banner notifications on dashboard for first visit
4. Auto-trigger test on first dashboard visit

## Implementation Phases

### Phase 1: Storage Service Enhancement

**Files to modify:**

- `src/app/services/storage.service.ts`

**Changes:**

- Add method to set/get first-time visit flag
- Add method to track registration completion status

### Phase 2: Confirm School Page Modification

**Files to modify:**

- `src/app/confirmschool/confirmschool.page.ts` (line 115)

**Changes:**

- Replace `this.router.navigate(['/schoolsuccess'])` with `this.router.navigate(['/starttest'])`
- Set localStorage flag for first-time visit: `isFirstVisitAfterRegistration = true`
- Set registration completion timestamp

### Phase 3: Dashboard (StartTest) Enhancement

**Files to modify:**

- `src/app/starttest/starttest.page.ts`
- `src/app/starttest/starttest.page.html`
- `src/app/starttest/starttest.page.scss`

**Changes:**

- Add property to track first-time visit status
- Add notification banner component/section
- Auto-trigger test on first visit (with delay)
- Clear first-time flag after test completion

### Phase 4: Notification Banner Component

**Files to create/modify:**

- Add banner section in `starttest.page.html`
- Style the banner in `starttest.page.scss`

**Banner Requirements:**

- Show "Registration completed" with checkmark
- Show "Running your first test" with progress indicator
- Similar styling to the reference image (blue banner with white text)
- Dismissible after test completion

### Phase 5: Auto-Test Trigger Logic

**Files to modify:**

- `src/app/starttest/starttest.page.ts`

**Changes:**

- Check for first-time visit flag in ngOnInit
- Auto-trigger `startNDT()` method after component initialization
- Update banner status during test execution

## Detailed Execution Steps

### Step 1: Storage Service Updates

```typescript
// Add to storage.service.ts
setFirstTimeVisit(value: boolean): void
getFirstTimeVisit(): boolean
setRegistrationCompleted(timestamp: number): void
getRegistrationCompleted(): number | null
```

### Step 2: Modify confirmschool.page.ts

```typescript
// Replace line 115
this.storage.set("isFirstVisitAfterRegistration", true);
this.storage.set("registrationCompletedAt", Date.now());
this.router.navigate(["/starttest"]);
```

### Step 3: Enhance starttest.page.ts

```typescript
// Add properties
isFirstVisit: boolean = false;
showRegistrationBanner: boolean = false;
registrationStatus: 'completed' | 'testing' | 'done' = 'completed';

// Add in ngOnInit
checkFirstTimeVisit();
if (this.isFirstVisit) {
  this.showRegistrationBanner = true;
  this.autoTriggerFirstTest();
}
```

### Step 4: Add Banner HTML

```html
<!-- Add to starttest.page.html after pcdc-header -->
<div class="registration-banner" *ngIf="showRegistrationBanner">
  <div class="banner-content">
    <div class="status-item completed">
      <ion-icon name="checkmark-circle" color="success"></ion-icon>
      <span>Registration completed</span>
    </div>
    <div class="status-item" [class.active]="registrationStatus === 'testing'">
      <ion-spinner *ngIf="registrationStatus === 'testing'"></ion-spinner>
      <ion-icon name="checkmark-circle" color="success" *ngIf="registrationStatus === 'done'"></ion-icon>
      <span>Running your first test</span>
    </div>
  </div>
  <ion-button fill="clear" size="small" (click)="dismissBanner()">
    <ion-icon name="close" slot="icon-only"></ion-icon>
  </ion-button>
</div>
```

### Step 5: Banner Styling

```scss
.registration-banner {
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

## Testing Checklist

- [ ] Confirm school registration redirects to dashboard
- [ ] First-time visit flag is set correctly
- [ ] Banner appears on first dashboard visit
- [ ] Auto-test triggers automatically
- [ ] Banner updates during test execution
- [ ] Banner can be dismissed
- [ ] Subsequent visits don't show banner
- [ ] All existing functionality remains intact

## Rollback Plan

If issues arise:

1. Revert confirmschool.page.ts to original navigation
2. Remove banner components from starttest page
3. Restore original schoolsuccess page functionality

## Risk Assessment

- **Low Risk**: Storage service modifications
- **Medium Risk**: Navigation flow changes
- **Low Risk**: UI banner additions
- **Medium Risk**: Auto-test trigger implementation

## Dependencies

- No external dependencies required
- All changes use existing Angular/Ionic components
- Leverages existing storage and measurement services
