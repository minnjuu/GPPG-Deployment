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
document.addEventListener("DOMContentLoaded", function () {
  const ctx = document.getElementById("IllegalTrade_Chart").getContext("2d");
  const yearSelect = document.getElementById("yearSelect");

  let gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, "rgba(255, 159, 64, 0.6)");
  gradient.addColorStop(1, "rgba(75, 192, 192, 0)");

  const chartConfig = {
    type: "line",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [
        {
          label: "",
          data: [],
          fill: true,
          backgroundColor: gradient,
          borderColor: "rgba(255, 159, 64, 1)",
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "rgba(255, 159, 64, 0.8)",
          pointBorderColor: "rgba(255, 159, 64, 1)",
          pointHoverRadius: 8,
          pointHoverBackgroundColor: "rgba(255, 159, 64, 1)",
          borderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: false,
            color: "rgba(0,0,0,0.1)",
            drawBorder: false,
          },
          ticks: {
            color: "rgba(0,0,0,0.7)",
            font: {
              size: 12,
              family: "'Bahnschrift', sans-serif",
            },
            padding: 10,
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "rgba(0,0,0,0.7)",
            font: {
              size: 12,
              family: "'Bahnschrift', sans-serif",
            },
            padding: 5,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.8)",
          titleFont: {
            size: 13,
            family: "'Bahnschrift', sans-serif",
          },
          bodyFont: {
            size: 12,
            family: "'Bahnschrift', sans-serif",
          },
          padding: 12,
          cornerRadius: 8,
        },
      },
    },
  };

  let chart = new Chart(ctx, chartConfig);

  // Fetch and update data functions
  async function fetchData() {
    try {
      const response = await fetch("/get-chart-data?status=Illegal Trade&period=overall");
      const data = await response.json();

      if (!data["illegal trade_trend"]?.yearly) {
        throw new Error("Invalid data format");
      }

      // Update year select options
      const years = Object.keys(data["illegal trade_trend"].yearly).sort();
      yearSelect.innerHTML = years.map((year) => `<option value="${year}">${year}</option>`).join("");

      // Set most recent year
      const mostRecentYear = Math.max(...years.map(Number));
      yearSelect.value = mostRecentYear;

      updateChart(mostRecentYear, data["illegal trade_trend"].yearly[mostRecentYear]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  function updateChart(year, data) {
    if (!Array.isArray(data)) return;

    chart.data.datasets[0].data = data;
    chart.data.datasets[0].label = `Illegal Trade - ${year}`;
    chart.update("show");
  }

  // Event listeners
  yearSelect.addEventListener("change", async function () {
    try {
      const response = await fetch(`/get-chart-data?status=Illegal Trade&period=${this.value}`);
      const data = await response.json();

      if (data["illegal trade_trend"]?.yearly?.[this.value]) {
        updateChart(this.value, data["illegal trade_trend"].yearly[this.value]);
      }
    } catch (error) {
      console.error("Error updating chart:", error);
    }
  });

  // Initialize
  fetchData();
});

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

let globalAliveTrend = {};
let globalDeadTrend = {};

// Function to get all unique years from the data
function getUniqueYears(data) {
  const years = new Set();

  // Add years from alive trend
  if (data.alive_trend?.yearly) {
    Object.keys(data.alive_trend.yearly).forEach((year) => years.add(year));
  }

  // Add years from dead trend
  if (data.dead_trend?.yearly) {
    Object.keys(data.dead_trend.yearly).forEach((year) => years.add(year));
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
      yearSelect.innerHTML = "";

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
// Vertical Bar Chart for Found Scales

const FoundScales_ctx = document.getElementById("FoundScales_verticalBarChart").getContext("2d");
const FoundScales_labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let FoundScales_filteredData = {};

// Function to filter and organize the data for the chart
function FoundScales_filterData(data, labels) {
  // Instead of filtering out zero values, return the full 12-month array
  const fullYearData = labels.map((_, index) => data[index] || 0);

  return {
    filteredData: fullYearData,
    filteredLabels: labels,
  };
}

const chartData = {
  labels: FoundScales_labels,
  datasets: [
    {
      label: "Data",
      data: Array(12).fill(0),
      backgroundColor: "rgb(255, 165, 0)",
      borderRadius: 10,
    },
  ],
};

const config = {
  type: "bar", // Changed to bar chart
  data: chartData,
  options: {
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

const verticalBarChart = new Chart(FoundScales_ctx, config);

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
  const selectedData = selectedYear
    ? FoundScales_filteredData[selectedYear] || { filteredData: Array(12).fill(0), filteredLabels: FoundScales_labels }
    : { filteredData: Array(12).fill(0), filteredLabels: FoundScales_labels };

  // Always update with full 12-month labels and data
  verticalBarChart.data.labels = FoundScales_labels;
  verticalBarChart.data.datasets[0].data = selectedData.filteredData;
  verticalBarChart.data.datasets[0].label = selectedYear ? `${selectedYear} Data` : "No Data Available";
  verticalBarChart.update();
}

// Event listener for year selection
document.getElementById("FoundScales_yearSelect").addEventListener("change", function () {
  const selectedYear = this.value;
  updateChartScales(selectedYear);
});

// Initial data fetch
document.addEventListener("DOMContentLoaded", fetchAndProcessData);
