# Daily-Cash-Register

একটি সম্পূর্ণ দৈনিক হিসাব ব্যবস্থাপনা অ্যাপ্লিকেশন যা Supabase দিয়ে তৈরি।

## 📂 ফোল্ডার স্ট্রাকচার

```
Daily-Cash-Register/
│
├── index.html              (Login Page)
├── dashboard.html          (Calculator Page)
├── history.html            (History Page)
├── profile.html            (Profile Page)
├── box.html                (Secret Box Page) 🆕
├── secret_history.html     (Secret History Page) 🆕
├── database.sql            (Supabase Database Setup)
├── migration_secret_box.sql (Migration for existing DB) 🆕
│
├── css/
│   ├── base.css            (Common Fonts & Reset)
│   ├── navbar.css          (Navigation Bar Design)
│   ├── login.css           (Login Page Design)
│   ├── dashboard.css       (Calculator Design)
│   ├── history.css         (History Table Design)
│   ├── profile.css         (Profile Page Design)
│   ├── box.css             (Secret Box Design) 🆕
│   └── secret_history.css  (Secret History Design) 🆕
│
└── js/
    ├── config.js           (Supabase Setup & Auth Check)
    ├── auth.js             (Login Logic)
    ├── dashboard.js        (Calculator Logic)
    ├── history.js          (History Logic)
    ├── profile.js          (Profile Logic)
    ├── box.js              (Secret Box Logic) 🆕
    └── secret_history.js   (Secret History Logic) 🆕
```

## 🚀 সেটআপ নির্দেশনা

### ধাপ ১: Supabase Database Setup

#### নতুন প্রজেক্টের জন্য:
1. [Supabase](https://supabase.com) এ গিয়ে একটি নতুন প্রজেক্ট তৈরি করুন
2. SQL Editor এ গিয়ে `database.sql` ফাইলের কোড রান করুন
3. এটি ডাটাবেস টেবিল এবং সিকিউরিটি পলিসি তৈরি করবে

#### পুরানো প্রজেক্ট আপডেট করতে:
1. SQL Editor এ গিয়ে `migration_secret_box.sql` ফাইলের কোড রান করুন
2. এটি secret_box টেবিলে `party_name` কলাম যোগ করবে

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

### মূল ফিচার:
- ✅ ইউজার লগিন/সাইনআপ সিস্টেম
- ✅ দৈনিক হিসাব ক্যালকুলেটর
- ✅ অটোমেটিক ওপেনিং ব্যালেন্স
- ✅ WhatsApp শেয়ার ফিচার
- ✅ হিস্ট্রি রেকর্ড দেখা
- ✅ PDF ডাউনলোড
- ✅ প্রোফাইল ম্যানেজমেন্ট
- ✅ সিকিউর ডাটা (RLS সহ)

### 🆕 Secret Box ফিচার:
- 🔐 ব্যক্তিগত লেনদেন ট্র্যাকিং (Loan/Return)
- 💰 তিনটি ব্যালেন্স ভিউ:
  - System Balance (অফিসিয়াল হিসাব)
  - Personal Due (ব্যক্তিগত ঋণ)
  - Physical Cash (আসল নগদ)
- 👤 নাম ও উদ্দেশ্য সহ এন্ট্রি
- 🔄 Auto-fill সাজেশন
- ⚡ Quick Return ফিচার
- ✏️ Inline Edit (সরাসরি এডিট)
- 🔍 ফিল্টার ও সার্চ
- 📊 সম্পূর্ণ হিস্ট্রি ভিউ
- 📋 Person-wise Due Summary (কে কত পাবে তার তালিকা) 🆕

### 💵 Dashboard ফিচার:
- 🧮 Cash Denomination Calculator (নোট গণনার ক্যালকুলেটর) 🆕
- ✅ Short/Excess ডিটেকশন
- 💰 রিয়েল-টাইম ম্যাচিং

## 🔒 সিকিউরিটি

- Row Level Security (RLS) দিয়ে প্রতিটি ইউজারের ডাটা সুরক্ষিত
- একজন ইউজার শুধুমাত্র নিজের ডাটা দেখতে পারবে

## 📱 রেসপন্সিভ ডিজাইন

- মোবাইল, ট্যাবলেট এবং ডেস্কটপ সব ডিভাইসে কাজ করবে

## 🛠️ টেকনোলজি

- HTML5, CSS3, JavaScript
- Supabase (Backend & Database)
- jsPDF (PDF Generation)
