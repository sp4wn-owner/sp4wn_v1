var name;
var connectedUser;
var otheruser;
var activecss;
var activejs;
let device;
let server;
let characteristic;
let drive;
let dc;
let deviceConn;
var deviceaddress;
let deviceType;
let mylocation;
let isCopyEnabled = false;
let globalUsername = null;

let BLE_Name = 'v0_Robot';
let serviceUUID = '12345678-1234-1234-1234-123456789012';
let characteristicUUID = 'abcdef12-1234-1234-1234-abcdef123456';

//var conn = new WebSocket('ws://localhost:8765');
//var conn = new WebSocket('https://sp4wn-signaling-server.onrender.com');
//var conn = new WebSocket('https://sp4wn-429514.uk.r.appspot.com');

let url = 'https://sp4wn-signaling-server.onrender.com';
let conn;
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;
const reconnectDelay = 2000;

function connect(username, userId, accessToken) {
    conn = new WebSocket(url);

    conn.onopen = () => {
        console.log('Connected to the server');
        reconnectAttempts = 0; 
        conn.send(JSON.stringify({ type: 'authenticate', username: username, userId: userId, token: accessToken }));
    };

    conn.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        handleMessage(data);
    };

    conn.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    conn.onclose = () => {
        console.log('Connection closed, attempting to reconnect...');
        handleReconnect(username, userId, accessToken);
    };
}

function handleMessage(data) {
    switch(data.type) {
        case "authenticated":
            handleAuth(data.success);
            break;   
        case "offer":
            handleOffer(data.offer, data.username, data.host);
            break;
        case "answer":
            handleAnswer(data.answer);
            break;
        case "candidate":
            console.log("Handling candidate");
            handleCandidate(data.candidate);
            break;
        case "leave":
            handleLeave();
            break;
        case "watch":
            watchStream(data.name);
            break;
        case "liveusers":
            handleStreams(data.images);
            break;
        case "promotedstreams":
            handlePromotedStreams(data.images);
            break;
        case "handlecheck":
            handlecheck(data.name);
            break;
        case "tokenupdate":
            checkBalance(data.username);
            break;
        case "error":
            handleError(data.message);
            break;
        default:
            console.log('Unhandled message type:', data.type);
            break;
    }
}

function handleReconnect(username, userId, accessToken) {
    if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = reconnectDelay * reconnectAttempts; 
        console.log(`Reconnecting in ${delay / 1000} seconds... (Attempt ${reconnectAttempts})`);
        setTimeout(() => connect(username, userId, accessToken), delay);
    } else {
        console.log('Max reconnect attempts reached. Please refresh the page.');
    }
}



function send(message) {
   if (connectedUser) {
      message.name = otheruser;
   }
   conn.send(JSON.stringify(message));
};

function sendtoWSS(message) {
   //deviceConn.send(JSON.stringify(message));
   if (deviceConn) {
       deviceConn.send(message);
   }
}

var loginPage = document.querySelector('#login-page');
var usernameInput = document.querySelector('#usernameInput');
var pwInput = document.querySelector('#pwInput');
var loginBtn = document.querySelector('#loginBtn');
var registerBtn = document.querySelector('#registerBtn');
const tokenBalanceDisplay = document.querySelectorAll('.token-balance');

var streamPage = document.querySelector('#stream-page');
var videoContainer = document.querySelector('#video-container');
var adminbtnContainer = document.querySelector('#admin-button-container');
var viewerbtnContainer = document.querySelector('#viewer-button-container');
var homePage = document.querySelector('#homepage');
var profilePage = document.querySelector('#profilepage');
var settingsPage = document.querySelector('#settingspage');
var infoPage = document.querySelector('#infopage');
var profileTitle = document.querySelector('#profiletitle');
var profilesettings = document.querySelector('#profile-settings');
var robotssettings = document.querySelector('#robots-settings');
var tokenspagelink = document.querySelector('#tokens-page-link');

var goliveBtn = document.querySelector('#goliveBtn');
var endliveBtn = document.querySelector('#endliveBtn');
var endotherliveBtn = document.querySelector('#endotherliveBtn');
var spawnBtn = document.querySelector('#spawnBtn');
var getstreamsBtn = document.querySelector('#getstreamsbtn');
var getprivatestreamsBtn = document.querySelector('#getprivatestreamsbtn');
var otherProfile = document.querySelector('#otherprofile');
var liveStreams = document.querySelector("#main-streams-container");

var connectdeviceBtn = document.querySelector('#connectdevice-Btn');
var connectcontrollerBtn = document.querySelector('#connectcontroller-Btn');

var devicedropBtns = document.querySelector('.device-dropdown-content');
var arrowBtns = document.querySelector('.arrow-Btns');
var disconnectdeviceBtn = document.querySelector('#disconnectdevice-Btn');
var controlpaneloutputs = document.querySelector('.control-panel-outputs');
var cparrowshost = document.querySelectorAll('.arrow-container-host');
var cparrowsremote = document.querySelectorAll('.arrow-container-remote');

var deviceinfo = document.querySelector('#deviceinfo');
var controlpanel = document.querySelector('#control-panel');

var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

let profileicon = document.querySelector('#profile-icon');
let homeicon = document.querySelector('#home-icon');
let settingsicon = document.getElementById('settings-icon');

var deviceaddressinput;
let locationinput = document.getElementById("locationinput");

const forwardbtn = document.getElementById("forwardbtn");
const leftbtn = document.getElementById("turnleftbtn");
const rightbtn = document.getElementById("turnrightbtn");
const reversebtn = document.getElementById("reversebtn");
const hostforward = document.getElementById("host-forward");
const hostleft = document.getElementById("host-left");
const hostright = document.getElementById("host-right");
const hostreverse = document.getElementById("host-reverse");

var modalVideo = document.getElementById("modal-video-select");
var modalDevice = document.getElementById("modal-device-select");
var videospan = document.getElementById("close-video-select");
var devicespan = document.getElementById("close-device-select");
var confirmVideoBtn = document.querySelector('#confirmvideoBTN');
var confirmDeviceBtn = document.querySelector('#confirmdeviceBTN');
const controlbuttons = document.querySelectorAll(".nocopy");
let robotdescription;
var robotdescriptionelement = document.getElementById("robotdescription");
var yourConn;
var stream;
var call
var ToUsernameInput;
let liveVideo = 0;
let liveremoteVideo = 0;

var configuration = {
   iceServers: [
       {
         urls: "stun:stun2.1.google.com:19302",
       },
       {
         urls: "stun:stun.relay.metered.ca:80",
       },
       {
         urls: "turn:standard.relay.metered.ca:80",
         username: "27669f6c0372d71cb8aa8e67",
         credential: "1YAoI8sksn13VTSc",
       },
       {
         urls: "turn:standard.relay.metered.ca:80?transport=tcp",
         username: "27669f6c0372d71cb8aa8e67",
         credential: "1YAoI8sksn13VTSc",
       },
       {
         urls: "turn:standard.relay.metered.ca:443",
         username: "27669f6c0372d71cb8aa8e67",
         credential: "1YAoI8sksn13VTSc",
       },
       {
         urls: "turns:standard.relay.metered.ca:443?transport=tcp",
         username: "27669f6c0372d71cb8aa8e67",
         credential: "1YAoI8sksn13VTSc",
       },
   ],
   'sdpSemantics': 'unified-plan',
 };
 const savedPage = localStorage.getItem('savedPage');
 function savePage(page) {
   console.log("saving to local storage: ", page);
   localStorage.setItem('savedPage', page);
}

 window.onload = async function() {  
   document.body.style.display = "none";
   const accessToken = localStorage.getItem('accessToken');
   const refreshToken = localStorage.getItem('refreshToken');

   if (accessToken) {
      try {
         autoLogin();
         
      } catch (error) {
         console.log(error);
         if (isAccessTokenExpired(accessToken)) {
            console.log("access token expired");
            if (refreshToken) {
               await refreshAccessToken(refreshToken);
            } else {
               showSnackbar("User not valid. Please login/register.");
            }
         } else {
            autoLogin();
            
         }
      }
      
   } else {
      showSnackbar("Please login.");
      returnToLogin();
   }
   
};

function togglePage(page) {
   switch(page) {
      case 'home':
         togglehome();
         break;
      case 'profile':
         toggleprofile('local');
         break;
      case 'settings':
         togglesettings();
         break;
      case 'infopage':
         toggleinfo();
         break;
      case 'robotssettings':
         togglerobotssettings();
         break;
      case 'tokenspage':
         toggletokenspage();
         break;
   }
}
function init() {
   //displayContent();   
};

function isLoggedIn() {
   const token = localStorage.getItem('accessToken');
   return token && !isTokenExpired(token);
}

function isTokenExpired(token) {
   const decoded = jwt_decode(token);
   return decoded.exp * 1000 < Date.now(); 
}

function displayContent(page) {
   if (isLoggedIn()) {
      loginPage.style.display = "none";
      document.getElementsByTagName('header')[0].style.display = "block";
      toggle(page);
   } else {
      returnToLogin();
      
   }
   
}
function returnToLogin() {   
   if (savedPage) {
         console.log("Saved page found:", savedPage);
         localStorage.removeItem('savedPage');
         console.log("Saved page has been deleted.");
   } else {
         console.log("No saved page found.");
   }
   document.body.style.display = "block";
   document.getElementsByTagName('header')[0].style.display = "none"; 
   revealText();
   loginPage.style.display = "block";
   document.getElementById("loginform").style.display = "block";
   document.getElementById("registerform").style.display = "none";
   homePage.style.display = "none";
   settingsPage.style.display = "none";
   profilePage.style.display = "none";
}
function registerform() {
   resetForm('regusernameInput', 'usernameMessage', 'regpwInput', 'regpwConfirmInput', 'messageArea');
   document.getElementById("loginform").style.display = "none";
   document.getElementById("registerform").style.display = "block";
}
function loginform() {
   document.getElementById("loginform").style.display = "block";
   document.getElementById("registerform").style.display = "none";
}

let introtext;
const textContainer = document.getElementById('introtext');
let index = 0;
if (isMobileOrSmallScreen()) {
   introtext = "Spawn"; 
} else {
   introtext = "Dawn of Telepresence Robotics"; 
}

function revealText() {
   
   if (index < introtext.length) {
      const span = document.createElement('span');
      span.textContent = introtext[index];
      span.classList.add('hidden');
      textContainer.appendChild(span);

      setTimeout(() => {
          span.classList.remove('hidden');
      }, 50);

      index++;
      setTimeout(revealText, 100);
  }
}

