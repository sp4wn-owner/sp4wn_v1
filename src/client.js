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
let xposition;
let yposition;
let drive;
let dc;

const deviceName = 'v0_Robot';
const serviceUUID = '12345678-1234-1234-1234-123456789012'; // Replace with your service UUID
const characteristicUUID = 'abcdef12-1234-1234-1234-abcdef123456'; // Replace with your characteristic UUID

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
      //when somebody wants to call us
      case "offer":
         handleOffer(data.offer, data.name, data.host);
         break;
      case "answer":
         handleAnswer(data.answer);
         break;
      //when a remote peer sends an ice candidate to us
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

const forward = document.getElementById("forward");
const left = document.getElementById("turnleft");
const right = document.getElementById("turnright");
const reverse = document.getElementById("reverse");
const hostforward = document.getElementById("host-forward");
const hostleft = document.getElementById("host-left");
const hostright = document.getElementById("host-right");
const hostreverse = document.getElementById("host-reverse");

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
   profilePage.style.display = "none";
   document.getElementsByTagName('header')[0].style.display = "none";
   xposition = 90;
   yposition = 90;
   
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
     // getstreamsBtn.click();
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
// Function to update the canvas at a specified interval (frame rate)
function updateCanvasAtInterval(context, image, canvas, interval) {
   setInterval(() => {
     context.drawImage(image, 0, 0, canvas.width, canvas.height);
   }, interval); // interval in milliseconds, e.g., 1000 / 15 for 15 fps
 }
//streamsrc = "http://10.0.0.249:81/stream";
const image = new Image();
// Set crossOrigin attribute to handle CORS
image.crossOrigin = 'anonymous'; // Use 'anonymous' or 'use-credentials' depending on the server settings
image.src = 'http://10.0.0.249:81/stream'; // Set the image source to your URL

goliveBtn.addEventListener("click", function () {
  console.log(username +" is going live");
  yourConn = new RTCPeerConnection(configuration);
  
  // Get the canvas context and draw the image onto the canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const stream = canvas.captureStream();
  const videoTrack = stream.getVideoTracks()[0];
  
  // Copy the stream
  const copiedStream1 = new MediaStream([videoTrack]);
  const copiedStream2 = new MediaStream([videoTrack]);

  // Set these streams to video elements
  localVideo.srcObject = copiedStream1;
  //document.getElementById('video2').srcObject = copiedStream2;
 
    // Add the video track to your WebRTC peer connection
    yourConn.addTrack(videoTrack, copiedStream2);

    // Start updating the canvas at a specific frame rate
    updateCanvasAtInterval(context, image, canvas, 1000 / 100); // 40 fps
 
  
        // Setup ice handling
        yourConn.onicecandidate = function (event) {
          if (event.candidate) {
             send({
                type: "candidate",
                candidate: event.candidate
             });
          }
       };
 
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
  
  if(localVideo) {
   goliveBtn.style.display = "none";
   endliveBtn.style.display = "block";
   liveVideo = 1;
   updatelive("addlive");
   }    
  
   
});


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
      // Your function logic here
      connectedUser = otheruser;
      yourConn = new RTCPeerConnection(configuration);
      
      // throw new Error('Test error'); // Uncomment to simulate an error
   })
   .catch(error => console.error(error.message));
   yourConn.ontrack = (event) => {
      const [remoteStream] = event.streams;
      //const remoteVideo = remoteVideo;
      remoteVideo.srcObject = remoteStream;
    };

    stream = new MediaStream();
      remoteVideo.srcObject = stream
      //when a remote user adds stream to the peer connection, we display it
      yourConn.onaddstream = function (e) {
      remoteVideo.srcObject = e.stream
      console.log('Function executed successfully');
      }

   updatelive('remotedelete');
   
   send({
      type: "watch",
      name: username,
      host: connectedUser
   });
   liveremoteVideo = 1;
   toggleprofile('remote');
   dcpeerB();
   controlpanel.style.display = "block";
   connectdeviceBtn.style.display = "none";
   disconnectdeviceBtn.style.display = "none";
   resetBtn.style.display = "none";
   cparrowsremote.forEach(cparrowsremote => {
      cparrowsremote.style.display = 'inline-block';
    });

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
   // Setup ice handling
   yourConn.onicecandidate = function (event) {
      if (event.candidate) {
         send({
            type: "candidate",
            candidate: event.candidate
         });
      }
   };

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
      document.getElementById("live-span-public").innerText = "No public robots available";
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

