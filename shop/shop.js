const PRODUCT_NAMES = {
  "ambition-guide": "Practical Ambition Guide",
  "room-playbook": "Room Playbook",
};

const catalog = document.querySelector(".catalog");
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

async function getPublishableKey() {
  const res = await fetch("/api/config");
  if (!res.ok) {
    throw new Error("Payment system is not configured yet.");
  }
  const { publishableKey } = await res.json();
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
  setLoading(true);
  showMessage("");

  try {
    const publishableKey = await getPublishableKey();
    const stripe = Stripe(publishableKey);

    const clientSecretPromise = fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    })
      .then((r) => {
        if (!r.ok) {
          return r.json().then((d) => {
            throw new Error(d.error ?? "Could not start checkout.");
          });
        }
        return r.json();
      })
      .then((data) => data.clientSecret);

    const appearance = {
      theme: "stripe",
      variables: {
        colorPrimary: "#b85c4a",
        colorBackground: "#faf7f2",
        colorText: "#2d2a26",
        borderRadius: "12px",
        fontFamily: "Lora, Georgia, serif",
      },
    };

    checkout = stripe.initCheckoutElementsSdk({
      clientSecret: clientSecretPromise,
      elementsOptions: { appearance },
    });

    checkout.on("change", (session) => {
      submitBtn.disabled = !session.canConfirm;
      if (session.total?.total?.amount) {
        buttonText.textContent = `Pay ${session.total.total.amount} now`;
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

    showCheckout(productId);
  } catch (err) {
    showMessage(err.message ?? "Something went wrong.");
    hideCheckout();
  } finally {
    setLoading(false);
  }
}

catalog.addEventListener("click", (e) => {
  const btn = e.target.closest(".product-card__buy");
  if (!btn) return;
  const card = btn.closest("[data-product-id]");
  const productId = card?.dataset.productId;
  if (productId) startCheckout(productId);
});

cancelBtn.addEventListener("click", hideCheckout);

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
