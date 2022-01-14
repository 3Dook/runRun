import React, { useEffect, useState } from 'react';
import HostOrJoin from './hostOrJoin';
import './display.css';
import GameTable from './gameTable';

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
            <div className="title">RUN RUN</div>
            <div className="bulletinBoard">{props.bulletin}</div>
            <div className='userColumn'>
                <div>
                    Name: {props.clientName}
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
                <div>
                    {host ? <button onClick={handleStart}>START</button> : null}
                </div>
                <div>
                    {restart ? <button onClick={handleRestart}>New Game</button>: null }
                </div>
            </div>
            {showGame ? <GameTable grid={props.grid}/> : <HostOrJoin socket={props.socket} onJoin={onJoin} start={showStart}/>}
        </div>
    );
}



export default Display;