// ✅ Load page với param và localStorage
async function loadPage(pageName, params = {}) {
  const content = document.getElementById("main-content");

  try {
    // Cập nhật localStorage
    localStorage.setItem("currentPage", pageName);
    localStorage.setItem("pageParams", JSON.stringify(params));

    // Cập nhật URL trên thanh địa chỉ (không reload)
    const url = new URL(window.location);
    url.searchParams.set("page", pageName);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    history.replaceState({}, "", url);

    // Load HTML nội dung
    const response = await fetch(`pages/${pageName}.html`);
    const htmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");

    // Chèn nội dung
    content.innerHTML = doc.body.innerHTML;

    // Tải & thực thi script bên trong trang
    const scripts = doc.querySelectorAll("script");
    scripts.forEach(oldScript => {
      const newScript = document.createElement("script");
      if (oldScript.src) {
        newScript.src = oldScript.src;
      } else {
        newScript.textContent = oldScript.textContent;
      }
      document.body.appendChild(newScript);
    });

  } catch (err) {
    content.innerHTML = "<p>Error loading page</p>";
    console.error("❌ Load error:", err);
  }
}

// ✅ Khi trang load
window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get("page") 
  
  if (!page) {
    // Nếu không có tham số page, lấy từ localStorage
    const storedPage = localStorage.getItem("currentPage");
    if (storedPage) {
      loadPage(storedPage);
      return;
    } else {
      // Nếu không có trang nào được lưu, tải trang mặc định
      loadPage("test");
      return;
    }
  }
  
  const otherParams = {};
  urlParams.forEach((value, key) => {
    if (key !== "page") {
      otherParams[key] = value;
    }
  });

  loadPage(page, otherParams);
};