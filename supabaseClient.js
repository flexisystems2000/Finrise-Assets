/* =========================================================
   FINRISE ASSET
   SUPABASE CLIENT & DATA ACCESS LAYER

   Database is the source of truth for authentication and
   all financial information.

   IMPORTANT AUTH NOTES:
   - Supabase Auth persists sessions in the browser.
   - getSession() reads the locally persisted session.
   - getCurrentUser() validates the user against Supabase Auth.
   - A locally stored session must NOT automatically be
     considered valid.
========================================================= */

const SUPABASE_URL = "https://jdcqczgrgnlqfzfgnsog.supabase.co";
const SUPABASE_KEY = "sb_publishable_C1cHus8zHeSRzWEnQn0kiA_c4m45QH9";

let supabaseClient = null;
let supabaseLoadPromise = null;

/* =========================================================
   LOAD SUPABASE LIBRARY
========================================================= */

function loadSupabaseLibrary() {
    if (window.supabase) {
        return Promise.resolve();
    }

    if (supabaseLoadPromise) {
        return supabaseLoadPromise;
    }

    supabaseLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

        script.async = true;

        script.onload = () => {
            resolve();
        };

        script.onerror = () => {
            supabaseLoadPromise = null;
            reject(
                new Error("Unable to load Supabase.")
            );
        };

        document.head.appendChild(script);
    });

    return supabaseLoadPromise;
}

/* =========================================================
   INITIALIZE SUPABASE
========================================================= */

