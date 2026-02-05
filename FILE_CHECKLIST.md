# Secret Box Feature - File Checklist ✅

## নতুন ফাইল তৈরি হয়েছে:

### HTML Files:
- [x] `box.html` - Secret Box মূল পেজ
- [x] `secret_history.html` - সম্পূর্ণ হিস্ট্রি এবং এডিট পেজ

### CSS Files:
- [x] `css/box.css` - Secret Box স্টাইলিং
- [x] `css/secret_history.css` - History পেজ স্টাইলিং

### JavaScript Files:
- [x] `js/box.js` - Secret Box লজিক
- [x] `js/secret_history.js` - History পেজ লজিক

### Database Files:
- [x] `migration_secret_box.sql` - পুরানো DB আপডেট করার জন্য

### Documentation:
- [x] `SETUP_GUIDE.md` - সেটআপ গাইড
- [x] `FILE_CHECKLIST.md` - এই ফাইল

---

## আপডেট করা ফাইল:

- [x] `database.sql` - party_name কলাম যোগ + update policy
- [x] `sw.js` - নতুন ফাইল ক্যাশিং এর জন্য
- [x] `README.md` - Secret Box ফিচার ডকুমেন্টেশন

---

## ইতিমধ্যে আছে (চেক করুন):

- [x] `dashboard.html` - Secret Box লিংক আছে
- [x] `history.html` - Secret Box লিংক আছে
- [x] `profile.html` - Secret Box লিংক আছে

---

## সেটআপ চেকলিস্ট:

### ধাপ ১: Database
- [ ] Supabase SQL Editor এ `migration_secret_box.sql` রান করেছেন
- [ ] অথবা নতুন প্রজেক্টে `database.sql` রান করেছেন

### ধাপ ২: Files
- [ ] সব নতুন HTML ফাইল আপলোড করেছেন
- [ ] সব নতুন CSS ফাইল আপলোড করেছেন
- [ ] সব নতুন JS ফাইল আপলোড করেছেন
- [ ] `sw.js` ফাইল আপডেট করেছেন

### ধাপ ৩: Testing
- [ ] Browser cache clear করেছেন (Ctrl+Shift+R)
- [ ] Dashboard থেকে Secret Box আইকন দেখা যাচ্ছে
- [ ] `box.html` পেজ ওপেন হচ্ছে
- [ ] TAKE এন্ট্রি করতে পারছেন
- [ ] RETURN এন্ট্রি করতে পারছেন
- [ ] তিনটি ব্যালেন্স সঠিকভাবে দেখাচ্ছে
- [ ] Secret History পেজ কাজ করছে
- [ ] Inline Edit কাজ করছে
- [ ] Quick Return কাজ করছে
- [ ] Filter কাজ করছে

---

## ফিচার টেস্টিং:

### Test Case 1: Take Money
1. box.html এ যান
2. Date, Purpose="Loan", Name="John", Amount=1000 দিন
3. "Take (Loan)" বাটনে ক্লিক করুন
4. চেক করুন:
   - Personal Due = ₹1,000 (লাল)
   - Physical Cash কমে গেছে

### Test Case 2: Return Money
1. Same Purpose এবং Name দিন
2. Amount=500 দিন
3. "Return (Deposit)" বাটনে ক্লিক করুন
4. চেক করুন:
   - Personal Due = ₹500 (আপডেট হয়েছে)
   - Physical Cash বেড়েছে

### Test Case 3: Quick Return
1. "View Full History & Edit" এ যান
2. TAKE এন্ট্রিতে Quick Return ইনপুটে 500 লিখুন
3. OK বাটনে ক্লিক করুন
4. চেক করুন:
   - নতুন RETURN এন্ট্রি তৈরি হয়েছে
   - Balance আপডেট হয়েছে

### Test Case 4: Inline Edit
1. Secret History পেজে যান
2. যেকোনো Name ফিল্ডে ক্লিক করুন
3. নাম পরিবর্তন করুন
4. বাইরে ক্লিক করুন
5. চেক করুন:
   - Auto-save হয়েছে (Console এ দেখুন)

### Test Case 5: Filter
1. Filter by Date সিলেক্ট করুন
2. Filter by Name লিখুন
3. চেক করুন:
   - শুধু ম্যাচিং রেকর্ড দেখাচ্ছে

---

## Common Issues & Solutions:

### Issue 1: "party_name column does not exist"
**Solution:** `migration_secret_box.sql` রান করুন

### Issue 2: "Permission denied for table secret_box"
**Solution:** Database policy চেক করুন, update policy আছে কিনা

### Issue 3: পুরানো ভার্সন দেখাচ্ছে
**Solution:** Browser cache clear করুন (Ctrl+Shift+R)

### Issue 4: Balance ভুল দেখাচ্ছে
**Solution:** 
- Dashboard এ গিয়ে একবার Save Day End করুন
- তারপর Secret Box চেক করুন

---

## File Structure Verification:

```
Daily-Cash-Register/
├── box.html ✅
├── secret_history.html ✅
├── database.sql ✅ (updated)
├── migration_secret_box.sql ✅ (new)
├── sw.js ✅ (updated)
├── SETUP_GUIDE.md ✅ (new)
├── FILE_CHECKLIST.md ✅ (new)
│
├── css/
│   ├── box.css ✅ (new)
│   └── secret_history.css ✅ (new)
│
└── js/
    ├── box.js ✅ (new)
    └── secret_history.js ✅ (new)
```

---

## 🎉 সব ঠিক থাকলে:

আপনার Secret Box ফিচার সম্পূর্ণভাবে কাজ করছে!

এখন আপনি:
- ব্যক্তিগত লেনদেন ট্র্যাক করতে পারবেন
- তিনটি ব্যালেন্স দেখতে পারবেন
- Quick Return করতে পারবেন
- Inline Edit করতে পারবেন
- Filter এবং Search করতে পারবেন

**Happy Tracking! 🚀**
