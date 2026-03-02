// ---------- DATA & STATE ----------
const BILLING = {
    MONTHLY: "monthly",
    YEARLY: "yearly",
  };
  
  const PLANS = {
    arcade: { label: "Arcade", monthly: 9, yearly: 90 },
    advanced: { label: "Advanced", monthly: 12, yearly: 120 },
    pro: { label: "Pro", monthly: 15, yearly: 150 },
  };
  
  const ADDONS = {
    "online-service": {
      label: "Online service",
      description: "Access to multiplayer games",
      monthly: 1,
      yearly: 10,
    },
    "larger-storage": {
      label: "Larger storage",
      description: "Extra 1TB of cloud save",
      monthly: 2,
      yearly: 20,
    },
    "custom-profile": {
      label: "Customizable profile",
      description: "Custom theme on your profile",
      monthly: 2,
      yearly: 20,
    },
  };
  
  const TOTAL_STEPS = 4;
  
  const formState = {
    currentStep: 1,
    billing: BILLING.MONTHLY,
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
    },
    planId: "arcade",
    addons: new Set(),
    payment: {
      cardName: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
    },
  };
  
  // ---------- DOM LOOKUPS ----------
  const bodyEl = document.body;
  const stepSections = Array.from(document.querySelectorAll(".step"));
  const stepIndicators = Array.from(document.querySelectorAll(".step-indicator"));
  
  const backBtn = document.getElementById("back-btn");
  const nextBtn = document.getElementById("next-btn");
  const confirmBtn = document.getElementById("confirm-btn");
  
  const fullNameInput = document.getElementById("full-name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  
  const planInputs = Array.from(document.querySelectorAll(".plan-input"));
  const billingToggleBtn = document.getElementById("billing-toggle");
  const billingLabels = Array.from(document.querySelectorAll(".billing-label"));
  
  const addonInputs = Array.from(document.querySelectorAll(".addon-input"));
  
  const summaryPlanNameEl = document.getElementById("summary-plan-name");
  const summaryPlanPriceEl = document.getElementById("summary-plan-price");
  const summaryAddonsEl = document.getElementById("summary-addons");
  const summaryTotalLabelEl = document.getElementById("summary-total-label");
  const summaryTotalPriceEl = document.getElementById("summary-total-price");
  const changePlanBtn = document.getElementById("change-plan-btn");
  
  const themeToggleBtn = document.getElementById("theme-toggle");
  const progressBarEl = document.getElementById("step-progress-bar");
  const progressLabelEl = document.getElementById("step-progress-label");
  
  const cardNameInput = document.getElementById("card-name");
  const cardNumberInput = document.getElementById("card-number");
  const cardExpiryInput = document.getElementById("card-expiry");
  const cardCvcInput = document.getElementById("card-cvc");
  
  // ---------- HELPERS ----------
  function formatPrice(value, billing) {
    const suffix = billing === BILLING.MONTHLY ? "/mo" : "/yr";
    return `$${value}${suffix}`;
  }
  
  function getPlanPrice(planId, billing) {
    const plan = PLANS[planId];
    return billing === BILLING.MONTHLY ? plan.monthly : plan.yearly;
  }
  
  function getAddonPrice(addonId, billing) {
    const addon = ADDONS[addonId];
    return billing === BILLING.MONTHLY ? addon.monthly : addon.yearly;
  }
  
  function getErrorElement(id) {
    return document.querySelector(`[data-error-for="${id}"]`);
  }
  
  function persistState() {
    try {
      const serializable = {
        billing: formState.billing,
        personalInfo: formState.personalInfo,
        planId: formState.planId,
        addons: Array.from(formState.addons),
        payment: formState.payment,
      };
      window.localStorage.setItem("msf-form", JSON.stringify(serializable));
    } catch {
      // ignore storage errors
    }
  }
  
  function loadPersistedState() {
    try {
      const raw = window.localStorage.getItem("msf-form");
      if (!raw) return;
      const saved = JSON.parse(raw);
  
      if (saved.billing && (saved.billing === BILLING.MONTHLY || saved.billing === BILLING.YEARLY)) {
        formState.billing = saved.billing;
      }
  
      if (saved.personalInfo) {
        formState.personalInfo = {
          ...formState.personalInfo,
          ...saved.personalInfo,
        };
        if (fullNameInput) fullNameInput.value = formState.personalInfo.fullName || "";
        if (emailInput) emailInput.value = formState.personalInfo.email || "";
        if (phoneInput) phoneInput.value = formState.personalInfo.phone || "";
      }
  
      if (saved.planId && PLANS[saved.planId]) {
        formState.planId = saved.planId;
        planInputs.forEach((input) => {
          input.checked = input.dataset.planId === formState.planId;
        });
      }
  
      if (Array.isArray(saved.addons)) {
        formState.addons = new Set(saved.addons.filter((id) => ADDONS[id]));
        addonInputs.forEach((input) => {
          input.checked = formState.addons.has(input.dataset.addonId);
        });
      }
  
      if (saved.payment) {
        formState.payment = {
          ...formState.payment,
          ...saved.payment,
        };
        if (cardNameInput) cardNameInput.value = formState.payment.cardName || "";
        if (cardNumberInput) cardNumberInput.value = formState.payment.cardNumber || "";
        if (cardExpiryInput) cardExpiryInput.value = formState.payment.cardExpiry || "";
        if (cardCvcInput) cardCvcInput.value = formState.payment.cardCvc || "";
      }
    } catch {
      // ignore parse errors
    }
  }
  
  function updateProgress(stepNumber) {
    if (!progressBarEl || !progressLabelEl) return;
    const clamped = Math.min(stepNumber, TOTAL_STEPS);
    const percent =
      TOTAL_STEPS === 1 ? 100 : ((clamped - 1) / (TOTAL_STEPS - 1)) * 100;
    progressBarEl.style.width = `${percent}%`;
    progressLabelEl.textContent = `Step ${clamped} of ${TOTAL_STEPS}`;
  }
  
  function animateInvalidStep(stepNumber) {
    const section = stepSections.find(
      (sec) => Number(sec.dataset.step) === stepNumber
    );
    if (!section) return;
    section.classList.remove("step--invalid");
    // force reflow so the animation can replay
    // eslint-disable-next-line no-unused-expressions
    section.offsetWidth;
    section.classList.add("step--invalid");
  }
  
  // ---------- VALIDATION ----------
  function validateStep(step) {
    let isValid = true;
  
    // Clear previous errors
    [fullNameInput, emailInput, phoneInput].forEach((input) => {
      input.classList.remove("field-input--error");
    });
    getErrorElement("full-name").textContent = "";
    getErrorElement("email").textContent = "";
    getErrorElement("phone").textContent = "";
    const planError = getErrorElement("plan");
    if (planError) planError.textContent = "";
    [cardNameInput, cardNumberInput, cardExpiryInput, cardCvcInput].forEach((input) => {
      if (input) input.classList.remove("field-input--error");
    });
    ["card-name", "card-number", "card-expiry", "card-cvc"].forEach((id) => {
      const el = getErrorElement(id);
      if (el) el.textContent = "";
    });
  
    if (step === 1) {
      const fullName = fullNameInput.value.trim();
      const email = emailInput.value.trim();
      const phone = phoneInput.value.trim();
  
      if (!fullName) {
        isValid = false;
        fullNameInput.classList.add("field-input--error");
        getErrorElement("full-name").textContent = "Please enter your name.";
      }
  
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) {
        isValid = false;
        emailInput.classList.add("field-input--error");
        getErrorElement("email").textContent = "Email is required.";
      } else if (!emailPattern.test(email)) {
        isValid = false;
        emailInput.classList.add("field-input--error");
        getErrorElement("email").textContent = "Please enter a valid email.";
      }
  
      if (!phone) {
        isValid = false;
        phoneInput.classList.add("field-input--error");
        getErrorElement("phone").textContent = "Please enter your phone number.";
      }
  
      if (isValid) {
        formState.personalInfo.fullName = fullName;
        formState.personalInfo.email = email;
        formState.personalInfo.phone = phone;
      }
    }
  
    if (step === 2) {
      const selectedPlanInput = planInputs.find((input) => input.checked);
      if (!selectedPlanInput) {
        isValid = false;
        getErrorElement("plan").textContent = "Please select a plan.";
      } else {
        formState.planId = selectedPlanInput.dataset.planId;
      }
    }
  
    // Step 3 doesn't require validation (add-ons are optional)
  
    if (step === 5) {
      const cardName = cardNameInput.value.trim();
      const cardNumberRaw = cardNumberInput.value.replace(/\s+/g, "");
      const expiryRaw = cardExpiryInput.value.trim();
      const cvc = cardCvcInput.value.trim();

      if (!cardName) {
        isValid = false;
        cardNameInput.classList.add("field-input--error");
        getErrorElement("card-name").textContent = "Please enter the name on the card.";
      }

      if (!/^\d{16}$/.test(cardNumberRaw)) {
        isValid = false;
        cardNumberInput.classList.add("field-input--error");
        getErrorElement("card-number").textContent = "Enter a 16-digit card number.";
      }

      // Allow common expiry formats like M/YY, MM/YY, MM/YYYY
      const expiryMatch = expiryRaw.match(/^(\d{1,2})[\/\-]?(\d{2}|\d{4})$/);
      if (!expiryMatch) {
        isValid = false;
        cardExpiryInput.classList.add("field-input--error");
        getErrorElement("card-expiry").textContent = "Use MM/YY or MM/YYYY format.";
      } else {
        let month = parseInt(expiryMatch[1], 10);
        let year = parseInt(expiryMatch[2], 10);
        // Normalise 2-digit year to 2000s
        if (year < 100) {
          year += 2000;
        }

        if (month < 1 || month > 12) {
          isValid = false;
          cardExpiryInput.classList.add("field-input--error");
          getErrorElement("card-expiry").textContent = "Month must be between 01 and 12.";
        } else {
          const now = new Date();
          const thisMonth = now.getMonth() + 1; // 1–12
          const thisYear = now.getFullYear();

          if (year < thisYear || (year === thisYear && month < thisMonth)) {
            isValid = false;
            cardExpiryInput.classList.add("field-input--error");
            getErrorElement("card-expiry").textContent = "Card has expired.";
          }
        }
      }

      if (!/^\d{3,4}$/.test(cvc)) {
        isValid = false;
        cardCvcInput.classList.add("field-input--error");
        getErrorElement("card-cvc").textContent = "Enter a 3–4 digit CVC.";
      }

      if (isValid) {
        formState.payment.cardName = cardName;
        formState.payment.cardNumber = cardNumberRaw;
        formState.payment.cardExpiry = expiryRaw;
        formState.payment.cardCvc = cvc;
        persistState();
      }
    }
  
    return isValid;
  }
  
  // ---------- STEP NAVIGATION ----------
  function goToStep(stepNumber) {
    formState.currentStep = stepNumber;
  
    stepSections.forEach((section) => {
      const isActive = Number(section.dataset.step) === stepNumber;
      section.classList.toggle("is-active", isActive);
    });
  
    stepIndicators.forEach((indicator) => {
      const step = Number(indicator.dataset.step);
      indicator.classList.toggle("is-active", step === stepNumber);
    });
  
    backBtn.disabled = stepNumber === 1 || stepNumber === 6;
    nextBtn.hidden = stepNumber >= 4;
    confirmBtn.hidden = !(stepNumber === 4 || stepNumber === 5);
    confirmBtn.textContent =
      stepNumber === 5 ? "Pay now" : "Continue to payment";
  
    if (stepNumber === 4) {
      updateSummary();
    }
  
    updateProgress(stepNumber);
  
    const activeSection = stepSections.find(
      (section) => Number(section.dataset.step) === stepNumber
    );
    if (activeSection) {
      const focusTarget = activeSection.querySelector("[data-autofocus]");
      if (focusTarget) {
        focusTarget.focus();
      }
    }
  }
  
  function goToNextStep() {
    if (!validateStep(formState.currentStep)) {
      animateInvalidStep(formState.currentStep);
      return;
    }
    if (formState.currentStep >= 4) return;
    const target = formState.currentStep + 1;
    goToStep(target);
  }
  
  function goToPreviousStep() {
    if (formState.currentStep <= 1) return;
    const target = formState.currentStep - 1;
    goToStep(target);
  }
  
  function simulatePayment() {
    confirmBtn.disabled = true;
    const originalText = confirmBtn.textContent;
    confirmBtn.textContent = "Processing...";

    const payload = buildSubmissionPayload();
    try {
      fetch("/api/save-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).catch(() => {
        // Ignore network errors; UI still completes
      });
    } catch {
      // Ignore fetch errors in older browsers
    }
  
    setTimeout(() => {
      persistState();
      confirmBtn.disabled = false;
      confirmBtn.textContent = originalText;
      goToStep(6);
    }, 1200);
  }
  
  // ---------- SUMMARY ----------
  function updateSummary() {
    const billing = formState.billing;
    const plan = PLANS[formState.planId];
    const planPrice = getPlanPrice(formState.planId, billing);
  
    summaryPlanNameEl.textContent = `${plan.label} (${billing === BILLING.MONTHLY ? "Monthly" : "Yearly"})`;
    summaryPlanPriceEl.textContent = formatPrice(planPrice, billing);
  
    // Add-ons
    summaryAddonsEl.innerHTML = "";
    let addonsTotal = 0;
  
    formState.addons.forEach((addonId) => {
      const addon = ADDONS[addonId];
      const price = getAddonPrice(addonId, billing);
      addonsTotal += price;
  
      const row = document.createElement("div");
      row.className = "summary-addon-row";
      const labelEl = document.createElement("span");
      labelEl.textContent = addon.label;
      const priceEl = document.createElement("span");
      priceEl.className = "summary-addon-row__price";
      priceEl.textContent = `+${formatPrice(price, billing)}`;
      row.append(labelEl, priceEl);
      summaryAddonsEl.appendChild(row);
    });
  
    const total = planPrice + addonsTotal;
    const intervalText = billing === BILLING.MONTHLY ? "per month" : "per year";
    summaryTotalLabelEl.textContent = `Total (${intervalText})`;
    summaryTotalPriceEl.textContent = formatPrice(total, billing);
  }

  function buildSubmissionPayload() {
    const billing = formState.billing;
    const plan = PLANS[formState.planId];
    const planPrice = getPlanPrice(formState.planId, billing);

    let addonsTotal = 0;
    const addons = Array.from(formState.addons).map((addonId) => {
      const addon = ADDONS[addonId];
      const price = getAddonPrice(addonId, billing);
      addonsTotal += price;
      return {
        id: addonId,
        label: addon.label,
        price,
      };
    });

    const total = planPrice + addonsTotal;

    const maskedCard =
      formState.payment.cardNumber && formState.payment.cardNumber.length >= 4
        ? `**** **** **** ${formState.payment.cardNumber.slice(-4)}`
        : null;

    return {
      submittedAt: new Date().toISOString(),
      billing,
      personalInfo: { ...formState.personalInfo },
      plan: {
        id: formState.planId,
        label: plan.label,
        price: planPrice,
      },
      addons,
      total,
      payment: {
        cardName: formState.payment.cardName,
        cardLast4: maskedCard,
      },
    };
  }
  
  // ---------- BILLING TOGGLE ----------
  function updateBillingVisuals() {
    billingLabels.forEach((label) => {
      const billingType = label.dataset.billing;
      label.classList.toggle("billing-label--active", billingType === formState.billing);
    });
  
    // Update plan and addon prices in UI
    Object.keys(PLANS).forEach((planId) => {
      const priceEl = document.querySelector(`[data-price-plan="${planId}"]`);
      const tagEl = document.querySelector(`[data-plan-tag="${planId}"]`);
      if (!priceEl || !tagEl) return;
  
      const price = getPlanPrice(planId, formState.billing);
      priceEl.textContent = formatPrice(price, formState.billing);
      if (formState.billing === BILLING.YEARLY) {
        tagEl.textContent = "2 months free";
      } else {
        tagEl.textContent = "";
      }
    });
  
    Object.keys(ADDONS).forEach((addonId) => {
      const priceEl = document.querySelector(`[data-price-addon="${addonId}"]`);
      if (!priceEl) return;
      const price = getAddonPrice(addonId, formState.billing);
      priceEl.textContent = `+${formatPrice(price, formState.billing)}`;
    });
  }
  
  function toggleBilling() {
    formState.billing =
      formState.billing === BILLING.MONTHLY ? BILLING.YEARLY : BILLING.MONTHLY;
    document.body.setAttribute("data-billing", formState.billing);
    updateBillingVisuals();
    if (formState.currentStep === 4) {
      updateSummary();
    }
  }
  
  // ---------- ADD-ONS ----------
  function handleAddonChange(event) {
    const checkbox = event.target;
    if (!checkbox.classList.contains("addon-input")) return;
  
    const addonId = checkbox.dataset.addonId;
    if (!addonId) return;
  
    if (checkbox.checked) {
      formState.addons.add(addonId);
    } else {
      formState.addons.delete(addonId);
    }
    persistState();
  }
  
  // ---------- THEME ----------
  function loadThemePreference() {
    const saved = window.localStorage.getItem("msf-theme");
    if (saved === "dark") {
      bodyEl.classList.add("theme-dark");
      bodyEl.classList.remove("theme-light");
    } else {
      bodyEl.classList.add("theme-light");
      bodyEl.classList.remove("theme-dark");
    }
  }
  
  function toggleTheme() {
    const isDark = bodyEl.classList.toggle("theme-dark");
    bodyEl.classList.toggle("theme-light", !isDark);
    window.localStorage.setItem("msf-theme", isDark ? "dark" : "light");
  }
  
  // ---------- INITIALIZATION ----------
  function initForm() {
    loadThemePreference();
    loadPersistedState();
  
    // Initialize billing visuals and plan/addon prices
    document.body.setAttribute("data-billing", formState.billing);
    updateBillingVisuals();
  
    // Personal info live updates (so going back keeps values)
    fullNameInput.addEventListener("input", (e) => {
      formState.personalInfo.fullName = e.target.value;
      persistState();
    });
    emailInput.addEventListener("input", (e) => {
      formState.personalInfo.email = e.target.value;
      persistState();
    });
    phoneInput.addEventListener("input", (e) => {
      formState.personalInfo.phone = e.target.value;
      persistState();
    });
  
    // Step navigation
    backBtn.addEventListener("click", () => {
      if (formState.currentStep === 6) {
        // From thank-you screen, don't go back
        return;
      }
      goToPreviousStep();
    });
  
    nextBtn.addEventListener("click", () => {
      goToNextStep();
    });
  
    confirmBtn.addEventListener("click", () => {
      if (formState.currentStep === 4) {
        if (!validateStep(4)) {
          animateInvalidStep(4);
          return;
        }
        goToStep(5);
        return;
      }
  
      if (formState.currentStep === 5) {
        if (!validateStep(5)) {
          animateInvalidStep(5);
          return;
        }
        simulatePayment();
      }
    });
  
    // Plan selection
    planInputs.forEach((input) => {
      input.addEventListener("change", () => {
        formState.planId = input.dataset.planId;
        persistState();
        if (formState.currentStep === 4) {
          updateSummary();
        }
      });
    });
  
    // Billing toggle
    billingToggleBtn.addEventListener("click", toggleBilling);
  
    // Add-ons
    addonInputs.forEach((input) => {
      input.addEventListener("change", handleAddonChange);
    });
  
    // Change plan from summary
    changePlanBtn.addEventListener("click", () => {
      goToStep(2);
    });
  
    // Theme
    themeToggleBtn.addEventListener("click", toggleTheme);
  
    // Start at step 1
    goToStep(1);
  }
  
  document.addEventListener("DOMContentLoaded", initForm);
  