const titleEl = document.getElementById("status-title");
const messageEl = document.getElementById("status-message");
const sessionId = new URLSearchParams(window.location.search).get("session_id");

async function loadStatus() {
  if (!sessionId) {
    titleEl.textContent = "Something went wrong";
    messageEl.textContent = "No payment session was found. Please try again from the shop.";
    return;
  }

  try {
    const res = await fetch(
      `/api/session-status?session_id=${encodeURIComponent(sessionId)}`
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error ?? "Could not verify payment.");
    }

    if (data.payment_status === "paid" || data.status === "complete") {
      titleEl.textContent = "Thank you!";
      messageEl.textContent = data.customer_email
        ? `Payment received. A receipt will be sent to ${data.customer_email}.`
        : "Payment received. Thank you for your order.";
      return;
    }

    if (data.status === "open") {
      titleEl.textContent = "Payment pending";
      messageEl.textContent =
        "Your payment is still processing. Refresh this page in a moment.";
      return;
    }

    titleEl.textContent = "Payment status";
    messageEl.textContent = `Status: ${data.payment_status ?? data.status}.`;
  } catch (err) {
    titleEl.textContent = "Could not confirm payment";
    messageEl.textContent = err.message ?? "Please contact support if you were charged.";
  }
}

loadStatus();
