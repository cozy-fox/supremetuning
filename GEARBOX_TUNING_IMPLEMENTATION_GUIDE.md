# 🔧 Gearbox Tuning Feature - Frontend Implementation Guide

## Overview
This guide will help you add the **mandatory gearbox tuning notice** to the frontend user application at `F:\work\supreme-tuning`.

---

## ✅ Implementation Steps

### **Step 1: Update Translations File**

**File:** `F:\work\supreme-tuning\lib\i18n\translations.js`

**Action:** Add the gearbox tuning translations for all 6 languages (Dutch, English, German, French, Spanish, Italian).

**Location:** Add these translations in each language section, right after the `ecuUnlockRequired` translations.

**Translations to add:** See file `FRONTEND_GEARBOX_TRANSLATIONS.txt` for the exact code to copy.

**Example for Dutch (NL):**
```javascript
// ECU Unlock
ecuUnlockRequired: 'ECU Unlock Vereist',
ecuUnlockDescription: '...',

// Gearbox Tuning  ← ADD THIS SECTION
gearboxTuningRequired: 'DSG & ZF Automaat Tuning Vereist',
gearboxTuningIncluded: 'Incl. automaat tuning (vereist)',
gearboxTuningDescription: 'Automatische versnellingsbak tuning is verplicht en inbegrepen in de prijs. Zonder versnellingsbak tuning wordt deze service niet aangeboden.',
```

Repeat for all 6 languages: NL, EN, DE, FR, ES, IT.

---

### **Step 2: Update ResultsClient Component**

**File:** `F:\work\supreme-tuning\app\[brand]\[model]\[type]\[engine]\ResultsClient.jsx`

#### **2.1 Add Zap Icon Import**

Find the import line at the top of the file:
```javascript
import { ChevronRight, Phone, ShoppingBag, Check, AlertCircle, Unlock, ... } from 'lucide-react';
```

Add `Zap` to the imports:
```javascript
import { ChevronRight, Phone, ShoppingBag, Check, AlertCircle, Zap, Unlock, ... } from 'lucide-react';
```

#### **2.2 Add Gearbox Tuning Notice**

Find the **Price Box** section (search for `price-box` or `Price`). It should look like:
```javascript
{/* Price */}
<div className="price-box">
  <div className="price-row">
    <span>{stage.stageName || 'Stage 1'}</span>
    <span className="price-value">€{stage.price || '---'}</span>
  </div>
</div>
```

**Add this code IMMEDIATELY AFTER the price box:**
```javascript
{/* Gearbox Tuning Notice - Mandatory for all vehicles */}
<div className="gearbox-tuning-notice" style={{
  marginTop: '16px',
  padding: '14px',
  background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.12) 0%, rgba(0, 200, 100, 0.08) 100%)',
  border: '1px solid rgba(0, 255, 136, 0.35)',
  borderRadius: '8px'
}}>
  <h4 style={{
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#00ff88',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: '600'
  }}>
    <Zap size={16} /> {t('gearboxTuningIncluded')}
  </h4>
  <p style={{ fontSize: '12px', color: '#b0b0b0', lineHeight: '1.5', margin: 0 }}>
    {t('gearboxTuningDescription')}
  </p>
</div>
```

**Full code example:** See file `FRONTEND_GEARBOX_COMPONENT.txt`

---

## 🎨 Visual Result

The gearbox notice will appear as a **green box** below the price:

```
┌─────────────────────────────────────────────┐
│ Stage 1                            €600     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ⚡ Incl. automaat tuning (vereist)         │
│                                             │
│ Automatische versnellingsbak tuning is     │
│ verplicht en inbegrepen in de prijs...     │
└─────────────────────────────────────────────┘
```

---

## 🌍 Multi-Language Support

The feature automatically supports all 6 languages:
- 🇳🇱 **Dutch (NL)** - Default
- 🇬🇧 **English (EN)**
- 🇩🇪 **German (DE)**
- 🇫🇷 **French (FR)**
- 🇪🇸 **Spanish (ES)**
- 🇮🇹 **Italian (IT)**

The text will change based on the user's selected language using the `t()` translation function.

---

## ✅ Testing Checklist

After implementation, test:
- [ ] Gearbox notice appears on all stage pages
- [ ] Notice appears below the price box
- [ ] Green styling is correct
- [ ] Lightning bolt icon (⚡) is visible
- [ ] Text changes when switching languages
- [ ] Responsive design works on mobile
- [ ] Notice appears for Stage 1, Stage 1+, Stage 2, Stage 2+

---

## 📁 Files Modified

1. ✅ `F:\work\supreme-tuning\lib\i18n\translations.js` - Added translations
2. ✅ `F:\work\supreme-tuning\app\[brand]\[model]\[type]\[engine]\ResultsClient.jsx` - Added component

---

## 🚀 Deployment

After making changes:
1. Save all files
2. Restart the development server: `npm run dev`
3. Test on: `http://localhost:3000/[brand]/[model]/[type]/[engine]`
4. Verify all languages work
5. Deploy to production

---

## 📞 Support

If you encounter any issues, check:
- Translation keys match exactly: `gearboxTuningIncluded`, `gearboxTuningDescription`
- `Zap` icon is imported from `lucide-react`
- Code is placed AFTER the price box, not inside it
- All 6 language sections have the translations

