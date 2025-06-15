async function fetchApartments() {
    const status = document.getElementById("status");
    const container = document.getElementById("apartmentList");

    try {
      const res = await fetch("https://api.thienhang.com/services/hotel/apartment/apartments", {
        headers: {
          "Accept": "application/json"
        }
      });

      if (!res.ok) throw new Error("Network error");

      const result = await res.json();
      const apartments = result.data;

      status.style.display = "none";
      container.classList.remove("hidden");

      apartments.forEach(apartment => {
        const card = document.createElement("div");
        card.className = "bg-white shadow-md rounded-xl overflow-hidden transition hover:shadow-lg";

        card.innerHTML = `
          <img src="https://images.ctfassets.net/hrltx12pl8hq/28ECAQiPJZ78hxatLTa7Ts/2f695d869736ae3b0de3e56ceaca3958/free-nature-images.jpg?fit=fill&w=1200&h=630" class="w-full h-48 object-cover" alt="apartment" />
          <div class="p-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">${apartment.title}</h3>
            <p class="text-sm text-gray-600 mb-1"><span class="font-medium">Price:</span> ${apartment.price_per_day.toLocaleString()} ${apartment.currency}</p>
            <p class="text-sm text-gray-600 mb-1"><span class="font-medium">Area:</span> ${apartment.total_area} m²</p>
            <p class="text-sm text-gray-600 mb-1"><span class="font-medium">Furnished:</span> ${apartment.is_furnished ? "Yes" : "No"}</p>
            <p class="text-sm text-gray-600 mb-1"><span class="font-medium">Garage:</span> ${apartment.is_garage ? "Yes" : "No"}</p>
            <p class="text-sm text-gray-600 mb-3"><span class="font-medium">Status:</span> ${apartment.is_booked ? "Booked" : "Available"}</p>
            <button onclick="showMore('${apartment._id}')" class="w-full bg-blue-600 text-white text-sm font-semibold py-2 rounded hover:bg-blue-700 transition">View Details</button>
          </div>
        `;

        container.appendChild(card);
      });

    } catch (err) {
      console.error("Fetch error:", err);
      status.innerText = "❌ Failed to load apartments.";
    }
  }

  function showMore(id) {
    alert(`View details for apartment ID: ${id}`);
    // or redirect: 
    window.location.href = `/booking/all-rooms.html?id=${id}`;
  }

  fetchApartments();