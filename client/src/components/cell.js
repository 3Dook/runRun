import React, { useEffect, useState } from 'react';
import './display.css'

function Cell(props){
    const [cellContent, setCellContent] = useState('0')
    const [isActive, setActive] = useState("false");

    useEffect(()=>{
        setCellContent(props.data);
    });

    return(
        <div className={"blank" + cellContent.toString()}>
            {cellContent}
        </div>
    );
}



export default Cell;