/* =========================================================
   FINRISE ASSET
   SUPABASE CLIENT & DATA ACCESS LAYER
   Database is the source of truth for authentication and
   all financial information.
========================================================= */

const SUPABASE_URL = "https://jdcqczgrgnlqfzfgnsog.supabase.co";
const SUPABASE_KEY = "sb_publishable_C1cHus8zHeSRzWEnQn0kiA_c4m45QH9";

let supabaseClient = null;
let supabaseLoadPromise = null;

function loadSupabaseLibrary() {
    if (window.supabase) return Promise.resolve();
    if (supabaseLoadPromise) return supabaseLoadPromise;

    supabaseLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error("Unable to load Supabase."));
        document.head.appendChild(script);
    });

    return supabaseLoadPromise;
}

async function initSupabase() {
    if (supabaseClient) return supabaseClient;

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

async function getSupabase() {
    return initSupabase();
}

async function getSession() {
    const client = await getSupabase();
    const { data, error } = await client.auth.getSession();
    return { session: data?.session || null, error };
}

async function getCurrentUser() {
    const client = await getSupabase();
    const { data, error } = await client.auth.getUser();
    return { user: data?.user || null, error };
}

async function signOut() {
    const client = await getSupabase();
    const { error } = await client.auth.signOut();
    return { error };
}

async function getCurrentProfile() {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();

    if (authError || !user) {
        return { profile: null, error: authError || new Error("No authenticated user.") };
    }

    const { data, error } = await client
        .from("profiles")
        .select("id,full_name,username,phone,country,referral_code,created_at")
        .eq("id", user.id)
        .maybeSingle();

    return { profile: data, error };
}

async function updateProfile(updates) {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();

    if (authError || !user) {
        return { data: null, error: authError || new Error("No authenticated user.") };
    }

    const safeUpdates = {};
    ["full_name", "username", "phone", "country"].forEach(key => {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
            safeUpdates[key] = updates[key];
        }
    });

    const { data, error } = await client
        .from("profiles")
        .update(safeUpdates)
        .eq("id", user.id)
        .select("id,full_name,username,phone,country,referral_code,created_at")
        .single();

    return { data, error };
}

async function getCurrentWallet() {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();

    if (authError || !user) {
        return { wallet: null, error: authError || new Error("No authenticated user.") };
    }

    const { data, error } = await client
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

    return { wallet: data, error };
}

async function getUserDeposits() {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();
    if (authError || !user) return { deposits: [], error: authError || new Error("No authenticated user.") };

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
    if (authError || !user) return { data: null, error: authError || new Error("No authenticated user.") };

    const payload = {
        user_id: user.id,
        amount: Number(depositData.amount),
        currency: depositData.currency || "NGN",
        method: depositData.method || "crypto",
        network: depositData.network || null,
        reference: String(depositData.reference || "").trim() || null,
        proof_url: depositData.proof_url || null,
        status: "pending"
    };

    const { data, error } = await client
        .from("deposits")
        .insert(payload)
        .select("*")
        .single();

    return { data, error };
}

async function getUserWithdrawals() {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();
    if (authError || !user) return { withdrawals: [], error: authError || new Error("No authenticated user.") };

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
    if (authError || !user) return { data: null, error: authError || new Error("No authenticated user.") };

    const { data, error } = await client.rpc("create_withdrawal", {
        p_amount: Number(params.amount),
        p_currency: params.currency || "NGN",
        p_method: params.method || "crypto",
        p_destination: params.destination,
        p_network: params.network || null,
        p_fee: 5
    });

    return { data, error };
}

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
    if (authError || !user) return { investments: [], error: authError || new Error("No authenticated user.") };

    const { data, error } = await client
        .from("investments")
        .select("*, investment_plans(name,roi_percentage,duration_hours)")
        .eq("user_id", user.id)
        .order("started_at", { ascending: false });

    return { investments: data || [], error };
}

async function createInvestmentRequest(params) {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();
    if (authError || !user) return { data: null, error: authError || new Error("No authenticated user.") };

    const { data, error } = await client.rpc("create_investment", {
        p_plan_id: params.plan_id,
        p_amount: Number(params.amount)
    });

    return { data, error };
}

async function getUserLedger() {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();
    if (authError || !user) return { ledger: [], error: authError || new Error("No authenticated user.") };

    const { data, error } = await client
        .from("ledger_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return { ledger: data || [], error };
}

async function getUserReferrals() {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();
    if (authError || !user) return { referrals: [], error: authError || new Error("No authenticated user.") };

    const { data, error } = await client
        .from("referrals")
        .select("id,referrer_id,referred_user_id,referral_code,created_at")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

    return { referrals: data || [], error };
}

async function getUserReferralRewards() {
    const client = await getSupabase();
    const { user, error: authError } = await getCurrentUser();
    if (authError || !user) return { rewards: [], error: authError || new Error("No authenticated user.") };

    const { data, error } = await client
        .from("referral_rewards")
        .select("id,user_id,source_user_id,amount,status,created_at,paid_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return { rewards: data || [], error };
}

async function adminApproveDeposit(depositId) {
    const client = await getSupabase();
    return client.rpc("admin_approve_deposit", { p_deposit_id: depositId });
}

async function adminRejectDeposit(depositId) {
    const client = await getSupabase();
    return client.rpc("admin_reject_deposit", { p_deposit_id: depositId });
}

async function adminCompleteWithdrawal(withdrawalId) {
    const client = await getSupabase();
    return client.rpc("admin_complete_withdrawal", { p_withdrawal_id: withdrawalId });
}

async function adminRejectWithdrawal(withdrawalId) {
    const client = await getSupabase();
    return client.rpc("admin_reject_withdrawal", { p_withdrawal_id: withdrawalId });
}

async function getPendingDeposits() {
    const client = await getSupabase();
    const { data, error } = await client.from("deposits").select("*").eq("status", "pending").order("created_at", { ascending: true });
    return { deposits: data || [], error };
}

async function getPendingWithdrawals() {
    const client = await getSupabase();
    const { data, error } = await client.from("withdrawals").select("*").eq("status", "pending").order("created_at", { ascending: true });
    return { withdrawals: data || [], error };
}

async function getAllUsers() {
    const client = await getSupabase();
    const { data, error } = await client.from("profiles").select("*").order("created_at", { ascending: false });
    return { users: data || [], error };
}

async function getAllDeposits() {
    const client = await getSupabase();
    const { data, error } = await client.from("deposits").select("*").order("created_at", { ascending: false });
    return { deposits: data || [], error };
}

async function getAllWithdrawals() {
    const client = await getSupabase();
    const { data, error } = await client.from("withdrawals").select("*").order("created_at", { ascending: false });
    return { withdrawals: data || [], error };
}
