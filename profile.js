/* =========================================================
   FINRISE ASSET
   SUPABASE PROFILE
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const section = document.getElementById("profile");
    if (!section) return;

    const form = document.getElementById("profileForm");
    const edit = document.getElementById("editProfileBtn");
    const save = document.getElementById("saveProfileBtn");
    const cancel = document.getElementById("cancelProfileBtn");
    const fullName = document.getElementById("profileFullname");
    const email = document.getElementById("profileEmail");
    const phone = document.getElementById("profilePhone");
    const country = document.getElementById("profileCountry");
    const nameDisplay = document.getElementById("profilePageName");
    const emailDisplay = document.getElementById("profilePageEmail");
    const accountId = document.getElementById("profileAccountId");
    const accountInfoId = document.getElementById("accountInfoId");
    const memberSince = document.getElementById("memberSince");
    const imageInput = document.getElementById("profileImageInput");
    const profileImage = document.getElementById("profilePageImage");

    let original = {};

    function setEditable(enabled) {
        [fullName, phone, country].forEach(el => { if (el) el.disabled = !enabled; });
        if (save) save.style.display = enabled ? "inline-flex" : "none";
        if (cancel) cancel.style.display = enabled ? "inline-flex" : "none";
    }

    function render(profile, user) {
        original = { ...profile };
        if (fullName) fullName.value = profile?.full_name || user.user_metadata?.full_name || "";
        if (email) email.value = user.email || "";
        if (phone) phone.value = profile?.phone || user.user_metadata?.phone || "";
        if (country) country.value = profile?.country || user.user_metadata?.country || "";
        if (nameDisplay) nameDisplay.textContent = profile?.full_name || user.email || "User";
        if (emailDisplay) emailDisplay.textContent = user.email || "";
        if (accountId) accountId.textContent = user.id;
        if (accountInfoId) accountInfoId.textContent = user.id;
        if (memberSince) memberSince.textContent = profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "-";
    }

    async function load() {
        const { user, error: userError } = await getCurrentUser();
        if (userError || !user) return;
        const { profile, error } = await getCurrentProfile();
        if (error) console.error("Profile load error:", error);
        render(profile || {}, user);
        setEditable(false);

        const savedImage = localStorage.getItem("finriseProfileImage");
        if (savedImage && profileImage) profileImage.src = savedImage;
    }

    edit?.addEventListener("click", () => setEditable(true));
    cancel?.addEventListener("click", () => load());

    form?.addEventListener("submit", async event => {
        event.preventDefault();
        const oldText = save?.textContent;
        if (save) { save.disabled = true; save.textContent = "Saving..."; }
        try {
            const { error } = await updateProfile({
                full_name: fullName?.value.trim(),
                phone: phone?.value.trim() || null,
                country: country?.value || null
            });
            if (error) throw error;
            alert("Profile updated successfully.");
            await load();
        } catch (error) {
            console.error(error);
            alert(error.message || "Unable to update profile.");
        } finally {
            if (save) { save.disabled = false; save.textContent = oldText || "Save Changes"; }
        }
    });

    imageInput?.addEventListener("change", event => {
        const file = event.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (profileImage) profileImage.src = reader.result;
            try { localStorage.setItem("finriseProfileImage", reader.result); } catch (error) { console.warn(error); }
        };
        reader.readAsDataURL(file);
    });

    try {
        await getSupabase();
        await load();
    } catch (error) {
        console.error(error);
    }
});
