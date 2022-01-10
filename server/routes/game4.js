const { FRAMERATE } = require('./constants')
const {updateBoard, createGameState, addPlayer, gameLoop, cleanBoard} = require('./gameControl')
const {makeid} = require('./utils')

const state = {}
const clientRooms = {}



module.exports = (client, io)=>{
    //client.emit("hi", "NO HEAD ACHES PLEASE")
    client.on("HI", ()=>{
        console.log("hello")
    });
    client.on('hostGame', handleHostgame);
    client.on('joinGame', handleJoingame);
    client.on('startGame', handleStartGame);
    client.on('disconnect', handleDisconnect); 
    client.on("keyPress", (k)=>{
        const roomName = clientRooms[client.id];
        if(!roomName){
            return;
        }
        //get client Id and then pass that information to
        // update the board
        data = state[roomName]
        player = client.id
        data = updateBoard(data, k, player);
        state[roomName] = data
        io.in(roomName).emit("update", data)
    }) 

    function handleDisconnect(){
        const roomName = clientRooms[client.id];
        if(!roomName){
            return;
        }
        // update the board
        data = state[roomName]
        player = client.id

        // find player number
        let playNum = data.players.find(p=> p.id === player);

        data = cleanBoard(data, player);
        state[roomName] = data;
        io.in(roomName).emit("update", data);
        io.in(roomName).emit("bulletin", `Player ${playNum} has Disconnected`);

        //update lobby size;
        io.in(roomName).emit("lobbySize", data.players.length);

        
    }

    function handleHostgame(){
        let roomName = makeid(5);
        clientRooms[client.id] = roomName;
        client.emit('roomName', roomName);
        let clientShortName = client.id.slice(-5, -1)
        client.emit('clientName', clientShortName)
        state[roomName] = createGameState(client.id); 
        client.join(roomName);
        client.number = 1;
        client.emit()
        io.in(roomName).emit("update", state[roomName])
        //console.log(clientRooms)
    }

    async function handleJoingame(roomName){
        //check if room is Valid
        if(!state[roomName]){
            client.emit("bulletin", "FAILED TO JOIN ROOM")
            return
        }

        const room = await io.in(roomName).fetchSockets();
        let numClients = 0;
        if(room){
            numClients = Object.keys(room).length;
        }

        if (numClients === 0){
            client.emit("bulletin", 'unknownGame');
            return
        } else if (numClients > 8){
            client.emit("bulletin", 'tooManyPlayers');
            return
        }

        //get all the numbers of the clients in the room 
        // and dynamically figure out which is the correct number to reassign them
        let clientsNumber = []
        for(let i = 0; i < numClients; i++){
            clientsNumber.push(room[i].number);
        }

        let clientNewNumber = 0;
        for(let k=1; k < 9; k++){
            if(!clientsNumber.includes(k)){
                clientNewNumber = k;
                break;
            }
        }

        clientRooms[client.id] = roomName;
        client.join(roomName);
        // correct get the right number here to fix the name
        client.number = clientNewNumber;
        client.emit('roomName', roomName);
        let clientShortName = client.id.slice(-5, -1)
        client.emit('clientName', clientShortName)
        io.in(roomName).emit("lobbySize", numClients + 1);
        state[roomName] = addPlayer(state[roomName], client.id, client.number)
        let msg  = `Player ${client.number} has joined the room`;
        io.in(roomName).emit("bulletin", msg)
        io.in(roomName).emit("update", state[roomName])
    }
 
    
    function frameLoop(roomName){
        const intervalId = setInterval(()=>{
            const winner = gameLoop(state[roomName]);
            if(!winner){
                //no one won so keep playing
                io.in(roomName).emit("update", state[roomName]) 
            } else {
                io.in(roomName).emit("update", state[roomName]) 
                // send the loser who died and everyone else who is alive so they can keep playing.
                let msg = `PLAYER ${winner} has died`
                io.in(roomName).emit("bulletin", msg) 

                // check interval to see is there anyone left in the game.
                clearInterval(intervalId);
            }
        }, 1000 / FRAMERATE);
    }

    function handleStartGame(roomName){
        if(!state[roomName]){
            client.emit("fail", "FAILED TO JOIN ROOM")
            return
        }

        let onThree = 3;
        const countDown = setInterval(()=>{
            if(onThree <= 0){
                let msg = `GAME IN PROGRESS`
                io.in(roomName).emit("bulletin", msg) 
                frameLoop(roomName)
                clearInterval(countDown);
            }else{
                let msg = `Starting in ${onThree}`;
                onThree -= 1;
                io.in(roomName).emit("bulletin", msg) 
            }
        }, 1000);
    }
}