var highlight;
var isSearching = false;
var isClickActive = false;

// Function to search for a municipality
function searchMunicipality(event) {
  event.preventDefault();
  const searchValue = document.getElementById("search-dropdown").value.toLowerCase();
  let foundFeature = null;

  // Show loading animation
  showLoading();

  vectorLayer.getSource().forEachFeature(function (feature) {
    const properties = feature.getProperties();
    const name = properties.name || properties.ADM3_EN || "";
    if (name.toLowerCase() === searchValue) {
      foundFeature = feature;
    }
  });

  if (foundFeature) {
    const geometry = foundFeature.getGeometry();
    const centroid = ol.extent.getCenter(geometry.getExtent());
    map.getView().fit(geometry.getExtent(), { duration: 1000, maxZoom: 10 });
    console.log("Zoomed to municipality:", searchValue);

    featureOverlay.getSource().clear();
    featureOverlay.getSource().addFeature(foundFeature);

    const properties = foundFeature.getProperties();
    const regionName = properties.name || properties.ADM3_EN || "Unknown Region";

    // Fetch data for the selected municipality
    fetchMunicipalityData(regionName);

    const infoElement = document.createElement("div");
    infoElement.innerHTML = `
      <div class="bg-white p-5 rounded-2xl relative shadow-2xl">
      <button onclick="removeOverlay()" class="absolute top-2 right-2 m-1 text-sm">&times;</button>
      <div class="text-center mb-5">
        <p class="font-bold">${regionName}</p>
        <div class="text-sm mt-2">
          <p class="font-semibold">Poaching Incidents Recorded:</p>
          <p class="text-2xl font-bold text-orange-600" id="total-text">Loading...</p>
        </div>
        <p class="text-sm text-gray-600" id="percentage-text">Loading...</p>
      </div>
      <canvas id="donutchart" width="220" height="220"></canvas>
    </div>
    `;
    overlay.setElement(infoElement);
    overlay.setPosition(centroid);

    isSearching = true;
  } else {
    
    showError("Municipality not found. Please try again.");
  }
  hideLoading();
}

// Error message display function
function showError(message) {
  // Create error message element if it doesn’t exist
  let errorElement = document.getElementById("error-message");
  if (!errorElement) {
    errorElement = document.createElement("div");
    errorElement.id = "error-message";
    errorElement.className = "fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-3 rounded shadow-lg";
    document.body.appendChild(errorElement);
  }

  errorElement.textContent = message;
  errorElement.style.display = "block";
  setTimeout(() => {
    errorElement.style.display = "none";
  }, 3000);
}


// Function to remove highlight from the municipality
function removeHighlight() {
  featureOverlay.getSource().clear();
  overlay.setPosition(undefined);
  isSearching = false;
  isClickActive = false;
}

// Function to show loading animation
function showLoading() {
  const loadingElement = document.getElementById("loading-animation");
  if (loadingElement) {
    loadingElement.classList.remove("hidden");
    loadingElement.innerHTML =
      '<div class="flex items-center absolute inset-0 md:ml-72 justify-center "><div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div></div>';
  }
}

// Function to hide loading animation
function hideLoading() {
  const loadingElement = document.getElementById("loading-animation");
  if (loadingElement) {
    loadingElement.classList.add("hidden");
    loadingElement.innerHTML = "";
  }
}
let municipalityData = {};
// Function to fetch the incident data for a specific municipality
let totalIncidents = 0;

// Modify the fetchMunicipalityData function to calculate percentages
function fetchMunicipalityData(municity) {
  fetch(`/get-municity-data/`)
    .then(response => response.json())
    .then(data => {
      // Calculate total incidents across all municipalities first
      let totalIncidents = 0;
      Object.values(data).forEach(municipalityData => {
        if (municipalityData) {
          totalIncidents += municipalityData.dead + 
                            municipalityData.alive + 
                            municipalityData.scales + 
                            municipalityData.illegalTrades;
        }
      });

      const municipalityData = data[municity];
      if (municipalityData) {
        // Calculate total for this municipality
        const municipalityTotal = municipalityData.dead + 
                                  municipalityData.alive + 
                                  municipalityData.scales + 
                                  municipalityData.illegalTrades;
        
        // Add total and percentage to the municipality data object
        municipalityData.municipalityTotal = municipalityTotal;
        municipalityData.percentage = ((municipalityTotal / totalIncidents) * 100).toFixed(2);

        createDoughnutChart(municipalityData);
      } else {
        createDoughnutChart(null);
      }
    })
    .catch(error => {
      console.error("Error fetching municipality data:", error);
    });
}

// Update the overlay HTML creation in both click and pointermove events
function createOverlayHTML(regionName, coordinate) {
  const infoElement = document.createElement("div");
  infoElement.innerHTML = `
    <div class="bg-white p-5 rounded-2xl relative shadow-2xl">
      <button onclick="removeOverlay()" class="absolute top-2 right-2 m-1 text-sm">&times;</button>
      <div class="text-center mb-5">
        <p class="font-bold">${regionName}</p>
        <div class="text-sm mt-2">
          <p class="font-semibold">Poaching Incidents Recorded:</p>
          <p class="text-2xl font-bold text-orange-600" id="total-text">Loading...</p>
        </div>
        <p class="text-sm text-gray-600" id="percentage-text">Loading...</p>
      </div>
      <canvas id="donutchart" width="220" height="220"></canvas>
    </div>
  `;
  return infoElement;
}

