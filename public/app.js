// Video display and posture checking page 

// No imports needed; modules are loaded globally
const video = document.getElementById('webcam');

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
    console.log('Webcam started.');

    // Initialize TensorFlow backend and pose detection
    tf.setBackend('webgl').then(() => {
      console.log('WebGL backend initialized.');
      poseDetection.createDetector(poseDetection.SupportedModels.MoveNet).then((detector) => {
        console.log('Pose detection model loaded.');
        // Use detector here
      });
    });
  })
  .catch((err) => console.error('Error accessing webcam:', err));

const timeIntervals = 10000;

const getEasternTime = () => {
  const now = new Date();

  // Get UTC time
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;

  // Offset for Eastern Standard Time (EST)
  const offset = -5; // EST is UTC-5
  const easternTime = new Date(utcTime + offset * 3600000);

  return easternTime.toLocaleString("en-US", { timeZone: "America/New_York" });  // Adjust format as needed
};

let detector;

const loadModel = async () => {
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
  console.log('Pose Detection Model Loaded');
};

loadModel();

// Create an audio element for the alert sound
const alertSound = new Audio('./slouch_alert.wav'); // Replace with your sound file URL

let isSlouching = false; // Track the user's posture state
let slouchLog = []

const sendLogToServer = async (timestamp) => {
  try {
    const response = await fetch('http://localhost:3000/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ timestamp }),
    });

    if (response.ok) {
      console.log('Log sent to server successfully');
    } else {
      console.error('Error sending log to server:', response.statusText);
    }
  } catch (err) {
    console.error('Error connecting to server:', err);
  }
};

let thresholdPercentage = 50; // Default slider value (percentage)
let thresholdPixels = 0 + (thresholdPercentage / 100) * 150; // Convert to 20-80 pixels range

const slider = document.getElementById('threshold-slider');
const thresholdDisplay = document.getElementById('threshold-display');

// Update threshold value when slider changes
slider.addEventListener('input', (event) => {
  thresholdPercentage = 100 - parseInt(event.target.value); // Slider value (0-100)
  
  // Map slider percentage (0-100) to pixel range (20-80)
  thresholdPixels = 0 + (thresholdPercentage / 100) * 150;

  // Update display
  thresholdDisplay.textContent = `${Math.round(thresholdPixels)} pixels`;
  console.log(`Threshold updated to: ${Math.round(thresholdPixels)} pixels`);
});

const analyzePosture = (keypoints) => {
  const nose = keypoints.find((k) => k.name === 'nose');
  const leftShoulder = keypoints.find((k) => k.name === 'left_shoulder');
  const rightShoulder = keypoints.find((k) => k.name === 'right_shoulder');

  const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

  if (nose.y > avgShoulderY + thresholdPixels) {
    if (!isSlouching) {
      isSlouching = true;
      const timestamp = getEasternTime();
      slouchLog.push(timestamp);
      console.log('Slouching detected at:', timestamp);
      
      // Send log to server
      sendLogToServer(timestamp);

      alertSound.play().catch((err) => console.error('Error playing sound:', err));
      alert('You are slouching! Sit up straight.');
    }
  } else {
    if (isSlouching) {
      isSlouching = false;
      console.log('Good posture detected!');
    }
  }
};

const detectPose = async () => {
  if (detector && video.readyState === 4) {
    const poses = await detector.estimatePoses(video);

    if (poses.length > 0) {
      const keypoints = poses[0].keypoints;

      // Analyze posture using keypoints
      analyzePosture(keypoints);
    }
  }
  requestAnimationFrame(detectPose); // Run detection continuously
};

video.addEventListener('loadeddata', detectPose); // Start detection when the video is ready

const fetchHourlyData = async () => {
  try {
    const response = await fetch('http://localhost:3000/logs/hourly');
    if (response.ok) {
      return await response.json(); // Get hourly data (array of 24 numbers)
    } else {
      console.error('Error fetching hourly data:', response.statusText);
    }
  } catch (err) {
    console.error('Error connecting to server:', err);
  }
};

// Render the chart
const renderChart = async () => {
  const hourlyData = await fetchHourlyData();

  // Generate labels for the past 24 hours
  const now = new Date();
  const labels = Array.from({ length: 24 }, (_, i) => {
    const hour = (now.getHours() - i + 24) % 24; // Handle wrap-around for hours
    return `${hour}:00`;
  }).reverse();

  // Create the Chart.js bar chart
  const ctx = document.getElementById('slouchChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels, // Labels for hours
      datasets: [{
        label: 'Slouches per Hour',
        data: hourlyData, // Data fetched from the backend
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Bar color
        borderColor: 'rgba(75, 192, 192, 1)', // Border color
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true, // Start Y-axis at 0
        },
      },
    },
  });
};

// Call renderChart on page load
renderChart();

