// Generate or get unique device ID
let deviceId = localStorage.getItem("deviceId");
if (!deviceId) {
  deviceId = Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15);
  localStorage.setItem("deviceId", deviceId);
}

let currentMeal = null;
let ratings = { overall: 0, items: {} };
const BACKEND_URL = "http://127.0.0.1:5000"; // backend

// Meal schedule in minutes
const mealSchedule = {
  Breakfast: { start: 420, end: 570 },
  Lunch: { start: 740, end: 870 },
  Evening: { start: 1020, end:1080 },
  Dinner: { start: 1200, end: 1290 }
};

// Menu for all days
const menuData = {
  Monday: {
    Breakfast: ["Paratha", "Aalu Chana", "Cornflakes", "Tea", "Banana"],
    Lunch: ["Yellow Dal", "Rice", "Roti", "Sabji", "Bhujia", "Salad", "Seasonal Fruit"],
    Evening: ["Tea", "Biscuit (04 pieces)"],
    Dinner: ["Dal (Sabut)", "Veg Pulao", "Roti", "Sahi Paneer", "Raita"]
  },
  Tuesday: {
    Breakfast: ["Puri", "Potato, Tomato & Onion Curry", "Sweet Daliya", "Bread (02 pieces)", "Butter/Jam", "Sprouts", "Banana", "Tea"],
    Lunch: ["Rajma", "Rice", "Roti", "Sabji", "Bhujia", "Salad", "Seasonal Fruit"],
    Evening: ["Tea", "Rusk (02 pieces)"],
    Dinner: ["Dal (Makhni)", "Sabji/Bhujiya", "Rice", "Roti", "Salad", "Sweet (02 pices)"]
  },
  Wednesday: {
    Breakfast: ["Idli Sambhar", "Coconut Chutney", "Bread (02 pieces)", "Butter/Jam", "Banana", "Tea"],
    Lunch: ["Yellow Dal (Arhar)", "Rice", "Roti", "Mix Veg", "Bhujia", "Salad"],
    Evening: ["Coffee", "Biscuit (04 pieces)"],
    Dinner: ["Chana Dal", "Jeera Rice", "Poori", "Mutter Paneer", "Raita"]
  },
  Thursday: {
    Breakfast: ["Aalu Paratha", "Plain Curd", "Bread (02 pieces)", "Butter/Jam", "Banana", "Tea"],
    Lunch: ["Chana Dal", "Rice", "Roti", "Sabji", "Onion Pakoda (02 pices)", "Papad", "Salad", "Seasonal Fruit"],
    Evening: ["Tea", "Rusk (02 pieces)"],
    Dinner: ["Yellow Dal (Arhar)", "Rice", "Roti", "Kheer", "Salad"]
  },
  Friday: {
    Breakfast: ["Puri", "Black Chana", "Halwa", "Sprouts", "Banana", "Tea"],
    Lunch: ["Yellow Dal (Arhar)", "Rice", "Roti", "Sabji", "Bhujia", "Salad", "Seasonal Fruit"],
    Evening: ["Coffee", "Biscuit (04 pieces)"],
    Dinner: ["Rasam", "Mix Veg", "Rice", "Roti", "Raita", "Sewai"]
  },
  Saturday: {
    Breakfast: ["Chole Bhatura (03 pices)", "Corn Flakes", "Sprouts", "Banana", "Tea"],
    Lunch: ["Rice", "Puri", "Paneer Butter Masala", "Chola", "Papad", "Salad", "Seasonal Fruit"],
    Evening: ["Tea", "Rusk (02 pieces)"],
    Dinner: ["Dal (Tadka)", "Sabji", "Rice", "Roti", "Kadhi Pakora", "Halwa (Suji/Moog Dal)", "Salad"]
  },
  Sunday: {
    Breakfast: ["Masala Dosa/Uttapam (02 pieces)", "Sambar", "Coconut Chutney", "Banana", "Sprouts", "Tea"],
    Lunch: ["Rasam", "Rice", "Roti", "Kofta", "Bhujia", "Papad", "Salad", "Seasonal Fruit"],
    Evening: ["Tea", "Biscuit (04 pieces)"],
    Dinner: ["Veg Biryani", "Raita", "Roti", "Chana Dal Tadka", "Veg Manchurian", "Ice-Cream"]
  }
};

// Get current meal
function getMealType() {
  const now = new Date();
  const time = now.getHours() * 60 + now.getMinutes();
  for (const meal in mealSchedule) {
    if (time >= mealSchedule[meal].start && time <= mealSchedule[meal].end) {
      return meal;
    }
  }
  return null;
}

// Get current day
function getDayName() {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return days[new Date().getDay()];
}

