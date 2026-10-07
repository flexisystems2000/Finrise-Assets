/* =========================================================
   FINRISE ASSET
   SUPABASE REFERRALS / REWARDS
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const section = document.getElementById("referral");
    if (!section) return;

    const balanceEl = document.getElementById("referralBalance");
    const totalEl = document.getElementById("totalReferrals");
    const activeEl = document.getElementById("activeReferrals");
    const earningsEl = document.getElementById("referralEarnings");
    const linkEl = document.getElementById("referralLink");
    const codeEl = document.getElementById("referralCode");
    const body = document.getElementById("referralTableBody");
    const empty = document.getElementById("emptyReferral");
    const count = document.getElementById("referralCountLabel");

    const money = value => new Intl.NumberFormat("en-US", { style: "currency", currency: "NGN", minimumFractionDigits: 2 }).format(Number(value) || 0);
    const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));

    async function load() {
        const { user } = await getCurrentUser();
        if (!user) return;

        const [{ profile }, { referrals }, { rewards }] = await Promise.all([
            getCurrentProfile(), getUserReferrals(), getUserReferralRewards()
        ]);

        const code = `FR-${String(profile?.username || user.id.slice(0, 8)).toUpperCase()}`;
        const link = `${window.location.origin}/logIn_Page.html?ref=${encodeURIComponent(code)}`;
        const earnings = (rewards || []).filter(r => ["approved", "paid"].includes(r.status)).reduce((s, r) => s + Number(r.amount || 0), 0);
        const active = (rewards || []).filter(r => ["approved", "paid"].includes(r.status)).length;

        if (balanceEl) balanceEl.textContent = money(earnings);
        if (earningsEl) earningsEl.textContent = money(earnings);
        if (totalEl) totalEl.textContent = String(referrals?.length || 0);
        if (activeEl) activeEl.textContent = String(active);
        if (codeEl) codeEl.textContent = code;
        if (linkEl) linkEl.value = link;
        if (count) count.textContent = `${referrals?.length || 0} referral(s)`;

        if (!body || !empty) return;
        if (!referrals?.length) {
            body.innerHTML = "";
            empty.style.display = "block";
            return;
        }
        empty.style.display = "none";
        body.innerHTML = referrals.map(ref => `
            <tr>
                <td>${escape(ref.referral_code || "-")}</td>
                <td>${escape(ref.referred_user_id || "-")}</td>
                <td>${new Date(ref.created_at).toLocaleDateString()}</td>
            </tr>
        `).join("");
    }

    document.getElementById("copyReferralBtn")?.addEventListener("click", async () => {
        if (!linkEl) return;
        try { await navigator.clipboard.writeText(linkEl.value); alert("Referral link copied."); }
        catch { linkEl.select(); document.execCommand("copy"); }
    });

    ["shareWhatsApp", "shareTelegram", "shareFacebook", "shareTwitter"].forEach(id => {
        document.getElementById(id)?.addEventListener("click", () => {
            const url = encodeURIComponent(linkEl?.value || window.location.href);
            const targets = {
                shareWhatsApp: `https://wa.me/?text=${url}`,
                shareTelegram: `https://t.me/share/url?url=${url}`,
                shareFacebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
                shareTwitter: `https://twitter.com/intent/tweet?url=${url}`
            };
            window.open(targets[id], "_blank", "noopener,noreferrer");
        });
    });

    try { await getSupabase(); await load(); } catch (error) { console.error(error); }
});