function isMobileOrSmallScreen() {
   const isMobile = /Mobi|Android/i.test(navigator.userAgent);  
   const isSmallScreen = window.innerWidth < 600;               
   return isMobile || isSmallScreen;
}

loginBtn.addEventListener("click", function (event) {
   const username = usernameInput.value;
   const password = pwInput.value;
   loginAndConnectToWebSocket(username, password);
});

document.getElementById('registerBtn').addEventListener('click', () => {
   const username = document.getElementById('regusernameInput').value;
   const password = document.getElementById('regpwInput').value;
   const confirmPassword = document.getElementById('regpwConfirmInput').value;
   validateAndRegister('register', username, password, confirmPassword);

   if (username.length < 8) {
      const usernameMessage = document.getElementById('usernameMessage');
      usernameMessage.textContent = "Username must be at least 8 characters long.";
      usernameMessage.style.color = "red";
      return;
  }

});

let updateuserBtn = document.getElementById("updateuserbtn");

document.getElementById('updateuserBtn').addEventListener('click', () => {
   const username = document.getElementById('updateusernameInput').value;
   const password = document.getElementById('updateregpwInput').value;
   const confirmPassword = document.getElementById('updateregpwConfirmInput').value;
   validateAndRegister('update', username, password, confirmPassword);

   if (username.length < 8) {
      const usernameMessage = document.getElementById('usernameMessage');
      usernameMessage.textContent = "Username must be at least 8 characters long.";
      usernameMessage.style.color = "red";
      return;
  }

});

async function resetForm(usernameID, messageID, regpwInputID, regpwConfirmInputID, messageareaID) {
   const usernameInput = document.getElementById(usernameID);
   const usernameMessage = document.getElementById(messageID);
   const passwordInput = document.getElementById(regpwInputID);
   const confirmPasswordInput = document.getElementById(regpwConfirmInputID);
   const messageArea = document.getElementById(messageareaID);
   const username = await getUsername();

   if (usernameInput) {
       usernameInput.value = username ? username : "";
   } else {
       console.warn(`Element with ID ${usernameID} not found.`);
   }

   if (usernameMessage) {
       usernameMessage.innerText = "";
   } else {
       console.warn(`Element with ID ${messageID} not found.`);
   }

   if (passwordInput) {
       passwordInput.value = "";
       passwordInput.style.borderColor = '';
   } else {
       console.warn(`Element with ID ${regpwInputID} not found.`);
   }

   if (confirmPasswordInput) {
       confirmPasswordInput.value = "";
       confirmPasswordInput.style.borderColor = '';
   } else {
       console.warn(`Element with ID ${regpwConfirmInputID} not found.`);
   }

   if (messageArea) {
       messageArea.innerText = "";
   } else {
       console.warn(`Element with ID ${messageareaID} not found.`);
   }
}

let usernameTimeout;

function handleInputChange(inputId, messageId) {
    clearTimeout(usernameTimeout);
    
    usernameTimeout = setTimeout(() => {
        checkUsernameAvailability(inputId, messageId);
    }, 1000);
}

async function checkUsernameAvailability(elementID, messageID) {
   const usernameInput = document.getElementById(elementID);
   const usernameMessage = document.getElementById(messageID);
   //const usernameInput = document.getElementById('regusernameInput');
   //const usernameMessage = document.getElementById('usernameMessage');
   const username = usernameInput.value;

   usernameMessage.textContent = '';

   if (username.length < 8) {
      usernameMessage.textContent = "Username must be at least 8 characters long.";
      usernameMessage.style.color = "red";
      return;
  }

   if (username === '') {
       return;
   }

   try {
       const response = await fetch(`https://sp4wn-signaling-server.onrender.com/check-username?username=${encodeURIComponent(username)}`);

       if (response.ok) {
           const data = await response.json();
           if (data.exists) {
               usernameMessage.textContent = "Username is already taken.";
               usernameMessage.style.color = "red";
           } else {
               usernameMessage.textContent = "Username is available.";
               usernameMessage.style.color = "green";
           }
       } else {
           console.error("Failed to check username availability:", await response.text());
       }
   } catch (error) {
       console.error("Error checking username availability:", error);
   }
}

function validatePassword(passwordID, messageID) {
   const passwordInput = document.getElementById(passwordID);
   const messageArea = document.getElementById(messageID);
   const password = passwordInput.value;

   const validPasswordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

   if (password.trim() === '') {
       messageArea.textContent = '';
       passwordInput.style.borderColor = '';
       return false;
   } else if (!validPasswordRegex.test(password)) {
       messageArea.textContent = "Password must be at least 8 characters long and contain numbers and special characters.";
       messageArea.style.color = "red";
       passwordInput.style.borderColor = "red";
       return false;
   } else {
       messageArea.textContent = ''; 
       passwordInput.style.borderColor = '';
       return true;
   }
}

function togglePasswordVisibility(inputId, toggleIcon) {
   const input = document.getElementById(inputId);
   const isPasswordVisible = input.type === 'text';
   input.type = isPasswordVisible ? 'password' : 'text';
   toggleIcon.classList.toggle('bi-eye-slash', isPasswordVisible);
   toggleIcon.classList.toggle('bi-eye', !isPasswordVisible);
}

