/* =========================================================
   FINRISE ASSET
   SUPABASE CLIENT & DATA ACCESS LAYER
========================================================= */

const SUPABASE_URL = "https://jdcqczgrgnlqfzfgnsog.supabase.co";
const SUPABASE_KEY = "sb_publishable_C1cHus8zHeSRzWEnQn0kiA_c4m45QH9";

let supabaseClient = null;

/* =====================================================
   INITIALIZE SUPABASE CLIENT
===================================================== */

async function initSupabase() {
    if (supabaseClient) {
        return supabaseClient;
    }

    await loadSupabaseLibrary();

    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY,
        {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        }
    );

    return supabaseClient;
}

/* =====================================================
   LOAD SUPABASE LIBRARY
===================================================== */

function loadSupabaseLibrary() {
    return new Promise((resolve, reject) => {
        if (window.supabase) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        script.onload = resolve;
        script.onerror = () => reject(new Error("Unable to load Supabase"));
        document.head.appendChild(script);
    });
}

/* =====================================================
   GET SUPABASE CLIENT
===================================================== */

async function getSupabase() {
    return initSupabase();
}

/* =====================================================
   AUTHENTICATION
===================================================== */

async function getCurrentUser() {
    const client = await getSupabase();
    const { data, error } = await client.auth.getUser();
    return { user: data?.user || null, error };
}

async function getSession() {
    const client = await getSupabase();
    const { data, error } = await client.auth.getSession();
    return { session: data?.session || null, error };
}

async function signOut() {
    const client = await getSupabase();
    const { error } = await client.auth.signOut();
    return { error };
}

/* =====================================================
   PROFILES
===================================================== */

async function getCurrentProfile() {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();

    if (authError || !user) {
        return { profile: null, error: authError || new Error("No user") };
    }

    const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

    return { profile: data, error };
}

async function updateProfile(updates) {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();

    if (authError || !user) {
        return { error: authError || new Error("No user") };
    }

    const { data, error } = await client
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

    return { data, error };
}

/* =====================================================
   WALLETS
===================================================== */

async function getCurrentWallet() {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();

    if (authError || !user) {
        return { wallet: null, error: authError || new Error("No user") };
    }

    const { data, error } = await client
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

    return { wallet: data, error };
}

/* =====================================================
   DEPOSITS
===================================================== */

async function getUserDeposits() {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();

    if (authError || !user) {
        return { deposits: [], error: authError || new Error("No user") };
    }

    const { data, error } = await client
        .from("deposits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return { deposits: data || [], error };
}

async function submitDeposit(depositData) {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();

    if (authError || !user) {
        return { error: authError || new Error("No user") };
    }

    const { data, error } = await client
        .from("deposits")
        .insert({
            user_id: user.id,
            amount: depositData.amount,
            currency: depositData.currency || "USD",
            method: depositData.method,
            status: "pending",
            ...depositData
        })
        .select()
        .single();

    return { data, error };
}

/* =====================================================
   WITHDRAWALS
===================================================== */

async function getUserWithdrawals() {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();

    if (authError || !user) {
        return { withdrawals: [], error: authError || new Error("No user") };
    }

    const { data, error } = await client
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return { withdrawals: data || [], error };
}

async function createWithdrawalRequest(params) {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();

    if (authError || !user) {
        return { error: authError || new Error("No user") };
    }

    const { data, error } = await client.rpc("create_withdrawal", {
        p_amount: params.amount,
        p_currency: params.currency,
        p_method: params.method,
        p_destination: params.destination,
        p_network: params.network,
        p_fee: params.fee
    });

    return { data, error };
}

/* =====================================================
   INVESTMENTS
===================================================== */

async function getInvestmentPlans() {
    const client = await getSupabase();

    const { data, error } = await client
        .from("investment_plans")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: true });

    return { plans: data || [], error };
}

async function getUserInvestments() {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();

    if (authError || !user) {
        return { investments: [], error: authError || new Error("No user") };
    }

    const { data, error } = await client
        .from("investments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return { investments: data || [], error };
}

async function createInvestmentRequest(params) {
    const client = await getSupabase();

    const { data, error } = await client.rpc("create_investment", {
        p_plan_id: params.plan_id,
        p_amount: params.amount
    });

    return { data, error };
}

/* =====================================================
   LEDGER / TRANSACTIONS
===================================================== */

async function getUserLedger() {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();

    if (authError || !user) {
        return { ledger: [], error: authError || new Error("No user") };
    }

    const { data, error } = await client
        .from("ledger_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return { ledger: data || [], error };
}

/* =====================================================
   REFERRALS
===================================================== */

async function getUserReferrals() {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();

    if (authError || !user) {
        return { referrals: [], error: authError || new Error("No user") };
    }

    const { data, error } = await client
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

    return { referrals: data || [], error };
}

async function getUserReferralRewards() {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();

    if (authError || !user) {
        return { rewards: [], error: authError || new Error("No user") };
    }

    const { data, error } = await client
        .from("referral_rewards")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

    return { rewards: data || [], error };
}

/* =====================================================
   ADMIN FUNCTIONS
===================================================== */

async function adminApproveDeposit(depositId) {
    const client = await getSupabase();

    const { data, error } = await client.rpc("admin_approve_deposit", {
        p_deposit_id: depositId
    });

    return { data, error };
}

async function adminRejectDeposit(depositId) {
    const client = await getSupabase();

    const { data, error } = await client.rpc("admin_reject_deposit", {
        p_deposit_id: depositId
    });

    return { data, error };
}

async function adminCompleteWithdrawal(withdrawalId) {
    const client = await getSupabase();

    const { data, error } = await client.rpc("admin_complete_withdrawal", {
        p_withdrawal_id: withdrawalId
    });

    return { data, error };
}

async function adminRejectWithdrawal(withdrawalId) {
    const client = await getSupabase();

    const { data, error } = await client.rpc("admin_reject_withdrawal", {
        p_withdrawal_id: withdrawalId
    });

    return { data, error };
}

async function getPendingDeposits() {
    const client = await getSupabase();

    const { data, error } = await client
        .from("deposits")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

    return { deposits: data || [], error };
}

async function getPendingWithdrawals() {
    const client = await getSupabase();

    const { data, error } = await client
        .from("withdrawals")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true });

    return { withdrawals: data || [], error };
}

async function getAllUsers() {
    const client = await getSupabase();

    const { data, error } = await client
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    return { users: data || [], error };
}

async function getAllDeposits() {
    const client = await getSupabase();

    const { data, error } = await client
        .from("deposits")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false });

    return { deposits: data || [], error };
}

async function getAllWithdrawals() {
    const client = await getSupabase();

    const { data, error } = await client
        .from("withdrawals")
        .select("*, profiles(full_name, email)")
        .order("created_at", { ascending: false });

    return { withdrawals: data || [], error };
}
