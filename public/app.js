// Select the video element from the HTML
const video = document.createElement('video');
video.setAttribute('autoplay', '');
video.setAttribute('playsinline', '');
document.body.appendChild(video);

// Access the webcam
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error('Error accessing webcam:', err);
  });

const timeIntervals = 10000;

setInterval(() => {
  // Mock detection logic (replace with actual analysis later)
  const slouching = Math.random() > 0.5; // Simulate random slouching detection

  if (slouching) {
    console.log('You are slouching! Sit up straight!');
    alert('You are slouching! Sit up straight!');
  }
}, timeIntervals);

const postureHistory = []; // To store posture data

setInterval(() => {
  const timestamp = new Date().toLocaleTimeString();
  const slouching = Math.random() > 0.5;

  postureHistory.push({ timestamp, slouching });

  console.log(postureHistory);
}, timeIntervals);
