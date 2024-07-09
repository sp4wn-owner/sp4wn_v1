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
         handleStreams(users);
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

var goliveBtn = document.querySelector('#go-liveBtn');
var watchstreamBtn = document.querySelector('#watch-streamBtn');

var hangUpBtn = document.querySelector('#hangUpBtn');

var localVideo = document.querySelector('#localVideo');
var remoteVideo = document.querySelector('#remoteVideo');

var yourConn;
var stream;
var callToUsernameInput;

var configuration = {
       "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }]
    };

function init() {
   if (name) {
      streamPage.style.display = "none";
      loginPage.style.display = "none";
   }else {
      streamPage.style.display = "none";
      loginPage.style.display = "block";
}};


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
      streamPage.style.display = "none";
      loginPage.style.display = "none";

      //check if user is admin
      if (name == "admin") {
        console.log("is admin");
        adminbtnContainer.style.display = "block";
        viewerbtnContainer.style.display = "none";

        yourConn = new webkitRTCPeerConnection(configuration);

      } else {
        console.log(name + " is not admin");
        fetchstreams();
        viewerbtnContainer.style.display = "block";
        adminbtnContainer.style.display = "none";
        callToUsernameInput = "admin";

        yourConn = new webkitRTCPeerConnection(configuration);
        stream = new MediaStream()
        localVideo.srcObject = stream

        //when a remote user adds stream to the peer connection, we display it
         yourConn.onaddstream = function (e) {
            localVideo.srcObject = e.stream
         };

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

  }
};

goliveBtn.addEventListener("click", function () {
  console.log(name +" is going live");
  navigator.webkitGetUserMedia({ video: true, audio: false }, function (myStream) {
     stream = myStream;

     //displaying local video stream on the page
     localVideo.srcObject = stream

     // setup stream listening
     yourConn.addStream(stream);

  }, function (error) {
     console.log(error);
  });

  if (localVideo) {
    adminbtnContainer.style.display = "none";
  }

  });

  watchstreamBtn.addEventListener("click", function () {

    send({
       type: "watch",
       name: name,
       host: "admin"
    });

    if(localVideo) {
      viewerbtnContainer.style.display = "none";
    }

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

   if (name == "admin") {
     adminbtnContainer.style.display = "block";
   }
   if (name != "admin") {
     viewerbtnContainer.style.display = "block";
   }
};

function fetchstreams () {
   send({
       type: "streams",
       });
}
function handleStreams(users) {
       for (let i = 0; i < images.length; i++) {
           document.getElementById("live-streams").innerHTML = users[i];
       }
}

init();