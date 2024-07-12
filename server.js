//require our websocket library
var WebSocketServer = require('ws').Server;

//creating a websocket server at port 9090
var wss = new WebSocketServer({port: 9090});

//all connected to the server users
var users = {};
var liveusers = {};

//when a user connects to our sever
wss.on('connection', function(connection) {

   console.log("User connected");

   //when server gets a message from a connected user
   connection.on('message', function(message) {

      var data;
      //accepting only JSON messages
      try {
         data = JSON.parse(message);
      } catch (e) {
         console.log("Invalid JSON");
         data = {};
      }

      //switching type of the user message
      switch (data.type) {
         //when a user tries to login

         case "login":
            console.log("User logged", data.name);

            //if anyone is logged in with this username then refuse
            if(users[data.name]) {
               sendTo(connection, {
                  type: "login",
                  success: false
               });
            } else {
               //save user connection on the server
               users[data.name] = connection;
               connection.name = data.name;

               sendTo(connection, {
                  type: "login",
                  success: true,
                  name: data.name
               });
            }

            break;
         
         case "addlive":
            //add user to list of live users
            console.log(data.username, " is added to live list");
            liveusers[data.username] = connection;
            connection.name = data.username;
            

            break;

         case "updatelive":
            //delete user from list of live users
            if(liveusers[data.username]) {
               delete liveusers[connection.name];
               console.log(data.username, " is removed from live list");
            } else {
               console.log(data.username, " is not removed from live list");
            }
            

            break;

         case "offer":
            //for ex. UserA wants to call UserB
            console.log("Sending offer to: ", data.host);

            //if UserB exists then send him offer details
            var conn = users[data.host];

            if(conn != null) {
               //setting that UserA connected with UserB
               connection.otherName = data.host;
              // console.log("Offer name: ", connection.name);
              // console.log("Offer othername to: ", connection.otherName);

               sendTo(conn, {
                  type: "offer",
                  offer: data.offer,
                  name: connection.name,
                  host: data.host
               });
            }

            break;

         case "answer":
            console.log("Sending answer to: ", data.host);
            //for ex. UserB answers UserA
            var conn = users[data.host];
            console.log(connection.name + " conn name in answer");
            console.log(connection.otherName + " other conn name in answer");
            if(conn != null) {
               connection.otherName = data.host;
               sendTo(conn, {
                  type: "answer",
                  answer: data.answer
               });
            }

            break;

         case "candidate":
            console.log("Sending candidate to:",data.name);
            var conn = users[data.name];

            if(conn != null) {
               sendTo(conn, {
                  type: "candidate",
                  candidate: data.candidate
               });
            }

            break;

         case "streams":
         console.log("Sending all streams to:",data.name);
         var conn = users[data.name];

         if(conn != null) {
            sendTo(conn, {
               type: "liveusers",
               name: liveusers
            });
         }

             break;
             
         case "watch":
            console.log("Sending offer to: ", data.host);
            var conn = users[data.host];
            if(conn != null) {
               //setting that UserA connected with UserB
               connection.otherName = data.host;

               sendTo(conn, {
                  type: "watch",
                  name: connection.name
               });
            }

            break;

         case "leave":
            console.log("On Leave - disconnecting from", data.othername);
            var conn = users[data.username];
            //conn.othername = null;

            //notify the other user so he can disconnect his peer connection
            if(conn != null) {
               sendTo(conn, {
                  type: "leave"
               });
            }

            break;

         default:
            sendTo(connection, {
               type: "error",
               message: "Command not found: " + data.type
            });

            break;
      }
   });

   //when user exits, for example closes a browser window
   //this may help if we are still in "offer","answer" or "candidate" state
   connection.on("close", function() {

      if(liveusers[connection.name]) {
         delete liveusers[connection.name];
         console.log("Deleting live user ", connection.name);
      }
      if(connection.name) {
         console.log("Deleting user ", connection.name);
         delete users[connection.name];
         
      
         if(connection.otherName ) {
            console.log("On Close - disconnecting from ", connection.otherName);
            var conn = users[connection.otherName];
               conn.otherName = null;
           
         }
      }
   });

});

function sendTo(connection, message) {
   connection.send(JSON.stringify(message));
}
