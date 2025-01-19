// Video display and posture checking page 

// No imports needed; modules are loaded globally
const video = document.createElement('video');
video.setAttribute('autoplay', '');
video.setAttribute('playsinline', '');
document.body.appendChild(video);

// Apply CSS to mirror the video
video.style.transform = 'scaleX(-1)';
video.style.height = 'auto'; // Optional: Maintain aspect ratio

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
      const timestamp = new Date().toISOString();
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
