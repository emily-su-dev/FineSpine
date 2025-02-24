  auth0.createAuth0Client({
    domain: "REPLACE WITH DOMAIN", // Replace with domain 
    clientId: "REPLACE WITH CLIENT ID", // Replace with client ID 
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  }).then(async (auth0Client) => {
    // Assumes a button with id "login" in the DOM
    const loginButton = document.getElementById("login");
    const logoutButton = document.getElementById("logout");
    const getStartedButton = document.getElementById("start");
    const camButton = document.getElementById("webcam"); 

    loginButton.addEventListener("click", (e) => {
      e.preventDefault();
      auth0Client.loginWithRedirect();
    });

    logoutButton.addEventListener("click", (e) => {
      e.preventDefault();
      auth0Client.logout({
        returnTo: window.location.origin // Redirect to home after logout
      });
    });

    getStartedButton.addEventListener("click", (e) => {
      e.preventDefault();
      auth0Client.loginWithRedirect();
    });

    // Handle redirect callback if applicable
    if (location.search.includes("state=") && 
        (location.search.includes("code=") || 
        location.search.includes("error="))) {
      await auth0Client.handleRedirectCallback();
      window.history.replaceState({}, document.title, "/");
    }

    const isAuthenticated = await auth0Client.isAuthenticated();

    // Conditionally render buttons and profile
    if (isAuthenticated) {
      loginButton.style.display = "none"; // Hide login button
      logoutButton.style.display = "block"; // Show logout button
      getStartedButton.style.display = "none"; // Hide get started button 
      camButton.style.display = "block"; // Show webcam page redirect button 
    } else {
      loginButton.style.display = "block"; // Show login button
      logoutButton.style.display = "none"; // Hide logout button
      getStartedButton.style.display = "block"; // Show get started button 
      camButton.style.display = "none"; // Hide webcam page redirect button 
    }
  });
