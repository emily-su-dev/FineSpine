// Create Auth0 client 
auth0.createAuth0Client({
  domain: "dev-4og5oz66ye0htgcp.us.auth0.com",
  clientId: "zhHeAAONqHM6lzrgcp4u7oYp5T0UGWQo",
  authorizationParams: {
    redirect_uri: window.location.origin
  }
}).then(async (auth0Client) => {
  // Assumes a button with id "login" in the DOM
  const loginButton = document.getElementById("login");

  loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    auth0Client.loginWithRedirect();
  });

  if (location.search.includes("state=") && 
      (location.search.includes("code=") || 
      location.search.includes("error="))) {
    await auth0Client.handleRedirectCallback();
    window.history.replaceState({}, document.title, "/");
  }

  // Assumes a button with id "logout" in the DOM
  const logoutButton = document.getElementById("logout");

  logoutButton.addEventListener("click", (e) => {
    e.preventDefault();
    auth0Client.logout();
  });

  const isAuthenticated = await auth0Client.isAuthenticated();
  const userProfile = await auth0Client.getUser();

  // Assumes an element with id "profile" in the DOM
  const profileElement = document.getElementById("profile");

  if (isAuthenticated) {
    profileElement.style.display = "block";
    profileElement.innerHTML = `
            <p>${userProfile.name}</p>
            <img src="${userProfile.picture}" />
          `;
  } else {
    profileElement.style.display = "none";
  }
});


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

// Create an audio element for the alert sound
const alertSound = new Audio('./slouch_alert.wav'); // Replace with your sound file URL

let isSlouching = false; // Track the user's posture state

const analyzePosture = (keypoints) => {
  const nose = keypoints.find((k) => k.name === 'nose');
  const leftShoulder = keypoints.find((k) => k.name === 'left_shoulder');
  const rightShoulder = keypoints.find((k) => k.name === 'right_shoulder');

  // Calculate average shoulder height
  const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

  // Check if the nose is significantly lower than shoulders (indicating slouching)
  if (nose.y > avgShoulderY + 40) { // Adjust threshold as needed
    if (!isSlouching) {
      isSlouching = true; // Update state
      console.log('Slouching detected!');
      
      // Play the alert sound
      alertSound.play().catch((err) => console.error('Error playing sound:', err));

      // Show an alert box
      alert('You are slouching! Sit up straight.');
    }
  } else {
    if (isSlouching) {
      isSlouching = false; // Reset state
      console.log('Good posture detected!');
    }
  }
};


// const postureHistory = []; // To store posture data

// setInterval(() => {
//     const timestamp = new Date().toLocaleTimeString();
//     const slouching = Math.random() > 0.5;

//     postureHistory.push({ timestamp, slouching });

//     console.log(postureHistory);
// }, timeIntervals);
