import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { detectSessionInUrl: true, persistSession: true, autoRefreshToken: true }
});

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userProfile = document.getElementById('user-profile');
const userName = document.getElementById('user-name');
const userPhoto = document.getElementById('user-photo');

function setLoggedOut() {
    loginBtn.style.display = 'flex';
    userProfile.style.display = 'none';
    localStorage.removeItem('user');
}

function setLoggedIn(user) {
    loginBtn.style.display = 'none';
    userProfile.style.display = 'flex';
    userName.textContent = user.user_metadata?.full_name || user.email || "User";
    userPhoto.src = user.user_metadata?.avatar_url || 'https://via.placeholder.com/32';
    localStorage.setItem('user', JSON.stringify({
        name: user.user_metadata?.full_name || user.email || "User",
        email: user.email || "",
        photo: user.user_metadata?.avatar_url || ""
    }));
}

loginBtn.addEventListener('click', async () => {
    const redirectTo = `${window.location.origin}/callback.html`;
    const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo }
    });
    if (error) {
        alert(error.message);
    }
});

logoutBtn.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        alert(error.message);
    }
});

const { data: sessionData } = await supabase.auth.getSession();
if (sessionData.session?.user) {
    setLoggedIn(sessionData.session.user);
} else {
    setLoggedOut();
}

supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
        setLoggedIn(session.user);
    } else {
        setLoggedOut();
    }
});

