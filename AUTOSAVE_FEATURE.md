# Cash Calculator Auto-Save Feature 💾

## সমস্যা কী ছিল?

আপনি যখন Cash Calculator এ নোট গণনা করছেন:
- 500 টাকার নোট = 10টি
- 200 টাকার নোট = 5টি
- 100 টাকার নোট = 8টি

হঠাৎ পেজ রিফ্রেশ হলে বা ব্রাউজার বন্ধ করলে সব ডাটা মুছে যেত। আবার নতুন করে গুনতে হতো।

## সমাধান: localStorage Auto-Save

এখন আপনি যখনই কোনো সংখ্যা ইনপুট করবেন, সাথে সাথে ব্রাউজারের localStorage এ সেভ হয়ে যাবে।

### কীভাবে কাজ করে?

1. **Auto Save:** প্রতিটি ইনপুটে সংখ্যা দিলেই সেভ হবে
2. **Auto Load:** পেজ খুললেই আগের ডাটা ফিরে আসবে
3. **Persistent:** ব্রাউজার বন্ধ করলেও থাকবে

## Technical Details:

### Save Logic (calcDenom):
```javascript
const denomData = {};
inputs.forEach(input => {
    denomData[multiplier] = input.value;
});
localStorage.setItem('cashDenoms', JSON.stringify(denomData));
```

### Load Logic (loadSavedDenominations):
```javascript
const savedData = localStorage.getItem('cashDenoms');
if (savedData) {
    const denoms = JSON.parse(savedData);
    inputs.forEach(input => {
        input.value = denoms[val];
    });
}
```

## উদাহরণ:

### Scenario 1: মাঝপথে বন্ধ
```
1. আপনি ইনপুট দিলেন:
   - 500: 10
   - 200: 5
   - 100: 8

2. হঠাৎ ব্রাউজার ক্র্যাশ হলো

3. আবার খুললেন:
   - 500: 10 ✅ (ফিরে এসেছে)
   - 200: 5 ✅
   - 100: 8 ✅
```

### Scenario 2: পরের দিন
```
1. আজ নোট গুনলেন এবং সেভ হলো
2. কাল এসে পেজ খুললেন
3. গতকালের ডাটা দেখতে পাবেন
4. নতুন করে ইনপুট দিলে আপডেট হবে
```

## কোড পরিবর্তন:

### 1. js/dashboard.js

**নতুন ফাংশন যোগ:**
```javascript
function loadSavedDenominations() {
    const savedData = localStorage.getItem('cashDenoms');
    if (savedData) {
        const denoms = JSON.parse(savedData);
        inputs.forEach(input => {
            input.value = denoms[val];
        });
    }
}
```

**calcDenom আপডেট:**
```javascript
const denomData = {};
inputs.forEach(input => {
    denomData[multiplier] = input.value;
});
localStorage.setItem('cashDenoms', JSON.stringify(denomData));
```

**window.onload আপডেট:**
```javascript
loadSavedDenominations(); // পেজ লোডে কল
```

## localStorage কী?

- ব্রাউজারের একটি স্টোরেজ সিস্টেম
- ডাটা পারমানেন্টলি সেভ থাকে
- ব্রাউজার বন্ধ করলেও মুছে যায় না
- শুধু ম্যানুয়ালি ক্লিয়ার করলে মুছবে

## Data Format:

localStorage এ এভাবে সেভ হয়:
```json
{
  "500": "10",
  "200": "5",
  "100": "8",
  "50": "2",
  "20": "5",
  "10": "10",
  "1": "25"
}
```

## Clear করার উপায়:

যদি ডাটা ক্লিয়ার করতে চান:

### Option 1: Browser Console
```javascript
localStorage.removeItem('cashDenoms');
```

### Option 2: Browser Settings
- Settings → Privacy → Clear browsing data → Cookies and site data

### Option 3: Day End এ Auto Clear (Optional)
saveDayEnd ফাংশনে যোগ করুন:
```javascript
localStorage.removeItem('cashDenoms');
```

## সুবিধা:

✅ পেজ রিফ্রেশ করলেও ডাটা থাকবে  
✅ ব্রাউজার বন্ধ করলেও থাকবে  
✅ অটোমেটিক সেভ  
✅ কোনো বাটন ক্লিক লাগবে না  
✅ দ্রুত এবং নির্ভরযোগ্য  

## সতর্কতা:

⚠️ **Browser Clear করলে মুছে যাবে**  
⚠️ **অন্য ডিভাইসে সিঙ্ক হবে না** (শুধু এই ব্রাউজারে)  
⚠️ **Private/Incognito Mode এ কাজ করবে না**  

---

**এখন নিশ্চিন্তে নোট গণনা করুন! 💯**
