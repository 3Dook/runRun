const {FRAMERATE, XGRIDSIZE, YGRIDSIZE} = require('./constants')
module.exports = {
    updateBoard,
    createGameState,
    addPlayer,
    gameLoop,
    cleanBoard,
}

function gameLoop(game){
    //players and the board,
    // each loop will shift each array forward
    // and then either make obstacles, boons or nothing
    game.board.forEach(row => {
        check = row.shift()
        //console.log(check)
        row.push(0)
    });

    // Originally shift player back with the game.
    // v2. let players stay in place
    game.players.forEach(player =>{
        player.pos.x -= 1;
        temp = game.board[player.pos.y][player.pos.x+1]
        game.board[player.pos.y][player.pos.x+1] = temp;
        game.board[player.pos.y][player.pos.x] = player.name;
    })

    game.obstacle += 1;
    if(game.obstacle > 3){
        createObstacle(game)
        game.obstacle = 0
    }

    //
    for(let i=0; i<game.players.length; i++){
        if(game.players[i].pos.x < 0){
            return game.players[i].name;
        }
    }



}

function createGameState(playerId){
    
    // GRID Size
    const arr = new Array(YGRIDSIZE);
    for (let i=0; i<arr.length; i++) {
        arr[i] = new Array(XGRIDSIZE).fill(0);
    }    

    game = {
        obstacle: 0,
        players:[],
        board: arr
    }

    addPlayer(game, playerId, 1);

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

    if (board[y][x] === 0){
        return true
    }
    return false;
}

function createObstacle(game){
    //This function reads the game state and will add obstacles for user to avoid. 
    xtemp = Math.floor(Math.random() * (XGRIDSIZE-15) + 15);
    ytemp = Math.floor(Math.random() * YGRIDSIZE);
    upOrdown = Math.floor(Math.random() * 2);
    for(let i = 0; i < (ytemp); i++){
        if(game.board[i][xtemp] > 0){
            continue;
        }
        else{
            game.board[i][xtemp] = '*'
        }
    }
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

