async function login() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email, password: pass
    });

    if (error) alert("ভুল ইমেইল বা পাসওয়ার্ড! " + error.message);
    else window.location.href = 'dashboard.html';
}

async function signup() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    const { data, error } = await _supabase.auth.signUp({
        email: email, password: pass
    });

    if (error) alert("Error: " + error.message);
    else alert("অ্যাকাউন্ট তৈরি হয়েছে! লগিন করুন।");
}

checkAuth(false);
