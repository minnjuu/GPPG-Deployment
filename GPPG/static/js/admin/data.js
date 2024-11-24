// Initialize on document load
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all dropdowns
  initializeDropdowns();

  // Initialize search functionality
  initializeSearch();

  // Initialize modals
  initializeModals();
});

// Dropdown functionality
function initializeDropdowns() {
  const dropdownButtons = document.querySelectorAll("[data-dropdown-toggle]");

  dropdownButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const targetId = button.getAttribute("data-dropdown-toggle");
      const dropdown = document.getElementById(targetId);

      // Close all other dropdowns first
      document.querySelectorAll('[id^="dropdownDotsActivity"]').forEach((d) => {
        if (d.id !== targetId) {
          d.classList.add("hidden");
        }
      });

      // Toggle current dropdown
      dropdown.classList.toggle("hidden");
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", () => {
    document.querySelectorAll('[id^="dropdownDotsActivity"]').forEach((dropdown) => {
      if (!dropdown.classList.contains("hidden")) {
        dropdown.classList.add("hidden");
      }
    });
  });
}

// Search functionality
function initializeSearch() {
  const searchInput = document.getElementById("hs-table-export-search");
  const cards = document.querySelectorAll('.grid > div[class*="bg-white"]'); // Select all cards except empty state

  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();

    cards.forEach((card) => {
      const name = card.querySelector("h3").textContent.toLowerCase();
      const description = card.querySelector("p").textContent.toLowerCase();
      const location = card.querySelector(".text-gray-600:nth-of-type(2)").textContent.toLowerCase();
      const date = card.querySelector(".text-gray-600:nth-of-type(1)").textContent.toLowerCase();

      const matches = name.includes(searchTerm) || description.includes(searchTerm) || location.includes(searchTerm) || date.includes(searchTerm);

      card.style.display = matches ? "" : "none";
    });

    // Show/hide empty state message
    const visibleCards = [...cards].filter((card) => card.style.display !== "none");
    const emptyState = document.querySelector(".col-span-3");
    if (emptyState) {
      emptyState.style.display = visibleCards.length === 0 ? "" : "none";
    }
  });
}

// Modal functionality
function initializeModals() {
  const modalButtons = document.querySelectorAll("[data-modal-toggle]");
  const closeButtons = document.querySelectorAll("[data-modal-hide]");

  modalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modalId = button.getAttribute("data-modal-target");
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove("hidden");
        document.body.classList.add("overflow-hidden");
      }
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modalId = button.getAttribute("data-modal-hide");
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
      }
    });
  });

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    const modals = document.querySelectorAll('[role="dialog"]');
    modals.forEach((modal) => {
      if (e.target === modal) {
        modal.classList.add("hidden");
        document.body.classList.remove("overflow-hidden");
      }
    });
  });
}

// Helper function to show modal title
function showTitle(title) {
  const modalTitle = document.querySelector("#modal-title");
  if (modalTitle) {
    modalTitle.textContent = title;
  }
}
