// Initialize on document load
document.addEventListener("DOMContentLoaded", function () {
  initializeSearch();
  initializeYearFilter();
  initializeDropdowns();
});

// Search functionality with client-side filtering
function initializeSearch() {
  const searchInput = document.getElementById("officers-search");
  const cards = document.querySelectorAll('.grid > div[class*="bg-white"]'); // Select all officer cards

  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();

    cards.forEach((card) => {
      const name = card.querySelector("h3")?.textContent.toLowerCase() || "";
      const position = card.querySelector("p")?.textContent.toLowerCase() || "";
      const dateJoined = card.querySelector(".text-gray-600")?.textContent.toLowerCase() || "";
      const socialLinks = card.querySelector(".text-gray-700")?.textContent.toLowerCase() || "";

      const matches = name.includes(searchTerm) || position.includes(searchTerm) || dateJoined.includes(searchTerm) || socialLinks.includes(searchTerm);

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

// Year filter functionality with page refresh
function initializeYearFilter() {
  const yearFilter = document.getElementById("year-filter");
  if (yearFilter) {
    yearFilter.addEventListener("change", (e) => {
      const searchInput = document.getElementById("officers-search");
      const searchValue = searchInput ? searchInput.value : "";

      // Build URL with search and year parameters
      let url = new URL(window.location.href);
      let params = new URLSearchParams(url.search);

      if (e.target.value) {
        params.set("year", e.target.value);
      } else {
        params.delete("year");
      }

      if (searchValue) {
        params.set("search", searchValue);
      }

      // Reset to first page when filtering
      params.delete("page");

      // Navigate to filtered URL
      window.location.href = `${url.pathname}?${params.toString()}`;
    });
  }
}

// Dropdown functionality
function initializeDropdowns() {
  const dropdownButtons = document.querySelectorAll("[data-dropdown-toggle]");

  dropdownButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const targetId = button.getAttribute("data-dropdown-toggle");
      const dropdown = document.getElementById(targetId);

      // Close all other dropdowns first
      document.querySelectorAll('[id^="dropdownDotsOfficer"]').forEach((d) => {
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
    document.querySelectorAll('[id^="dropdownDotsOfficer"]').forEach((dropdown) => {
      if (!dropdown.classList.contains("hidden")) {
        dropdown.classList.add("hidden");
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
