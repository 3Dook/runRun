import React, { useEffect, useState } from 'react';
import './display.css'

function Cell(props){
    const [cellContent, setCellContent] = useState('0')
    const [isActive, setActive] = useState("false");
    const [backColor, setColor] = useState("#2c2c2c")

    useEffect(()=>{
        setCellContent(props.data);

        if(typeof cellContent == 'number'){
            if(cellContent > 0){
                // player object
                let cellColor = props.colors.find(color => color.name === cellContent);
                try{
                    setColor(cellColor.color);
                }catch(e){
                    setColor("#2c2c2c")
                }
            }
            else{
                setColor("#2c2c2c")
            }
        }
        else{
            setColor("#2c2c2c")
        }
    });

    return(
        <div className={"blank" + cellContent.toString()} 
        style={{backgroundColor: backColor}}>
            {cellContent}
        </div>
    );
}



export default Cell;