const PRODUCT_NAMES = {
  stranger: "Stranger 🙂",
  acquaintance: "Acquaintance 😊",
  friend: "Friend 😘",
  bestie: "Bestie 😍",
};

const catalog = document.querySelector(".catalog");
const shopNotice = document.getElementById("shop-notice");
const checkoutSection = document.getElementById("checkout");
const checkoutTitle = document.getElementById("checkout-product-name");
const cancelBtn = document.getElementById("checkout-cancel");
const paymentForm = document.getElementById("payment-form");
const emailInput = document.getElementById("email");
const emailErrors = document.getElementById("email-errors");
const paymentMessage = document.getElementById("payment-message");
const submitBtn = document.getElementById("submit");
const buttonText = document.getElementById("button-text");
const spinner = document.getElementById("spinner");

let checkout = null;
let actions = null;
let paymentElement = null;

function showNotice(text) {
  if (!shopNotice) return;
  if (text) {
    shopNotice.textContent = text;
    shopNotice.hidden = false;
  } else {
    shopNotice.textContent = "";
    shopNotice.hidden = true;
  }
}

async function getPublishableKey() {
  const res = await fetch("/api/config");
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error ?? `Payment config failed (${res.status}). Check Vercel env vars.`
    );
  }
  const { publishableKey } = await res.json();
  if (!publishableKey) {
    throw new Error("Missing publishable key from /api/config.");
  }
  return publishableKey;
}

function showMessage(text) {
  paymentMessage.textContent = text ?? "";
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading || !actions;
  spinner.hidden = !isLoading;
}

function showCheckout(productId) {
  catalog.classList.add("catalog--hidden");
  checkoutSection.hidden = false;
  checkoutSection.classList.remove("checkout--hidden");
  checkoutTitle.textContent = PRODUCT_NAMES[productId] ?? "Checkout";
  showMessage("");
  emailInput.value = "";
  emailErrors.textContent = "";
}

function hideCheckout() {
  catalog.classList.remove("catalog--hidden");
  checkoutSection.hidden = true;
  checkoutSection.classList.add("checkout--hidden");
  if (paymentElement) {
    paymentElement.unmount();
    paymentElement = null;
  }
  checkout = null;
  actions = null;
}

async function validateEmail(email) {
  if (!actions) return { isValid: false, message: "Checkout not ready." };
  const updateResult = await actions.updateEmail(email);
  const isValid = updateResult.type !== "error";
  return {
    isValid,
    message: isValid ? null : updateResult.error.message,
  };
}

async function startCheckout(productId) {
  showNotice("Loading checkout…");
  setLoading(true);
  showMessage("");

  try {
    if (typeof Stripe === "undefined") {
      throw new Error(
        "Stripe.js did not load. Check your network or ad blocker."
      );
    }

    const publishableKey = await getPublishableKey();
    const stripe = Stripe(publishableKey);

    if (typeof stripe.initCheckoutElementsSdk !== "function") {
      throw new Error(
        "Stripe Checkout SDK is unavailable. Try refreshing the page."
      );
    }

    let clientSecret;
    const sessionRes = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    const sessionData = await sessionRes.json().catch(() => ({}));
    if (!sessionRes.ok) {
      const detail = sessionData.detail
        ? ` ${sessionData.detail}`
        : "";
      throw new Error(
        (sessionData.error ?? `Checkout API failed (${sessionRes.status}).`) +
          detail
      );
    }
    if (!sessionData.clientSecret) {
      throw new Error("No client secret returned from checkout API.");
    }
    clientSecret = sessionData.clientSecret;

    const appearance = {
      theme: "stripe",
      variables: {
        colorPrimary: "#635bff",
        colorBackground: "#faf7f2",
        colorText: "#2d2a26",
        borderRadius: "12px",
        fontFamily: '"Lora", Georgia, "Times New Roman", serif',
      },
    };

    checkout = stripe.initCheckoutElementsSdk({
      clientSecret,
      elementsOptions: { appearance },
    });

    checkout.on("change", (session) => {
      submitBtn.disabled = !session.canConfirm;
      if (session.total?.total?.amount) {
        buttonText.textContent = `Pay ${session.total.total.amount}`;
      }
    });

    const mountTarget = document.getElementById("payment-element");
    mountTarget.innerHTML = "";
    paymentElement = checkout.createPaymentElement();
    paymentElement.mount("#payment-element");

    const loadActionsResult = await checkout.loadActions();
    if (loadActionsResult.type === "error") {
      throw new Error(loadActionsResult.error.message);
    }
    actions = loadActionsResult.actions;

    showNotice("");
    showCheckout(productId);
  } catch (err) {
    console.error("[shop] checkout failed:", err);
    hideCheckout();
    showNotice(err.message ?? "Something went wrong. See the browser console for details.");
  } finally {
    setLoading(false);
  }
}

if (!catalog) {
  showNotice("Shop script could not find the product catalog.");
  console.error("[shop] .catalog element missing");
} else {
  catalog.addEventListener("click", (e) => {
    const btn = e.target.closest(".product-card__buy");
    if (!btn) return;
    const card = btn.closest("[data-product-id]");
    const productId = card?.dataset.productId;
    if (productId) startCheckout(productId);
  });
}

cancelBtn.addEventListener("click", () => {
  hideCheckout();
  showNotice("");
});

emailInput.addEventListener("input", () => {
  emailErrors.textContent = "";
  emailInput.classList.remove("error");
});

emailInput.addEventListener("blur", async () => {
  const email = emailInput.value.trim();
  if (!email || !actions) return;
  const { isValid, message } = await validateEmail(email);
  if (!isValid) {
    emailInput.classList.add("error");
    emailErrors.textContent = message;
  }
});

paymentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!actions) return;

  setLoading(true);
  showMessage("");

  const email = emailInput.value.trim();
  const { isValid, message } = await validateEmail(email);
  if (!isValid) {
    emailInput.classList.add("error");
    emailErrors.textContent = message;
    showMessage(message);
    setLoading(false);
    return;
  }

  const { error } = await actions.confirm();
  if (error) {
    showMessage(error.message);
    setLoading(false);
  }
});