// Check if already submitted today
function alreadySubmitted(day, meal) {
  const key = `submitted_${day}_${meal}`;
  return localStorage.getItem(key) === deviceId;
}

// Mark submission
function markSubmitted(day, meal) {
  const key = `submitted_${day}_${meal}`;
  localStorage.setItem(key, deviceId);
}

// Initialize meal section
function initMeal() {
  const day = getDayName();
  currentMeal = getMealType();

  if (currentMeal) {
    if (alreadySubmitted(day, currentMeal)) {
      document.getElementById("mealSection").classList.add("hidden");
      document.getElementById("submitBtn").classList.add("hidden");
      document.getElementById("nomsg").classList.remove("hidden");
      document.getElementById("nomsg").innerText = "⚠️ You have already submitted your review for this meal today!";
      return;
    }

    document.getElementById("mealSection").classList.remove("hidden");
    document.getElementById("submitBtn").classList.remove("hidden");
    document.getElementById("mealTitle").innerText = `🍽 ${currentMeal} - ${day}`;

    const menuContainer = document.getElementById("menuItems");
    menuContainer.innerHTML = "";
    ratings.items = {};

    menuData[day][currentMeal].forEach(item => {
      const div = document.createElement("div");
      div.classList.add("menu-item");
      div.innerHTML = `
        <h3>${item}</h3>
        <div class="rating" data-item="${item}">
          <span data-value="5">★</span>
          <span data-value="4">★</span>
          <span data-value="3">★</span>
          <span data-value="2">★</span>
          <span data-value="1">★</span>
        </div>
        <textarea placeholder="Feedback for ${item} (optional)..."></textarea>
      `;
      menuContainer.appendChild(div);
      ratings.items[item] = 0;
    });

    attachRatingHandlers();
  } else {
    document.getElementById("nomsg").classList.remove("hidden");
  }

  renderFullWeekMenu();
}

// Star rating
function attachRatingHandlers() {
  document.querySelectorAll(".rating").forEach(ratingDiv => {
    const isOverall = ratingDiv.id === "overallRating";
    const stars = ratingDiv.querySelectorAll("span");

    stars.forEach(star => {
      star.addEventListener("click", function () {
        const value = this.getAttribute("data-value");
        stars.forEach(s => s.classList.remove("active"));
        this.classList.add("active");
        let prev = this.nextElementSibling;
        while (prev) {
          prev.classList.add("active");
          prev = prev.nextElementSibling;
        }
        if (isOverall) ratings.overall = value;
        else ratings.items[ratingDiv.getAttribute("data-item")] = value;
      });
    });
  });
}

// Submit review
document.getElementById("submitBtn").addEventListener("click", async function () {
  if (!currentMeal) { alert("Not a valid meal time!"); return; }
  if (ratings.overall == 0) { alert("Please give an overall rating ⭐"); return; }

  const day = getDayName();
  if (alreadySubmitted(day, currentMeal)) {
    alert("You have already submitted for this meal today!");
    return;
  }

  const data = { 
    day, 
    meal: currentMeal, 
    overallRating: ratings.overall, 
    overallFeedback: document.getElementById("overallFeedback").value.trim(), 
    items: {}
  };

  document.querySelectorAll("#menuItems .menu-item").forEach(div => {
    const item = div.querySelector("h3").innerText;
    const feedback = div.querySelector("textarea").value.trim();
    data.items[item] = { rating: ratings.items[item], feedback };
  });

  try {
    const response = await fetch(`${BACKEND_URL}/submit_review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (response.ok) {
      markSubmitted(day, currentMeal); // mark as submitted
      document.getElementById("thankyou").classList.remove("hidden");
      document.getElementById("submitBtn").classList.add("hidden");
      ratings = { overall: 0, items: {} };
      document.getElementById("overallFeedback").value = "";
      document.querySelectorAll(".rating span").forEach(s => s.classList.remove("active"));
      document.querySelectorAll("#menuItems textarea").forEach(t => t.value = "");
    } else {
      alert("Error submitting review: " + result.error);
    }
  } catch (err) {
    alert("Failed to connect to backend!");
    console.error(err);
  }
});

// Render full week menu (right side)
function renderFullWeekMenu() {
  const container = document.getElementById("fullWeekMenu");
  container.innerHTML = "<h2>📅 Week Menu</h2>";

  for (const day in menuData) {
    const dayDiv = document.createElement("div");
    dayDiv.innerHTML = `<h3>${day}</h3>`;
    for (const meal in menuData[day]) {
      const mealItems = menuData[day][meal].join(", ");
      dayDiv.innerHTML += `<p><strong>${meal}:</strong> ${mealItems}</p>`;
    }
    container.appendChild(dayDiv);
  }
}

// Run on load
initMeal();
