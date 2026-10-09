/* =========================================================
   FINRISE ASSET
   SUPABASE PROFILE
   Database/Auth is the source of truth.
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    const section = document.getElementById("profile");
    if (!section) return;

    const $ = id => document.getElementById(id);

    const form = $("profileForm");
    const edit = $("editProfileBtn");
    const save = $("saveProfileBtn");
    const cancel = $("cancelProfileBtn");
    const fullName = $("profileFullname");
    const email = $("profileEmail");
    const phone = $("profilePhone");
    const country = $("profileCountry");
    const nameDisplay = $("profilePageName");
    const emailDisplay = $("profilePageEmail");
    const accountId = $("profileAccountId");
    const accountInfoId = $("accountInfoId");
    const memberSince = $("memberSince");
    const imageInput = $("profileImageInput");
    const profileImage = $("profilePageImage");

    let authUser = null;
    let currentProfile = {};

    function setEditable(enabled) {
        [fullName, phone, country].forEach(el => {
            if (el) el.disabled = !enabled;
        });

        if (save) save.style.display = enabled ? "inline-flex" : "none";
        if (cancel) cancel.style.display = enabled ? "inline-flex" : "none";
        if (edit) edit.style.display = enabled ? "none" : "inline-flex";
    }

    function getDisplayName() {
        return currentProfile.full_name ||
            authUser?.user_metadata?.full_name ||
            authUser?.email ||
            "User";
    }

    function render() {
        const displayName = getDisplayName();

        if (fullName) fullName.value = currentProfile.full_name || authUser?.user_metadata?.full_name || "";
        if (email) email.value = authUser?.email || "";
        if (phone) phone.value = currentProfile.phone || authUser?.user_metadata?.phone || "";
        if (country) country.value = currentProfile.country || authUser?.user_metadata?.country || "";

        if (nameDisplay) nameDisplay.textContent = displayName;
        if (emailDisplay) emailDisplay.textContent = authUser?.email || "";
        if (accountId) accountId.textContent = authUser?.id || "-";
        if (accountInfoId) accountInfoId.textContent = authUser?.id || "-";

        if (memberSince) {
            memberSince.textContent = currentProfile.created_at
                ? new Date(currentProfile.created_at).toLocaleDateString()
                : "-";
        }

        const metadataAvatar = authUser?.user_metadata?.avatar_url;
        if (profileImage) {
            if (metadataAvatar) {
                profileImage.onerror = () => {
                    profileImage.onerror = null;
                    profileImage.src = "https://i.pravatar.cc/150?img=12";
                };
                profileImage.src = metadataAvatar;
            } else {
                profileImage.onerror = null;
                profileImage.src = "https://i.pravatar.cc/150?img=12";
            }
        }
    }

    async function load() {
        const { user, error: userError } = await getCurrentUser();

        if (userError || !user) {
            window.location.href = "logIn_Page.html";
            return;
        }

        authUser = user;

        const { profile, error } = await getCurrentProfile();
        if (error) console.error("Profile load error:", error);

        currentProfile = profile || {};
        render();
        setEditable(false);
    }

    edit?.addEventListener("click", () => setEditable(true));
    cancel?.addEventListener("click", () => load());

    form?.addEventListener("submit", async event => {
        event.preventDefault();

        const oldText = save?.textContent;
        if (save) {
            save.disabled = true;
            save.textContent = "Saving...";
        }

        try {
            const result = await updateProfile({
                full_name: fullName?.value.trim() || "",
                phone: phone?.value.trim() || null,
                country: country?.value.trim() || null
            });

            if (result.error) throw result.error;

            currentProfile = result.data || currentProfile;

            const client = await getSupabase();
            const metadataResult = await client.auth.updateUser({
                data: {
                    full_name: currentProfile.full_name || "",
                    phone: currentProfile.phone || null,
                    country: currentProfile.country || null
                }
            });

            if (!metadataResult.error && metadataResult.data?.user) {
                authUser = metadataResult.data.user;
            }

            alert("Profile updated successfully.");
            await load();
        } catch (error) {
            console.error("Profile update failed:", error);
            alert(error.message || "Unable to update profile.");
        } finally {
            if (save) {
                save.disabled = false;
                save.textContent = oldText || "Save Changes";
            }
        }
    });

    imageInput?.addEventListener("change", async event => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!authUser?.id) {
            alert("Please sign in again before changing your profile picture.");
            event.target.value = "";
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            alert("Choose a JPG, PNG, WEBP, or GIF image.");
            event.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Please choose an image smaller than 5MB.");
            event.target.value = "";
            return;
        }

        const oldText = imageInput.parentElement?.title || "Change profile picture";
        try {
            const client = await getSupabase();
            const extensionByType = {
                "image/jpeg": "jpg",
                "image/png": "png",
                "image/webp": "webp",
                "image/gif": "gif"
            };
            const extension = extensionByType[file.type];
            const path = `${authUser.id}/avatar.${extension}`;

            const { error: uploadError } = await client.storage
                .from("finrise-avatars")
                .upload(path, file, {
                    upsert: true,
                    contentType: file.type,
                    cacheControl: "3600"
                });
            if (uploadError) throw uploadError;

            const { data: publicData } = client.storage.from("finrise-avatars").getPublicUrl(path);
            if (!publicData?.publicUrl) throw new Error("Unable to retrieve the uploaded profile picture URL.");
            const avatarUrl = `${publicData.publicUrl}?v=${Date.now()}`;

            const { data: updatedUser, error: updateError } = await client.auth.updateUser({
                data: { avatar_url: avatarUrl }
            });
            if (updateError) throw updateError;

            authUser = updatedUser?.user || authUser;
            if (profileImage) {
                profileImage.onerror = null;
                profileImage.src = avatarUrl;
            }
            document.dispatchEvent(new CustomEvent("finrise:avatar-updated", { detail: { avatarUrl } }));
            alert("Profile picture updated successfully.");
        } catch (error) {
            console.error("Profile image upload failed:", error);
            alert(error.message || "Unable to update profile picture.");
        } finally {
            event.target.value = "";
        }
    });

    try {
        await getSupabase();
        await load();
    } catch (error) {
        console.error("Profile initialization failed:", error);
    }
});
