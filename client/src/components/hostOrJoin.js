import React, { useEffect, useState } from 'react';
import './display.css';
import Button from 'react-bootstrap/Button';

function HostOrJoin(props){
/*     const [grid, setGrid] = useState */
    const [placeholder, setPlaceholder] = useState("Enter Room Code")
    

    function handlePlacerHolderChange(e){
        console.log(e.target.value)
        setPlaceholder(e.target.value)
    }

    function handleHostButton(){
        props.onJoin();
        props.start();
        props.socket.emit("hostGame")
    }

    function handleJoinButton(e){
        e.preventDefault();
        console.log("attempting to join room ", placeholder)
        props.socket.emit("joinGame", placeholder);
        props.socket.on("joinSuccess", ()=>{
            props.onJoin()
        })
    }

    return(
        <div className='hostOrJoin'>
            <Button variant="success" onClick={handleHostButton} size="lg">HOST</Button>       
            <p>OR</p>
          <form /* onSubmit={this.handleSubmit} */>
            <label>
                <input type="text" name="room" placeholder={placeholder} onChange={handlePlacerHolderChange} />
            </label>
            <Button variant="primary"onClick={handleJoinButton} size="lg">JOIN</Button>
          </form>
        </div>
    );
}



export default HostOrJoin;