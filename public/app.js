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

// setInterval(() => {
//     // Mock detection logic (replace with actual analysis later)
//     const slouching = Math.random() > 0.5; // Simulate random slouching detection

//     if (slouching) {
//         console.log('You are slouching! Sit up straight!');
//         alert('You are slouching! Sit up straight!');
//     }
// }, timeIntervals);

// const postureHistory = []; // To store posture data

// setInterval(() => {
//     const timestamp = new Date().toLocaleTimeString();
//     const slouching = Math.random() > 0.5;

//     postureHistory.push({ timestamp, slouching });

//     console.log(postureHistory);
// }, timeIntervals);



let detector;

const loadModel = async () => {
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
  console.log('Pose Detection Model Loaded');
};

loadModel();

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

const analyzePosture = (keypoints) => {
  const nose = keypoints.find((k) => k.name === 'nose');
  const leftShoulder = keypoints.find((k) => k.name === 'left_shoulder');
  const rightShoulder = keypoints.find((k) => k.name === 'right_shoulder');

  // Calculate average shoulder height
  const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

  // Check if nose is significantly lower than shoulders (indicating slouching)
  if (nose.y > avgShoulderY + 50) { // Adjust the threshold as needed
    console.log('Slouching detected!');
    alert('You are slouching! Sit up straight.');
  } else {
    console.log('Good posture!');
  }
};
