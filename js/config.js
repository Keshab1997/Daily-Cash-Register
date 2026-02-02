const SUPABASE_URL = "https://fpzduypihjkzphuofmhe.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwemR1eXBpaGprenBodW9mbWhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMjY4NjAsImV4cCI6MjA4NTYwMjg2MH0.b9-iGceM8cByJJXWF_2V3rNpbk5d9OCT_E0o4g0xy_Y";

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkAuth(required = true) {
    const { data: { session } } = await _supabase.auth.getSession();
    
    if (required && !session) {
        window.location.href = 'index.html';
    }
    if (!required && session) {
        window.location.href = 'dashboard.html';
    }
    return session;
}
