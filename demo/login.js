document.getElementById('formAuthentication').addEventListener('submit', async function (e) {
    e.preventDefault(); // Ngăn form reload trang
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('https://api.thienhang.com/authentication/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
        credentials: 'include' 
      });
  
      if (!response.ok) {
        const error = await response.json();
        alert("Login failed: " + (error.detail || response.statusText));
        return;
      }
  
      const data = await response.json();
  
    //   // Lưu token vào localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
  
      // Chuyển hướng sau khi đăng nhập thành công
      window.location.href = '/index.html'; // hoặc trang phù hợp
    } catch (error) {
      alert("Something went wrong: " + error.message);
    }
  });