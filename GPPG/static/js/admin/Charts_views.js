//############################################################################################################
// Data for Website Views
const WebsiteViews_ChartData = {
  thisYear: {
    labels: ["Jan", "Feb", "Mar", "Apr", "Jun", "Jul", "Sep", "Nov", "Dec"],
    data: [50, 60, 80, 10, null, 120, 140, 160, 180],
  },
  lastYear: {
    labels: ["Jan", "Mar", "Apr", "May", "Jul", "Sep", "Oct", "Dec"],
    data: [40, 70, 100, 110, null, 130, 150, 170],
  },
};

function WebsiteViews_sumData(data) {
  return data.reduce((sum, value) => sum + (value !== null ? value : 0), 0);
}

const thisYearSum = WebsiteViews_sumData(WebsiteViews_ChartData.thisYear.data);
const lastYearSum = WebsiteViews_sumData(WebsiteViews_ChartData.lastYear.data);

const WebsiteViews_PieData = {
  labels: ["This Year", "Last Year"],
  datasets: [
    {
      data: [thisYearSum, lastYearSum],
      backgroundColor: ["rgba(63,7,3)", "rgba(255, 159, 64, 1)"],
      borderWidth: 0,
    },
  ],
};

const WebsiteViews_ctx = document.getElementById("yearPieChart").getContext("2d");
const WebsiteViews_pieChart = new Chart(WebsiteViews_ctx, {
  type: "pie",
  data: WebsiteViews_PieData,
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "right",
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const total = thisYearSum + lastYearSum;
            const value = tooltipItem.raw;
            const percentage = ((value / total) * 100).toFixed(2);
            return tooltipItem.label + ": " + value + " (" + percentage + "%)";
          },
        },
      },
      datalabels: {
        color: "#fff",
        formatter: function (value, context) {
          const total = thisYearSum + lastYearSum;
          const percentage = ((value / total) * 100).toFixed(2);
          return value + " (" + percentage + "%)";
        },
        font: {
          weight: "bold",
          size: 12,
        },
      },
    },
  },
  plugins: [ChartDataLabels],
});

//############################################################################################################
// Bar Chart for Poaching
// const PoachingChart_ctx = document.getElementById("PoachingChart").getContext("2d");

// // Function to get responsive bar thickness
// function getBarThickness() {
//   return window.innerWidth <= 600 ? 15 : 30;
// }

// // Global chart instance
// let barChart = null;

// // Initial data and labels
// let initialData, initialLabels;

