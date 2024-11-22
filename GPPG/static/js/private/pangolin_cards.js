const items = document.querySelectorAll(".carousel-item");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const carouselInner = document.getElementById("carouselInner");

let currentItem = 0;
const totalItems = items.length;

function updateCarousel() {
  const offset = -currentItem * 100; // Calculate the percentage offset based on current item
  carouselInner.style.transform = `translateX(${offset}%)`; // Update the transform property to slide
}

// Next button click event
nextBtn.addEventListener("click", () => {
  currentItem = (currentItem + 1) % totalItems; // Move to the next item, looping back to first
  updateCarousel();
});

// Prev button click event
prevBtn.addEventListener("click", () => {
  currentItem = (currentItem - 1 + totalItems) % totalItems; // Move to the previous item, looping back to last
  updateCarousel();
});

// Initialize carousel
updateCarousel();