async function initSupabase() {
    if (supabaseClient) {
        return supabaseClient;
    }

    await loadSupabaseLibrary();

    if (!window.supabase) {
        throw new Error(
            "Supabase library is unavailable."
        );
    }

    supabaseClient =
        window.supabase.createClient(
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

/* =========================================================
   GET SUPABASE CLIENT
========================================================= */

async function getSupabase() {
    return initSupabase();
}

/* =========================================================
   GET CURRENT SESSION
       
   NOTE:
   This reads the persisted Supabase session.

   It does NOT by itself prove that the Auth user still
   exists. For protected operations use getCurrentUser()
   or validateAuthSession().
========================================================= */

async function getSession() {
    const client = await getSupabase();

    const {
        data,
        error
    } = await client.auth.getSession();

    return {
        session: data?.session || null,
        error
    };
}

/* =========================================================
   GET CURRENT USER
       
   IMPORTANT:
   auth.getUser() validates the authenticated user against
   the Supabase Auth server.

   This is safer than trusting getSession() alone.
========================================================= */

async function getCurrentUser() {
    const client = await getSupabase();

    try {
        const {
            data,
            error
        } = await client.auth.getUser();

        return {
            user: data?.user || null,
            error: error || null
        };

    } catch (error) {
        console.error(
            "Unable to retrieve authenticated user:",
            error
        );

        return {
            user: null,
            error
        };
    }
}

/* =========================================================
   VALIDATE AUTH SESSION
       
   This is the main authentication safety helper.

   It checks:

   1. Does a persisted session exist?
   2. Does the authenticated user still exist?
   3. If not, clear the stale browser session.

   This prevents the old:

       Login
          ↓
       Dashboard
          ↓
       Login
          ↓
       Dashboard
          ↓
       LOOP

========================================================= */

async function validateAuthSession(options = {}) {
    const {
        clearInvalidSession = true
    } = options;

    const client = await getSupabase();

    try {
        const {
            session,
            error: sessionError
        } = await getSession();

        /* ---------------------------------------------
           No persisted session
        --------------------------------------------- */

        if (!session) {
            return {
                authenticated: false,
                user: null,
                session: null,
                error: sessionError || null
            };
        }

        /* ---------------------------------------------
           Session exists locally.

           Now validate the user with Supabase Auth.
        --------------------------------------------- */

        const {
            user,
            error: userError
        } = await getCurrentUser();

        if (user && !userError) {
            return {
                authenticated: true,
                user,
                session,
                error: null
            };
        }

        /* ---------------------------------------------
           Session exists but user is no longer valid.

           Example:

           User existed yesterday
           ↓
           Browser saved session
           ↓
           Admin deletes Auth user
           ↓
           Browser still has old session
           ↓
           getUser() fails

           Clear it here.
        --------------------------------------------- */

        if (clearInvalidSession) {
            try {
                await client.auth.signOut();
            } catch (clearError) {
                console.warn(
                    "Unable to clear invalid authentication session:",
                    clearError
                );
            }
        }

        return {
            authenticated: false,
            user: null,
            session: null,
            error:
                userError ||
                new Error(
                    "Authentication session is no longer valid."
                )
        };

    } catch (error) {
        console.error(
            "Authentication validation error:",
            error
        );

        if (clearInvalidSession) {
            try {
                await client.auth.signOut();
            } catch (clearError) {
                console.warn(
                    "Unable to clear authentication session:",
                    clearError
                );
            }
        }

        return {
            authenticated: false,
            user: null,
            session: null,
            error
        };
    }
}

/* =========================================================
   SIGN OUT
========================================================= */

async function signOut() {
    const client = await getSupabase();

    try {
        const {
            error
        } = await client.auth.signOut();

        return {
            error: error || null
        };

    } catch (error) {
        console.error(
            "Sign out error:",
            error
        );

        return {
            error
        };
    }
}

/* =========================================================
   CURRENT PROFILE
========================================================= */

async function getCurrentProfile() {
    const client = await getSupabase();

    const {
        user,
        error: authError
    } = await getCurrentUser();

    if (authError || !user) {
        return {
            profile: null,
            error:
                authError ||
                new Error(
                    "No authenticated user."
                )
        };
    }

    const {
        data,
        error
    } = await client
        .from("profiles")
        .select(
            "id,full_name,username,phone,country,referral_code,created_at"
        )
        .eq("id", user.id)
        .maybeSingle();

    return {
        profile: data,
        error
    };
}

/* =========================================================
   UPDATE PROFILE
========================================================= */

async function updateProfile(updates) {
    const client = await getSupabase();

    const {
        user,
        error: authError
    } = await getCurrentUser();

    if (authError || !user) {
        return {
            data: null,
            error:
                authError ||
                new Error(
                    "No authenticated user."
                )
        };
    }

    const safeUpdates = {};

    [
        "full_name",
        "username",
        "phone",
        "country"
    ].forEach(key => {
        if (
            Object.prototype.hasOwnProperty.call(
                updates,
                key
            )
        ) {
            safeUpdates[key] = updates[key];
        }
    });

    const {
        data,
        error
    } = await client
        .from("profiles")
        .update(safeUpdates)
        .eq("id", user.id)
        .select(
            "id,full_name,username,phone,country,referral_code,created_at"
        )
        .single();

    return {
        data,
        error
    };
}

/* =========================================================
   CURRENT WALLET
========================================================= */

async function getCurrentWallet() {
    const client = await getSupabase();

    const {
        user,
        error: authError
    } = await getCurrentUser();

    if (authError || !user) {
        return {
            wallet: null,
            error:
                authError ||
                new Error(
                    "No authenticated user."
                )
        };
    }

    const {
        data,
        error
    } = await client
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

    return {
        wallet: data,
        error
    };
}

/* =========================================================
   USER DEPOSITS
========================================================= */

async function getUserDeposits() {
    const client = await getSupabase();

    const {
        user,
        error: authError
    } = await getCurrentUser();

    if (authError || !user) {
        return {
            deposits: [],
            error:
                authError ||
                new Error(
                    "No authenticated user."
                )
        };
    }

    const {
        data,
        error
    } = await client
        .from("deposits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
            ascending: false
        });

    return {
        deposits: data || [],
        error
    };
}

/* =========================================================
   SUBMIT DEPOSIT
========================================================= */

async function submitDeposit(depositData) {
    const client = await getSupabase();

    const {
        user,
        error: authError
    } = await getCurrentUser();

    if (authError || !user) {
        return {
            data: null,
            error:
                authError ||
                new Error(
                    "No authenticated user."
                )
        };
    }

    const payload = {
        user_id: user.id,
        amount: Number(depositData.amount),
        currency:
            depositData.currency || "NGN",
        method:
            depositData.method || "crypto",
        network:
            depositData.network || null,
        reference:
            String(
                depositData.reference || ""
            ).trim() || null,
        proof_url:
            depositData.proof_url || null,
        status: "pending"
    };

    const {
        data,
        error
    } = await client
        .from("deposits")
        .insert(payload)
        .select("*")
        .single();

    return {
        data,
        error
    };
}

/* =========================================================
   USER WITHDRAWALS
========================================================= */

async function getUserWithdrawals() {
    const client = await getSupabase();

    const {
        user,
        error: authError
    } = await getCurrentUser();

    if (authError || !user) {
        return {
            withdrawals: [],
            error:
                authError ||
                new Error(
                    "No authenticated user."
                )
        };
    }

    const {
        data,
        error
    } = await client
        .from("withdrawals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
            ascending: false
        });

    return {
        withdrawals: data || [],
        error
    };
}

