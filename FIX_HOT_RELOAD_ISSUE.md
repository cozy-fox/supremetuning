# 🔧 Fix: setStagePlusPricingDialog is not defined

## Problem

You're seeing this error:
```
page.jsx:2097 Uncaught ReferenceError: setStagePlusPricingDialog is not defined
```

## Root Cause

This is a **Next.js hot-reload cache issue**. The state variable `setStagePlusPricingDialog` IS properly defined in the code (line 66), but Next.js's hot module replacement (HMR) hasn't picked up the change correctly.

## Solution: Restart the Dev Server

### **Option 1: Hard Restart (Recommended)**

1. **Stop the dev server:**
   - Press `Ctrl + C` in the terminal running `npm run dev`

2. **Clear Next.js cache:**
   ```powershell
   Remove-Item -Recurse -Force .next
   ```

3. **Restart the dev server:**
   ```powershell
   npm run dev
   ```

4. **Hard refresh the browser:**
   - Press `Ctrl + Shift + R` (Windows/Linux)
   - Or `Cmd + Shift + R` (Mac)

### **Option 2: Quick Restart**

1. **Stop the dev server:**
   - Press `Ctrl + C` in the terminal

2. **Restart immediately:**
   ```powershell
   npm run dev
   ```

3. **Hard refresh the browser:**
   - Press `Ctrl + Shift + R`

### **Option 3: If Still Not Working**

1. **Clear browser cache:**
   - Open DevTools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"

2. **Clear Next.js cache and node_modules:**
   ```powershell
   Remove-Item -Recurse -Force .next
   Remove-Item -Recurse -Force node_modules
   npm install
   npm run dev
   ```

## Verification

After restarting, the state variable should be properly recognized:

```javascript
// Line 66 in app/admin/page.jsx
const [stagePlusPricingDialog, setStagePlusPricingDialog] = useState(false);

// Line 2097 - This should now work
setStagePlusPricingDialog(true);
```

## Why This Happens

Next.js uses Hot Module Replacement (HMR) to update code without full page reloads. Sometimes when adding new state variables or imports, HMR doesn't properly update the component scope, causing variables to appear "undefined" even though they exist in the code.

This is a common issue when:
- Adding new state variables
- Adding new imports
- Modifying component structure
- Adding new hooks

## Prevention

For future changes, if you see similar "not defined" errors after adding new code:
1. Always try a dev server restart first
2. Clear `.next` folder if restart doesn't work
3. Hard refresh the browser

---

**TL;DR:** Stop the dev server (`Ctrl + C`), delete `.next` folder, run `npm run dev`, and hard refresh browser (`Ctrl + Shift + R`).

