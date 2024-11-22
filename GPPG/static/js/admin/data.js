// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Get references to important elements
  const exportButton = document.getElementById("exportButton");
  const table = document.getElementById("pangolinsTable");
  const statusCheckboxes = document.querySelectorAll('#dropdownDefaultCheckbox input[type="checkbox"]');

  // Add click event listener to the export button
  exportButton.addEventListener("click", exportData);

  function exportData() {
    // Get all rows from the table body
    const rows = Array.from(table.querySelectorAll("tbody tr"));

    // Get selected statuses
    const selectedStatuses = Array.from(statusCheckboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    // Filter rows based on selected statuses
    const filteredRows = rows.filter((row) => {
      const status = row.querySelector("td:nth-child(3)").textContent;
      return selectedStatuses.length === 0 || selectedStatuses.includes(status);
    });

    // Convert filtered rows to CSV format
    const csvContent = convertToCSV(filteredRows);

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create a download link and trigger the download
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "pangolins_export.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  function convertToCSV(rows) {
    const headers = Array.from(table.querySelectorAll("thead th"))
      .map((th) => th.textContent.trim())
      .slice(0, -1); // Exclude the "Action" column

    const csvRows = rows.map((row) => {
      return Array.from(row.querySelectorAll("td"))
        .map((td) => td.textContent.trim())
        .slice(0, -1) // Exclude the "Action" column
        .map((text) => `"${text.replace(/"/g, '""')}"`) // Escape double quotes
        .join(",");
    });

    return [headers.join(","), ...csvRows].join("\n");
  }

  // Initialize the status filter dropdown
  const dropdownButton = document.getElementById("dropdownCheckboxButton");
  const dropdownMenu = document.getElementById("dropdownDefaultCheckbox");

  dropdownButton.addEventListener("click", () => {
    dropdownMenu.classList.toggle("hidden");
  });

  // Close the dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.add("hidden");
    }
  });

  // Update the dropdown button text based on selected checkboxes
  statusCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateDropdownText);
  });

  function updateDropdownText() {
    const selectedStatuses = Array.from(statusCheckboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    if (selectedStatuses.length === 0) {
      dropdownButton.textContent = "All";
    } else if (selectedStatuses.length === statusCheckboxes.length) {
      dropdownButton.textContent = "All";
    } else {
      dropdownButton.textContent = `${selectedStatuses.length} selected`;
    }
  }
});
