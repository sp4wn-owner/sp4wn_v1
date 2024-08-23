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

let BLE_Name = 'v0_Robot';
let serviceUUID = '12345678-1234-1234-1234-123456789012'; // Replace with your service UUID
let characteristicUUID = 'abcdef12-1234-1234-1234-abcdef123456'; // Replace with your characteristic UUID

//connecting to our signaling server
//var conn = new WebSocket('ws://10.0.0.30:9090');
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
         handleStreams(data.name);
         break;
      case "finalleave":
         handleFinalLeave();
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
function sendtoESP(message) {
   deviceConn.send(JSON.stringify(message));
};

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
var liveStreams = document.querySelector("#livestreams");

var connectdeviceBtn = document.querySelector('#connectdevice-Btn');
var connectcontrollerBtn = document.querySelector('#connectcontroller-Btn');

var devicedropBtns = document.querySelector('.device-dropdown-content');
var arrowBtns = document.querySelector('.arrow-Btns');
var disconnectdeviceBtn = document.querySelector('#disconnectdevice-Btn');
var resetBtn = document.querySelector('#reset-Btn');
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


function init() {
   loginPage.style.display = "block";
   homePage.style.display = "none";
   infoPage.style.display = "none";
   profilePage.style.display = "none";
   document.getElementsByTagName('header')[0].style.display = "none";
   deviceaddress = null;   
   };


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
var deviceserviceinput = document.getElementById("deviceserviceinput");
var devicecharinput = document.getElementById("devicecharinput");
var devicenameinput = document.getElementById("devicenameinput");
var deviceaddressinput = document.getElementById("deviceaddressinput");

