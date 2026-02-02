# Daily-Cash-Register

একটি সম্পূর্ণ দৈনিক হিসাব ব্যবস্থাপনা অ্যাপ্লিকেশন যা Supabase দিয়ে তৈরি।

## 📂 ফোল্ডার স্ট্রাকচার

```
Daily-Cash-Register/
│
├── index.html           (Login Page)
├── dashboard.html       (Calculator Page)
├── history.html         (History Page)
├── profile.html         (Profile Page)
├── database.sql         (Supabase Database Setup)
│
├── css/
│   ├── base.css         (Common Fonts & Reset)
│   ├── navbar.css       (Navigation Bar Design)
│   ├── login.css        (Login Page Design)
│   ├── dashboard.css    (Calculator Design)
│   ├── history.css      (History Table Design)
│   └── profile.css      (Profile Page Design)
│
└── js/
    ├── config.js        (Supabase Setup & Auth Check)
    ├── auth.js          (Login Logic)
    ├── dashboard.js     (Calculator Logic)
    ├── history.js       (History Logic)
    └── profile.js       (Profile Logic)
```

## 🚀 সেটআপ নির্দেশনা

### ধাপ ১: Supabase Database Setup

1. [Supabase](https://supabase.com) এ গিয়ে একটি নতুন প্রজেক্ট তৈরি করুন
2. SQL Editor এ গিয়ে `database.sql` ফাইলের কোড রান করুন
3. এটি ডাটাবেস টেবিল এবং সিকিউরিটি পলিসি তৈরি করবে

### ধাপ ২: Supabase Credentials যুক্ত করুন

1. `js/config.js` ফাইল ওপেন করুন
2. আপনার Supabase Project Settings থেকে:
   - `SUPABASE_URL` কপি করুন
   - `SUPABASE_ANON_KEY` কপি করুন
3. `config.js` ফাইলে এই দুটি মান বসান

### ধাপ ৩: অ্যাপ্লিকেশন চালান

1. `index.html` ফাইল ব্রাউজারে ওপেন করুন
2. "Create New Account" বাটনে ক্লিক করে নতুন অ্যাকাউন্ট তৈরি করুন
3. লগিন করুন এবং ব্যবহার শুরু করুন!

## ✨ ফিচারসমূহ

- ✅ ইউজার লগিন/সাইনআপ সিস্টেম
- ✅ দৈনিক হিসাব ক্যালকুলেটর
- ✅ অটোমেটিক ওপেনিং ব্যালেন্স
- ✅ WhatsApp শেয়ার ফিচার
- ✅ হিস্ট্রি রেকর্ড দেখা
- ✅ PDF ডাউনলোড
- ✅ প্রোফাইল ম্যানেজমেন্ট
- ✅ সিকিউর ডাটা (RLS সহ)

## 🔒 সিকিউরিটি

- Row Level Security (RLS) দিয়ে প্রতিটি ইউজারের ডাটা সুরক্ষিত
- একজন ইউজার শুধুমাত্র নিজের ডাটা দেখতে পারবে

## 📱 রেসপন্সিভ ডিজাইন

- মোবাইল, ট্যাবলেট এবং ডেস্কটপ সব ডিভাইসে কাজ করবে

## 🛠️ টেকনোলজি

- HTML5, CSS3, JavaScript
- Supabase (Backend & Database)
- jsPDF (PDF Generation)
