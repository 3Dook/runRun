import React, { useEffect, useState } from 'react';
import HostOrJoin from './hostOrJoin';
import './display.css';
import GameTable from './gameTable';
import Button from 'react-bootstrap/esm/Button';

function Display(props){
/*     const [grid, setGrid] = useState */
    const [showGame, setShowGame] = useState(false);
    const [host, setHost] = useState(false);
    const [restart, setRestart] = useState(false);
    
    function handleStart(e){
        e.preventDefault();
        showStart();
        props.socket.emit('startGame', props.roomName);
        props.socket.on('resetAllowed', ()=>{
            setRestart(!restart)
        }) 
    }

    function onJoin(){
        setShowGame(!showGame);
    } 

    function showStart(){
        setHost(!host);
    }

    function handleRestart(e){
        e.preventDefault();
        props.socket.emit('restartGame', props.roomName);
        setRestart(!restart);
        setHost(!host);
    }

    return(
        <div className="gameDisplay">
            {showGame ?
            <div className='userColumn'>
                <div>
                    {props.clientName}
                </div>
                <div>
                    Room: {props.roomName}
                </div>
                <div>
                    Lobby: {props.lobby}
                </div>
                <div>
                    Score: {props.playScore}
                </div>
            </div>
            : null
            }


            {showGame ? 
            <div className="bulletinBoard">{props.bulletin}</div>
            :
            <div className="mainbulletinBoard">{props.bulletin}</div>
            }

            {showGame ? <GameTable grid={props.grid} colors={props.colors}/> : <HostOrJoin socket={props.socket} onJoin={onJoin} start={showStart}/>}

            {host ? <Button variant="success" className="startOrRestart" onClick={handleStart} size="lg">START</Button>: null}

            {restart ?  <Button variant="warning" className="startOrRestart" onClick={handleRestart} >NEW GAME</Button>: null }

            {showGame ?
            <div className='instructions'>Instruction: Use "WASD" to move and collect points and block other players. The player with the highest Points wins!
            </div> : null
            }
        </div>
    );
}



export default Display;