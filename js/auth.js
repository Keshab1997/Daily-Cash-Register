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

    if(!email || !pass) return alert("Please enter email and password");

    btn.innerHTML = "Logging in...";
    btn.disabled = true;

    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email, password: pass
    });

    if (error) {
        alert("Login failed: " + error.message);
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

    if(!email || !pass) return alert("Please fill all fields");
    if(pass.length < 6) return alert("Password must be at least 6 characters");

    btn.innerHTML = "Creating account...";
    btn.disabled = true;

    const { data, error } = await _supabase.auth.signUp({
        email: email, password: pass
    });

    if (error) {
        alert("Error: " + error.message);
        btn.innerHTML = "Sign Up";
        btn.disabled = false;
    } else {
        document.getElementById('signupForm').classList.add('hidden');
        document.getElementById('verifyMsg').classList.remove('hidden');
        document.getElementById('sentEmail').innerText = email;
    }
}

checkAuth(false);
