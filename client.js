//our username
var name;
var connectedUser;
var otheruser;

//connecting to our signaling server
var conn = new WebSocket('ws://localhost:9090');

conn.onopen = function () {
   console.log("Connected to the signaling server");
};

//when we got a message from a signaling server
conn.onmessage = function (msg) {
   console.log("Got message", msg.data);

   var data = JSON.parse(msg.data);

   switch(data.type) {
      case "login":
         handleLogin(data.success);
         break;
      //when somebody wants to call us
      case "offer":
         handleOffer(data.offer, data.name);
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
      case "watch":
         watchStream(data.name);
         break;
      case "liveusers":
         handleStreams(data.name);
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
       "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }]
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

function handleLogin(success) {
   if (success === false) {
      alert("Ooops...try a different username");
   } else {
      console.log(name);
      loginPage.style.display = "none";
      homePage.style.display = "block";
      liveStreams.innerHTML = "";

      yourConn = new RTCPeerConnection(configuration);

       
       // Setup ice handling
       yourConn.onicecandidate = function (event) {
         if (event.candidate) {
            send({
               type: "candidate",
               candidate: event.candidate
            });
         }
      };
   
      send({
         type: "streams",
         name: name
      });
            
    }
};

getstreamsBtn.addEventListener("click", function (event) {
   liveStreams.innerHTML = "";

      if(connectedUser != null) {
         send({
            type: "leave",
         });
         handleLeave();
      }
   
      send({
         type: "streams",
         name: name
      });
   

});

goliveBtn.addEventListener("click", function () {
  console.log(name +" is going live");
  navigator.webkitGetUserMedia({ video: true, audio: false }, (stream) => {
     
     
     //displaying local video stream on the page
     localVideo.srcObject = stream

     stream.getTracks().forEach((track) => {
      yourConn.addTrack(track, stream);
      });

      if(localVideo) {
         goliveBtn.style.display = "none";
         endliveBtn.style.display = "block";
         liveVideo = 1;

         send({
            type: "live",
            name: name
         });
      }    

   }, function (error) {
      console.log(error);
   });

});

endliveBtn.addEventListener("click", function (event) {
   liveVideo = 0;
   console.log(name + "is ending stream");
   send({
      type: "updatelive",
      name: name
   });
   
   stopStreamedVideo(localVideo);
   toggleprofile('local');
});
endotherliveBtn.addEventListener("click", function (event) {
   liveremoteVideo = 0;
   
   send({
      type: "leave",
   });
   handleLeave();
   toggleprofile('remote');
});

// stop local stream
function stopStreamedVideo(localVideo) {
   const stream = localVideo.srcObject;
   const tracks = stream.getTracks();
   try {
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
   stream = new MediaStream()
   remoteVideo.srcObject = stream
   //when a remote user adds stream to the peer connection, we display it
   yourConn.onaddstream = function (e) {
   remoteVideo.srcObject = e.stream
   }
   connectedUser = otheruser;
   send({
      type: "watch",
      name: name,
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
            offer: offer
         });
 
         yourConn.setLocalDescription(offer);
      }, function (error) {
         alert("Error when creating an offer");
      });
 
   }
 }

////////////////////////////////BELOW IS GOOD

//when somebody sends us an offer
function handleOffer(offer, name) {
   connectedUser = name;
   yourConn.setRemoteDescription(new RTCSessionDescription(offer));

   //create an answer to an offer
   yourConn.createAnswer(function (answer) {
      yourConn.setLocalDescription(answer);

      send({
         type: "answer",
         answer: answer
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
   connectedUser = null;
   remoteVideo.srcObject = null;
   localVideo.srcObject = null;

   yourConn.close();
   yourConn.onicecandidate = null;
   yourConn.onaddstream = null;
   
};

function handleStreams(liveusers) {
   var list = [];
   list = Object.values(liveusers);
   //otheruser = "";
   
   console.log(list.length);
   for (let i = 0; i < list.length; i++) {
      var text = list[i].name.toString();
      liveStreams.innerHTML += "<a href ='#'>" + text + "</a>"; 
      console.log(text);
   }  

}
liveStreams.addEventListener("click", function (event) {
   var val = event.target.innerHTML;
   console.log(val);
   checkProfile(val);     

});
function checkProfile (userdata) {
   console.log(userdata);
   otheruser = userdata;
   console.log(otheruser);
   toggleprofile('remote');
}

function togglehome() {
   profilePage.style.display = "none";
   homePage.style.display = "block";
   liveStreams.innerHTML = "";
   otheruser = "";
   console.log(otheruser);
   send({
      type: "streams",
      name: name
   });
}

function toggleprofile(msg) {
   var data = msg;
   profilePage.style.display = "block";
   homePage.style.display = "none";
   console.log(liveVideo);
   console.log(otheruser);
   console.log(liveremoteVideo);
   switch(data) {
      case "local":
         profileTitle.innerHTML = name;
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
         break;

      case "remote":
         if (otheruser == name) {
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
      break;
   }
      
}

init();

