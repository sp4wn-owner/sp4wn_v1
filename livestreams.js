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



 for (let i = 0; i < names.length; i++) {
    document.getElementById("live-streams").innerHTML = names[i];
}

for (let i = 0; i < list.length; i++) {
    document.getElementById("live-streams").innerHTML = list[i].name;
}