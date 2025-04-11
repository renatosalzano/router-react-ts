// import { useState } from 'react';
import { Router, navigate } from 'react-router';
import './App.css';
import { useRef } from 'react';


function App() {


  const current_route = useRef('/')

  function to_user() {
    navigate("/user")
  }

  function to_home() {
    navigate("/")
  }



  return (
    <div>
      <h1>App.tsx</h1>
      <div>
        <button onClick={to_home}>home page</button>
        <button onClick={to_user}>user page</button>
      </div>
      <Router />
    </div>
  )
}

export default App