function togglehome() {
   if (username) {
      homePage.style.display = "block";
      profilePage.style.display = "none";
      homeicon.classList.add("active");
      profileicon.classList.remove("active");
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
   homeicon.classList.remove("active");
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

function toggleDevices() {
   if (connectdeviceBtn.classList.contains("active")) {
      devicedropBtns.style.display = "none";
      connectdeviceBtn.classList.remove("active");      
  } else {
      devicedropBtns.style.display = "block";
      connectdeviceBtn.classList.add("active");
  }
}

function deviceSelect(option) {
   switch(option) {
      case "option1":
         devicedropBtns.style.display = "none";
         connectdeviceBtn.classList.remove("active"); 

         break;

      case "option2":
         devicedropBtns.style.display = "none";
         connectdeviceBtn.classList.remove("active"); 
         //load js
        // var script = document.createElement("script");
        // script.src = "APIs/v0-robot/v0-robot.js";  // Path to the external JS file
        // script.type = "text/javascript";
        // script.id = "v0-robot-js"
        // activejs = script.id;
        // script.onload = function() {
       //     console.log("Script loaded and executed.");
       //  };
       //  document.body.appendChild(script);
         //load css
        // var link = document.createElement("link");
        // link.rel = "stylesheet";
        // link.type = "text/css";
       //  link.href = "APIs/v0-robot/v0-robot-styles.css"; 
       //  link.id = "v0-robot-css";
       //  activecss = link.id;
       //  document.head.appendChild(link);
 
         //connect to device
         connectDevice();
         

         break;
      
      case "option3":
      devicedropBtns.style.display = "none";
      connectdeviceBtn.classList.remove("active"); 

         break;

      default:
         console.log(`Error msg: ${expr}.`);
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

async function connectDevice(params) {
   try {
       // Request a Bluetooth device
       device = await navigator.bluetooth.requestDevice({
           filters: [{ name: deviceName }],
           optionalServices: [serviceUUID]
       });

       // Connect to the GATT server
       server = await device.gatt.connect();

       // Get the primary service
       const service = await server.getPrimaryService(serviceUUID);

       // Get the characteristic
       characteristic = await service.getCharacteristic(characteristicUUID);

       //enable buttons
       connectdeviceBtn.style.display = "none";    
       disconnectdeviceBtn.style.display = "block";          
       controlpaneloutputs.style.display = "block";
       cparrowshost.forEach(cparrowshost => {
         cparrowshost.style.display = 'inline-block';
       });
       deviceinfo.style.display = "block";
       deviceinfo.innerHTML = deviceName;
       console.log('Connected and ready to send messages.');
   } catch (error) {
       console.error('Connection failed:', error);
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
      connectdeviceBtn.style.display = "block";
      controlpaneloutputs.style.display = "none";
   } else {
       console.error('No active connection to disconnect.');
   }
}

forward.onpointerdown = function() {
   sendDC(2000);
}
forward.onpointerup = function () {
   setTimeout(sendDC, 200, 2004);
}
turnleft.onpointerdown = function() {
   sendDC(2001);
}
turnleft.onpointerup = function() {
   setTimeout(sendDC, 200, 2004);
}
turnright.onpointerdown = function() {
   sendDC(2002);
}
turnright.onpointerup = function() {
   setTimeout(sendDC, 200, 2004);
}
reverse.onpointerdown = function() {
   sendDC(2003);
}
reverse.onpointerup = function() {
   setTimeout(sendDC, 200, 2004);
}
hostforward.onpointerdown = function() {
   move(2000);
}
hostforward.onpointerup = function () {
   move(2004);
}
hostleft.onpointerdown = function() {
   move(2001);
}
hostleft.onpointerup = function() {
   move(2004);
}
hostright.onpointerdown = function() {
   move(2002);
}
hostright.onpointerup = function() {
   move(2004);
}
hostreverse.onpointerdown = function() {
   move(2003);
}
hostreverse.onpointerup = function() {
   move(2004);
}

function move(string) {
   let value = Number(string);
   console.log(value);
   if (value > -100 && value < 100) {
       xposition = xposition + value;
       if (xposition < 0) {
           xposition = 0;
       } if (xposition > 180){
           xposition = 180;
       }
       sendpos('pan');
   } if (value < -100 || value > 100 && value < 999) {
       if (value < -100) {
           yposition = yposition + (value + 100);
       } else {
           yposition = yposition + (value - 100);
       }
       if (yposition <= 0) {
           yposition = 0;
       } if (yposition >= 180){
           yposition = 180;
       }
       sendpos('tilt');
   } else if (value > 1999) {
       drive = value;
       sendpos('drive');
   }
   
}

async function sendpos(pantilt) {
   switch (pantilt) {
       case 'pan':
           console.log('pan: ' + xposition);
           if (!characteristic) {
               console.error('No characteristic available. Please connect first.');
               return;
           }
       
           try {
               // Send a message
               const encoder = new TextEncoder();
               const message = xposition;
               await characteristic.writeValue(encoder.encode(message));
       
               console.log('Message sent to robot for tilt!');
           } catch (error) {
               console.error('Error sending message:', error);
           }
           break;

       case 'tilt':
           console.log('tilt: ' + yposition);
           let yvalue = yposition + 1000;
           if (!characteristic) {
               console.error('No characteristic available. Please connect first.');
               return;
           }
       
           try {
               // Send a message
               const encoder = new TextEncoder();
               const message = yvalue;
               await characteristic.writeValue(encoder.encode(message));
       
               console.log('Message sent!');
           } catch (error) {
               console.error('Error sending message:', error);
           }
           break;

           case 'drive':
           console.log('drive: ' + drive);
           
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
      console.log('Message sent!');
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

async function resetDevice(params) {
   xposition = 90;
   yposition = 1090;
   if (!characteristic) {
       console.error('No characteristic available. Please connect first.');
       return;
   }

   try {
       // Send a message
       const encoder = new TextEncoder();
       const messagex = xposition;
       const messagey = yposition;
       await characteristic.writeValue(encoder.encode(messagex));
       await characteristic.writeValue(encoder.encode(messagey));
       console.log('Message sent!');
       yposition = 90;
   } catch (error) {
       console.error('Error sending message:', error);
   }
}

init();

