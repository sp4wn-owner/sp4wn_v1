//our username
var name;
var username;
var connectedUser;
var otheruser;

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
      message.name = connectedUser;
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
var otherProfile = document.querySelector('#otherprofile');
var liveStreams = document.querySelector("#livestreams");

var hangUpBtn = document.querySelector('#hangUpBtn');

var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

var yourConn;
var stream;
var callToUsernameInput;
let liveVideo = 0;
let liveremoteVideo = 0;

var configuration = {
       "iceServers": [{ "url": "stun:stun.1.google.com:19302",
         "url": "stun:stun1.1.google.com:19302",
         "url": "stun:stun2.1.google.com:19302"
        }]
    };

function init() {
   loginPage.style.display = "block";
   homePage.style.display = "none";
   profilePage.style.display = "none";
   
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

      getstreamsBtn.click();
            
    }
};

getstreamsBtn.addEventListener("click", function (event) {
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
   

});

goliveBtn.addEventListener("click", function () {
  console.log(username +" is going live");
  navigator.webkitGetUserMedia({ video: true, audio: false }, (stream) => {
      
     localStream(stream);

      if(localVideo) {
         goliveBtn.style.display = "none";
         endliveBtn.style.display = "block";
         liveVideo = 1;

         updatelive("addlive");
      }    

   }, function (error) {
      console.log(error);
   });

});

// Local stream
function localStream(stream) {
   yourConn = new RTCPeerConnection(configuration);
     
     //displaying local video stream on the page
     localVideo.srcObject = stream

     stream.getTracks().forEach((track) => {
      yourConn.addTrack(track, stream);
      });

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
   connectedUser = otheruser;
   yourConn = new RTCPeerConnection(configuration);
   stream = new MediaStream()
   remoteVideo.srcObject = stream
   //when a remote user adds stream to the peer connection, we display it
   yourConn.onaddstream = function (e) {
   remoteVideo.srcObject = e.stream
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
   updatelive('remotedelete');
   
   send({
      type: "watch",
      name: username,
      host: connectedUser
   });
   liveremoteVideo = 1;
   toggleprofile('remote');

});

function watchStream (name) {
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

////////////////////////////////BELOW IS GOOD

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
      }
   }

   
};
function handleRemoteLeave() {
   send({
      type: "leave",
      username: username,
      othername: connectedUser
   });
   connectedUser = null;
   remoteVideo.srcObject = null;
 //  localVideo.srcObject = null;
   yourConn.close();
   yourConn.onicecandidate = null;
   yourConn.onaddstream = null;
   spawnBtn.style.display = "block";
   
   
   
};
function handleFinalLeave() {
   connectedUser = null;
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
      liveStreams.innerHTML = "";
      getstreamsBtn.click();
   } else {
      init();
   }
 
}

function toggleprofile(msg) {
   if (username) {
      var data = msg;
      profilePage.style.display = "block";
      homePage.style.display = "none";
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
               if (liveremoteVideo == 1) {
                  spawnBtn.style.display = "none";
                  endotherliveBtn.style.display = "block";
               } else {
                  spawnBtn.style.display = "block";
                  endotherliveBtn.style.display = "none";
               }
               
            }
         }
         
      } else {
         init();
      }
   }

init();

