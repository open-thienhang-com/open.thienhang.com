// Load sub page content
async function loadPage(page) {
    const content = document.getElementById("main-content");
    try {
      const response = await fetch(`pages/${page}.html`);
      const html = await response.text();
      content.innerHTML = html;
    } catch (err) {
      content.innerHTML = "<p>Error loading page</p>";
      console.error("Load error:", err);
    }
  }

  // Auto load default page
  window.onload = () => loadPage('hotels');



  // function addRoomSection() {
  //   const container = document.getElementById("rooms-container");
  //   const section = document.createElement("div");
  //   section.innerHTML = `
  //    <div class="card mb-4">
  //     <div class="card-body">
  //       <h4 class="card-title">Add Room</h4>
  //       <div class="row">
          
  //         <!-- Left: Upload image -->
  //         <div class="col-md-4 d-flex flex-column align-items-center justify-content-center border-end">
  //           <div class="mb-3 text-center">
  //             <label for="roomImage" class="form-label">Room Thumbnail</label>
  //             <input class="form-control" type="file" id="roomImage" accept="image/*">
  //           </div>
  //           <img id="previewImage" src="https://via.placeholder.com/200x150?text=Preview" class="img-fluid rounded border" style="max-height: 150px;" alt="Preview">
  //         </div>

  //         <!-- Right: Room Info -->
  //         <div class="col-md-8">
  //           <div class="form-group mb-3">
  //             <label>Room Name</label>
  //             <input type="text" class="form-control" placeholder="Room type or name">
  //           </div>
  //           <div class="form-group mb-3">
  //             <label>Price Per Night</label>
  //             <input type="number" class="form-control" placeholder="USD">
  //           </div>
  //           <div class="form-group mb-3">
  //             <label>Capacity</label>
  //             <input type="number" class="form-control" placeholder="Number of people">
  //           </div>
  //         </div>

  //       </div>
  //     </div>
  //   </div>
  //   `;
  //   container.appendChild(section);
  // }



  // const fileInput = document.getElementById("roomImage");
  // const previewImage = document.getElementById("previewImage");

  // fileInput.addEventListener("change", function () {
  //   const file = this.files[0];
  //   if (file) {
  //     previewImage.src = URL.createObjectURL(file);
  //   }
  // });



  