// // Function to initialize or update the chart
// function initializeChart(chartData, labels) {
//   // Create or update the chart
//   if (!barChart) {
//     // Create new chart
//     barChart = new Chart(PoachingChart_ctx, {
//       type: "bar",
//       data: {
//         labels: labels,
//         datasets: [
//           {
//             data: chartData,
//             backgroundColor: "rgba(255, 159, 64, 0.6)",
//             borderColor: "rgba(255, 159, 64, 1)",
//             borderWidth: 1,
//             barThickness: getBarThickness(),
//             borderRadius: 5,
//           },
//         ],
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         layout: {
//           padding: {
//             top: 20,
//             right: 20,
//             bottom: 20,
//             left: 20,
//           },
//         },
//         scales: {
//           y: {
//             beginAtZero: true,
//             ticks: {
//               color: "black",
//               precision: 0,
//             },
//             grid: {
//               display: false,
//             },
//           },
//           x: {
//             ticks: {
//               color: "black",
//             },
//             grid: {
//               display: false,
//             },
//           },
//         },
//         plugins: {
//           legend: {
//             display: false,
//           },
//         },
//         animation: {
//           duration: 1000,
//           easing: "easeInOutQuart",
//         },
//       },
//     });
//   } else {
//     // Update existing chart
//     barChart.data.labels = labels;
//     barChart.data.datasets[0].data = chartData;
//     barChart.update();
//   }

//   // Calculate and display total
//   const totalSum = chartData.reduce((acc, curr) => acc + curr, 0);
//   document.getElementById("totalDisplay").innerText = `Total: ${totalSum}`;
// }

// // Function to fetch chart data
// async function fetchChartData() {
//   try {
//     const response = await fetch("/get-chart-data/");

//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }

//     const data = await response.json();

//     // Sum up incidents for each month across all statuses
//     const monthlyTotals = data.alive_trend.overall.map((_, monthIndex) => Object.values(data).reduce((total, statusData) => total + statusData.overall[monthIndex], 0));

//     // Store initial data and labels
//     initialData = monthlyTotals;
//     initialLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//     return monthlyTotals;
//   } catch (error) {
//     console.error("Error fetching chart data:", error);
//     return new Array(12).fill(0);
//   }
// }

// // Function to update chart with date filtering
// async function updateChart() {
//   const startDateInput = document.getElementById("startDateInput").value;
//   const endDateInput = document.getElementById("endDateInput").value;
//   const startDate = new Date(startDateInput);
//   const endDate = new Date(endDateInput);

//   try {
//     if (startDateInput && endDateInput && startDate <= endDate) {
//       const startMonthIndex = startDate.getMonth();
//       const endMonthIndex = endDate.getMonth();

//       const filteredData = initialData.slice(startMonthIndex, endMonthIndex + 1);
//       const filteredLabels = initialLabels.slice(startMonthIndex, endMonthIndex + 1);

//       // Update chart with filtered data
//       initializeChart(filteredData, filteredLabels);
//     } else {
//       document.getElementById("totalDisplay").innerText = `Invalid Date Range`;
//     }
//   } catch (error) {
//     console.error("Error updating chart:", error);
//   }
// }

// // Function to clear dates and reset chart
// async function clearDates() {
//   // Reset date inputs
//   document.getElementById("startDateInput").value = "";
//   document.getElementById("endDateInput").value = "";

//   // Update chart with full data
//   initializeChart(initialData, initialLabels);
// }

// // Initialize chart on page load
// window.addEventListener("load", async function () {
//   try {
//     const initialData = await fetchChartData();
//     initializeChart(initialData, initialLabels);
//   } catch (error) {
//     console.error("Error initializing chart:", error);
//   }
// });

// // Responsive chart resizing
// window.addEventListener("resize", function () {
//   if (barChart) {
//     barChart.resize();
//   }
// });

//############################################################################################################
// Line Chart Code for Illegal Trades
const IllegalTradeChart_ctx = document.getElementById("IllegalTrade_Chart").getContext("2d");

const IllegalTrade_labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const yearSelect = document.getElementById("yearSelect");

// Initialize the chart
let IllegalTradeGradient = IllegalTradeChart_ctx.createLinearGradient(0, 0, 0, 400);
IllegalTradeGradient.addColorStop(0, "rgba(255, 159, 64, 0.6)");
IllegalTradeGradient.addColorStop(1, "rgba(75, 192, 192, 0)");

const IllegalTradeChartConfig = {
  type: "line",
  data: {
    labels: IllegalTrade_labels,
    datasets: [
      {
        label: "", // Will be set dynamically
        data: [], // Will be set dynamically
        fill: true,
        backgroundColor: IllegalTradeGradient,
        borderColor: "rgba(255, 159, 64, 1)",
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "rgba(255, 159, 64, 0.6)",
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "black",
        },
        grid: {
          display: false,
        },
      },
      x: {
        ticks: {
          color: "black",
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  },
};

let IllegalTradeChart = new Chart(IllegalTradeChart_ctx, IllegalTradeChartConfig);

function fetchDataIllegalTrade() {
  fetch(`/get-chart-data?status=Illegal Trade&period=overall`)
    .then((response) => response.json())
    .then((data) => {
      console.log("Fetched Data:", data);

      const trends = data["illegal trade_trend"];
      if (!trends || !trends.yearly) {
        console.error("Invalid data format:", data);
        return;
      }

      // Populate year dropdown
      const years = Object.keys(trends.yearly).sort(); // Sort years to get the latest easily
      yearSelect.innerHTML = ""; // Clear previous options
      years.forEach((year) => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });

      // Set the default to the most recent year and update the chart
      const mostRecentYear = Math.max(...years.map(Number)); // Find the most recent year
      yearSelect.value = mostRecentYear; // Set the dropdown to the most recent year
      updateChartIllegalTrade(mostRecentYear, trends.yearly[mostRecentYear]);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}


function updateChartIllegalTrade(year, chartData) {
  if (!chartData || !Array.isArray(chartData)) {
    console.error("Invalid data for the selected year:", chartData);
    return;
  }


  IllegalTradeChart.data.datasets[0].data = chartData;
  IllegalTradeChart.data.datasets[0].label = `Illegal Trade - ${year}`;
  IllegalTradeChart.update();
}

// Handle year selection
yearSelect.addEventListener("change", function () {
  const selectedYear = this.value;

  fetch(`/get-chart-data?status=Illegal Trade&period=${selectedYear}`)
    .then((response) => response.json())
    .then((data) => {
      console.log("Data for Selected Year:", data);

      // Ensure the data structure is valid
      const trends = data["illegal trade_trend"];
      if (trends && trends.yearly && selectedYear in trends.yearly) {
        updateChartIllegalTrade(selectedYear, trends.yearly[selectedYear]);
      } else {
        console.error(
          `No data found for the selected year '${selectedYear}' or invalid structure:`,
          trends
        );
        alert(`No data available for the selected year: ${selectedYear}`);
      }
    })
    .catch((error) => {
      console.error("Error fetching data for the selected year:", error);
    });
});


// Initialize the fetch on page load
fetchDataIllegalTrade();


//############################################################################################################
// Bar two Chart Code for Dead and alive
const DeadAliveChartCtx = document.getElementById("DeadAliveChart").getContext("2d");

// Initialize the chart with empty data
let DeadAlive_currentChart = new Chart(DeadAliveChartCtx, {
  type: "bar",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Alive",
        data: [],
        backgroundColor: "rgb(251, 146, 60)",
        borderColor: "rgb(249, 115, 22)",
        borderWidth: 1,
        borderRadius: 10,
      },
      {
        label: "Dead",
        data: [],
        backgroundColor: "rgba(63,7,3)",
        borderColor: "rgba(63,7,3)",
        borderWidth: 1,
        borderRadius: 10,
      },
    ],
  },
  options: {
    maintainAspectRatio: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "black",
        },
        grid: {
          display: false,
        },
      },
      x: {
        ticks: {
          color: "black",
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          padding: 30,
          usePointStyle: true,
          color: "black",
        },
      },
    },
  },
});

