/* =========================================================
   FINRISE ASSET
   SUPABASE REFERRALS / REWARDS
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const section = document.getElementById("referral");
    if (!section) return;

    const $ = id => document.getElementById(id);

    const balanceEl = $("referralBalance");
    const totalEl = $("totalReferrals");
    const activeEl = $("activeReferrals");
    const earningsEl = $("referralEarnings");
    const linkEl = $("referralLink");
    const codeEl = $("referralCode");
    const body = $("referralTableBody");
    const empty = $("emptyReferral");
    const count = $("referralCountLabel");

    const money = value => new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2
    }).format(Number(value) || 0);

    const escape = value => String(value ?? "").replace(
        /[&<>"']/g,
        c => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[c])
    );

    let referralLink = "";

    async function load() {
        const { user, error: userError } = await getCurrentUser();

        if (userError || !user) {
            window.location.href = "logIn_Page.html";
            return;
        }

        const [
            profileResult,
            referralsResult,
            rewardsResult
        ] = await Promise.all([
            getCurrentProfile(),
            getUserReferrals(),
            getUserReferralRewards()
        ]);

        if (profileResult.error) console.error("Profile:", profileResult.error);
        if (referralsResult.error) console.error("Referrals:", referralsResult.error);
        if (rewardsResult.error) console.error("Rewards:", rewardsResult.error);

        const profile = profileResult.profile || {};
        const referrals = referralsResult.referrals || [];
        const rewards = rewardsResult.rewards || [];

        const base = String(profile.username || user.id.slice(0, 8))
            .replace(/\s+/g, "")
            .toUpperCase();

        const codeFromDatabase = referrals.find(ref => ref.referral_code)?.referral_code;
        const code = codeFromDatabase || `FR-${base}`;

        referralLink =
            `${window.location.origin}/logIn_Page.html?ref=${encodeURIComponent(code)}`;

        const approvedRewards = rewards.filter(reward =>
            ["approved", "paid"].includes(String(reward.status || "").toLowerCase())
        );

        const earnings = approvedRewards.reduce(
            (sum, reward) => sum + Number(reward.amount || 0),
            0
        );

        const active = new Set(
            approvedRewards.map(reward => reward.source_user_id).filter(Boolean)
        ).size;

        if (balanceEl) balanceEl.textContent = money(earnings);
        if (earningsEl) earningsEl.textContent = money(earnings);
        if (totalEl) totalEl.textContent = String(referrals.length);
        if (activeEl) activeEl.textContent = String(active);
        if (codeEl) codeEl.textContent = code;
        if (linkEl) linkEl.value = referralLink;
        if (count) count.textContent = `${referrals.length} referral(s)`;

        if (!body || !empty) return;

        if (!referrals.length) {
            body.innerHTML = "";
            empty.style.display = "block";
            return;
        }

        empty.style.display = "none";

        body.innerHTML = referrals.map(ref => `
            <tr>
                <td>${escape(ref.referral_code || code)}</td>
                <td>${escape(ref.referred_user_id || "-")}</td>
                <td>${ref.created_at ? new Date(ref.created_at).toLocaleDateString() : "-"}</td>
            </tr>
        `).join("");
    }

    $("copyReferralBtn")?.addEventListener("click", async () => {
        if (!linkEl) return;

        try {
            await navigator.clipboard.writeText(linkEl.value || referralLink);
            alert("Referral link copied.");
        } catch {
            linkEl.focus();
            linkEl.select();
            document.execCommand("copy");
            alert("Referral link copied.");
        }
    });

    const shareTargets = {
        shareWhatsApp: url => `https://wa.me/?text=${encodeURIComponent(`Join Finrise Assets using my referral link: ${url}`)}`,
        shareTelegram: url => `https://t.me/share/url?url=${encodeURIComponent(url)}`,
        shareFacebook: url => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        shareTwitter: url => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`
    };

    Object.entries(shareTargets).forEach(([id, makeUrl]) => {
        $(id)?.addEventListener("click", () => {
            const url = linkEl?.value || referralLink || window.location.href;
            window.open(makeUrl(url), "_blank", "noopener,noreferrer");
        });
    });

    try {
        await getSupabase();
        await load();
    } catch (error) {
        console.error("Referral initialization failed:", error);
    }
});
