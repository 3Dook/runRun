import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Display from './components/display'
import HostOrJoin from './components/hostOrJoin';
import './App.css';



function App() {  
  const [socket, setSocket] = useState(null);
  const [data, setData] = useState([[0,0,0],[0,0,0],[0,0,0]]);
  const [client, setClient] = useState(null);
  const [roomName, setRoom] = useState(null);
  const [lobbySize, setLobby] = useState(1);
  const [bulletin, setBullet] = useState("PLEASE HOST OR JOIN A GAME TO START");
  const [playScore, setScore] = useState(0);
 
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
      let score = board.players.find(player=> player.id === newSocket.id);
      setScore(score.score);
      setData(board.board);
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


  return (
    <div className="App">
      <Display grid={data} bulletin={bulletin} clientName={client} roomName={roomName} lobby={lobbySize} playScore={playScore} socket={socket}/>
    </div>

  );
}

export default App;
