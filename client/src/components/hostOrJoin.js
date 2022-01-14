import React, { useEffect, useState } from 'react';


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
        <div>
            <button onClick={handleHostButton} >HOST</button>
          <form /* onSubmit={this.handleSubmit} */>
            <label>
                <input type="text" name="room" placeholder={placeholder} onChange={handlePlacerHolderChange} />
            </label>
            <input type="submit" value="Join" onClick={handleJoinButton} />
          </form>
        </div>
    );
}



export default HostOrJoin;