import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Display from './components/display'

import './App.css';



function App() {  
  const [socket, setSocket] = useState(null);
  const [data, setData] = useState([[0,0,0],[0,0,0],[0,0,0]]);
  const [client, setClient] = useState(null);
  const [roomName, setRoom] = useState(null);
  const [lobbySize, setLobby] = useState(1);
  const [bulletin, setBullet] = useState("PLEASE HOST OR JOIN A GAME TO START")
 
  const [message, setMessge] = useState("ENTER ROOM CODE")

  useEffect(() => {
    const newSocket = io(`http://localhost:5001`);
    setSocket(newSocket);
    window.addEventListener('keydown', (event) => {
      newSocket.emit("keyPress", event.key);
    });

    newSocket.on('connect', ()=>{
      console.log(newSocket.id)
    })

    newSocket.on('disconnect', ()=>{
      console.log("Good bye")
    })

    newSocket.on("clientName", (name)=>{
      setClient(name);
    })

    newSocket.on("roomName", (name)=>{
      setRoom(name);
    })

    newSocket.on("fail", (msg)=>{
      console.log(msg)
    })
    newSocket.on('update', (board)=>{
      setData(board.board)
    })

    newSocket.on('lobbySize', (count)=>{
      setLobby(count);
    })
   
    newSocket.on('bulletin', (msg)=>{
      setBullet(msg)
    })

    const temp = new Array(6);
    for (let i=0; i<temp.length; i++) {
        temp[i] = new Array(20).fill(0);
    }
    setData(temp);
  }, []);

  function handleHostButton(){
/*     console.log(socket) */
    //socket.emit("HI")
    socket.emit("hostGame")
  }

  function handleJoinButton(e){
    e.preventDefault();
    console.log("attempting to join room ", message)
    socket.emit("joinGame", message);
  }

  function handleMessageChange(e){
    console.log(e.target.value)
    setMessge(e.target.value)
  }

  function handleStart(e){
    e.preventDefault();
    socket.emit('startGame', roomName);
  }

  return (
    <div className="App">
      <div>
        <button onClick={handleHostButton}>HOST</button>
        <div>
          <form /* onSubmit={this.handleSubmit} */>
            <label>
                <input type="text" name="room" placeholder={message} onChange={handleMessageChange} />
            </label>
            <input type="submit" value="Join" onClick={handleJoinButton} />
          </form>
        </div>
      </div>
      <Display grid={data} bulletin={bulletin} clientName={client} roomName={roomName} lobby={lobbySize}/>
      <div>
        <button onClick={handleStart}>START</button>
      </div>
    </div>

  );
}

export default App;
