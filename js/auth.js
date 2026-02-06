function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm.classList.contains('hidden')) {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    }
}

async function login() {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const btn = document.querySelector('#loginForm button');

    if(!email || !pass) {
        showToast("Please enter email and password", 'error');
        return;
    }

    btn.innerHTML = "Logging in...";
    btn.disabled = true;

    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email, password: pass
    });

    if (error) {
        showToast("Login failed: " + error.message, 'error');
        btn.innerHTML = "Login";
        btn.disabled = false;
    } else {
        window.location.href = 'dashboard.html';
    }
}

async function signup() {
    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPassword').value;
    const btn = document.querySelector('#signupForm button');

    if(!email || !pass) {
        showToast("Please fill all fields", 'error');
        return;
    }
    if(pass.length < 6) {
        showToast("Password must be at least 6 characters", 'error');
        return;
    }

    btn.innerHTML = "Creating account...";
    btn.disabled = true;

    const { data, error } = await _supabase.auth.signUp({
        email: email, password: pass
    });

    if (error) {
        showToast("Error: " + error.message, 'error');
        btn.innerHTML = "Sign Up";
        btn.disabled = false;
    } else {
        document.getElementById('signupForm').classList.add('hidden');
        document.getElementById('verifyMsg').classList.remove('hidden');
        document.getElementById('sentEmail').innerText = email;
        showToast("Account created! Check your email.", 'success');
    }
}

checkAuth(false);
