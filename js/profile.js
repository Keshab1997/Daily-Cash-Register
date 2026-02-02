let currentUser = null;

window.onload = async () => {
    const session = await checkAuth(true);
    currentUser = session.user;
    document.getElementById('userEmail').innerText = currentUser.email;

    // ইউজারের ছবি থাকলে তা লোড করা
    if (currentUser.user_metadata && currentUser.user_metadata.avatar_url) {
        document.getElementById('profileImg').src = currentUser.user_metadata.avatar_url;
    }

    loadStats(currentUser.id);
};

async function loadStats(userId) {
    try {
        const { count } = await _supabase.from('daily_accounts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        document.getElementById('totalDays').innerText = count || 0;

        const { data } = await _supabase.from('daily_accounts')
            .select('petty_cash')
            .eq('user_id', userId)
            .order('report_date', { ascending: false })
            .limit(1);

        if(data && data.length > 0) {
            document.getElementById('lastBalance').innerText = "₹" + data[0].petty_cash;
        } else {
            document.getElementById('lastBalance').innerText = "₹0";
        }
    } catch (err) {
        console.error("Error loading stats:", err);
    }
}

async function logout() {
    await _supabase.auth.signOut();
    window.location.href = 'index.html';
}

// --- ছবি আপলোড করার ফাংশন ---
async function uploadAvatar(input) {
    const file = input.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
    const filePath = fileName;

    const imgEl = document.getElementById('profileImg');
    const originalSrc = imgEl.src;
    imgEl.src = "https://i.gifer.com/ZKZg.gif"; // লোডিং অ্যানিমেশন

    try {
        // ১. Supabase Storage-এ আপলোড
        const { error: uploadError } = await _supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // ২. পাবলিক URL নেওয়া
        const { data: { publicUrl } } = _supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // ৩. ইউজারের মেটাডাটা আপডেট করা
        const { error: updateError } = await _supabase.auth.updateUser({
            data: { avatar_url: publicUrl }
        });

        if (updateError) throw updateError;

        imgEl.src = publicUrl;
        alert("✅ Profile picture updated!");

    } catch (error) {
        alert("Error: " + error.message);
        imgEl.src = originalSrc;
    }
}

// --- Factory Reset Logic (Fixed) ---
async function resetAccount() {
    if (!currentUser) {
        const { data: { session } } = await _supabase.auth.getSession();
        if (session) currentUser = session.user;
    }

    if (!currentUser) {
        alert("Session not found. Please login again.");
        return;
    }

    if(!confirm("⚠️ WARNING: This will delete ALL your data permanently. Are you sure?")) {
        return;
    }

    const userInput = prompt("To confirm, please type 'DELETE':");

    if (userInput === "DELETE") {
        const btn = document.querySelector('.btn-reset-new');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="ri-loader-4-line"></i> Deleting...';
        btn.disabled = true;

        try {
            // 1. Delete Transactions
            const { error: tError } = await _supabase
                .from('transactions')
                .delete()
                .eq('user_id', currentUser.id);

            if (tError) throw tError;

            // 2. Delete Daily Accounts
            const { error: dError } = await _supabase
                .from('daily_accounts')
                .delete()
                .eq('user_id', currentUser.id);

            if (dError) throw dError;

            alert("✅ All data has been deleted successfully!");
            window.location.reload();

        } catch (error) {
            console.error(error);
            alert("Error: " + error.message + "\n\nTip: Make sure you ran the DELETE SQL policy in Supabase.");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    } else {
        alert("❌ Action Cancelled.");
    }
}
