/* =========================================================
   FINRISE ASSET
   INVESTMENT PAGE
   Supabase investment plans/investments are the source of truth.
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    /* -----------------------------
       Existing hero slider
    ----------------------------- */
    const slides2 = document.querySelectorAll(".slide2");
    const dots2 = document.querySelectorAll(".dot2");
    const next2 = document.querySelector(".next2");
    const prev2 = document.querySelector(".prev2");

    let current = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides2.length) return;

        current = ((index % slides2.length) + slides2.length) % slides2.length;

        slides2.forEach(slide => slide.classList.remove("active"));
        dots2.forEach(dot => dot.classList.remove("active"));

        slides2[current]?.classList.add("active");
        dots2[current]?.classList.add("active");
    }

    function nextSlide() {
        showSlide(current + 1);
    }

    function prevSlide() {
        showSlide(current - 1);
    }

    function startTimer() {
        if (slides2.length > 1) {
            clearInterval(timer);
            timer = setInterval(nextSlide, 5000);
        }
    }

    next2?.addEventListener("click", () => {
        nextSlide();
        startTimer();
    });

    prev2?.addEventListener("click", () => {
        prevSlide();
        startTimer();
    });

    dots2.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            showSlide(index);
            startTimer();
        });
    });

    showSlide(0);
    startTimer();

    /* -----------------------------
       Existing testimonial slider
    ----------------------------- */
    const slides = document.querySelector(".slides");
    const cards = document.querySelectorAll(".testimonial-card");
    const dots = document.querySelectorAll(".dot");
    const next = document.querySelector(".next");
    const prev = document.querySelector(".prev");

    let testimonialIndex = 0;

    function updateSlider() {
        if (!slides || !cards.length) return;

        testimonialIndex =
            ((testimonialIndex % cards.length) + cards.length) % cards.length;

        slides.style.transform =
            `translateX(-${testimonialIndex * 100}%)`;

        dots.forEach(dot => dot.classList.remove("active"));
        dots[testimonialIndex]?.classList.add("active");
    }

    next?.addEventListener("click", () => {
        testimonialIndex++;
        updateSlider();
    });

    prev?.addEventListener("click", () => {
        testimonialIndex--;
        updateSlider();
    });

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            testimonialIndex = index;
            updateSlider();
        });
    });

    if (cards.length > 1) {
        setInterval(() => {
            testimonialIndex++;
            updateSlider();
        }, 5000);
    }

    updateSlider();

    /* -----------------------------
       Existing FAQ behavior
    ----------------------------- */
    document.querySelectorAll(".faq-box").forEach(box => {
        const question = box.querySelector(".faq-question");
        if (!question) return;

        question.addEventListener("click", () => {
            document.querySelectorAll(".faq-box").forEach(other => {
                if (other !== box) other.classList.remove("active");
            });
            box.classList.toggle("active");
        });
    });

    document.querySelectorAll(".faq-item").forEach(item => {
        const question = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");
        if (!question || !answer) return;

        question.addEventListener("click", () => {
            document.querySelectorAll(".faq-item").forEach(other => {
                if (other === item) return;

                other.classList.remove("active");
                const otherAnswer = other.querySelector(".faq-answer");
                if (otherAnswer) otherAnswer.style.maxHeight = null;
            });

            item.classList.toggle("active");
            answer.style.maxHeight = item.classList.contains("active")
                ? `${answer.scrollHeight}px`
                : null;
        });
    });

    document.querySelectorAll(".faq-item.active .faq-answer").forEach(answer => {
        answer.style.maxHeight = `${answer.scrollHeight}px`;
    });

    /* -----------------------------
       Supabase investment section
       This is deliberately optional so
       the existing design is preserved.
    ----------------------------- */
    const planContainer =
        document.getElementById("investmentPlans") ||
        document.getElementById("plansContainer") ||
        document.querySelector("[data-investment-plans]");

    const investmentContainer =
        document.getElementById("userInvestments") ||
        document.getElementById("investmentHistory") ||
        document.querySelector("[data-user-investments]");

    const status = document.getElementById("investmentStatus");

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

    function setStatus(message, isError = false) {
        if (!status) return;
        status.textContent = message;
        status.classList.toggle("error", isError);
        status.classList.toggle("success", !isError);
    }

    function getPlanAmount(plan, card) {
        const input =
            card?.querySelector("[data-invest-amount]") ||
            card?.querySelector("input[type='number']");

        if (input) {
            const amount = Number(input.value);
            if (Number.isFinite(amount) && amount > 0) return amount;
        }

        const min =
            Number(plan.min_amount ?? plan.minimum_amount ?? plan.minimum ?? 0);

        return min > 0 ? min : 0;
    }

    async function loadInvestments() {
        if (!planContainer && !investmentContainer) return;

        const { user, error: userError } = await getCurrentUser();

        if (userError || !user) {
            if (planContainer) {
                planContainer.innerHTML =
                    '<p>Please login to view investment plans.</p>';
            }
            return;
        }

        const [plansResult, investmentsResult] = await Promise.all([
            getInvestmentPlans(),
            getUserInvestments()
        ]);

        if (plansResult.error) {
            console.error("Investment plans:", plansResult.error);
            setStatus(plansResult.error.message || "Unable to load investment plans.", true);
        }

        if (investmentsResult.error) {
            console.error("Investments:", investmentsResult.error);
        }

        const plans = plansResult.plans || [];
        const investments = investmentsResult.investments || [];

        if (planContainer) {
            if (!plans.length) {
                planContainer.innerHTML =
                    '<div class="investment-empty"><p>No active investment plans are available at the moment.</p></div>';
            } else {
                planContainer.innerHTML = plans.map(plan => {
                    const name = plan.name || "Investment Plan";
                    const roi = Number(plan.roi_percentage ?? plan.roi ?? 0);
                    const duration = plan.duration_hours ?? plan.duration ?? "-";
                    const min = plan.min_amount ?? plan.minimum_amount ?? plan.minimum ?? 0;

                    return `
                        <div class="investment-plan-card" data-plan-id="${escape(plan.id)}">
                            <h3>${escape(name)}</h3>
                            <p>ROI: ${escape(roi)}%</p>
                            <p>Duration: ${escape(duration)} hours</p>
                            <p>Minimum: ${money(min)}</p>
                            <input type="number"
                                   min="${Number(min) || 0}"
                                   step="0.01"
                                   placeholder="Amount"
                                   data-invest-amount>
                            <button type="button" data-invest-plan="${escape(plan.id)}">
                                Invest Now
                            </button>
                        </div>
                    `;
                }).join("");
            }
        }

        if (investmentContainer) {
            if (!investments.length) {
                investmentContainer.innerHTML =
                    '<p class="investment-empty">You have no investments yet.</p>';
            } else {
                investmentContainer.innerHTML = investments.map(item => {
                    const planName =
                        item.investment_plans?.name ||
                        item.plan_name ||
                        "Investment";

                    return `
                        <div class="investment-history-item">
                            <strong>${escape(planName)}</strong>
                            <span>${money(item.amount)}</span>
                            <small>${escape(item.status || "active")}</small>
                        </div>
                    `;
                }).join("");
            }
        }

        if (planContainer) {
            planContainer.querySelectorAll("[data-invest-plan]").forEach(button => {
                button.addEventListener("click", async () => {
                    const planId = button.dataset.investPlan;
                    const card = button.closest("[data-plan-id]");
                    const plan = plans.find(item => String(item.id) === String(planId));

                    if (!plan) {
                        alert("Investment plan could not be found.");
                        return;
                    }

                    const amount = getPlanAmount(plan, card);
                    if (!amount || amount <= 0) {
                        alert("Enter a valid investment amount.");
                        return;
                    }

                    const minimum =
                        Number(plan.min_amount ?? plan.minimum_amount ?? plan.minimum ?? 0);

                    if (minimum > 0 && amount < minimum) {
                        alert(`The minimum investment amount is ${money(minimum)}.`);
                        return;
                    }

                    if (!confirm(`Invest ${money(amount)} in ${plan.name || "this plan"}?`)) {
                        return;
                    }

                    button.disabled = true;
                    const oldText = button.textContent;
                    button.textContent = "Processing...";

                    try {
                        const result = await createInvestmentRequest({
                            plan_id: planId,
                            amount
                        });

                        if (result.error) throw result.error;

                        alert("Investment request created successfully.");
                        setStatus("Investment created successfully.");
                        await loadInvestments();
                    } catch (error) {
                        console.error("Investment creation failed:", error);
                        alert(error.message || "Unable to create investment.");
                    } finally {
                        button.disabled = false;
                        button.textContent = oldText;
                    }
                });
            });
        }
    }

    try {
        await getSupabase();
        await loadInvestments();
    } catch (error) {
        console.error("Investment initialization failed:", error);
    }
});
