document.addEventListener("DOMContentLoaded", () => {
    // Lấy key từ URL và hiển thị lên form
    const urlParams = new URLSearchParams(window.location.search);
    const key = urlParams.get('key') || '';
  
    const keyInput = document.getElementById('key');
    const debugText = document.getElementById('key-debug');
  
    if (keyInput) keyInput.value = key;
    if (debugText) debugText.textContent = key ? key : '(no key found in URL)';
  
    // Bắt sự kiện submit form
    const form = document.getElementById('resetPasswordForm');
    if (!form) return;
  
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
  
      const otp = document.getElementById('otp')?.value.trim();
      const password = document.getElementById('new-password')?.value.trim();
  
      if (!key || !otp || !password) {
        alert("Please fill in all fields including OTP and new password.");
        return;
      }
  
      const payload = {
        otp: otp,
        password: password
      };
  
      try {
        const response = await fetch(`https://api.thienhang.com/authentication/update-password?key=${encodeURIComponent(key)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          alert("❌ Reset failed: " + (data.detail || data.message || "Unknown error"));
          return;
        }
  
        alert("✅ Password reset successful!");
        window.location.href = "/login.html";
      } catch (error) {
        alert("🚫 Something went wrong: " + error.message);
      }
    });
  });
  