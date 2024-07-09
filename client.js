//our username
var name;
var connectedUser;

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
      case "streams":
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

var goliveBtn = document.querySelector('#goliveBtn');
var endliveBtn = document.querySelector('#endliveBtn');
var watchstreamBtn = document.querySelector('#watch-streamBtn');
var getstreamsBtn = document.querySelector('#getstreamsbtn');

var hangUpBtn = document.querySelector('#hangUpBtn');

var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

var yourConn;
var stream;
var callToUsernameInput;
let liveVideo = 0;



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

      document.getElementById("live-streams").innerHTML = "";
   
      send({
         type: "streams",
         name: name
      });
      
    }
};

getstreamsBtn.addEventListener("click", function (event) {
   document.getElementById("live-streams").innerHTML = "";
   
      send({
         type: "streams",
         name: name
      });
   

});

goliveBtn.addEventListener("click", function () {
  console.log(name +" is going live");
  navigator.webkitGetUserMedia({ video: true, audio: false }, (stream) => {
     yourConn = new RTCPeerConnection();
     
     //displaying local video stream on the page
     localVideo.srcObject = stream

     stream.getTracks().forEach((track) => {
      yourConn.addTrack(track, stream);
      });

      if(localVideo) {
         goliveBtn.style.display = "none";
         endliveBtn.style.display = "block";
         liveVideo = 1;
      }
     

   }, function (error) {
      console.log(error);
   });

});

endliveBtn.addEventListener("click", function (event) {
   stopStreamedVideo(localVideo);
   yourConn.onicecandidate = null;
   yourConn.onaddstream = null;
   goliveBtn.style.display = "block";
   endliveBtn.style.display = "none";
   liveVideo = 0;
   

});

// stop both mic and camera
function stopStreamedVideo(localVideo) {
   const stream = localVideo.srcObject;
   const tracks = stream.getTracks();
 
   tracks.forEach((track) => {
     track.stop();
   });
 
   localVideo.srcObject = null;
 }

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

  };
};

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
   localVideo.srcObject = null;

   yourConn.close();
   yourConn.onicecandidate = null;
   yourConn.onaddstream = null;

   goliveBtn.style.display = "block";
};

function handleStreams(users) {
   console.log(users);
   var list = [];
   list = Object.values(users);
   console.log(list);
   
   console.log(list.length);
   for (let i = 0; i < list.length; i++) {
      document.getElementById("live-streams").innerHTML += "<div class='livestream'>" + list[i].name;"</div>"
  }

      
}
function togglehome() {
   profilePage.style.display = "none";
   homePage.style.display = "block";
}
function toggleprofile() {
   profilePage.style.display = "block";
   homePage.style.display = "none";
   console.log(liveVideo);
   if (liveVideo == 1) {
      goliveBtn.style.display = "none";
      endliveBtn.style.display = "block";
   } else {
      goliveBtn.style.display = "block";
      endliveBtn.style.display = "none";
   }
   
}

init();

