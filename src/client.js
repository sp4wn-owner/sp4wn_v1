//our username
var name;
var username;
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
let location;

let BLE_Name = 'v0_Robot';
let serviceUUID = '12345678-1234-1234-1234-123456789012'; // Replace with your service UUID
let characteristicUUID = 'abcdef12-1234-1234-1234-abcdef123456'; // Replace with your characteristic UUID

//connecting to our signaling server
//var conn = new WebSocket('ws://localhost:9090');
var conn = new WebSocket('https://sp4wn-signaling-server.onrender.com');
//var conn = new WebSocket('https://sp4wn-429514.uk.r.appspot.com');

conn.onopen = function () {
   console.log("Connected to the signaling server");
};

//when we got a message from a signaling server
conn.onmessage = function (msg) {
   console.log("Got message", msg.data);

   var data = JSON.parse(msg.data);

   switch(data.type) {
      case "login":
         handleLogin(data.success, data.name);
         break;   
      case "offer":
         handleOffer(data.offer, data.name, data.host);
         break;
      case "answer":
         handleAnswer(data.answer);
         break;
      case "candidate":
         console.log("handling candidate");
         handleCandidate(data.candidate);
         break;
      case "leave":
         handleLeave();
         break;
      case "remoteleave":
         handleRemoteLeave();
         break;
      case "watch":
         watchStream(data.name);
         break;
      case "liveusers":
         handleStreams(data.images);
         break;
      case "finalleave":
         handleFinalLeave();
         break;
      case "error":
         handleError(data.error);
         break;
      default:
         break;
   }
};

conn.onerror = function (err) {
   console.log("Got error", err);
};

//alias for sending JSON encoded messages
function send(message) {
   //attach the other peer username to our messages
   if (connectedUser) {
      message.name = otheruser;
     // message.name = connectedUser;
   }
   conn.send(JSON.stringify(message));
};

function sendtoWSS(message) {
   //deviceConn.send(JSON.stringify(message));
   if (deviceConn) {
       deviceConn.send(message);
   }
}

//******
//UI selectors block
//******

var loginPage = document.querySelector('#login-page');
var usernameInput = document.querySelector('#usernameInput');
var loginBtn = document.querySelector('#loginBtn');

var streamPage = document.querySelector('#stream-page');
var videoContainer = document.querySelector('#video-container');
var adminbtnContainer = document.querySelector('#admin-button-container');
var viewerbtnContainer = document.querySelector('#viewer-button-container');
var homePage = document.querySelector('#homepage');
var profilePage = document.querySelector('#profilepage');
var infoPage = document.querySelector('#infopage');
var profileTitle = document.querySelector('#profiletitle');

var goliveBtn = document.querySelector('#goliveBtn');
var endliveBtn = document.querySelector('#endliveBtn');
var endotherliveBtn = document.querySelector('#endotherliveBtn');
var spawnBtn = document.querySelector('#spawnBtn');
var getstreamsBtn = document.querySelector('#getstreamsbtn');
var getprivatestreamsBtn = document.querySelector('#getprivatestreamsbtn');
var otherProfile = document.querySelector('#otherprofile');
//var liveStreams = document.querySelector("#livestreams");
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
let infoicon = document.querySelector('#info-icon');

var deviceaddressinput;
let locationinput = document.getElementById("location");

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


var yourConn;
var stream;
var callToUsernameInput;
let liveVideo = 0;
let liveremoteVideo = 0;

var configuration = {
   iceServers: [
       {
         urls: "stun:stun2.1.google.com:19302",
       },
       {
         urls: "turn:global.relay.metered.ca:80",
         username: "27669f6c0372d71cb8aa8e67",
         credential: "1YAoI8sksn13VTSc",
       },
       {
         urls: "turn:global.relay.metered.ca:80?transport=tcp",
         username: "27669f6c0372d71cb8aa8e67",
         credential: "1YAoI8sksn13VTSc",
       },
       {
         urls: "turn:global.relay.metered.ca:443",
         username: "27669f6c0372d71cb8aa8e67",
         credential: "1YAoI8sksn13VTSc",
       },
       {
         urls: "turns:global.relay.metered.ca:443?transport=tcp",
         username: "27669f6c0372d71cb8aa8e67",
         credential: "1YAoI8sksn13VTSc",
       },
   ],
 };

 const introtext = "Dawn of Telepresence Robotics";
 const textContainer = document.getElementById('introtext');
 let index = 0;

