// Create Auth0 client 
auth0.createAuth0Client({
    domain: "dev-4og5oz66ye0htgcp.us.auth0.com",
    clientId: "BpDLWPnET9va689Hnl6XSpOBM1SwKC14",
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  }).then(async (auth0Client) => {
    // Assumes a button with id "login" in the DOM
    const loginButton = document.querySelector(".login-btn");
  
    loginButton.addEventListener("click", (e) => {
      e.preventDefault();
      auth0Client.loginWithRedirect();
    });
  
    // Assumes a button with id "start" in the DOM
    const getStartedButton = document.querySelector(".login-btn");
  
    getStartedButton.addEventListener("click", (e) => {
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
    // Use if logout button differs from login 

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
        // Update button to "Log Out"
        // Use if login button is same as logout button 

        // loginButton.innerText = "Log Out";
        // loginButton.onclick = async (e) => {
        //     e.preventDefault();
        //     await auth0Client.logout();
        // }; 

        // Toggle login/logout button?
        loginButton.style.display = "none";
        logoutButton.style.display = "block";
        getStartedButton.style.display = "none";

        // Richer user profile interface 
        profileElement.style.display = "block";
        profileElement.innerHTML = `
              <p>${userProfile.name}</p>
              <img src="${userProfile.picture}" />
            `;
    } else {  
        // loginButton.innerText = "Log In";
        // loginButton.onclick = async (e) => {
        //     e.preventDefault();
        //     await auth0Client.loginWithRedirect();
        // };

        loginButton.style.display = "block";
        logoutButton.style.display = "none";
        getStartedButton.style.display = "block";

        profileElement.style.display = "none";
    }
  });
