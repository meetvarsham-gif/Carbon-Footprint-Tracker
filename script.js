function calculateDetailedFootprint({ kmPerDay, electricity, gas, diet, flights }) {
  // Processes data entries matching decimal inputs accurately
  const transportAnn = kmPerDay * 0.21 * 365; 
  const electricAnn = electricity * 0.5 * 12; 
  const gasAnn = gas * 2.3 * 12; 
  const dietAnn = { "vegetarian": 800, "mixed": 1500, "meat-heavy": 2500 }[diet];
  const flightAnn = flights * 250;

  const totalKg = transportAnn + electricAnn + gasAnn + dietAnn + flightAnn;
  const totalTons = totalKg / 1000;

  return {
    total: parseFloat(totalTons.toFixed(2)),
    breakdown: {
      transport: parseFloat((transportAnn / 1000).toFixed(2)),
      utilities: parseFloat(((electricAnn + gasAnn) / 1000).toFixed(2)),
      diet: parseFloat((dietAnn / 1000).toFixed(2)),
      aviation: parseFloat((flightAnn / 1000).toFixed(2))
    }
  };
}

const formElement = document.getElementById('trackerForm');
if (formElement) {
  formElement.addEventListener('submit', function (e) {
    e.preventDefault();

    // Uses parseFloat to securely process decimal input measurements
    const inputs = {
      kmPerDay: parseFloat(document.getElementById('kmPerDay').value) || 0,
      electricity: parseFloat(document.getElementById('electricity').value) || 0,
      gas: parseFloat(document.getElementById('gas').value) || 0,
      diet: document.getElementById('diet').value,
      flights: parseFloat(document.getElementById('flights').value) || 0
    };

    const calculated = calculateDetailedFootprint(inputs);
    const username = localStorage.getItem("currentUser");
    const historyKey = `carbonHistory_${username}`;
    const historicalRecords = JSON.parse(localStorage.getItem(historyKey) || "[]");

    const recordEntry = {
      date: new Date().toLocaleDateString(),
      ...inputs,
      footprint: calculated.total,
      breakdown: calculated.breakdown
    };

    historicalRecords.push(recordEntry);
    localStorage.setItem(historyKey, JSON.stringify(historicalRecords));

    updateDashboardData();
    alert("Metrics calculated and logged successfully!");
  });
}

let footprintPieChart = null;

function updateDashboardData() {
  const username = localStorage.getItem("currentUser");
  const historyKey = `carbonHistory_${username}`;
  const records = JSON.parse(localStorage.getItem(historyKey) || "[]");

  if (records.length === 0) return;

  const latestRecord = records[records.length - 1];
  
  if(document.getElementById('latestScore')) {
    document.getElementById('latestScore').textContent = latestRecord.footprint;
  }
  
  if(document.getElementById('ecoBadge')) {
    let badgeText = "OPTIMAL // ECO WARRIOR";
    let badgeColor = "#00ff87"; 
    
    if (latestRecord.footprint > 5 && latestRecord.footprint <= 12) {
      badgeText = "WARNING // AVERAGE CARBON EMITTER";
      badgeColor = "#ff9f43"; 
    } else if (latestRecord.footprint > 12) {
      badgeText = "CRITICAL // HEAVY ENVIRONMENT IMPACT";
      badgeColor = "#ff4757"; 
    }
    
    const badgeElem = document.getElementById('ecoBadge');
    badgeElem.textContent = badgeText;
    badgeElem.style.color = badgeColor;
    badgeElem.style.textShadow = `0 0 10px ${badgeColor}`;
  }

  const ctx = document.getElementById('distributionChart');
  if (ctx) {
    const dataObj = latestRecord.breakdown || { transport: 0, utilities: 0, diet: 0, aviation: 0 };
    
    if (footprintPieChart) {
      footprintPieChart.destroy();
    }

    footprintPieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Transport', 'Electricity & Gas', 'Diet Footprint', 'Aviation Flights'],
        datasets: [{
          data: [dataObj.transport, dataObj.utilities, dataObj.diet, dataObj.aviation],
          backgroundColor: ['#00f2fe', '#4facfe', '#ff9f43', '#ff4757'],
          borderColor: '#060913',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { 
            position: 'bottom',
            labels: { color: '#e2e8f0', font: { family: 'Rajdhani', size: 13 } }
          }
        }
      }
    });
  }
}