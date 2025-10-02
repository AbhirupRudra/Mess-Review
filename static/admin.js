const ADMIN_PASSWORD = "mess123";

const loginBtn = document.getElementById("loginBtn");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");
const loginSection = document.getElementById("loginSection");
const adminPanel = document.getElementById("adminPanel");
const refreshBtn = document.getElementById("refreshBtn");
const tbody = document.querySelector("#reviewsTable tbody");
const reviewDate = document.getElementById("reviewDate");

const today = new Date().toISOString().split("T")[0];
reviewDate.value = today;

// Login
loginBtn.addEventListener("click", () => {
  const pass = passwordInput.value.trim();
  if (pass === ADMIN_PASSWORD) {
    loginSection.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    fetchReviews();
  } else {
    loginError.classList.remove("hidden");
  }
});

// Refresh button
refreshBtn.addEventListener("click", fetchReviews);
reviewDate.addEventListener("change", fetchReviews);

// Fetch reviews from Flask-Firestore backend
async function fetchReviews() {
  const date = reviewDate.value;
  if (!date) return;

  try {
    const res = await fetch(`/get_reviews?date=${date}`, {
      headers: { Authorization: `Bearer ${ADMIN_PASSWORD}` }
    });
    const data = await res.json();
    if (!res.ok) {
      alert("Error fetching reviews: " + data.error);
      return;
    }
    renderReviews(data);
  } catch (err) {
    alert("Failed to connect to backend!");
    console.error(err);
  }
}

// Render reviews in table
function renderReviews(reviews) {
  tbody.innerHTML = "";
  if (reviews.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="4" style="text-align:center;">No reviews for this day</td>`;
    tbody.appendChild(tr);
    return;
  }

  reviews.forEach(review => {
    let itemsObj = review.items || {};

    const itemDetails = Object.entries(itemsObj).map(([item, val]) => {
      return `${item}: ${val.rating}⭐ ${val.feedback}`;
    }).join("<br>");

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${review.meal}</td>
      <td>${review.overall_rating}⭐</td>
      <td>${review.overall_feedback || "-"}</td>
      <td>${itemDetails}</td>
    `;
    tbody.appendChild(tr);
  });
}
