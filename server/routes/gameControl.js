const {FRAMERATE, XGRIDSIZE, YGRIDSIZE, POINTS} = require('./constants')
module.exports = {
    updateBoard,
    createGameState,
    addPlayer,
    gameLoop,
    cleanBoard,
}



function gameLoop(game, roomName, io){

    let shiftPlayers = [];
    game.players.forEach(player =>{
        if (validMove(game.board, player.pos.x+1, player.pos.y)){
            if( game.board[player.pos.y][player.pos.x + 1] === '*'){
                player.score += POINTS;
            }
            game.board[player.pos.y][player.pos.x + 1] = player.name;
            game.board[player.pos.y][player.pos.x] = 0;
        }else if (game.board[player.pos.y][player.pos.x + 1] > 0){
            // If another player is in front shift forward later if possible
            shiftPlayers.push(player.name);
        }
        else{
            player.pos.x -= 1;
        }
    })    
  
    //for loop backwards to check and move it forward.
    let shiftLength = shiftPlayers.length;
    for(let i = shiftLength; i > 0; i--){
        let tempShift = game.players.find(player => player.name === shiftPlayers[i - 1])
        if (validMove(game.board, tempShift.pos.x + 1, tempShift.pos.y)){
            game.board[tempShift.pos.y][tempShift.pos.x + 1] =tempShift.name;
            game.board[tempShift.pos.y][tempShift.pos.x] = 0;
        }
        else{
            tempShift.pos.x-= 1;
        }
    }

    game.board.forEach(row => {
        check = row.shift()
        row.push(0)
    });

    game.obstacle += 1;
    if(game.obstacle > 3){
        createObstacle(game)
        game.obstacle = 0
    }else if(game.obstacle < 2){
        do {
            xTemp = Math.floor(Math.random() * XGRIDSIZE);
            yTemp = Math.floor(Math.random() * YGRIDSIZE);
        } while(!validMove(game.board, xTemp, yTemp));
    
        game.board[yTemp][xTemp] = "*"
    }

    game.active = false;
    game.players.forEach(player =>{
        if(!player.eliminated){
            if(player.pos.x < 0){
                player.eliminated = true;
                let msg = `PLAYER ${player.name} has been eliminated`;
                io.in(roomName).emit("bulletin", msg) 
            }else{
                player.score += 1;
                game.active = true;
            }
        }
    })

/*     for(let i=0; i<game.players.length; i++){
        if(game.players[i].pos.x < 0){
            return game.players[i].name;
        }
    } */
}

function createGameState(){
    
    // GRID Size
    const arr = new Array(YGRIDSIZE);
    for (let i=0; i<arr.length; i++) {
        arr[i] = new Array(XGRIDSIZE).fill(0);
    }    

    game = {
        obstacle: 0,
        players:[],
        active: true,
        board: arr
    }

    return game;

}

function addPlayer(game, playerId, playNum){
    // check if space with valid move then set it as parameter
    do {
        xTemp = Math.floor(Math.random() * XGRIDSIZE);
        yTemp = Math.floor(Math.random() * YGRIDSIZE);
    } while(!validMove(game.board, xTemp, yTemp));

    let temp = {
        name: playNum,
        id: playerId,
        score: 0,
        eliminated: false,
        pos:{
            x: xTemp,
            y: yTemp,
        },
        color: "red",
    }

    game.players.push(temp)
    game.board[yTemp][xTemp] = playNum
    return game;
}
function validMove(board, x, y){
    // This function will return true if move is valid or no if it is not
    // Check if x or y would go over
    let rows = board.length - 1
    let columns = board[0].length - 1

    if(y < 0 || x < 0 || y > rows || x > columns){
        return false;
    }

    if (board[y][x] === 0 || board[y][x]=== '*'){
        return true
    }
    return false;
}

function createObstacle(game){
    //This function reads the game state and will add obstacles for user to avoid. 
/*     xtemp = Math.floor(Math.random() * (XGRIDSIZE-15) + 15); */
    ytemp = Math.floor(Math.random() * (YGRIDSIZE) + 3);

    let obstacleArray = []
    for(let i = 0; i < yTemp; i++){
        let temp = Math.floor(Math.random() * YGRIDSIZE);
        obstacleArray.push(temp);
    }

    obstacleArray.forEach(obstacle =>{
        if(game.board[obstacle][XGRIDSIZE-1] === 0){
            game.board[obstacle][XGRIDSIZE-1]  = "||" 
        }
    })

    //change frame rates
    // multiple types road blocks 
    // fire   
}

function cleanBoard(game, playerId){

    player = game.players.find( p => p.id === playerId);
    playerIndex = game.players.findIndex(p=>p.id === playerId);
    x = player.pos.x
    y = player.pos.y
    //clean up the board
    game.board[y][x] = 0;
    if (playerIndex > -1){
        game.players.splice(playerIndex, 1);
    }

    return game;

}

function updateBoard(game, key, playerId){

    player = game.players.find( p => p.id === playerId);
    playerIndex = game.players.findIndex(p=>p.id === playerId);
    x = player.pos.x
    y = player.pos.y
    oldx = x;
    oldy = y;
    try{
        switch(key){
            case 'w':
                y = y-1;
                break;
            case "s":
                y = y+1
                break;
            case "d":
                x=x+1;
                break;
            case 'a':
                x=x-1;
               break;
        }

        if(validMove(game.board, x, y)){
            if( game.board[y][x] === '*'){
                player.score += POINTS;
            }
            game.board[y][x] = player.name;
            game.players[playerIndex].pos.x = x;
            game.players[playerIndex].pos.y = y;
            //reset the previous position
            game.board[oldy][oldx] = 0;
        }
        
    } catch(err){
        console.log(err)
    }

    return game;
}

