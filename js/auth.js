async function login() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    if(!email || !pass) return alert("Please fill all fields");

    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email, password: pass
    });

    if (error) alert("Login Failed: " + error.message);
    else window.location.href = 'dashboard.html';
}

async function signup() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    if(!email || !pass) return alert("Please fill all fields");

    const { data, error } = await _supabase.auth.signUp({
        email: email, password: pass
    });

    if (error) alert("Error: " + error.message);
    else alert("Account created! Please login.");
}

checkAuth(false);
