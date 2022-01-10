// app
var express = require("express");
var path = require("path");
//import * as cors from "cors";
var cors = require('cors');
var app = express();
app.use(cors());
const http = require('http').Server(app);

//Sockets
const io = require('socket.io')(http, {
    cors: {
        //origin: ["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:3000/"],
        origin: "*", 
        methods: ["GET", "POST"],
    },
   allowEIO3: true
});

/* https://stackoverflow.com/questions/23653617/socket-io-listen-events-in-separate-files-in-node-js */
io.on("connection", client =>{
    require('./routes/game')(client, io);
})

http.listen(process.env.PORT || 5001);