function init() {
   revealText();
   loginPage.style.display = "block";
   homePage.style.display = "none";
   infoPage.style.display = "none";
   profilePage.style.display = "none";
   profilePage.style.display = "none";
   infoPage.style.display = "none";
   liveStreams.innerHTML = "";
   document.getElementsByTagName('header')[0].style.display = "none";
   deviceaddress = null;   
   };

function revealText() {
   
   if (index < introtext.length) {
      const span = document.createElement('span');
      span.textContent = introtext[index];
      span.classList.add('hidden');
      textContainer.appendChild(span);

      // Add a small delay before making the character visible
      setTimeout(() => {
          span.classList.remove('hidden');
      }, 50);

      index++;
      setTimeout(revealText, 100); // Adjust the timing for each character
  }
}
// Login when the user clicks the button
loginBtn.addEventListener("click", function (event) {
   
   name = usernameInput.value;

   if (name.length > 0) {
      send({
         type: "login",
         name: name
      });
   }
});

function handleLogin(success, name) {
   if (success === false) {
      alert("Ooops...try a different username");
   } else {
      username = name;
      loginPage.style.display = "none";
      homePage.style.display = "block";
      liveStreams.innerHTML = "";
      document.getElementsByTagName('header')[0].style.display = "block";
      getStreams();
            
    }
};

function getStreams() {
   liveStreams.innerHTML = "";

      if(connectedUser != null) {
         send({
            type: "leave",
            othername: connectedUser,
            username: username
         });
         handleLeave();
      }
   
      send({
         type: "streams",
         username: username
      });
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

// Get the select element
var videoSelect = document.getElementById("videoSelect");
var deviceSelect = document.getElementById("deviceSelect");
var useripaddress = document.getElementById("useripaddressinput");
var streamdescriptioninput = document.getElementById("streamdescinput");
var deviceserviceinput = document.getElementById("deviceserviceinput");
var devicecharinput = document.getElementById("devicecharinput");
var devicenameinput = document.getElementById("devicenameinput");
var deviceaddressinput = document.getElementById("deviceaddressinput");
let streamdescription;

// Add an event listener for the 'change' event
videoSelect.addEventListener("change", function() {
  // Get the selected value
  var selectedValue = videoSelect.value;

  if (selectedValue == "0") {
   useripaddress.style.display = "none";
   locationinput.style.display = "none";
   streamdescriptioninput.style.display = "none";   
  }

  if (selectedValue == "1") {
   useripaddress.style.display = "none";
   locationinput.style.display = "block";
   streamdescriptioninput.style.display = "block";   
  }
  
  if (selectedValue == "2") {
   useripaddress.style.display = "block";
   locationinput.style.display = "none";
   streamdescriptioninput.style.display = "none";
  }
  
});

deviceSelect.addEventListener("change", function() {
   // Get the selected value
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
      // Perform actions if the WebSocket is open
      //enable buttons
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
let imgInterval;
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
         alert("Error getting stream. Make sure https is enabled on your IP camera.");
         stopimagecapture();
         clearInterval(intervalID);
      }
   }, interval); // interval in milliseconds, e.g., 1000 / 15 for 15 fps
 }