/* =========================================================
   CREATE WITHDRAWAL REQUEST
========================================================= */

async function createWithdrawalRequest(params) {
    const client = await getSupabase();

    const {
        user,
        error: authError
    } = await getCurrentUser();

    if (authError || !user) {
        return {
            data: null,
            error:
                authError ||
                new Error(
                    "No authenticated user."
                )
        };
    }

    const {
        data,
        error
    } = await client.rpc(
        "create_withdrawal",
        {
            p_amount:
                Number(params.amount),

            p_currency:
                params.currency || "NGN",

            p_method:
                params.method || "crypto",

            p_destination:
                params.destination,

            p_network:
                params.network || null,

            p_fee: 5
        }
    );

    return {
        data,
        error
    };
}

/* =========================================================
   INVESTMENT PLANS
========================================================= */

async function getInvestmentPlans() {
    const client = await getSupabase();

    const {
        data,
        error
    } = await client
        .from("investment_plans")
        .select("*")
        .eq("active", true)
        .order("created_at", {
            ascending: true
        });

    return {
        plans: data || [],
        error
    };
}

/* =========================================================
   USER INVESTMENTS
========================================================= */

async function getUserInvestments() {
    const client = await getSupabase();

    const {
        user,
        error: authError
    } = await getCurrentUser();

    if (authError || !user) {
        return {
            investments: [],
            error:
                authError ||
                new Error(
                    "No authenticated user."
                )
        };
    }

    const {
        data,
        error
    } = await client
        .from("investments")
        .select(
            "*, investment_plans(name,roi_percentage,duration_hours)"
        )
        .eq("user_id", user.id)
        .order("started_at", {
            ascending: false
        });

    return {
        investments: data || [],
        error
    };
}

/* =========================================================
   CREATE INVESTMENT REQUEST
========================================================= */

async function createInvestmentRequest(params) {
    const client = await getSupabase();

    const {
        user,
        error: authError
    } = await getCurrentUser();

    if (authError || !user) {
        return {
            data: null,
            error:
                authError ||
                new Error(
                    "No authenticated user."
                )
        };
    }

    const {
        data,
        error
    } = await client.rpc(
        "create_investment",
        {
            p_plan_id:
                params.plan_id,

            p_amount:
                Number(params.amount)
        }
    );

    return {
        data,
        error
    };
}

/* =========================================================
   USER LEDGER
========================================================= */

async function getUserLedger() {
    const client = await getSupabase();

    const {
        user,
        error: authError
    } = await getCurrentUser();

    if (authError || !user) {
        return {
            ledger: [],
            error:
                authError ||
                new Error(
                    "No authenticated user."
                )
        };
    }

    const {
        data,
        error
    } = await client
        .from("ledger_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
            ascending: false
        });

    return {
        ledger: data || [],
        error
    };
}

/* =========================================================
   USER REFERRALS
========================================================= */

