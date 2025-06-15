document.getElementById("formAuthentication").addEventListener("submit", async function (e) {
    e.preventDefault(); // prevent default form submission

    const emailInput = document.getElementById("email");
    const email = emailInput.value;
    const messageDiv = document.getElementById("email-message");
    messageDiv.textContent = ""; // Clear old messages

    try {
      const response = await fetch(`https://api.thienhang.com/authentication/reset-password?email=${encodeURIComponent(email)}`, {
        method: "POST",
        headers: {
          "Accept": "application/json"
        },
        body: null
      });

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.data || "Reset link sent!";
        messageDiv.classList.remove("text-danger");
        messageDiv.classList.add("text-success");
      } else {
        messageDiv.textContent = result.message || "Failed to send reset link.";
        messageDiv.classList.remove("text-success");
        messageDiv.classList.add("text-danger");
      }
    } catch (error) {
      messageDiv.textContent = "An error occurred. Please try again.";
      messageDiv.classList.remove("text-success");
      messageDiv.classList.add("text-danger");
    }
  });