confirmVideoBtn.onclick = function() {
   var selectedValue = videoSelect.value;
   //const urlprefix = "https://";
   var enteredIP = useripaddress.value;
   //var deviceIPsrc = urlprefix.concat(enteredIP);
   deviceIPsrc = enteredIP;
   modalVideo.style.display = "none";
   if (selectedValue == "1") {
      console.log(username +" is going live using this device");
      location = locationinput.value;
      streamdescription = streamdescriptioninput.value;
      
      navigator.getUserMedia({ video: true, audio: false }, (stream) => {
      yourConn = new RTCPeerConnection(configuration);
     
      //displaying local video stream on the page
      localVideo.srcObject = stream
      video = localVideo;

      stream.getTracks().forEach((track) => {
         yourConn.addTrack(track, stream);
      });

      beginICE();
      ICEstatus();

      if(localVideo) {
         goliveBtn.style.display = "none";
         endliveBtn.style.display = "block";
         liveVideo = 1;         
         updatelive("addlive");
         setTimeout(() => {
            captureImage();
         }, 1000);
         
      }    

      }, function (error) {
         console.log(error);
      });
   }
     
   if (selectedValue == "2") {
      console.log(username +" is going live with IP Camera");
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

   startimagecapture(30000);
}
function startimagecapture(interval) {
   imgInterval = setInterval(() => {
      captureImage();
  }, interval);
}

function stopimagecapture() {
   clearInterval(imgInterval);
   updatelive('local');
   console.log("Image captured terminated");
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
   // Setup ice handling
   yourConn.onicecandidate = function (event) {
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
   // Monitor ICE connection state changes
   yourConn.oniceconnectionstatechange = () => {
      const iceConnectionState = yourConn.iceConnectionState;
      console.log('ICE Connection State changed to:', iceConnectionState);
      
      // Handle different states
      switch (iceConnectionState) {
         case 'new':
            console.log('ICE Connection State is new.');
            break;
         case 'checking':
            console.log('ICE Connection is checking.');
            break;
         case 'connected':
            console.log('ICE Connection has been established.');
            break;
         case 'completed':
            console.log('ICE Connection is completed.');
            break;
         case 'failed':
            console.error('ICE Connection has failed.');
            // Potentially restart ICE or alert the user
            break;
         case 'disconnected':
            console.warn('ICE Connection is disconnected.');
            // May indicate a temporary network issue
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
   // Set up event handlers
   dc.onopen = () => {
      console.log("Data channel A is open");
      // Send a message once the data channel is open
      dc.send("Hello, Peer B!");
      controlpaneloutputs.disabled = true;
   };

   dc.onmessage = (event) => {
      console.log("Received from Peer B:", event.data);
      if (event.data == "handleimg") {
         stopimagecapture();
      } else {
         sendtoDevice(event.data);
         dc.send(event.data);
      }
   };

   dc.onclose = () => {
      console.log("Data channel A detected closure from Peer B");
  };
}

// stop local stream
endliveBtn.addEventListener("click", function (event) {
   liveVideo = 0;
   stopimagecapture();
   console.log(username + " is ending stream");
   
   send({
      type: "leave",
      username: username,
      othername: connectedUser
   });
   stopStreamedVideo(localVideo);
   toggleprofile('local');
});
// stop remote stream
endotherliveBtn.addEventListener("click", function (event) {
   if (liveremoteVideo == 1) {
      liveremoteVideo = 0;
      updatelive('addremotelive');
      handleRemoteLeave();
      toggleprofile('remote');
   } else {
      updatelive('addremotelive');
      
   }
});

// stop local stream
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


spawnBtn.addEventListener("click", function (event) {   
   connectedUser = otheruser;
   retryFunction(async () => {    
      yourConn = new RTCPeerConnection(configuration);
      stream = new MediaStream();      
      remoteVideo.srcObject = stream;
      yourConn.onaddstream = function (e) {         
         remoteVideo.srcObject = e.stream;       
         console.log('Function executed successfully');
      }               
      send({
         type: "watch",
         username: username,
         host: connectedUser
      });
      dcpeerB();   
       beginICE();
   }).catch(error => console.error(error.message));
   
    ICEstatus();

    setTimeout(async () => {
      if (yourConn.iceConnectionState === 'connected') {
         try {            
            video = remoteVideo;
            liveremoteVideo = 1;
            spawnBtn.style.display = "none";
            controlpanel.style.display = "block";
            connectdeviceBtn.style.display = "none";
            controlpaneloutputs.style.display = "block";
            connectcontrollerBtn.style.display = "inline-block";
            cparrowsremote.forEach(cparrowsremote => {
               cparrowsremote.style.display = 'inline-block';
            });
            console.log('PeerConnection is connected!');
            
         } catch (error) {
            console.log(error);
         }
         window.addEventListener("gamepaddisconnected", (event) => {
            console.log("Gamepad disconnected:", event.gamepad);
         });        
         
   
      } else {
            console.log('PeerConnection is not connected. Current state:', yourConn.iceConnectionState);
      }
      
   }, 1500);

   
    
});

async function retryFunction(fn, retries = 3, delay = 1000) {
   if (typeof fn !== 'function') {
       throw new TypeError('Expected fn to be a function');
   }

   for (let i = 0; i < retries; i++) {
       try {
           return await fn();
       } catch (error) {
           console.error(`Attempt ${i + 1} failed: ${error.message}`);
           if (i < retries - 1) {
               await new Promise(res => setTimeout(res, delay)); // Wait before retrying
           }
       }
   }

   throw new Error(`Function failed after ${retries} attempts`);
}


function dcpeerB() {
   // Listen for the data channel event
   yourConn.ondatachannel = (event) => {
      dc = event.channel;

      // Set up event handlers for Peer B's data channel
      dc.onopen = () => {
         console.log("Data channel B is open");
         // Respond to Peer A
         dc.send("handleimg");
      };

      dc.onmessage = (event) => {
         console.log("Received from Peer A:", event.data);
         
      };

      dc.onclose = () => {
         console.log("Data channel B has been closed");
     };
   };
}

function watchStream (name) {
   opendc();
   clientName = name;
   var callToUsername = clientName;
 
   if (callToUsername.length > 0) {
 
      connectedUser = callToUsername;
 
      // create an offer
      yourConn.createOffer(function (offer) {
         send({
            type: "offer",
            offer: offer,
            username: username,
            host: connectedUser
         });
 
         yourConn.setLocalDescription(offer);
      }, function (error) {
         alert("Error when creating an offer");
      });
 
   }
 }

 function updatelive(msg) {
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

//when somebody sends us an offer
function handleOffer(offer) {
   //connectedUser = host;
   yourConn.setRemoteDescription(new RTCSessionDescription(offer));

   //create an answer to an offer
   yourConn.createAnswer(function (answer) {
      yourConn.setLocalDescription(answer);

      send({
         type: "answer",
         answer: answer,
         username: username,
         host: connectedUser
      });
    //  document.getElementById('sdp-answer').value = JSON.stringify(answer)
   }, function (error) {
      alert("Error when creating an answer");
   });
   //toggleprofile('remote');
};

//when we got an answer from a remote user
function handleAnswer(answer) {
   yourConn.setRemoteDescription(new RTCSessionDescription(answer));
};

//when we got an ice candidate from a remote user
function handleCandidate(candidate) {
   yourConn.addIceCandidate(new RTCIceCandidate(candidate));
};

//hang up

function handleLeave() {   

   if (liveVideo == 1) {
      updatelive('addlive');
      connectedUser = null;
      dc = null;
      captureImage();
      startimagecapture(30000);
   } 
   
   if (liveremoteVideo == 1) {
      liveremoteVideo = 0;
      remoteVideo.srcObject = null;
      disconnectDevice();
      yourConn.close();
      yourConn.onicecandidate = null;
      yourConn.onaddstream = null;
      //toggleprofile('local');
      //setTimeout(togglehome(), 200);
      //togglehome();
      if(connectedUser != null) {
         send({
            type: "leave",
            othername: connectedUser,
            username: username
         });
         connectedUser = null;
         dc = null;
      }
   }
};
function handleRemoteLeave() {
   send({
      type: "leave",
      username: username,
      othername: connectedUser
   });
   if (dc === open) {
      dc.close();
   }
   
   console.log("Data channel B is closed");
   dc = null;
   connectedUser = null;
   remoteVideo.srcObject = null;
   yourConn.close();
   yourConn.onicecandidate = null;
   yourConn.onaddstream = null;
   spawnBtn.style.display = "block";

};
function handleFinalLeave() {
   disconnectDevice();
   connectedUser = null;
   dc = null;
   remoteVideo.srcObject = null;
   localVideo.srcObject = null;
   yourConn.close();
   yourConn.onicecandidate = null;
   yourConn.onaddstream = null;
}


function handleStreams(images) {
   premadeIcon = `<i class="fa fa-location"></i>`
   for (let i = 0; i< images.length; i++) {
      let text = images[i].username;
      let imgurl = images[i].imageDataUrl;
      let hostlocation = images[i].location;
      let description = images[i].description;
      let divElement = document.createElement('div');
      let divElementIcon = document.createElement('div');
      let divStreamName = document.createElement('div');
      let imgElement = document.createElement('img');
      let locationElement = document.createElement('span');
      let descElement = document.createElement('span');
      divElement.classList.add("live-streams-container"); 
      divStreamName.classList.add("live-streams-names");
          
      locationElement.innerHTML = hostlocation;
      descElement.innerHTML = description;
      divStreamName.innerHTML = text;
      imgElement.src = imgurl;
      imgElement.style.width = '250px';

      liveStreams.appendChild(divElement);
      divElement.appendChild(imgElement);      
      divElement.appendChild(divStreamName);
      divElement.appendChild(divElementIcon);
      divElementIcon.appendChild(premadeIcon);
      divElementIcon.appendChild(locationElement);
      divElement.appendChild(descElement);
      

      // Attach the onclick event
      divElement.onclick = function() {
         checkProfile(text);
      };
   }

   if (images.length < 1) {
      document.getElementById("live-span-public").style.display = "block";      
   } else {
      document.getElementById("live-span-public").style.display = "none";      
   }
}

function checkProfile (userdata) {
   console.log(userdata);
   otheruser = userdata;   
   toggleprofile('remote');
}
function toggleinfo() {
   homePage.style.display = "none";
   profilePage.style.display = "none";
   infoPage.style.display = "block";
   infoicon.classList.add("active");
   homeicon.classList.remove("active");
   profileicon.classList.remove("active");
}
function togglehome() {
   if (username) {
      homePage.style.display = "block";
      profilePage.style.display = "none";
      infoPage.style.display = "none";
      homeicon.classList.add("active");
      profileicon.classList.remove("active");
      infoicon.classList.remove("active");
      liveStreams.innerHTML = "";
      setTimeout(getStreams(), 50);

   } else {
      init();
   }
 
}

function toggleprofile(msg) {
if (username) {
   var data = msg;
   profilePage.style.display = "block";
   homePage.style.display = "none";
   infoPage.style.display = "none";
   homeicon.classList.remove("active");
   infoicon.classList.remove("active");
   profileicon.classList.add("active");
   switch(data) {
      case "local":
         if (liveremoteVideo == 1) {
            toggleprofile('remote');
         } else {            
            profileTitle.innerHTML = username;
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
            
            if (liveVideo == 1) {
               goliveBtn.style.display = "none";
               endliveBtn.style.display = "block";
            } else {
               goliveBtn.style.display = "block";
               endliveBtn.style.display = "none";
            }
         }
         
         break;

      case "remote":
         if (otheruser == username) {
            toggleprofile('local');
         } else {
            profileTitle.innerHTML = otheruser;
            remoteVideo.style.display = "block";
            localVideo.style.display = "none";
            goliveBtn.style.display = "none";
            endliveBtn.style.display = "none";
            deviceinfo.style.display = "none";
            controlpanel.style.display = "none";     
            disconnectdeviceBtn.style.display = "none";       
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
      
   } else {
      init();
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
       //enable buttons
       connectdeviceBtn.style.display = "none";   
       connectcontrollerBtn.style.display = "inline-block";  
       disconnectdeviceBtn.style.display = "block";          
       controlpaneloutputs.style.display = "block";
       cparrowshost.forEach(cparrowshost => {
         cparrowshost.style.display = 'inline-block';
       });
       deviceinfo.style.display = "block";
       deviceinfo.innerHTML = BLE_Name;
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
   connectController();
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
      alert("If controller is connected, press a button and try again");
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
document.addEventListener('DOMContentLoaded', function() {
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
});

function captureImage(customWidth = 640, customHeight = 480) {
   // Check if localVideo element is available
   if (!localVideo || !localVideo.videoWidth || !localVideo.videoHeight) {
      console.error("Video element not available or video not playing.");
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
         username: username,
         location: location,
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
      alert("User is already connected")
   }
}
function captureImageMaintainRatio(customWidth = 640, customHeight = 480) {
   // Check if localVideo element is available
   if (!localVideo || !localVideo.videoWidth || !localVideo.videoHeight) {
      console.error("Video element not available or video not playing.");
      return;
   }
   
   // Create a canvas element to capture the current video frame
   const canvas = document.createElement('canvas');
   canvas.width = customWidth;  // Set custom width
   canvas.height = customHeight;  // Set custom height
   const context = canvas.getContext('2d');
   
   // Ensure video dimensions are available
   const videoWidth = localVideo.videoWidth;
   const videoHeight = localVideo.videoHeight;

   // Calculate aspect ratio to maintain image quality
   const aspectRatio = videoWidth / videoHeight;
   let drawWidth = customWidth;
   let drawHeight = customWidth / aspectRatio;

   // Adjust height if needed
   if (drawHeight > customHeight) {
       drawHeight = customHeight;
       drawWidth = customHeight * aspectRatio;
   }
   
   // Center the image on the canvas
   const offsetX = (canvas.width - drawWidth) / 2;
   const offsetY = (canvas.height - drawHeight) / 2;

   // Draw the video frame on the canvas
   context.drawImage(localVideo, offsetX, offsetY, drawWidth, drawHeight);
   
   // Convert the canvas to a data URL (image format)
   const imageDataUrl = canvas.toDataURL('image/png');
   // Store the image in the array
   //capturedImageArray.push(imageDataUrl);

   // Store image on server
   try {
      send({
         type: "storeimg",
         image: imageDataUrl,
         username: username
      });
      console.log("sent image to server");
   } catch (error) {
      console.log("failed to send image to server");
   }      
}


init();

