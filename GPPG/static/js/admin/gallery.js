// Initialize on document load
document.addEventListener("DOMContentLoaded", function () {
  initializeDropdowns();
  initializeSearch();
  initializeModals();
  initializeYearFilter();
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
      document.querySelectorAll('[id^="dropdownDotsOfficer"], [id="filterDropdown"]').forEach((d) => {
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
    document.querySelectorAll('[id^="dropdownDotsOfficer"], [id="filterDropdown"]').forEach((dropdown) => {
      if (!dropdown.classList.contains("hidden")) {
        dropdown.classList.add("hidden");
      }
    });
  });
}

// Search functionality
function initializeSearch() {
  const searchInput = document.getElementById("officers-search");
  const cards = document.querySelectorAll('.grid > div[class*="bg-white"]');

  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();

    cards.forEach((card) => {
      const name = card.querySelector("h3")?.textContent.toLowerCase() || "";
      const position = card.querySelector("p")?.textContent.toLowerCase() || "";
      const dateJoined = card.querySelector(".text-gray-600:first-child")?.textContent.toLowerCase() || "";
      const socialLinks = card.querySelector(".text-gray-700")?.textContent.toLowerCase() || "";

      const matches = name.includes(searchTerm) || position.includes(searchTerm) || dateJoined.includes(searchTerm) || socialLinks.includes(searchTerm);

      card.style.display = matches ? "" : "none";
    });

    updateEmptyState();
  });
}

// Year filter functionality
function initializeYearFilter() {
  const yearSelect = document.getElementById("year-filter");
  const cards = document.querySelectorAll('.grid > div[class*="bg-white"]');

  if (yearSelect) {
    yearSelect.addEventListener("change", (e) => {
      const selectedYear = e.target.value.toLowerCase();

      cards.forEach((card) => {
        const dateJoined = card.querySelector(".text-gray-600:first-child")?.textContent.toLowerCase() || "";
        const yearMatch = dateJoined.match(/(\d{4})/);
        const cardYear = yearMatch ? yearMatch[1] : "";

        const matches = !selectedYear || cardYear.includes(selectedYear);
        card.style.display = matches ? "" : "none";
      });

      updateEmptyState();
    });
  }
}

// Helper function to update empty state
function updateEmptyState() {
  const cards = document.querySelectorAll('.grid > div[class*="bg-white"]');
  const visibleCards = [...cards].filter((card) => card.style.display !== "none");
  const emptyState = document.querySelector(".col-span-3");

  if (emptyState) {
    emptyState.style.display = visibleCards.length === 0 ? "" : "none";
  }
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
        modal.classList.add("flex");
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
        modal.classList.remove("flex");
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
        modal.classList.remove("flex");
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
