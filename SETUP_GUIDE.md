# Secret Box Feature - Setup Guide

## 🎯 কী করবে এই ফিচার?

Secret Box আপনাকে ব্যক্তিগত লেনদেন ট্র্যাক করতে সাহায্য করবে যা আপনার অফিসিয়াল হিসাবের বাইরে। যেমন:
- কারো কাছ থেকে টাকা ধার নেওয়া (TAKE)
- ধার করা টাকা ফেরত দেওয়া (RETURN)

## 📊 তিনটি ব্যালেন্স দেখাবে:

1. **System Balance** - আপনার অফিসিয়াল হিসাবে যা আছে
2. **Personal Due** - আপনি কত টাকা ধার নিয়েছেন (শর্ট)
3. **Physical Cash** - আসলে আপনার হাতে কত টাকা আছে

**Formula:** Physical Cash = System Balance - Personal Due

---

## 🚀 সেটআপ করুন (৩টি ধাপ)

### ধাপ ১: Database Update

আপনার Supabase Dashboard → SQL Editor এ যান এবং নিচের কোড রান করুন:

```sql
-- যদি টেবিল আগে থেকে থাকে তবে এটি রান করুন
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'secret_box' AND column_name = 'party_name'
    ) THEN
        ALTER TABLE secret_box ADD COLUMN party_name text;
    END IF;
END $$;

-- Update Policy
DROP POLICY IF EXISTS "Users can update own secret data" ON secret_box;
CREATE POLICY "Users can update own secret data" ON secret_box 
FOR UPDATE USING (auth.uid() = user_id);
```

**অথবা** যদি নতুন প্রজেক্ট হয়, তবে পুরো `database.sql` ফাইল রান করুন।

---

### ধাপ ২: ফাইলগুলো আপলোড করুন

নিচের নতুন ফাইলগুলো আপনার প্রজেক্টে যোগ করুন:

#### HTML Files:
- `box.html`
- `secret_history.html`

#### CSS Files:
- `css/box.css`
- `css/secret_history.css`

#### JS Files:
- `js/box.js`
- `js/secret_history.js`

#### Updated Files:
- `sw.js` (ক্যাশিং এর জন্য আপডেট করা)
- `database.sql` (party_name কলাম যোগ)

---

### ধাপ ৩: ব্রাউজার ক্যাশ ক্লিয়ার করুন

1. আপনার ব্রাউজারে `Ctrl + Shift + R` (Windows) বা `Cmd + Shift + R` (Mac) চাপুন
2. অথবা Settings → Clear Cache করুন
3. পেজ রিলোড করুন

---

## 🎯 কীভাবে ব্যবহার করবেন?

### Secret Box Page:
1. Dashboard থেকে **Secret Box** আইকনে ক্লিক করুন
2. Date, Purpose, Name, Amount দিন
3. **Take (Loan)** বাটনে ক্লিক করুন টাকা নেওয়ার জন্য
4. **Return (Deposit)** বাটনে ক্লিক করুন টাকা ফেরত দেওয়ার জন্য
5. **View Due Summary** বাটনে ক্লিক করে প্রত্যেক ব্যক্তির বাকি দেখুন 🆕

### Secret History Page:
1. "View Full History & Edit" লিংকে ক্লিক করুন
2. যেকোনো ফিল্ডে ক্লিক করে সরাসরি এডিট করুন (Auto-save)
3. TAKE এন্ট্রিতে Quick Return ইনপুট দিয়ে দ্রুত ফেরত দিন
4. Filter দিয়ে Date, Name, Purpose অনুযায়ী খুঁজুন

---

## 🎨 ফিচার হাইলাইটস:

✨ **Auto-fill Suggestion** - একবার Purpose লিখলে পরের বার Name অটো আসবে  
⚡ **Quick Return** - History থেকে সরাসরি Return করুন  
✏️ **Inline Edit** - যেকোনো ফিল্ড ক্লিক করে এডিট করুন  
🔍 **Smart Filter** - Date, Name, Purpose দিয়ে ফিল্টার করুন  
📊 **Real-time Balance** - তিনটি ব্যালেন্স রিয়েল-টাইমে আপডেট হবে  
📋 **Person-wise Due Summary** - এক ক্লিকে দেখুন কে কত টাকা পাবে 🆕  

---

## 🔒 সিকিউরিটি:

- Row Level Security (RLS) দিয়ে সুরক্ষিত
- শুধুমাত্র আপনি নিজের ডাটা দেখতে পারবেন
- অন্য কেউ আপনার Secret Box দেখতে পারবে না

---

## 🐛 সমস্যা হলে:

1. Browser Console (F12) চেক করুন
2. Supabase SQL Editor এ Policy চেক করুন
3. `migration_secret_box.sql` ফাইল রান করুন
4. Cache clear করে পেজ রিলোড করুন

---

## 📞 সাপোর্ট:

কোনো সমস্যা হলে GitHub Issue তৈরি করুন অথবা README.md দেখুন।

---

**Happy Tracking! 🎉**
