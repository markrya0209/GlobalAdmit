import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://uhefibgtsbtdxfqluzxo.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_9z6iuc_jIARINrRIwbzRNw_nN6BGEr_";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authForm = document.getElementById("auth-form");
const authEmailInput = document.getElementById("auth-email");
const authPasswordInput = document.getElementById("auth-password");
const authStatus = document.getElementById("auth-status");
const authSubmitButton = document.getElementById("auth-submit-button");
const signinToggle = document.getElementById("signin-toggle");
const signupToggle = document.getElementById("signup-toggle");
const signupConsent = document.getElementById("signup-consent");
const signupAgree = document.getElementById("signup-agree");
const authHelper = document.getElementById("auth-helper");
const googleAuthButton = document.getElementById("google-auth-button");

let isAuthBusy = false;
let authMode = "signin";

function setAuthStatus(message, isError = false) {
  if (!authStatus) return;
  authStatus.textContent = message;
  authStatus.classList.toggle("auth-status-error", isError);
}

function setAuthBusyState(isBusy) {
  isAuthBusy = isBusy;
  if (authEmailInput) authEmailInput.disabled = isBusy;
  if (authPasswordInput) authPasswordInput.disabled = isBusy;
  if (authSubmitButton) authSubmitButton.disabled = isBusy;
  if (signinToggle) signinToggle.disabled = isBusy;
  if (signupToggle) signupToggle.disabled = isBusy;
  if (googleAuthButton) googleAuthButton.disabled = isBusy;
  if (signupAgree) signupAgree.disabled = isBusy;
}

function renderAuthMode(mode) {
  authMode = mode;
  const isSignin = mode === "signin";

  signinToggle?.classList.toggle("is-active", isSignin);
  signupToggle?.classList.toggle("is-active", !isSignin);
  signinToggle?.setAttribute("aria-selected", String(isSignin));
  signupToggle?.setAttribute("aria-selected", String(!isSignin));

  if (authSubmitButton) {
    authSubmitButton.textContent = isSignin ? "Log in" : "Create account";
  }

  if (authHelper) {
    authHelper.hidden = !isSignin;
  }

  if (signupConsent) {
    signupConsent.hidden = isSignin;
    signupConsent.setAttribute("aria-hidden", String(isSignin));
  }

  if (signupAgree && isSignin) {
    signupAgree.checked = false;
  }
}

async function routeIfSignedIn() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    setAuthStatus(error.message, true);
    return;
  }

  if (data.session?.user) {
    window.location.replace("dashboard.html");
    return;
  }

  setAuthStatus("Sign in or create an account to continue to your dashboard.");
}

async function handleAuth() {
  if (isAuthBusy || !authEmailInput || !authPasswordInput) {
    return;
  }

  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value;

  if (!email || !password) {
    setAuthStatus("Enter both email and password.", true);
    return;
  }

  if (password.length < 6) {
    setAuthStatus("Password must be at least 6 characters.", true);
    return;
  }

  if (authMode === "signup" && !signupAgree?.checked) {
    setAuthStatus("Agree to the Terms & Conditions and Privacy Policy to create your account.", true);
    return;
  }

  setAuthBusyState(true);
  setAuthStatus(authMode === "signup" ? "Creating account..." : "Signing in...");

  const authAction = authMode === "signup"
    ? supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login.html`,
        },
      })
    : supabase.auth.signInWithPassword({ email, password });

  const { data, error } = await authAction;
  setAuthBusyState(false);

  if (error) {
    setAuthStatus(error.message, true);
    return;
  }

  authPasswordInput.value = "";

  if (authMode === "signup" && !data.session) {
    setAuthStatus("Account created. Check your email to activate your account.");
    return;
  }

  window.location.replace("dashboard.html");
}

async function handleGoogleAuth() {
  if (isAuthBusy) {
    return;
  }

  setAuthBusyState(true);
  setAuthStatus("Redirecting to Google...");

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/dashboard.html`,
    },
  });

  setAuthBusyState(false);

  if (error) {
    setAuthStatus(error.message, true);
  }
}

authForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await handleAuth();
});

signinToggle?.addEventListener("click", () => {
  renderAuthMode("signin");
});

signupToggle?.addEventListener("click", () => {
  renderAuthMode("signup");
});

googleAuthButton?.addEventListener("click", async () => {
  await handleGoogleAuth();
});

supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    window.location.replace("dashboard.html");
  }
});

renderAuthMode("signin");
routeIfSignedIn();
