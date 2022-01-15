import React, { useEffect, useState } from 'react';
import Cell from './cell';
import './display.css';

function GameTable(props){
    return(
            <div className='gameTable'>
                {props.grid.map((row, line)=>{
                    return (
                        <div className='gameGrid' key={line}>
                            {row.map((cell, cellIndex)=>{
                                return(
                                    <Cell key={cellIndex} data={cell} colors={props.colors}/>
                                )
                            })}
                        </div>
                    );
                })}
            </div>
    );
}

export default GameTable;