// Add an event listener for the 'change' event
videoSelect.addEventListener("change", function() {
  // Get the selected value
  var selectedValue = videoSelect.value;

  if (selectedValue == "0") {
   useripaddress.style.display = "none";
  }

  if (selectedValue == "1") {
   useripaddress.style.display = "none";
  }
  
  if (selectedValue == "2") {
   useripaddress.style.display = "block";
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
      deviceaddress = deviceaddressinput.value;     
      deviceConn = new WebSocket('ws://10.0.0.31:8085');

      try {
         deviceConn.onopen = function(event) {
            console.log('Socket1 is open');
            sendtoESP({
               type: "test",
               command: '1'
            });
         };
        
         deviceConn.onmessage = function(event) {
            console.log('Message from socket1:', event.data);
         };
         
         deviceConn.onclose = function(event) {
            console.log('Socket1 is closed');
         };
         deviceConn.onerror = function (err) {
            console.log("Got error", err);
         };
         modalDevice.style.display = "none";   
         
      } catch (error) {
         console.log(error);
      }
      

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
         alert("Error getting stream. Make sure https is enabled on your IP camera.");
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
      navigator.getUserMedia({ video: true, audio: false }, (stream) => {
      
      yourConn = new RTCPeerConnection(configuration);
     
      //displaying local video stream on the page
      localVideo.srcObject = stream

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
         alert("HTTPS is required for IP Cameras unless serving this page locally and getting stream from LAN.");
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
      }
   }
}
function drawStream() {
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
   captureImageFromVideo();
   
   yourConn = new RTCPeerConnection(configuration);
   // Add the video track to your WebRTC peer connection
   yourConn.addTrack(videoTrack, stream);

   // Start updating the canvas at a specific frame rate
   updateCanvasAtInterval(context, image, canvas, 1000 / 60); // 60 fps
}
function beginICE() {
   // Setup ice handling
   yourConn.onicecandidate = function (event) {
      if (event.candidate) {
         send({
            type: "candidate",
            candidate: event.candidate
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
      move(event.data);
      
   };

   dc.onclose = () => {
      console.log("Data channel A detected closure from Peer B");
  };
}

// stop local stream
endliveBtn.addEventListener("click", function (event) {
   liveVideo = 0;
   console.log(username + " is ending stream");
   
   send({
      type: "leave",
      username: username,
      othername: connectedUser
   });
   updatelive('local');
   
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
   

   retryFunction(async () => {      
      connectedUser = otheruser;
      yourConn = new RTCPeerConnection(configuration);
      stream = new MediaStream();
      remoteVideo.srcObject = stream;
      yourConn.onaddstream = function (e) {         
         remoteVideo.srcObject = e.stream;       
         console.log('Function executed successfully');
      }            
      send({
         type: "watch",
         name: username,
         host: connectedUser
      });
       beginICE();
   })
   .catch(error => console.error(error.message));
   
   updatelive('remotedelete');
   
   liveremoteVideo = 1;
   toggleprofile('remote');
   dcpeerB();
   controlpanel.style.display = "block";
   connectdeviceBtn.style.display = "none";
   connectcontrollerBtn.style.display = "inline-block";
   disconnectdeviceBtn.style.display = "none";
   resetBtn.style.display = "none";
   cparrowsremote.forEach(cparrowsremote => {
      cparrowsremote.style.display = 'inline-block';
    });
    ICEstatus();
    
    
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
         dc.send("Hello, Peer A!");
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
            name: name,
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
         name: username,
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
   } 
   
   if (liveremoteVideo == 1) {
      liveremoteVideo = 0;
      remoteVideo.srcObject = null;
      disconnectDevice();
      yourConn.close();
      yourConn.onicecandidate = null;
      yourConn.onaddstream = null;
      toggleprofile('local');
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


function handleStreams(liveusers) {
   var list = liveusers;
   //list = Object.values(liveusers);
   //otheruser = "";
   
   for (let i = 0; i < list.length; i++) {
      //var text = list[i].name.toString();
      var text = list[i];
      liveStreams.innerHTML += "<a href ='#'>" + text + "</a>"; 
      console.log(text);
   }  
   if (list.length < 1) {
      document.getElementById("live-span-public").innerText = "No robots available";
   }
}

liveStreams.addEventListener("click", function (event) {
   var val = event.target.innerHTML;
   checkProfile(val);     

});

function checkProfile (userdata) {
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
    //  getstreamsBtn.click();
      getStreams();

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
            controlpanel.style.display = "none";            
            cparrowshost.forEach(cparrowshost => {
               cparrowshost.style.display = 'none';
             });
            
            document.getElementById('cph2').style.display = "none";
            document.getElementById('deviceinfo').style.display = "none";
            if (liveremoteVideo == 1) {
               spawnBtn.style.display = "none";
               endotherliveBtn.style.display = "block";
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

// reset device button
disconnectdeviceBtn.addEventListener("click", function (event) {
   resetDevice();
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
   alert("No gamepad detected");
}

async function connectController() {
      // Check if the Gamepad API is supported
   if (navigator.getGamepads) {
      console.log("Gamepad API is supported in this browser.");  
          
      window.addEventListener("gamepaddisconnected", (event) => {
         console.log("Gamepad disconnected:", event.gamepad);
      });
      checkGamepad();
   } else {
      console.log("Gamepad API is not supported in this browser.");
}
  
}

async function disconnectDevice(params) {
   if (server) {
       server.disconnect();
       console.log('Disconnected from the device.');

       // Clear the references
       device = null;
       server = null;
       characteristic = null;

       //update buttons
      connectdeviceBtn.style.display = "inline-block";
      controlpaneloutputs.style.display = "none";
   } else {
       console.error('No active connection to disconnect.');
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
   move(forward);
}
hostforward.onpointerup = function () {
   setTimeout(move, 200, park);   
}
hostleft.onpointerdown = function() {
   move(left);
}
hostleft.onpointerup = function() {
   setTimeout(move, 200, park);   
}
hostright.onpointerdown = function() {
   move(right);
}
hostright.onpointerup = function() {
   setTimeout(move, 200, park);   
}
hostreverse.onpointerdown = function() {
   move(reverse);
}
hostreverse.onpointerup = function() {
   setTimeout(move, 200, park);   
}

function move(string) {
   
   let value = Number(string);
   
   
       drive = string;
       sendpos('drive');
   
   
}

async function sendpos(pantilt) {
   switch (pantilt) {
       case 'pan':
          
         break;

       case 'tilt':
          
         break;

      case 'drive':       
         driveBT();
         break;
       
       default:
           console.log(`Sorry, we are out of ${expr}.`);
   }
}
async function driveBT() {
   try {
      // Send a message
      const encoder = new TextEncoder();
      const message = drive;
      await characteristic.writeValue(encoder.encode(message));
      console.log('Message sent!' + message);
      return;
   } catch (error) {
      console.error('Error sending message:', error);
     }
}
   

function sendDC(value) {
   try {
      dc.send(value);
      console.log(value);
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
         } else if (!button.pressed && previousGamepadState.buttons[index]) {
            console.log(`Button ${index} released`);
      }
   });
      // Detect changes in axis values
      gamepad.axes.forEach((axis, index) => {
         value = Math.round(axis);
         if (Math.abs(axis - previousGamepadState.axes[index]) > DEAD_ZONE) {
         console.log(`Axis ${index} value changed to: ${value.toFixed(2)}`);
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

init();

