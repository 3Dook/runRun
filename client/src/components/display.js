import React, { useEffect, useState } from 'react';
import Cell from './cell';
import './display.css';

function Display(props){
/*     const [grid, setGrid] = useState */

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
            </div>
            <div className='gameTable'>
                {props.grid.map((row, line)=>{
                    return (
                        <div className='gameGrid' key={line}>
                            {row.map((cell, cellIndex)=>{
                                return(
                                    <Cell key={cellIndex} data={cell}/>
                                )
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}



export default Display;