const { FRAMERATE } = require('./constants')
const {updateBoard, createGameState, addPlayer, gameLoop, cleanBoard} = require('./gameControl')
const {makeid} = require('./utils')

const state = {}
const clientRooms = {}



module.exports = (client, io)=>{
    client.on('hostGame', handleHostgame);
    client.on('joinGame', handleJoingame);
    client.on('startGame', handleStartGame);
    client.on('disconnect', handleDisconnect); 
    client.on('restartGame', handleRestart);
    client.on("keyPress", (k)=>{
        const roomName = clientRooms[client.id];
        if(!roomName){
            return;
        }

        // check to see if player has been eliminated;

        //get client Id and then pass that information to
        // update the board
        data = state[roomName]
        player = client.id
        // check to see if player has been eliminated
        let playerIsOut = data.players.find(player => player.id === client.id); 

        if(playerIsOut.eliminated){
            return;
        }

        // update the board
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
        io.in(roomName).emit("bulletin", `Player ${playNum.name} has Disconnected`);

        data = cleanBoard(data, player);
        state[roomName] = data;
        io.in(roomName).emit("update", data);

        //update lobby size;
        io.in(roomName).emit("lobbySize", data.players.length);

    
        //If there are no more players in the room then delete the state
        if(data.players.length <= 0){
            delete state[roomName];
        }
    }

    function handleHostgame(){
        let roomName = makeid(5);
        clientRooms[client.id] = roomName;
        client.emit('roomName', roomName);
        state[roomName] = createGameState(); 
        client.number = 1;
        addPlayer(state[roomName], client.id, client.number)
        client.join(roomName);
        client.emit('clientName', `Player ${client.number}`);
        io.in(roomName).emit("bulletin", `Player ${client.number} started Host game`)
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
        } else if (numClients > 7){
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
        client.emit("joinSuccess");
        // correct get the right number here to fix the name
        client.number = clientNewNumber;
        client.emit('roomName', roomName);
        client.emit('clientName', `Player ${client.number}`)
        io.in(roomName).emit("lobbySize", numClients + 1);
        state[roomName] = addPlayer(state[roomName], client.id, client.number)
        let msg  = `Player ${client.number} has joined the room`;
        io.in(roomName).emit("bulletin", msg)
        io.in(roomName).emit("update", state[roomName])
    }
 
    
    function frameLoop(roomName){
        const intervalId = setInterval(()=>{
/*             const winner = gameLoop(state[roomName]); */
            gameLoop(state[roomName], roomName, io);

            if(state[roomName].active){
                //there is at least one player active so keep going.
                io.in(roomName).emit("update", state[roomName]) 
            } else {
                io.in(roomName).emit("update", state[roomName]) 
                // broadcast winner based on highest score.
                let highestScore = 0;
                let highestPlayers = [];

                state[roomName].players.forEach(player => {
                    if(player.score >= highestScore){
                        highestScore = player.score;
                    }
                })

                highestPlayers = state[roomName].players.filter(p => p.score === highestScore);

                let winners = highestPlayers.map((player)=>{
                    return player.name;
                })
                io.in(roomName).emit("bulletin", `Player ${winners} has Won with a score of ${highestScore}`) 
                io.in(roomName).emit("resetAllowed")
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


    function handleRestart(roomName){
        if(!state[roomName]){
            client.emit("fail", "unable to restart game")
            return
        }

        let temp = createGameState();

        state[roomName].players.forEach(player=>{
            addPlayer(temp, player.id, player.name);
        })
        //need to get list of clients in a room and
        // make a new board, and reassign all players positions.
        state[roomName] = temp;
        io.in(roomName).emit("update", state[roomName]) 
    }
}