async function validateAndRegister(type, username, password, confirmPassword) {
   const messageArea = document.getElementById('messageArea');
   const passwordInput = document.getElementById('regpwInput');
   const confirmPasswordInput = document.getElementById('regpwConfirmInput');
   
   messageArea.textContent = '';
   passwordInput.style.borderColor = '';
   confirmPasswordInput.style.borderColor = '';
   const isPasswordValid = validatePasswordOnSubmit(password);

   if (type === 'register') {
       if (!isPasswordValid) return;

       if (confirmPassword === '') {
           messageArea.textContent = "Please confirm your password.";
           messageArea.style.color = "red";
           confirmPasswordInput.style.borderColor = "red";
           return;
       }

       if (password !== confirmPassword) {
           messageArea.textContent = "Passwords do not match. Please try again.";
           messageArea.style.color = "red";
           passwordInput.style.borderColor = "red";
           confirmPasswordInput.style.borderColor = "red";
           return; 
       }

       try {
           const response = await fetch('https://sp4wn-signaling-server.onrender.com/register', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({ username, password })
           });

           if (response.ok) {
               messageArea.textContent = "Account created successfully. Please login.";
               messageArea.style.color = "green"; 
               showSnackbar("Account created successfully. Please login.");
               returnToLogin();
           } else {
               const data = await response.json(); 
               let errorMessage = "Registration failed. Please try again.";
               if (data.message) {
                   errorMessage = data.message;
               }
               messageArea.textContent = errorMessage;
               messageArea.style.color = "red"; 
               console.log("Registration failed:", data.message);
           }
       } catch (error) {
           messageArea.textContent = "An error occurred. Please try again.";
           messageArea.style.color = "red"; 
           console.error("Registration error:", error);
       }
   } else if (type === 'update') {
      let body;
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
  
      if (!isPasswordValid) {
          body = { username };
      } else {
          body = { username, password };
      }
  
      try {
          const response = await fetch('https://sp4wn-signaling-server.onrender.com/update-user', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify(body)
          });
  
          if (response.ok) {
              const responseData = await response.json();
  
              if (responseData.accessToken) {
                  localStorage.setItem('accessToken', responseData.accessToken);
              }
  
              messageArea.textContent = "Account updated successfully.";
              messageArea.style.color = "green"; 
              showSnackbar("Account successfully updated");
              resetForm('updateusernameInput', 'updateusernameMessage', 'updateregpwInput', 'updateregpwConfirmInput', 'updatemessageArea');
          } else if (response.status === 401) {
              console.log('Unauthorized access. Attempting to refresh token...');
              const newAccessToken = await refreshAccessToken(refreshToken);
              if (newAccessToken) {
                  const retryResponse = await fetch('https://sp4wn-signaling-server.onrender.com/update-user', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${newAccessToken}`
                      },
                      body: JSON.stringify(body)
                  });
  
                  if (retryResponse.ok) {
                      const retryData = await retryResponse.json();
                      if (retryData.accessToken) {
                          localStorage.setItem('accessToken', retryData.accessToken);
                      }
  
                      messageArea.textContent = "Account updated successfully.";
                      messageArea.style.color = "green"; 
                      showSnackbar("Account updated successfully.");
                      resetForm('updateusernameInput', 'updateusernameMessage', 'updateregpwInput', 'updateregpwConfirmInput', 'updatemessageArea');
                  } else {
                      const retryData = await retryResponse.json();
                      let errorMessage = "Account update failed. Please try again.";
                      if (retryData.message) {
                          errorMessage = retryData.message;
                      }
                      messageArea.textContent = errorMessage;
                      messageArea.style.color = "red"; 
                      console.log("Account update failed:", retryData.message);
                  }
              } else {
                  messageArea.textContent = "Failed to refresh token. Please login again.";
                  messageArea.style.color = "red"; 
                  console.log("Failed to refresh token.");
              }
          } else {
              const data = await response.json();
              let errorMessage = "Account update failed. Please try again.";
              if (data.message) {
                  errorMessage = data.message;
              }
              messageArea.textContent = errorMessage;
              messageArea.style.color = "red"; 
              console.log("Account update failed:", data.message);
          }
      } catch (error) {
          messageArea.textContent = "An error occurred. Please try again.";
          messageArea.style.color = "red"; 
          console.error("Account update error:", error);
      }
  }
  
  
}



function validatePasswordOnSubmit(password) {
   const messageArea = document.getElementById('messageArea');
   const validPasswordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

   if (!validPasswordRegex.test(password)) {
       messageArea.textContent = "Password must be at least 8 characters long and contain numbers and special characters.";
       messageArea.style.color = "red";
       document.getElementById('regpwInput').style.borderColor = "red";
       return false;
   }
   return true;
}
async function handleAuth(success) {
   document.body.style.display = "block";
   if (success === false) {
      showSnackbar("Unable to authenticate user");
      logout();
   } else {      
      if(globalUsername) {
         profileTitle.innerHTML = globalUsername;
      } else {
         console.log("awaiting");
         await checkUsername();
         profileTitle.innerHTML = globalUsername;
      }
      
      if (savedPage) {    
         togglePage(savedPage); 
      } else {
         console.log("no saved page");            
         togglehome();
      }          
      loginPage.style.display = "none";
      document.getElementsByTagName('header')[0].style.display = "block";
      tokenBalanceDisplay.forEach((element) => {
         element.style.display = "block";
         element.addEventListener('click', function() {
            toggletokenspage();
         });
      });  
   }
};

function logincheckEnter(event) {
   if (event.key === 'Enter') {
       loginBtn.click();
   }
}
function registercheckEnter(event) {
   if (event.key === 'Enter') {
       registerBtn.click();
   }
}

async function loginAndConnectToWebSocket(username, password) {
   const response = await fetch('https://sp4wn-signaling-server.onrender.com/login', {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json'
       },
       body: JSON.stringify({ username, password })
   });

   const data = await response.json();

   if (data.success) {
       localStorage.setItem('accessToken', data.accessToken);
       localStorage.setItem('refreshToken', data.refreshToken);
       const tokenBalance = data.tokens;

       tokenBalanceDisplay.forEach((element) => {
           element.textContent = `Tokens: ${tokenBalance}`;
       });

       const userId = data.userId;
       connect(username, userId, data.accessToken);
   } else {
       console.log("Login failed:", data.message);
       showSnackbar("Login failed")
   }
}

async function autoLogin() {
   console.log("Attempting auto login");

   if (!hasToken()) {
       console.log("No token found in localStorage.");
       return;
   }

   const accessToken = localStorage.getItem('accessToken');
   const refreshToken = localStorage.getItem('refreshToken');

   if (!accessToken) {
       console.log("No access token found.");
       return;
   }

   try {
       const response = await fetch('https://sp4wn-signaling-server.onrender.com/protected', {
           method: 'GET',
           headers: {
               'Authorization': `Bearer ${accessToken}`
           }
       });

       if (!response.ok) {
           const responseText = await response.text(); 
           console.error('Response Status:', response.status);
           console.error('Response Text:', responseText);
           returnToLogin();

           if (response.status === 401) {
               console.log('Unauthorized access. Attempting to refresh token...');
               const newTokens = await refreshAccessToken(refreshToken);

               if (newTokens) {
                   await autoLoginWithNewToken(newTokens.accessToken, newTokens.refreshToken);
               } else {
                   console.log("Failed to refresh access token.");
                   showSnackbar("Session expired. Please log in again.");
               }
           } else if (response.status === 403) {
               console.log('Access forbidden. Please check your permissions.');
               showSnackbar('Access forbidden. You do not have permission to access this resource.');
               
           } else {
               showSnackbar(`Auto-login failed: ${response.status} - ${responseText}`);
           }
           return;
       }

       const data = await response.json(); 
       const username = data.username;
       const tokenBalance = data.tokens;

       tokenBalanceDisplay.forEach((element) => {
           element.textContent = `Tokens: ${tokenBalance}`;
       });

       console.log('Login successful!');
       const userId = getUserIdFromAccessToken();
       connect(username, userId, accessToken);
   } catch (error) {
       console.error("Error during auto login:", error);
       showSnackbar("An error occurred during auto login. Please try again.");
   }
}


async function refreshAccessToken(refreshToken) {
   try {
       const response = await fetch('https://sp4wn-signaling-server.onrender.com/refresh-token', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json'
           },
           body: JSON.stringify({ refreshToken })
       });

       if (response.ok) {
           const data = await response.json();
           localStorage.setItem('accessToken', data.accessToken);
           localStorage.setItem('refreshToken', data.refreshToken);
           return data; 
       } else {
           console.error("Failed to refresh token:", response.status);
           return null;
       }
   } catch (error) {
       console.error("Error during token refresh:", error);
       return null; 
   }
}

async function autoLoginWithNewToken(newAccessToken, newRefreshToken) {
   localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    await autoLogin();
}

async function logout() {
   const refreshToken = localStorage.getItem('refreshToken');
   if (savedPage) {
      console.log("Saved page found:", savedPage);
      localStorage.removeItem('savedPage');
      console.log("Saved page has been deleted.");
  } else {
      console.log("No saved page found.");
  }

   if (!refreshToken) {
       console.error('No refresh token found');
       return;
   }

   await fetch('https://sp4wn-signaling-server.onrender.com/logout', {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json',
       },
       body: JSON.stringify({ refreshToken }),
   })
   .then(response => {
      if (response.ok) {
         localStorage.removeItem('accessToken');
         localStorage.removeItem('refreshToken');
         
         if (conn) {
            conn.close();
         }

         console.log('You are logged out. Please log back in.');
         window.location.reload();
      } else {
         console.error('Logout failed:', response.statusText);
     }
   });    
}

async function getUsername() {
   if (hasToken()) {
      const accessToken = localStorage.getItem('accessToken');
      const username = await getUsernameFromToken(accessToken);
        globalUsername = username;
        return globalUsername;
  } else {
      console.log("No token found in localStorage.");
  }
}
function getUsernameFromToken(accessToken) {
   const decodedToken = jwt_decode(accessToken); 
   return decodedToken.username; 
}
function hasToken() {
   const token = localStorage.getItem('accessToken'); 
   return token !== null;
}

let streamInterval;

function startStreamInterval(interval) {
   if(streamInterval) {
      stopStreamInterval();
   }      
   streamInterval = setInterval(() => {
      getStreams();
   }, interval);
   console.log("Stream interval initiated");
}

function stopStreamInterval() {
   clearInterval(streamInterval);   
   streamInterval = null;
   console.log("Stream interval terminated");
}

function getStreams() {
   liveStreams.innerHTML = "";
   send({
      type: "streams"
   });
}

let promotedstreamInterval;
let promotedStreamsContainer = document.getElementById("promoted-streams-container");

function startPromotedStreamInterval(interval) {
   if(promotedstreamInterval) {
      stopPromotedStreamInterval();
   }      
   promotedstreamInterval = setInterval(() => {
      getPromotedStreams();
   }, interval);
   console.log("Promoted stream interval initiated");
}

function stopPromotedStreamInterval() {
   clearInterval(promotedstreamInterval);   
   promotedstreamInterval = null;
   console.log("Promoted stream interval terminated");
}

function getPromotedStreams() {
   promotedStreamsContainer.innerHTML = "";
   send({
      type: "promotedstreams"
   });
}

let promotedimage;
let isProcessing = false; 

function handleStreams(images) {
    
    if (isProcessing) {
        console.log("Function is already processing.");
        return; 
    }

    isProcessing = true;

    let ratetext = ' tokens/min';
    const premadeMarkerIcon = `<i class="fa fa-map-marker"></i>`;
    
    for (let i = 0; i < images.length; i++) {
        let text = images[i].username;
        let imgurl = images[i].imageDataUrl;
        let rate = images[i].tokenrate;
        
        if (rate == 0 || rate == null) {
            rate = "FREE";
            ratetext = '';
        }

        let hostlocation = images[i].location;
        let description = images[i].description;
        let divElement = document.createElement('div');
        let divElementIcon = document.createElement('div');
        let divStreamName = document.createElement('div');
        let imgElement = document.createElement('img');
        let divElementRate = document.createElement('div');
        let elementRateSpan = document.createElement('span');
        let rateElement = document.createElement('span');
        let locationElement = document.createElement('span');
        
        divElement.classList.add("live-streams-container"); 
        divStreamName.classList.add("live-streams-names");
        
        rateElement.innerHTML = rate;
        locationElement.innerHTML = hostlocation;
        divStreamName.innerHTML = text;
        imgElement.src = imgurl;
        imgElement.style.width = '250px';

        liveStreams.appendChild(divElement);
        divElement.appendChild(imgElement);      
        divElement.appendChild(divStreamName);
        divElement.appendChild(divElementRate);
        divElementRate.appendChild(rateElement);      
        divElementRate.appendChild(elementRateSpan);  
        elementRateSpan.innerText = ratetext;      
        divElement.appendChild(divElementIcon);
        divElementIcon.innerHTML = premadeMarkerIcon;
        divElementIcon.appendChild(locationElement);

        divElement.onclick = function() {
            checkProfile(text, rate, description, imgurl);
        };
    }

    if (images.length < 1) {
        document.getElementById("live-span-public").style.display = "block";      
    } else {
        document.getElementById("live-span-public").style.display = "none";      
    }

    isProcessing = false;
}


function handlePromotedStreams(images) {
   //let ratetext = ' tokens/min';
   for (let i = 0; i< images.length; i++) {
      let text = images[i].username;
      let rate = images[i].tokenrate;
      let imageurl = images[i].imageDataUrl;
      if (rate == 0 || rate == null) {
         rate = "FREE";
         ratetext = '';
      }
      let description = images[i].description;
      //let promotedimageDataURL = images[i].imageDataUrl;
      let divElement = document.createElement('div');
      let divStreamName = document.createElement('div');
      
      let divElementRate = document.createElement('div');
      let rateElement = document.createElement('span');
     // let elementRateSpan = document.createElement('span');

      divElement.classList.add("promoted-streams-layout"); 
      divStreamName.classList.add("promoted-streams-names");
      
      rateElement.innerHTML = rate;
      divStreamName.innerHTML = text;

      promotedStreamsContainer.appendChild(divElement);    
      divElement.appendChild(divStreamName);
      divElement.appendChild(divElementRate);
      divElementRate.appendChild(rateElement); 
      //divElementRate.appendChild(elementRateSpan);   
      //elementRateSpan.innerText = ratetext;         
      
      divElement.onclick = function() {         
         checkProfile(text, rate, description, imageurl);
      };
   }

   if (images.length < 1) {
      document.getElementById("promoted-span").style.display = "block";      
   } else {
      document.getElementById("promoted-span").style.display = "none";      
   }
}

function checkProfile (userdata, rate, description, imageurl) {
   tokenrate = rate;
   otheruser = userdata;   
   robotdescription = description;  
   promotedimage = imageurl;  
   if (otheruser == globalUsername) {
      toggleprofile('local');
   } if (otheruser != globalUsername) {
      toggleprofile('remote');
   } else {
      console.log("Not sure who target user is: ", otheruser);
   }
  
}

let autoRedeemInterval;
const redemptionInterval = 60 * 1000;

async function redeemTokens(tokens) {
   const userId = getUserIdFromAccessToken();

   const response = await fetch('https://sp4wn-signaling-server.onrender.com/redeem', {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json'
       },
       body: JSON.stringify({
           hostId: connectedUser,
           userId: userId,
           tokens: tokens
       })
   });

   const data = await response.json();
   if (data.success) {
       console.log(`Successfully redeemed ${tokens} tokens! Remaining tokens: ${data.tokens}`);
       tokenBalanceDisplay.forEach((element) => {
           element.textContent = `Tokens: ${data.tokens}`;
       });
       return true;
   } else {
       console.log('Redemption failed: ' + data.error);
       return false;
   }
}


function startAutoRedeem() {
    if (autoRedeemInterval) {
        console.log('Automatic token redemption is already in progress.');
        return;
    }

    autoRedeemInterval = setInterval(async () => {        
      const success = await redeemTokens(tokenrate);
      if (!success) {
            stopAutoRedeem();            
      }       
    }, redemptionInterval);
}

function stopAutoRedeem() {
    if (autoRedeemInterval) {
        clearInterval(autoRedeemInterval);
        autoRedeemInterval = null;
        console.log('Automatic token redemption stopped.');
    }
}

function getUserIdFromAccessToken() {

   const accessToken = localStorage.getItem('accessToken');

   if (!accessToken) {
       console.error('Access token is undefined or null.');
       return null; 
   }

   try {
       const payload = accessToken.split('.')[1];

       if (!payload) {
           console.error('Access token is not in the correct format.');
           return null; 
       }

       const decodedPayload = JSON.parse(atob(payload));

       return decodedPayload.id;
   } catch (err) {
       console.error(`Error decoding access token: ${err.message}`);
       return null;
   }
}

async function checkBalance() {
   const accessToken = localStorage.getItem('accessToken');
   const refreshToken = localStorage.getItem('refreshToken');

   if (!accessToken) {
       console.log('Access token is missing. User may need to log in again.');
       return false;
   }

   const response = await fetch(`https://sp4wn-signaling-server.onrender.com/check-balance`, {
       method: 'GET',
       headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${accessToken}` 
       }
   });

   if (!response.ok) {
       console.error('HTTP error:', response.status, response.statusText);
       
       if (response.status === 401) {
           console.log('Unauthorized. Attempting to refresh token...');
           const refreshed = await refreshAccessToken(refreshToken);

           if (refreshed) {
               const newAccessToken = localStorage.getItem('accessToken');
               return await checkBalanceWithNewToken(newAccessToken);
           } else {
               console.log('Token refresh failed. User may need to log in again.');
               return false;
           }
       }

       return false;
   }

   const data = await response.json();
   if (data.success) {
      console.log(`Balance: ${data.tokens}`);
      tokenBalanceDisplay.forEach((element) => {
        element.textContent = `Tokens: ${data.tokens}`;
     });       
      return data.tokens;
  } else {
      console.log('Error: ' + data.error);
      return false;
  }
}

async function checkBalanceWithNewToken(accessToken) {
   const response = await fetch(`https://sp4wn-signaling-server.onrender.com/check-balance`, {
       method: 'GET',
       headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${accessToken}`
       }
   });

   if (!response.ok) {
       console.error('HTTP error after refreshing token:', response.status, response.statusText);
       return false;
   }

   if (data.success) {
      console.log(`Balance: ${data.tokens}`);
      tokenBalanceDisplay.forEach((element) => {
        element.textContent = `Tokens: ${data.tokens}`;
     });       
      return data.tokens;
  } else {
      console.log('Error: ' + data.error);
      return false;
  }
}




goliveBtn.addEventListener("click", function () {
   modalVideo.style.display = "block";   
 });
videospan.onclick = function() {
   modalVideo.style.display = "none";
 }
devicespan.onclick = function() {
   modalDevice.style.display = "none";
 }
 window.onclick = function(event) {
   if (event.target == modalVideo) {
      modalVideo.style.display = "none";
   }
   if (event.target == modalDevice) {
      modalDevice.style.display = "none";
   }
}

var videoSelect = document.getElementById("videoSelect");
var deviceSelect = document.getElementById("deviceSelect");
var useripaddress = document.getElementById("useripaddressinput");
var streamdescriptioninput = document.getElementById("streamdescinput");
var deviceserviceinput = document.getElementById("deviceserviceinput");
var devicecharinput = document.getElementById("devicecharinput");
var devicenameinput = document.getElementById("devicenameinput");
var deviceaddressinput = document.getElementById("deviceaddressinput");
let streamdescription;

videoSelect.addEventListener("change", function() {
  var selectedValue = videoSelect.value;

  if (selectedValue == "0") {
   useripaddress.style.display = "none";
   tokenrateinput.style.display = "none";
   locationinput.style.display = "none";
   streamdescriptioninput.style.display = "none";   
  }

  if (selectedValue == "1") {
   tokenrateinput.style.display = "block";
   useripaddress.style.display = "none";
   locationinput.style.display = "block";
   streamdescriptioninput.style.display = "block";   
  }
  
  if (selectedValue == "2") {
   tokenrateinput.style.display = "block";
   useripaddress.style.display = "block";
   locationinput.style.display = "block";
   streamdescriptioninput.style.display = "block";
  }
  
});

deviceSelect.addEventListener("change", function() {
   var selectedValue = deviceSelect.value;
 
   if (selectedValue == "0") {
      deviceaddressinput.style.display = "none";
      devicenameinput.style.display = "none";
      deviceserviceinput.style.display = "none";
      devicecharinput.style.display = "none";
   }
 
   if (selectedValue == "1") {
      deviceaddressinput.style.display = "none";
      devicenameinput.style.display = "block";
      deviceserviceinput.style.display = "block";
      devicecharinput.style.display = "block";
   }
   
   if (selectedValue == "2") {
      deviceaddressinput.style.display = "block";
      devicenameinput.style.display = "none";
      deviceserviceinput.style.display = "none";
      devicecharinput.style.display = "none";
   }
   
 });
connectdeviceBtn.onclick = function() {
   modalDevice.style.display = "block";   
 }

confirmDeviceBtn.onclick = function() {
   var selectedValue = deviceSelect.value; 
   
   if (selectedValue == "1") {
      BLE_Name = devicenameinput.value;
      serviceUUID = deviceserviceinput.value;
      characteristicUUID = devicecharinput.value;
      connectDevice();
      modalDevice.style.display = "none";   
   }
   if (selectedValue == "2") {
      connecttoWebServer();      
   }   
 }

 async function connecttoWebServer() {
   deviceaddress = deviceaddressinput.value;           

   try {
      deviceConn = new WebSocket(deviceaddress);
      deviceConn.onopen = function(event) {
         console.log('Web server is connected');
         deviceType = "wss";
         sendtoWSS("7");
      };
      
      deviceConn.onmessage = function(event) {
         console.log('Message from web server:', event.data);
      };
      
      deviceConn.onclose = function(event) {
         console.log('Web server is disconnected');
      };
      deviceConn.onerror = function (err) {
         console.log("Got error", err);
      };
      modalDevice.style.display = "none";   
      
   } catch (error) {
      console.log(error);
   }
   setTimeout(checkReadyState,300);    
 }
 
 function checkReadyState() {
   if (deviceConn.readyState === WebSocket.OPEN) {         
      connectdeviceBtn.style.display = "none";   
      connectcontrollerBtn.style.display = "inline-block";  
      disconnectdeviceBtn.style.display = "block";          
      controlpaneloutputs.style.display = "block";
      cparrowshost.forEach(cparrowshost => {
         cparrowshost.style.display = 'inline-block';
      });
      deviceinfo.style.display = "block";
      deviceinfo.innerHTML = "ESP Web Server";
      console.log("WebSocket is open and ready for commands");
   }    
 }

const image = new Image();
// Set crossOrigin attribute to handle CORS
image.crossOrigin = 'anonymous'; // Use 'anonymous' or 'use-credentials' depending on the server settings
image.src = ''; // Set the image source to your URL

let intervalID;

// Function to update the canvas at a specified interval (frame rate)
function updateCanvasAtInterval(context, image, canvas, interval) {
   intervalID = setInterval(() => {
      try { 
         context.drawImage(image, 0, 0, canvas.width, canvas.height);
      } catch (error) {         
         goliveBtn.style.display = "block";
         endliveBtn.style.display = "none";
         liveVideo = 0;
         updatelive("local");
         showSnackbar("Error getting stream. Make sure https is enabled on your IP camera.")
         stopimagecapture();
         clearInterval(intervalID);
      }
   }, interval); 
 }

function getMediaStream(constraints) {
   return new Promise((resolve, reject) => {
       navigator.mediaDevices.getUserMedia(constraints)
           .then(stream => resolve(stream))
           .catch(err => reject(err));
   });
}
function addStreamToPeerConnection(stream) {
   return new Promise((resolve, reject) => {
       stream.getTracks().forEach(track => {
           yourConn.addTrack(track, stream);
       });
       resolve();
   });
}
function createPeerConnection() {
   return new Promise((resolve, reject) => {
       const yourConn = new RTCPeerConnection(configuration);

       yourConn.onicecandidate = event => {
         if (event.candidate) {
             console.log('New ICE candidate: ', event.candidate);
             if (event.candidate) {
               send({
                  type: "candidate",
                  candidate: event.candidate,
                  othername: connectedUser           
               });
            }
         }
     };
       resolve(yourConn);
   });
}
function setCodec(sdp, codecsToKeep) {
   const lines = sdp.split('\r\n');
   let codecs = [];
   let mLineIndex = -1;

   lines.forEach((line, index) => {
       if (line.startsWith('m=')) {
           mLineIndex = index;
       }
       if (line.startsWith('a=rtpmap:')) {
           const parts = line.split(' ');
           const codecPayloadType = parts[0].split(':')[1];
           const codecName = parts[1].split('/')[0];

           // Collect the codec info
           codecs.push({ payloadType: codecPayloadType, name: codecName });
       }
   });

   // Filter codecs based on what you want to keep
   const selectedPayloadTypes = codecs
       .filter(codec => codecsToKeep.includes(codec.name))
       .map(codec => codec.payloadType);

   // Replace the codec in the m-line
   if (mLineIndex !== -1) {
       const mLineParts = lines[mLineIndex].split(' ');
       mLineParts.splice(3, mLineParts.length - 3); // Remove existing codec payloads
       const newMLine = `${mLineParts.slice(0, 3).join(' ')} ${selectedPayloadTypes.join(' ')}`;
       lines[mLineIndex] = newMLine;
   }

   return lines.join('\r\n');
}



function createOffer() {
   return new Promise((resolve, reject) => {
       yourConn.createOffer()
           .then(offer => {
               return yourConn.setLocalDescription(offer)
               .then(() => offer);
            })
           .then(offer => {               
               send({
                  type: "offer",
                  offer: offer,
                  username: globalUsername,
                  host: connectedUser
               });
               console.log('Offer created and sent.');
               resolve();
           })
           .catch(err => reject(err));
   });
}

async function watchStream(name) {
   connectedUser = name;
   console.log(yourConn.iceConnectionState);
   if (yourConn.iceConnectionState === "closed") {  
      console.log("ice closed");
      beginICE();

   } else {
      console.log("sending offer");  
      if (isDataChannelOpen()) {
         console.log("data channel is open");
      } else {opendc();} 
   }
   await createOffer();
}

let tokenrateinput = document.getElementById("tokenrateinput");
let tokenrate;
tokenrateinput.addEventListener('input', validateTokenRate);

function validateInput(event) {
   let value = event.target.value;

   const validValue = value.replace(/[^0-9]/g, '');
   let numericValue = Number(validValue);

   if (numericValue < 0) {
       numericValue = 0;
   } else if (numericValue > 990) {
       numericValue = 990;
   }

   numericValue = Math.floor(numericValue / 10) * 10;

   event.target.value = numericValue.toString();

   return numericValue;
}
function getTokenRate() {
   const tokenrate = validateInput({ target: tokenrateinput });
   console.log(`Validated token rate: ${tokenrate}`);
   return tokenrate;
}


function validateTokenRate() {
   const value = parseInt(tokenrateinput.value);

   if (value >= 0 && value <= 990 && value % 10 === 0) {
      confirmVideoBtn.disabled = false;
      tokenrateinput.classList.remove('invalid-input');
      tokenrateinput.setCustomValidity("");
   } else {
      confirmVideoBtn.disabled = true;
      tokenrateinput.classList.add('invalid-input'); 
      tokenrateinput.setCustomValidity("Token rate must be between 10 and 990 in intervals of 10.");
      tokenrateinput.reportValidity();
   }
}

async function afterLocalVideo() {
   if(localVideo) {
      goliveBtn.style.display = "none";
      endliveBtn.style.display = "block";
      liveVideo = 1;         
      updatelive("addlive");
      setTimeout(() => {
         captureImage();
      }, 1000);
      
   }   
}

async function initiateConn() {
   try {
      localStream = await getMediaStream({ video: true, audio: true });
      localVideo.srcObject = localStream;
      video = localVideo;
      yourConn = await createPeerConnection();
      const transceiver = yourConn.addTransceiver('video', { direction: 'sendonly' });
      const sender = transceiver.sender;

      if (localStream.getVideoTracks().length > 0) {
         const videoTrack = localStream.getVideoTracks()[0];
         sender.replaceTrack(videoTrack)
            .then(() => {
                  console.log("Track replaced successfully");
            })
            .catch(error => {
                  console.error("Error replacing track:", error);
            });
      } else {
         console.error("No video tracks available in localStream");
      }

      const audioTransceiver = yourConn.addTransceiver('audio', { direction: 'sendonly' });
      const audioSender = audioTransceiver.sender;

      if (localStream.getAudioTracks().length > 0) {
            const audioTrack = localStream.getAudioTracks()[0];
            await audioSender.replaceTrack(audioTrack);
            console.log("Audio track replaced successfully");
      } else {
            console.error("No audio tracks available in localStream");
      }

      console.log("Local Stream Tracks: ", localStream.getTracks());

      await afterLocalVideo(); 
      beginICE(); 
      ICEstatus();
   } catch (error) {
      console.error('Error in starting call:', error);
   }
}


confirmVideoBtn.onclick = function() {
   
   let selectedValue = videoSelect.value;
   //const urlprefix = "https://";
   let enteredIP = useripaddress.value;
   //var deviceIPsrc = urlprefix.concat(enteredIP);
   deviceIPsrc = enteredIP;
   modalVideo.style.display = "none";
   if (selectedValue == "1") {
      tokenrate = getTokenRate();
      mylocation = locationinput.value;
      streamdescription = streamdescriptioninput.value;
      robotdescriptionelement.innerHTML = streamdescription;
      
      if(mylocation == "" || mylocation == null) {
         mylocation = "Not specified";
      }
      if(streamdescription == "" || streamdescription == null) {
         streamdescription = "No description";
      }
      if(tokenrate == "" || tokenrate == null) {
         tokenrate = 0;
      }
      initiateConn();
   }
     
   if (selectedValue == "2") {
      image.src = deviceIPsrc;
      const prefix = deviceIPsrc.slice(0,8);
      console.log(prefix);

      if (prefix == "https://") {
         try {
            drawStream();

            if(localVideo) {
               goliveBtn.style.display = "none";
               endliveBtn.style.display = "block";
               liveVideo = 1;      
               updatelive("addlive");
            }
            ICEstatus(); 
            beginICE();
            
         } catch (error) {
            console.log(error);
         }
      } else {
         console.log("HTTPS is required for IP Cameras unless serving this page locally and getting stream from LAN.");
         try {
            drawStream();

            if(localVideo) {
               goliveBtn.style.display = "none";
               endliveBtn.style.display = "block";
               liveVideo = 1;
               if (video) {
                  updatelive("addlive");
                  setTimeout(() => {
                     captureImage();
                  }, 1000); 
               }               
            }
            ICEstatus(); 
            beginICE();
         } catch (error) {
            console.log(error);
         }
      }
   }   
   startimagecapture(15000);
}

let intervalIds = [];

function startimagecapture(interval) {
   stopimagecapture();
   const intervalId = setInterval(() => {
      captureImage(); 
    }, interval);
   intervalIds.push(intervalId);
   console.log(`Started interval #${intervalIds.length - 1}`);
}
function stopimagecapture() {
   while (intervalIds.length > 0) {
       clearInterval(intervalIds.pop());
       updatelive('local');
   }
   console.log("All image captures terminated.");
}

function drawStream() {

   try {
      // Get the canvas context and draw the image onto the canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const stream = canvas.captureStream();
      const videoTrack = stream.getVideoTracks()[0];
      
      // Copy the stream
      const copiedStream1 = new MediaStream([videoTrack]);

      // Set these streams to video elements
      localVideo.srcObject = copiedStream1;
      video = localVideo;

      yourConn = new RTCPeerConnection(configuration);
      // Add the video track to your WebRTC peer connection
      yourConn.addTrack(videoTrack, stream);
       
      setTimeout(() => {
         // Start updating the canvas at a specific frame rate
      updateCanvasAtInterval(context, image, canvas, 1000 / 60); // 60 fps
  }, 1000);
   } catch (error) {
      console.log(error);
   }  
   
}
function beginICE() {
   yourConn.onicecandidate = function (event) {
      console.log("received ice candidate");
      if (event.candidate) {
         send({
            type: "candidate",
            candidate: event.candidate,
            othername: connectedUser           
         });
      }
   };
}

function ICEstatus() {
   yourConn.oniceconnectionstatechange = () => {
      const iceConnectionState = yourConn.iceConnectionState;
      console.log('ICE Connection State changed to:', iceConnectionState);
      
      switch (iceConnectionState) {
         case 'new':
            console.log('ICE Connection State is new.');
            break;
         case 'checking':
            console.log('ICE Connection is checking.');
            break;
         case 'connected':
            console.log('ICE Connection has been established.');
            if(localVideo == 1) {
               opendc();
            } 
            if(remoteVideo == 1) {
               dcpeerB();
            }
            break;
         case 'completed':
            console.log('ICE Connection is completed.');
            break;
         case 'failed':
            console.error('ICE Connection has failed.');
            yourConn.restartIce();
            break;
         case 'disconnected':
            console.warn('ICE Connection is disconnected.');
            handleLeave();
            break;
         case 'closed':
            console.log('ICE Connection has closed.');
            break;
         default:
            console.log('Unknown ICE Connection State:', iceConnectionState);
      }
   }
}

//open datachannel as Peer A
function opendc() {
   dc = yourConn.createDataChannel("PeerA");
   dc.onopen = async () => {
      console.log("Data channel A is open");
      dc.send("Hello, Peer B!");
      stopimagecapture();
      controlpaneloutputs.style.display = "none";
   };

   dc.onmessage = (event) => {
      console.log("Received from Peer B:", event.data);
      if (server) {
         sendtoDevice(event.data);
         dc.send(event.data);
      } else {
         console.log("not connected to device");
      }
   };

   dc.onclose = () => {
      console.log("Data channel A detected closure from Peer B");
  };
}

endliveBtn.addEventListener("click", function (event) {
   liveVideo = 0;
   stopimagecapture();
   console.log(globalUsername + " is ending stream");
   
   send({
      type: "leave",
      username: globalUsername,
      othername: connectedUser
   });
   stopStreamedVideo(localVideo);
   toggleprofile('local');
});

function stopStreamedVideo(localVideo) {
   try {
      const stream = localVideo.srcObject;
      const tracks = stream.getTracks();
      
      tracks.forEach((track) => {
         track.stop();
       });
   } catch (error) {
      console.log(error);
      toggleprofile('local');
   }
 
   localVideo.srcObject = null;
 }


 spawnBtn.addEventListener("click", async (event) => {
   spawnBtn.disabled = true; // Disable button to prevent multiple clicks
   connectedUser = otheruser;
   if (tokenrate == "FREE") {
      tokenrate = 0;
   }
   console.log(tokenrate);

   const balance = await checkBalance();
   if (balance === null) {
       console.log('Failed to check balance.');
       spawnBtn.disabled = false; // Re-enable button if balance check fails
       return;
   }

   console.log('Balance checked successfully.');
   if (balance < tokenrate) {
       showSnackbar("Your token balance is too low.");
       spawnBtn.disabled = false; // Re-enable button if balance is insufficient
       return;
   }

   initializePeerConnection();
   
   send({
       type: "watch",
       username: globalUsername,
       host: connectedUser
   });
   dcpeerB();
   beginICE();
   console.log("Attempting to connect...");
   const isConnected = await checkICEStatus();

   if (isConnected) {
       handleConnectionEstablished();
       await openDataChannelWithRetry();
   } else {
       console.error('ICE connection was not established.');
       spawnBtn.disabled = false; // Re-enable button if connection fails
   }
});
let remoteStream;
function initializePeerConnection() {
   yourConn = new RTCPeerConnection(configuration);
   remoteStream = new MediaStream();
   remoteVideo.srcObject = remoteStream;

   yourConn.ontrack = (event) => {
      console.log(event.streams[0]);
      remoteStream.addTrack(event.track);
      remoteVideo.srcObject = remoteStream;
      console.log("Received track:", event.track);
   };
   
   
}

async function handleConnectionEstablished() {
   remoteVideo.style.display = "block";
   videoplaceholder.style.display = 'none'; 
   videoplaceholder.src = "";
}

function isStreamLive() {
   return remoteStream && remoteStream.getTracks().some(track => track.readyState === 'live');
}

async function openDataChannelWithRetry(maxRetries = 5, baseDelay = 1000) {
   let retries = 0;
   let delay = baseDelay;

   while (retries < maxRetries) {
      if (isDataChannelOpen()) {
         if (!isStreamLive()) {
            console.log("Media stream is not live.");
            return;
         }
           console.log("Data channel is open");
           const redeemSuccess = await redeemTokens(tokenrate);
           if (redeemSuccess) {
               
               startAutoRedeem(tokenrate);
               handleUIOnConnection();
           } else {
               console.error('Token redemption failed.');
           }
           return;
       }
       dcpeerB();
       console.log(`Data channel is not open. Retrying in ${delay} ms...`);
       await new Promise(resolve => setTimeout(resolve, delay));

       // Increment the delay for the next retry
       delay += baseDelay; 
       retries++;
   }

   console.error('Max retries reached. Data channel could not be opened.');
   spawnBtn.disabled = false; // Re-enable button after max retries
}

async function checkICEStatus(maxRetries = 5, delay = 1500) {
   for (let retries = 0; retries < maxRetries; retries++) {
       await new Promise(resolve => setTimeout(resolve, delay));
       ICEstatus(); // Update the ICE status

       console.log("ICE status is ", yourConn.iceConnectionState);
       if (yourConn.iceConnectionState === 'connected') {
           console.log('PeerConnection is connected!');
           dcpeerB();
           return true;
       } else {
           console.log('PeerConnection is not connected. Current state:', yourConn.iceConnectionState);
       }
   }
   console.error('Max retries reached. ICE connection is still not connected.');
   spawnBtn.disabled = false; // Re-enable button after max retries
   return false; 
}


function handleUIOnConnection() {
   remoteVideo.style.display = "block";
   videoplaceholder.style.display = 'none'; 
   videoplaceholder.src = "";
   video = remoteVideo;
   liveremoteVideo = 1;
   spawnBtn.disabled = false;
   spawnBtn.style.display = "none";
   controlpanel.style.display = "block";
   connectdeviceBtn.style.display = "none";
   controlpaneloutputs.style.display = "block";
   connectcontrollerBtn.style.display = "inline-block";
   cparrowsremote.forEach(cparrow => {
       cparrow.style.display = 'inline-block';
   });
   
   addKeyListeners();
   window.addEventListener("gamepaddisconnected", (event) => {
       console.log("Gamepad disconnected:", event.gamepad);
   });

   
}


async function retryFunction(fn, retries = 3, delay = 1000) {
   if (typeof fn !== 'function') {
       throw new TypeError('Expected fn to be a function');
   }

   for (let i = 0; i < retries; i++) {
       try {
         if (isDataChannelOpen()) {
            return await fn();
         }
         console.log("data channel not open. Retrying");        
         
       } catch (error) {
           console.error(`Attempt ${i + 1} failed: ${error.message}`);
           if (i < retries - 1) {
               await new Promise(res => setTimeout(res, delay));
           }
       }
   }

   throw new Error(`Function failed after ${retries} attempts`);
}

function dcpeerB() {
   yourConn.ondatachannel = (event) => {
      dc = event.channel;

      dc.onopen = () => {
         console.log("Data channel B is open");
         dc.send("Hello from peer B");
      };

      dc.onmessage = (event) => {
         console.log("Received from Peer A:", event.data);
         
      };

      dc.onclose = () => {
         console.log("Data channel B has been closed");
         stopAutoRedeem();
     };
   };
}

function isDataChannelOpen() {
   return dc ? dc.readyState === "open" : false;
}

 function updatelive(msg) {
   const username = globalUsername;
   var data = msg;
   switch(data) {
      
      case "addlive":
         
         send({
            type: "addlive",
            username: username
         });
         break;
      case "addremotelive":
         send({
            type: "addlive",
            username: connectedUser
         });
         break;
      case "local":
         send({
            type: "updatelive",
            username: username
         });
         break;

      case "remotedelete":
         send({
            type: "updatelive",
            username: connectedUser
         });
      break;
      
   }

 }


 function handleOffer(offer) {

   yourConn.setRemoteDescription(new RTCSessionDescription(offer));

   yourConn.createAnswer(function (answer) {
      yourConn.setLocalDescription(answer);

      send({
         type: "answer",
         answer: answer,
         username: globalUsername,
         host: connectedUser
      });
   }, function (error) {
      console.log("Error when creating an answer");
   });
};

function handleAnswer(answer) {
   yourConn.setRemoteDescription(new RTCSessionDescription(answer))
      .catch((error) => {
         console.log("Error when setting remote description: ", error);
      });
}

function handleCandidate(candidate) {
   yourConn.addIceCandidate(new RTCIceCandidate(candidate))
      .then(() => {
         console.log("ICE candidate added successfully:", candidate);
      })
      .catch((error) => {
         console.error("Error adding ICE candidate:", error);
      });
}


function handleClientDisconnect() {
   if (server) {
      sendBT("off");
   } else {
      console.log("not connected to device");
   }
}

function handleLeave() {   
   if (liveVideo == 1) {
      updatelive('addlive');   
      if (dc === open) {
         dc.close();
      }
      dc = null;
      handleClientDisconnect();
      captureImage();
      startimagecapture(15000);
      send({
         type: "leave",
         othername: connectedUser
      });
      connectedUser = null;
   } 
   
   if (liveremoteVideo == 1) {
      stopAutoRedeem();
      liveremoteVideo = 0;
      remoteVideo.srcObject = null;
      removeKeyListeners();
      disconnectDevice();
      yourConn.close();
      yourConn.onicecandidate = null;
      yourConn.onaddstream = null;
      if(connectedUser != null) {
         if (dc === open) {
            dc.close();
         }
         dc = null;
         connectedUser = null;         
      }
   }
};

function toggleinfo() {
   savePage('infopage');
   homePage.style.display = "none";
   profilePage.style.display = "none";
   infoPage.style.display = "block";
   settingsPage.style.display = "none";
   settingsicon.classList.remove("active");
   homeicon.classList.remove("active");
   profileicon.classList.remove("active");
}

function togglesettings() {
   
   toggleprofilesettings();

}

let tokenspage = document.getElementById("tokenspage");
let profilesettingspage = document.getElementById("profilesettingspage");
let robotssettingspage = document.getElementById("robotssettingspage");
let videoplaceholder = document.getElementById("video-placeholder");

async function toggleprofilesettings() {
   savePage('settings');
   homePage.style.display = "none";
   profilePage.style.display = "none";
   infoPage.style.display = "none";
   settingsPage.style.display = "block";
   settingsicon.classList.add("active");
   homeicon.classList.remove("active");
   profileicon.classList.remove("active")
   const usernameInputfield = document.getElementById("updateusernameInput");
   profilesettings.classList.add("active");
   robotssettings.classList.remove("active");
   tokenspagelink.classList.remove("active");
   profilesettingspage.style.display = "block";
   robotssettingspage.style.display = "none";
   tokenspage.style.display = "none";
   resetForm('updateusernameInput', 'updateusernameMessage', 'updateregpwInput', 'updateregpwConfirmInput', 'updatemessageArea');
   usernameInputfield.value = await getUsername();
}
function togglerobotssettings() {   
   savePage('robotssettings');
   homePage.style.display = "none";
   profilePage.style.display = "none";
   infoPage.style.display = "none";
   settingsPage.style.display = "block";
   profilesettings.classList.remove("active");
   robotssettings.classList.add("active");
   tokenspagelink.classList.remove("active");
   profilesettingspage.style.display = "none";
   robotssettingspage.style.display = "block";
   tokenspage.style.display = "none";
}
function toggletokenspage() {
   savePage('tokenspage');
   homePage.style.display = "none";
   profilePage.style.display = "none";
   infoPage.style.display = "none";
   settingsPage.style.display = "block";
   settingsicon.classList.add("active");
   homeicon.classList.remove("active");
   profileicon.classList.remove("active");
   profilesettings.classList.remove("active");
   robotssettings.classList.remove("active");
   tokenspagelink.classList.add("active");
   profilesettingspage.style.display = "none";
   robotssettingspage.style.display = "none";
   tokenspage.style.display = "block";
   paymentResult.innerText = "";
   tokenAmountSelect.addEventListener('change', () => {
      selectedTokens = tokenAmountSelect.value; 
      selectedAmount = tokenAmountSelect.options[tokenAmountSelect.selectedIndex].getAttribute('data-amount');
      document.getElementById('payment-form').style.display = 'block'; 
   });
}



function togglehome() { 
   savePage('home');
   homePage.style.display = "block";
   profilePage.style.display = "none";
   infoPage.style.display = "none";
   settingsPage.style.display = "none";
   homeicon.classList.add("active");
   profileicon.classList.remove("active");
   settingsicon.classList.remove("active");
   liveStreams.innerHTML = "";
   if(connectedUser != null) {
      if(liveVideo == 1) {
         console.log("still streaming");
      } else {
         stopAutoRedeem();
         send({
            type: "leave",
            othername: connectedUser,
            username: globalUsername
         });
         handleLeave();
      }         
   }
   stopPromotedStreamInterval();
   setTimeout(getStreams(), 50);
   startStreamInterval(30000);   
}
function handleProfileTitleClick() {
   toggleprofilesettings();
}
function toggleprofile(msg) { 
   savePage('profile');
   stopStreamInterval();
   setTimeout(getPromotedStreams(), 50);
   startPromotedStreamInterval(30000);
   var data = msg;
   if (isMobileOrSmallScreen()) {
      profilePage.style.display = "block";
      mobileOrientation();
   } else {
      profilePage.style.display = "grid";
   }
   
   homePage.style.display = "none";
   infoPage.style.display = "none";
   settingsPage.style.display = "none";
   homeicon.classList.remove("active");
   settingsicon.classList.remove("active");
   profileicon.classList.add("active");
   
   switch(data) {
      case "local":
         if (liveremoteVideo == 1) {
            toggleprofile('remote');
         } else {     
            if (liveVideo == 1) {               
               goliveBtn.style.display = "none";
               endliveBtn.style.display = "block";
            } else {
               goliveBtn.style.display = "block";
               endliveBtn.style.display = "none";
            }
            profileTitle.addEventListener('click', handleProfileTitleClick);    
            profileTitle.innerHTML = globalUsername;
            remoteVideo.style.display = "none";
            localVideo.style.display = "block";
            spawnBtn.style.display = "none";
            connectcontrollerBtn.style.display = "none";
            connectdeviceBtn.style.display = "inline-block";
            endotherliveBtn.style.display = "none";
            disconnectdeviceBtn.style.display = "none";
            controlpaneloutputs.style.display = "none";
            deviceinfo.style.display = "none";
            cparrowsremote.forEach(cparrowsremote => {
               cparrowsremote.style.display = 'none';
            });
            controlbuttons.forEach(button => {
               button.addEventListener("click", () => {                   
                   const content = document.querySelectorAll(".nocopy");
                   content.forEach(item => {
                       item.style.userSelect = isCopyEnabled ? 'text' : 'none';
                       //item.style.pointerEvents = isCopyEnabled ? 'auto' : 'none';
                   });
               });
           });           
         }
         
         break;

      case "remote":
         if (otheruser == globalUsername) {
            toggleprofile('local');
         } else {
            profileTitle.removeEventListener('click', handleProfileTitleClick);
            profileTitle.innerHTML = otheruser;
            videoplaceholder.style.display = 'block'; 
            videoplaceholder.src = promotedimage;
            robotdescriptionelement. innerHTML = robotdescription;
            remoteVideo.style.display = "block";
            localVideo.style.display = "none";
            goliveBtn.style.display = "none";
            endliveBtn.style.display = "none";
            deviceinfo.style.display = "none";
            controlpanel.style.display = "none";     
            disconnectdeviceBtn.style.display = "none"; 
            connectdeviceBtn.style.display = "none";       
            cparrowshost.forEach(cparrowshost => {
               cparrowshost.style.display = 'none';
             });
            
            document.getElementById('cph2').style.display = "none";
            document.getElementById('deviceinfo').style.display = "none";
            if (liveremoteVideo == 1) {
               spawnBtn.style.display = "none";
               //endotherliveBtn.style.display = "block";
            } else {
               spawnBtn.style.display = "block";
               endotherliveBtn.style.display = "none";
            }
            
         }
         break;

      default:
         console.log(`Error msg: ${expr}.`);
      }

}

// disconnect device button
disconnectdeviceBtn.addEventListener("click", function (event) {
   disconnectDevice();   
});

async function connectDevice() {
   try {
       // Request a Bluetooth device
       console.log("attempting to connect to: " + BLE_Name);
       device = await navigator.bluetooth.requestDevice({
           filters: [{ name: BLE_Name }],
           optionalServices: [serviceUUID]
       });
       
       // Connect to the GATT server
       server = await device.gatt.connect();
       // Get the primary service
       const service = await server.getPrimaryService(serviceUUID);
       // Get the characteristic
       characteristic = await service.getCharacteristic(characteristicUUID);
       console.log(characteristic.properties);
       if (characteristic.properties.notify) {
         console.log('This characteristic supports notifications');
         await characteristic.startNotifications();
         characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
         console.log('Connected and listening for notifications...');
       } else if (characteristic.properties.indicate) {
         console.log('This characteristic supports indications');
       } else {
         console.error('Notifications or indications are not supported on this characteristic');
       }
       deviceType = "BT";
       
       connectdeviceBtn.style.display = "none";   
       connectcontrollerBtn.style.display = "inline-block";  
       disconnectdeviceBtn.style.display = "block";          
       controlpaneloutputs.style.display = "block";
       cparrowshost.forEach(cparrowshost => {
         cparrowshost.style.display = 'inline-block';
       });
       deviceinfo.style.display = "block";
       deviceinfo.innerHTML = BLE_Name;
       addKeyListeners();
       console.log('Connected and ready to send messages.');
   } catch (error) {
       console.error('Connection failed:', error);
   }
}
// Handle incoming data from the characteristic
function handleCharacteristicValueChanged(event) {
   const value = event.target.value;
   const decoder = new TextDecoder('utf-8');
   const response = decoder.decode(value);
 
   console.log('Notification received:', response);
 }
connectcontrollerBtn.onclick = function() {
   try {
      connectController();      
   } catch (error) {
      showSnackbar("Failed to connect controller. Try again.");
   }
   
}

function checkGamepad() {
   const gamepads = navigator.getGamepads();
   
   // Check if any gamepad is detected
   for (let i = 0; i < gamepads.length; i++) {
       if (gamepads[i]) {
         // Start the game loop            
            console.log(`Gamepad detected: ${gamepads[i].id}`);
            controlpaneloutputs.style.display = "none";
            connectcontrollerBtn.style.display = "none";
            requestAnimationFrame(gameLoop);            
            return;
         }
   }
   console.log("No gamepad detected");
}

async function connectController() {
      // Check if the Gamepad API is supported
   if (navigator.getGamepads) {
      console.log("Gamepad API is supported in this browser.");  
      checkGamepad();
   } else {
      console.log("Gamepad API is not supported in this browser.");
      showSnackbar("If controller is connected, press a button and try again");
   }
  
}

async function disconnectDevice(params) {
   switch (deviceType) {
      case "BT":
         if (server) {
            server.disconnect();
            console.log('Disconnected from the device.');
     
            // Clear the references
            device = null;
            server = null;
            characteristic = null;
     
            //update buttons
           connectdeviceBtn.style.display = "inline-block";
           connectcontrollerBtn.style.display = "none";
           controlpaneloutputs.style.display = "none";
           deviceinfo.innerHTML = "";
           removeKeyListeners();
         } else {
            console.error('No active connection to disconnect.');
         }
         break;

      case "wss":
         if (deviceConn) {
            // Close the WebSocket connection
            deviceConn.close(1000, "Closing normally"); // 1000 is the normal closure status code
            console.log("WebSocket connection closing...");
            //update buttons
            connectdeviceBtn.style.display = "inline-block";
            connectcontrollerBtn.style.display = "none";
            controlpaneloutputs.style.display = "none";
            deviceinfo.innerHTML = "";
         } else {
            console.log("WebSocket is not connected.");
         }
         break;
   }
   
}

//CONTROLS
let forward = "forward";
let reverse = "reverse";
let right = "right";
let left = "left";
let park = "park";

let activeKey = null;
let keyIntervalId = null;

function handleKeyDown(event) {
   if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
       if (activeKey !== event.key) {
         if (activeKey) {
             stopAction();
         }
         activeKey = event.key;
         startAction(activeKey);
     }
   }
}

function handleKeyUp(event) {
   if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
       if (activeKey === event.key) {
           stopAction();
       }
   }
}

function startAction(direction) {
   updateDirection(direction);
   keyIntervalId = setInterval(() => {
       updateDirection(direction);
   }, 1000); // Adjust the interval for continuous action
}

function stopAction() {
   clearInterval(keyIntervalId);
   keyIntervalId = null;
   activeKey = null;
   updateDirection(park);
   console.log("key up");
}

function updateDirection(direction) {
   let msg;
   msg = "command unkown";
   switch (direction) {
      case 'ArrowUp':
         msg = forward;
         console.log("UP");
         break;
      case 'ArrowDown':
         msg = reverse;
         console.log("DOWN");
         break;
      case 'ArrowLeft':
         msg = left;
         console.log("LEFT");
         break;
      case 'ArrowRight':
         msg = right;
         console.log("RIGHT");
         break;
      case 'park':
         msg = park;
         console.log("Park");
         break;
      default:
         break;
   }
   if (liveVideo == 1) {
      sendtoDevice(msg);
   } else if (liveremoteVideo == 1) {
      sendDC(msg);
   }
}

function addKeyListeners() {
   document.addEventListener('keyup', handleKeyUp);
   document.addEventListener('keydown', handleKeyDown);
   console.log('Event listeners added.');
}

function removeKeyListeners() {
   document.addEventListener('keyup', handleKeyUp);
   document.addEventListener('keydown', handleKeyDown);
   console.log('Event listeners removed.');
}

forwardbtn.onpointerdown = function() {
   sendDC(forward);
}
forwardbtn.onpointerup = function () {
   setTimeout(sendDC, 200, park);
}
turnleftbtn.onpointerdown = function() {
   sendDC(left);
}
turnleftbtn.onpointerup = function() {
   setTimeout(sendDC, 200, park);
}
turnrightbtn.onpointerdown = function() {
   sendDC(right);
}
turnrightbtn.onpointerup = function() {
   setTimeout(sendDC, 200, park);
}
reversebtn.onpointerdown = function() {
   sendDC(reverse);
}
reversebtn.onpointerup = function() {
   setTimeout(sendDC, 200, park);
}
hostforward.onpointerdown = function() {
   sendtoDevice(forward);
}
hostforward.onpointerup = function () {
   setTimeout(sendtoDevice, 200, park);   
}
hostleft.onpointerdown = function() {
   sendtoDevice(left);
}
hostleft.onpointerup = function() {
   setTimeout(sendtoDevice, 200, park);   
}
hostright.onpointerdown = function() {
   sendtoDevice(right);
}
hostright.onpointerup = function() {
   setTimeout(sendtoDevice, 200, park);   
}
hostreverse.onpointerdown = function() {
   sendtoDevice(reverse);
}
hostreverse.onpointerup = function() {
   setTimeout(sendtoDevice, 200, park);   
}

async function sendBT(string) {
   try {
      const encoder = new TextEncoder();
      const message = string;
      await characteristic.writeValue(encoder.encode(message));      
      console.log('Message sent: ' + message);
      return;
   } catch (error) {
      console.error('Error sending message:', error);
     }     
}
function sendtoDevice(value) {
   console.log("sending value: ", value)

   switch (deviceType) {

      case "BT":
         sendBT(value);
         break;
      
      case "wss":
         sendtoWSS(value);
         break;
   }
}
function sendDC(value) {
   console.log("sending value: ", value)
   try {
      dc.send(value);
   } catch (e) {
      console.log(e);
   }   
}

// Store previous gamepad state
let previousGamepadState = null;
const DEAD_ZONE = 0.05; // Define a small dead zone threshold
let lastLoggedTime = 0;
const logInterval = 300;

function detectGamepadChanges(gamepad) {
   const currentTime = Date.now();

   if (currentTime - lastLoggedTime < logInterval) {
      return;
   } 
   if (!previousGamepadState) {
      // Initialize the previous state if it's the first time checking
      previousGamepadState = {
         buttons: gamepad.buttons.map(button => button.pressed),
         axes: gamepad.axes.slice(),
      };
      return;
   }
   // Detect button changes
   gamepad.buttons.forEach((button, index) => {      
      if (button.pressed && !previousGamepadState.buttons[index]) {
         console.log(`Button ${index} pressed`);
         toggleButtons(index);
         
      } else if (!button.pressed && previousGamepadState.buttons[index]) {
         console.log(`Button ${index} released`);
      }      
   });
   // Detect changes in axis values
   gamepad.axes.forEach((axis, index) => {
      value = Math.round(axis);
      if (Math.abs(axis - previousGamepadState.axes[index]) > DEAD_ZONE) {
         console.log(`Axis ${index} value changed to: ${value.toFixed(2)}`);
         toggleAxis(index, value);
      }
   });
   // Update the previous state
   previousGamepadState = {
      buttons: gamepad.buttons.map(button => button.pressed),
      axes: gamepad.axes.slice(),
   };  
   lastLoggedTime = currentTime;
}

function gameLoop() {
   const gamepads = navigator.getGamepads();
   const gamepad = gamepads[0]; // Checking the first connected gamepad
   if (gamepad) {
         detectGamepadChanges(gamepad);
   }

   requestAnimationFrame(gameLoop); // Continue the loop
}

function toggleButtons(index) {
   let msg;
   switch (index) {
      case 0:
         msg = "0";
         break;

      case 1:
         msg = "1";
         break;
      
      case 2:
         msg = "2";        
         break;

      case 3:
         msg = "3";
         break;

      case 4:
         msg = "4";
         break;
      
      case 5:
         msg = "5";        
         break;

      case 6:
         msg = "6";
         break;

      case 7:
         msg = "7";
         break;

      case 8:
         msg = "8";
         break;
      
      case 9:
         msg = "9";        
         break;

      case 10:
         msg = "10";
         break;      

      case 11:
         msg = "11";
         break;

      case 12:
         msg = "12";
         break;
      
      case 13:
         msg = "13";        
         break;

      case 14:
         msg = "14";
         break;

      case 15:
         msg = "15";
         break;
   }
   if (liveVideo == 1) {
      sendtoDevice(msg);
   } else if (liveremoteVideo == 1) {
      sendDC(msg);
   }
}

function toggleAxis(index, value) {
   let msg;
   switch (index) {
      case 0:
         if (value == -1) {
            console.log("left");
            msg = "left";
         }
         if (value == 1) {
            console.log("right");
            msg = "right";
         }
         if (value == 0) {
            console.log("park");
            msg = "park";
         }
         break;

      case 1:
         if (value == -1) {
            console.log("forward")
            msg = "forward";
         }
         if (value == 1) {
            console.log("reverse");
            msg = "reverse";
         }
         if (value == 0) {
            console.log("park");
            msg = "park";
         }
         break;
      
      case 2:
         if (value == -1) {
            console.log("right stick left");
            msg = "rjl";
         }
         if (value == 1) {
            console.log("right stick right");
            msg = "rjr";
         }
         if (value == 0) {
            console.log("right stick center");
            msg = "rjc";
         }
         break;

      case 3:
         if (value == -1) {
            console.log("right stick up");
            msg = "rju";
         }
         if (value == 1) {
            console.log("right stick down");
            msg = "rjd";
         }
         if (value == 0) {
            console.log("right stick center")
            msg = "rjc";
         }
         break;
   }
   if (liveVideo == 1) {
      sendtoDevice(msg);
   } else if (liveremoteVideo == 1) {
      sendDC(msg);
   }
}
let video;
function toggleFullscreen() {   
   if (liveVideo == 1) {
      video = localVideo;
   } else if (liveremoteVideo == 1) {
      video = remoteVideo;
   }
   // Check if the document is in fullscreen mode
   if (!document.fullscreenElement && !document.mozFullScreenElement && 
      !document.webkitFullscreenElement && !document.msFullscreenElement) {
      enterFullscreen();
   } else {
      exitFullscreen();
   }
}
function enterFullscreen() {
   // Enter fullscreen
   if (video.requestFullscreen) {
      video.requestFullscreen();
   } else if (video.mozRequestFullScreen) { // Firefox
      video.mozRequestFullScreen();
   } else if (video.webkitRequestFullscreen) { // Chrome, Safari, and Opera
      video.webkitRequestFullscreen();
   } else if (video.msRequestFullscreen) { // IE/Edge
      video.msRequestFullscreen();
   }
}
function exitFullscreen() {
   // Exit fullscreen
      if (document.exitFullscreen) {
         document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { // Firefox
         document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { // Chrome, Safari, and Opera
         document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { // IE/Edge
         document.msExitFullscreen();
      }
}
function mobileOrientation() {
   if (liveVideo == 1) {
      video = localVideo;
   } else if (liveremoteVideo == 1) {
      video = remoteVideo;
   }

   if ('orientation' in screen) {
       screen.orientation.addEventListener('change', function() {
           if (screen.orientation.type.startsWith('landscape')) {
               enterFullscreen(video);
           } else if (screen.orientation.type.startsWith('portrait')) {
               exitFullscreen();
           }
       });
   } else {

      // Fallback for browsers that do not support the Screen Orientation API
      window.addEventListener('resize', function() {
         if (window.innerWidth > window.innerHeight) {
               enterFullscreen(video);
         } else {
               exitFullscreen();
         }
      });
   }

   function enterFullscreen(element) {
       if (element.requestFullscreen) {
           element.requestFullscreen();
       } else if (element.webkitRequestFullscreen) { /* Safari */
           element.webkitRequestFullscreen();
       } else if (element.msRequestFullscreen) { /* IE11 */
           element.msRequestFullscreen();
       }
   }

   function exitFullscreen() {
       if (document.exitFullscreen) {
           document.exitFullscreen();
       } else if (document.webkitExitFullscreen) { /* Safari */
           document.webkitExitFullscreen();
       } else if (document.msExitFullscreen) { /* IE11 */
           document.msExitFullscreen();
       }
   }
}

function captureImage(customWidth = 640, customHeight = 480) {
   // Check if localVideo element is available
   if (!localVideo || !localVideo.videoWidth || !localVideo.videoHeight) {
      console.error("Video element not available or video not playing.");
      stopimagecapture();
      return;
   }
   
   // Create a canvas element to capture the current video frame
   const canvas = document.createElement('canvas');
   canvas.width = customWidth;  // Set custom width
   canvas.height = customHeight;  // Set custom height
   const context = canvas.getContext('2d');
   
   // Draw the video frame on the canvas with the specified dimensions
   context.drawImage(localVideo, 0, 0, customWidth, customHeight);
   
   // Convert the canvas to a data URL (image format)
   const imageDataUrl = canvas.toDataURL('image/png');
   // Convert the canvas to a data URL (image format)
   //capturedImageArray.push(imageDataUrl);

   // Store image on server

   try {
      send({
         type: "storeimg",
         image: imageDataUrl,
         username: globalUsername,
         tokenrate: tokenrate,
         location: mylocation,
         description: streamdescription
      });
      console.log("sent image to server");
   } catch (error) {
      console.log("failed to send image to server");
   }      
}

function handleError(message) {
   console.log(message);
   if (message == "userconnected") {
      showSnackbar("User is already connected. Please try again later.");
   }
}
function captureImageMaintainRatio(customWidth = 640, customHeight = 480) {
   if (!localVideo || !localVideo.videoWidth || !localVideo.videoHeight) {
      console.error("Video element not available or video not playing.");
      return;
   }
   
   const canvas = document.createElement('canvas');
   canvas.width = customWidth;  
   canvas.height = customHeight;  
   const context = canvas.getContext('2d');
   
   const videoWidth = localVideo.videoWidth;
   const videoHeight = localVideo.videoHeight;

   const aspectRatio = videoWidth / videoHeight;
   let drawWidth = customWidth;
   let drawHeight = customWidth / aspectRatio;

   if (drawHeight > customHeight) {
       drawHeight = customHeight;
       drawWidth = customHeight * aspectRatio;
   }
   
   const offsetX = (canvas.width - drawWidth) / 2;
   const offsetY = (canvas.height - drawHeight) / 2;

   context.drawImage(localVideo, offsetX, offsetY, drawWidth, drawHeight);
   
   const imageDataUrl = canvas.toDataURL('image/png');

   try {
      send({
         type: "storeimg",
         image: imageDataUrl,
         username: globalUsername,
      });
      console.log("sent image to server");
   } catch (error) {
      console.log("failed to send image to server");
   }      
}
async function checkUsername() {
   await getUsername();
   console.log("Username:", globalUsername);
}

const tokenamount = 100;
const stripe = Stripe('pk_test_51Q5W2QK6K3XpLiJAXCOHs60262ZZzXtZHFym8OhC73IL1VsMxURw5WBFzegofpHxY7EfGalvJFYfdjjGeRcvV3e100RBC5ZaJz');
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

const form = document.getElementById('payment-form');
const submitButton = document.getElementById('stripe-submit');
const paymentResult = document.getElementById('payment-result');

let selectedTokens = null;
let selectedAmount = null;

const tokenAmountSelect = document.getElementById('token-amount');

form.addEventListener('submit', async (event) => {
   event.preventDefault();

   submitButton.disabled = true;
   paymentResult.classList.add("visible");

   const username = await getUsername();

   const selectedOption = tokenAmountSelect.options[tokenAmountSelect.selectedIndex];

   selectedTokens = selectedOption ? selectedOption.value : null;
   selectedAmount = selectedOption ? selectedOption.getAttribute('data-amount') : null;

   if (!selectedTokens) {
      alert('Please select the number of tokens.');
      return;
   } else {
      console.log(`Selected Tokens: ${selectedTokens}`);
      console.log(`Selected Amount: ${selectedAmount}`);
      
      try {
         const userId = getUserIdFromAccessToken();
  
         const { clientSecret } = await fetch('https://sp4wn-signaling-server.onrender.com/create-payment-intent', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ 
                 amount: tokenamount, 
                 username: username, 
                 tokenamount: selectedTokens,
                 userId: userId
             }), 
         }).then(r => r.json());
  
         const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
             payment_method: {
                 card: cardElement,
             },
         });
  
         if (error) {
             paymentResult.innerText = error.message;
         } else {
             if (paymentIntent.status === 'succeeded') {               
                 paymentResult.innerText = 'Payment succeeded!';
             }
         }
     } catch (error) {
         console.error('Payment processing error:', error);
         paymentResult.innerText = 'An error occurred while processing payment.';
     } finally {
         submitButton.disabled = false;
     }
   }
});

function copyToClipboard(cardNumber) {
   navigator.clipboard.writeText(cardNumber).then(function() {
     showSnackbar(`${cardNumber} copied!`);
   }).catch(function(err) {
     console.error('Error copying text: ', err);
     alert('Failed to copy card number.');
   });
 }

 function showSnackbar(message) {
   const snackbar = document.getElementById('snackbar');
   snackbar.textContent = message;
   snackbar.className = 'snackbar show';

   setTimeout(function() {
     snackbar.className = snackbar.className.replace('show', '');
   }, 3000);
 }

function isAccessTokenExpired(accessToken) {
   if (!accessToken) return true;

   const payload = JSON.parse(atob(accessToken.split('.')[1]));

   const exp = payload.exp;
   const currentTime = Math.floor(Date.now() / 1000); 

   return exp < currentTime;
}

init();
