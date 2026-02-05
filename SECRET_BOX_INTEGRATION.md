# Secret Box Integration with Cash Calculator 🔗

## সমস্যা কী ছিল?

আপনি যখন নিজের জন্য বা গোপনে কিছু টাকা খরচ করেন (Secret Box এ TAKE এন্ট্রি), তখন:
- Dashboard এর Closing Balance = ₹10,000 (অফিসিয়াল হিসাব)
- কিন্তু আপনার ড্রয়ারে আসল টাকা = ₹9,500 (কারণ ₹500 নিজে নিয়েছেন)

এখন যদি Cash Calculator দিয়ে নোট গুনে ₹9,500 পান, তাহলে সে দেখাবে **Short: -₹500** 🔴

কিন্তু আসলে কোনো Short নেই! আপনি জেনেশুনেই ₹500 নিয়েছেন।

## সমাধান:

এখন Cash Calculator স্মার্ট হয়ে গেছে। সে Secret Box থেকে আপনার Due টাকা নিয়ে এসে হিসাব করবে।

### Formula:
```
Expected Physical Cash = Official Balance - Secret Due
```

### উদাহরণ:
```
Official Balance: ₹10,000
Secret Due: ₹500 (আপনি নিজে নিয়েছেন)
Expected Physical Cash: ₹9,500
```

এখন আপনি নোট গুনে ₹9,500 পেলে দেখাবে: **✅ Matched!** 🟢

## কীভাবে কাজ করে?

### ধাপ ১: Secret Box এ এন্ট্রি
1. Secret Box পেজে যান
2. TAKE এন্ট্রি করুন (যেমন: নিজের খরচ ₹500)

### ধাপ ২: Dashboard এ Calculator খুলুন
1. Dashboard এ Calculator আইকনে ক্লিক করুন
2. উপরে দেখবেন:
   - **Official Bal:** ₹10,000
   - **Secret Due:** ₹500
   - **Expected Cash:** ₹9,500

### ধাপ ৩: নোট গণনা করুন
1. প্রতিটি নোটের সংখ্যা ইনপুট করুন
2. Total Counted দেখুন
3. Difference চেক করুন

## নতুন ফিচার:

### 1. Adjustment Info Section
Calculator এর উপরে একটি লাল বক্স দেখাবে যেখানে:
- Official Balance (ড্যাশবোর্ডের হিসাব)
- Secret Due (সিক্রেট বক্সের খরচ)
- Expected Cash (আসল টাকা যা থাকার কথা)

### 2. Auto Sync
- Secret Box এ নতুন এন্ট্রি করলে অটোমেটিক আপডেট হবে
- Date পরিবর্তন করলে সিক্রেট ডিউ রিফ্রেশ হবে
- Calculator খোলার সময় লেটেস্ট ডাটা লোড হবে

### 3. Smart Matching
Calculator এখন Expected Cash এর সাথে মিলাবে, Official Balance এর সাথে নয়।

## বাস্তব উদাহরণ:

### Scenario 1: নিজের খরচ
```
Dashboard Closing: ₹50,000
Secret Box TAKE: ₹5,000 (নিজের খরচ)
Expected Cash: ₹45,000

নোট গুনে পেলেন: ₹45,000
Result: ✅ Matched!
```

### Scenario 2: কারো কাছ থেকে ধার
```
Dashboard Closing: ₹50,000
Secret Box TAKE: ₹10,000 (রহিমের কাছ থেকে ধার)
Expected Cash: ₹40,000

নোট গুনে পেলেন: ₹40,000
Result: ✅ Matched!
```

### Scenario 3: ধার ফেরত দিয়েছেন
```
Dashboard Closing: ₹50,000
Secret Box:
  - TAKE: ₹10,000
  - RETURN: ₹3,000
  - Net Due: ₹7,000
Expected Cash: ₹43,000

নোট গুনে পেলেন: ₹43,000
Result: ✅ Matched!
```

## কোড পরিবর্তন:

### 1. dashboard.html
- Adjustment Info সেকশন যোগ
- offBal, secDue, targetCash স্প্যান যোগ

### 2. css/dashboard.css
- `.adjustment-info` স্টাইলিং
- `.target-cash` ডিজাইন

### 3. js/dashboard.js
- `secretDueAmount` ভেরিয়েবল যোগ
- `fetchSecretDue()` ফাংশন যোগ
- `calcDenom()` আপডেট (Expected Cash ব্যবহার)
- `toggleCashCounter()` আপডেট (খোলার সময় sync)

## সুবিধা:

✅ নিজের খরচ ট্র্যাক করা সহজ  
✅ হিসাব সবসময় মিলবে  
✅ Short/Excess সঠিকভাবে দেখাবে  
✅ অটোমেটিক সিঙ্ক  
✅ রিয়েল-টাইম আপডেট  

## গুরুত্বপূর্ণ নোট:

1. **Secret Box এ TAKE** = আপনার Due বাড়বে = Expected Cash কমবে
2. **Secret Box এ RETURN** = আপনার Due কমবে = Expected Cash বাড়বে
3. Calculator সবসময় **Expected Cash** এর সাথে মিলাবে

---

**এখন আপনার হিসাব সম্পূর্ণ নিখুঁত থাকবে! 💯**