// Store the trend data globally
let globalAliveTrend = {};
let globalDeadTrend = {};

// Function to get all unique years from the data
function getUniqueYears(data) {
  const years = new Set();
  
  // Add years from alive trend
  if (data.alive_trend?.yearly) {
    Object.keys(data.alive_trend.yearly).forEach(year => years.add(year));
  }
  
  // Add years from dead trend
  if (data.dead_trend?.yearly) {
    Object.keys(data.dead_trend.yearly).forEach(year => years.add(year));
  }
  
  return Array.from(years).sort();
}

// Fetch data from API and populate chart options dynamically
function fetchDataDeadAlive() {
  fetch(`/get-chart-data?status=Dead,Alive&period=overall`)
    .then((response) => response.json())
    .then((data) => {
      console.log("Fetched Data:", data);

      // Store the trend data globally
      globalAliveTrend = data.alive_trend?.yearly || {};
      globalDeadTrend = data.dead_trend?.yearly || {};
      
      // Get all unique years
      const availableYears = getUniqueYears(data);

      // Populate the year dropdown
      const yearSelect = document.getElementById("DeadAlive_yearSelector");
      // Clear existing options first
      yearSelect.innerHTML = '';
      
      availableYears.forEach((year) => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });

      // Set initial data for the most recent year
      if (availableYears.length > 0) {
        const mostRecentYear = Math.max(...availableYears);
        yearSelect.value = mostRecentYear;
        updateChartData(mostRecentYear);
      }
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

// Update chart data for the selected year
function updateChartData(selectedYear) {
  // Initialize arrays with zeros
  const emptyData = new Array(12).fill(0);
  
  // Get data for the selected year or use zeros if not available
  const aliveData = globalAliveTrend[selectedYear] || emptyData;
  const deadData = globalDeadTrend[selectedYear] || emptyData;

  // Update the chart
  DeadAlive_currentChart.data.datasets[0].data = aliveData;
  DeadAlive_currentChart.data.datasets[1].data = deadData;
  DeadAlive_currentChart.update();
}

// Event listener for year selection
document.getElementById("DeadAlive_yearSelector").addEventListener("change", function () {
  const selectedYear = this.value;
  updateChartData(selectedYear);
});

// Fetch data on page load
fetchDataDeadAlive();

//############################################################################################################
// Horizontal Chart for Found Scales

const FoundScales_ctx = document.getElementById("FoundScales_horizontalBarChart").getContext("2d");
const FoundScales_labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let FoundScales_filteredData = {};

// Function to filter and organize the data for the chart
function FoundScales_filterData(data, labels) {
  const filteredData = [];
  const filteredLabels = [];

  // Only add non-zero data points
  data.forEach((value, index) => {
    if (value !== 0) {
      filteredData.push(value);
      filteredLabels.push(labels[index]);
    }
  });

  // If no data points, return empty arrays
  return {
    filteredData: filteredData.length ? filteredData : [],
    filteredLabels: filteredLabels.length ? filteredLabels : [],
  };
}

// Initial chart configuration
const chartData = {
  labels: [], // Will be updated dynamically
  datasets: [
    {
      label: "Data",
      data: [],
      backgroundColor: "rgb(251, 146, 60)",
      borderRadius: 10,
    },
  ],
};

const config = {
  type: "bar",
  data: chartData,
  options: {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "black",
        },
        grid: {
          display: false,
        },
      },
      x: {
        beginAtZero: true,
        ticks: {
          color: "black",
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  },
};

const horizontalBarChart = new Chart(FoundScales_ctx, config);

// Fetch data dynamically from API
async function fetchAndProcessData() {
  try {
    const response = await fetch("/get-chart-data?status=Scales&period=overall");
    const data = await response.json();

    // Ensure scales_trend exists
    if (!data.scales_trend) {
      console.error("Scales trend data not available.");
      data.scales_trend = {
        yearly: {},
      };
    }

    // Get year select element
    const yearSelect = document.getElementById("FoundScales_yearSelect");

    // Clear existing options
    yearSelect.innerHTML = "";

    // Process and add yearly data
    const years = Object.keys(data.scales_trend.yearly).sort(); // Get sorted years
    years.forEach((year) => {
      const filteredYearData = FoundScales_filterData(data.scales_trend.yearly[year], FoundScales_labels);
      FoundScales_filteredData[year] = filteredYearData;

      // Add year to select options
      const yearOption = document.createElement("option");
      yearOption.value = year;
      yearOption.textContent = year;
      yearSelect.appendChild(yearOption);
    });

    // Trigger initial chart update with the most recent year if available
    if (years.length > 0) {
      const mostRecentYear = Math.max(...years.map(Number)); // Get the most recent year
      yearSelect.value = mostRecentYear; // Set the dropdown to the most recent year
      updateChartScales(mostRecentYear); // Update the chart with the most recent year's data
    }
  } catch (error) {
    console.error("Error fetching data:", error);

    // Provide fallback data
    FoundScales_filteredData = {};
    updateChartScales(null);
  }
}

// Function to update chart data based on the selected year
function updateChartScales(selectedYear) {
  const selectedData = selectedYear ? FoundScales_filteredData[selectedYear] || { filteredData: [], filteredLabels: [] } : { filteredData: [], filteredLabels: [] };

  // Only update and render if there's data
  if (selectedData.filteredData.length) {
    horizontalBarChart.data.labels = selectedData.filteredLabels;
    horizontalBarChart.data.datasets[0].data = selectedData.filteredData;
    horizontalBarChart.data.datasets[0].label = `${selectedYear} Data`;
    horizontalBarChart.update();
  } else {
    // Clear the chart or show a "No data" message
    horizontalBarChart.data.labels = [];
    horizontalBarChart.data.datasets[0].data = [];
    horizontalBarChart.data.datasets[0].label = "No Data Available";
    horizontalBarChart.update();
  }
}

// Event listener for year selection
document.getElementById("FoundScales_yearSelect").addEventListener("change", function () {
  const selectedYear = this.value;
  updateChartScales(selectedYear);
});

// Initial data fetch
document.addEventListener("DOMContentLoaded", fetchAndProcessData);
