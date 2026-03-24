import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// On Koyeb, this will automatically point to your URL
const socket = io(); 

function App() {
  const [screen, setScreen] = useState('home'); 
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [students, setStudents] = useState([]);

  useEffect(() => {
    socket.on('room_created', (newCode) => {
      setCode(newCode);
      setScreen('lobby');
    });

    socket.on('update_students', (list) => {
      setStudents(list);
    });

    socket.on('error_msg', (msg) => alert(msg));
  }, []);

  const hostGame = () => socket.emit('create_room');
  const joinGame = () => {
    if(code && name) {
        socket.emit('join_room', { roomCode: code, name: name });
        setScreen('waiting');
    }
  };

  return (
    <div style={{ backgroundColor: '#282c34', minHeight: '100vh', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>CANDO EDUCATION</h1>

      {screen === 'home' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={hostGame} style={{ padding: '15px 30px', fontSize: '1.2rem', backgroundColor: '#4CAF50', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px' }}>TEACHER: HOST GAME</button>
          <hr />
          <input placeholder="ENTER CODE" onChange={(e) => setCode(e.target.value)} style={{ padding: '15px', fontSize: '1.2rem', textAlign: 'center' }} />
          <input placeholder="YOUR NAME" onChange={(e) => setName(e.target.value)} style={{ padding: '15px', fontSize: '1.2rem', textAlign: 'center' }} />
          <button onClick={joinGame} style={{ padding: '15px 30px', fontSize: '1.2rem', backgroundColor: '#2196F3', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '8px' }}>JOIN GAME</button>
        </div>
      )}

      {screen === 'lobby' && (
        <div style={{ textAlign: 'center' }}>
          <h2>Join at <strong>Cando-Education.com</strong></h2>
          <div style={{ fontSize: '5rem', background: 'white', color: 'black', padding: '20px', borderRadius: '15px', margin: '20px' }}>{code}</div>
          <h3>Students Joined:</h3>
          {students.map(s => <div key={s.id} style={{ fontSize: '1.5rem' }}>👤 {s.name}</div>)}
        </div>
      )}

      {screen === 'waiting' && (
        <div style={{ textAlign: 'center' }}>
          <h2>You're In, {name}!</h2>
          <p>Wait for your teacher to start the game.</p>
        </div>
      )}
    </div>
  );
}

export default App;