async function getUserReferrals() {
    const client = await getSupabase();

    const {
        user,
        error: authError
    } = await getCurrentUser();

    if (authError || !user) {
        return {
            referrals: [],
            error:
                authError ||
                new Error(
                    "No authenticated user."
                )
        };
    }

    const {
        data,
        error
    } = await client
        .from("referrals")
        .select(
            "id,referrer_id,referred_user_id,referral_code,created_at"
        )
        .eq("referrer_id", user.id)
        .order("created_at", {
            ascending: false
        });

    return {
        referrals: data || [],
        error
    };
}

/* =========================================================
   USER REFERRAL REWARDS
========================================================= */

async function getUserReferralRewards() {
    const client = await getSupabase();

    const {
        user,
        error: authError
    } = await getCurrentUser();

    if (authError || !user) {
        return {
            rewards: [],
            error:
                authError ||
                new Error(
                    "No authenticated user."
                )
        };
    }

    const {
        data,
        error
    } = await client
        .from("referral_rewards")
        .select(
            "id,user_id,source_user_id,amount,status,created_at,paid_at"
        )
        .eq("user_id", user.id)
        .order("created_at", {
            ascending: false
        });

    return {
        rewards: data || [],
        error
    };
}

/* =========================================================
   ADMIN — APPROVE DEPOSIT
========================================================= */

async function adminApproveDeposit(depositId) {
    const client = await getSupabase();

    return client.rpc(
        "admin_approve_deposit",
        {
            p_deposit_id: depositId
        }
    );
}

/* =========================================================
   ADMIN — REJECT DEPOSIT
========================================================= */

async function adminRejectDeposit(depositId) {
    const client = await getSupabase();

    return client.rpc(
        "admin_reject_deposit",
        {
            p_deposit_id: depositId
        }
    );
}

/* =========================================================
   ADMIN — COMPLETE WITHDRAWAL
========================================================= */

async function adminCompleteWithdrawal(withdrawalId) {
    const client = await getSupabase();

    return client.rpc(
        "admin_complete_withdrawal",
        {
            p_withdrawal_id:
                withdrawalId
        }
    );
}

/* =========================================================
   ADMIN — REJECT WITHDRAWAL
========================================================= */

async function adminRejectWithdrawal(withdrawalId) {
    const client = await getSupabase();

    return client.rpc(
        "admin_reject_withdrawal",
        {
            p_withdrawal_id:
                withdrawalId
        }
    );
}

/* =========================================================
   ADMIN — PENDING DEPOSITS
========================================================= */

async function getPendingDeposits() {
    const client = await getSupabase();

    const {
        data,
        error
    } = await client
        .from("deposits")
        .select("*")
        .eq("status", "pending")
        .order("created_at", {
            ascending: true
        });

    return {
        deposits: data || [],
        error
    };
}

/* =========================================================
   ADMIN — PENDING WITHDRAWALS
========================================================= */

async function getPendingWithdrawals() {
    const client = await getSupabase();

    const {
        data,
        error
    } = await client
        .from("withdrawals")
        .select("*")
        .eq("status", "pending")
        .order("created_at", {
            ascending: true
        });

    return {
        withdrawals: data || [],
        error
    };
}

/* =========================================================
   ADMIN — ALL USERS
========================================================= */

async function getAllUsers() {
    const client = await getSupabase();

    const {
        data,
        error
    } = await client
        .from("profiles")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    return {
        users: data || [],
        error
    };
}

/* =========================================================
   ADMIN — ALL DEPOSITS
========================================================= */

async function getAllDeposits() {
    const client = await getSupabase();

    const {
        data,
        error
    } = await client
        .from("deposits")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    return {
        deposits: data || [],
        error
    };
}

/* =========================================================
   ADMIN — ALL WITHDRAWALS
========================================================= */

async function getAllWithdrawals() {
    const client = await getSupabase();

    const {
        data,
        error
    } = await client
        .from("withdrawals")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    return {
        withdrawals: data || [],
        error
    };
}