let chartInstance; 

function createDoughnutChart(municipalityData) {
  const ctx = document.getElementById("donutchart").getContext("2d");
  const percentageElement = document.getElementById("percentage-text");
  const totalElement = document.getElementById("total-text");

  // Clear the canvas before rendering new content
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Check if municipalityData is null or empty
  if (!municipalityData || Object.values(municipalityData).every(value => value === 0 || typeof value === 'string')) {
    // Display "No recorded incidents" message
    ctx.font = "bold 15px Roboto";
    ctx.fillStyle = "gray";
    ctx.textAlign = "center";
    const message = "No poaching incidents recorded\nin this area";
    const lines = message.split("\n");

    // Adjust y position for multi-line text
    lines.forEach((line, index) => {
      ctx.fillText(line, ctx.canvas.width / 2, ctx.canvas.height / 2 - 10 + index * 20);
    });
    
    if (percentageElement) {
      percentageElement.innerHTML = "0% of total incidents";
      totalElement.innerHTML = "0";
    }
    return;
  }

  // Update percentage text
  if (percentageElement) {
    percentageElement.innerHTML = `<span class='font-bold'>${municipalityData.percentage}%</span> of total incidents`;
    totalElement.innerHTML = `<span class='font-bold'>${municipalityData.municipalityTotal}</span>`;
  }

  // Prepare the data
  const dataValues = [municipalityData.dead, municipalityData.alive, municipalityData.scales, municipalityData.illegalTrades];
  const total = dataValues.reduce((sum, value) => sum + value, 0);

  // If a chart instance already exists, destroy it before creating a new one
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Create a new chart instance
  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Dead", "Alive", "Scales", "Illegal Trades"],
      datasets: [
        {
          data: dataValues,
          backgroundColor: ["#ffa500", "#008000", "#8b4513", "#a52a2a"],
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 10,
            usePointStyle: true,
            color: "#000",
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw;
              if (total > 0) {
                const percentage = ((value / total) * 100).toFixed(2);
                return `${context.label}: (${percentage}%)`;
              }
              return `${context.label}: ${value}`;
            },
          },
        },
        datalabels: {
          color: "white",
          formatter: (value) => `${value}`,
          font: { weight: "semibold"},
          align: "center",
          anchor: "center",
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}



// Create a map instance
var map = new ol.Map({
  target: "map",
  layers: [],
  view: new ol.View({
    center: ol.proj.fromLonLat([118.7384, 9.8349]),
    zoom: 1,
    minZoom: 2,
    maxZoom: 18,
    extent: ol.proj.transformExtent([114, 7.5, 124.5, 25], "EPSG:4326", "EPSG:3857"),
  }),
});

showLoading();

map.on("rendercomplete", function () {
  hideLoading();
});

// Define a vector layer to load GeoJSON
var vectorLayer = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: "/static/maps/Municipals.geojson",
    format: new ol.format.GeoJSON(),
  }),
  style: function (feature) {
    const regionName = feature.get("ADM3_EN");
    feature.set("data", municipalityData[regionName] || "No data available");

    return new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: "#ff8c00",
        width: 0.5,
      }),
      fill: new ol.style.Fill({
        color: "rgba(255, 140, 0, 0.3)",
      }),
    });
  },
});

map.addLayer(vectorLayer);

// Overlay for displaying information about the municipality
var overlay = new ol.Overlay({
  element: document.createElement("div"),
  positioning: "bottom-center",
  stopEvent: false,
  offset: [0, -10],
});
map.addOverlay(overlay);

// Highlight style for hovered municipality
var highlightStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: "#ff0000",
    width: 0.5,
  }),
  fill: new ol.style.Fill({
    color: "rgba(255, 0, 0, 0.1)",
  }),
});

// Feature overlay for highlighting municipalities
var featureOverlay = new ol.layer.Vector({
  source: new ol.source.Vector(),
  map: map,
  style: highlightStyle,
});

// Map pointer move event to highlight features
map.on("click", function (evt) {
  var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });

  if (feature) {
    isClickActive = true;

    const properties = feature.getProperties();
    const regionName = properties.name || properties.ADM3_EN || "Unknown Region";
    const geometry = feature.getGeometry();
    const centroid = ol.extent.getCenter(geometry.getExtent());

    featureOverlay.getSource().clear();
    featureOverlay.getSource().addFeature(feature);

    overlay.setElement(createOverlayHTML(regionName));
    overlay.setPosition(centroid);
    
    fetchMunicipalityData(regionName);
  } else {
    removeOverlay();
  }
});

// Update the pointermove event handler
map.on("pointermove", function (evt) {
  if (isSearching || isClickActive) return;

  var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });

  if (feature !== highlight) {
    if (highlight) {
      featureOverlay.getSource().removeFeature(highlight);
    }
    if (feature) {
      featureOverlay.getSource().addFeature(feature);
      const properties = feature.getProperties();
      const regionName = properties.name || properties.ADM3_EN || "Unknown Region";

      overlay.setElement(createOverlayHTML(regionName));
      overlay.setPosition(evt.coordinate);
      fetchMunicipalityData(regionName);
    } else {
      overlay.setPosition(undefined);
    }
    highlight = feature;
  }
});


function removeOverlay() {
  overlay.setPosition(undefined);
  featureOverlay.getSource().clear();
  highlight = null;
  selectedFeature = null;
  isClickActive = false;
  isSearching = false;
}
