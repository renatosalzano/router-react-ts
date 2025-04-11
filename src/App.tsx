// import { useState } from 'react';
import { Router, navigate } from 'react-router';
import './App.css';
import { useRef } from 'react';


function App() {

  const current_route = useRef('/')

  function onclick() {
    const next_page = current_route.current == '/' ? "/user" : '/';
    current_route.current = next_page
    console.log(next_page)
    navigate("")
  }

  return (
    <div>
      <h1>App.tsx</h1>
      <div>
        <button onClick={onclick}>switch page</button>
      </div>
      <Router />
    </div>
  )
}

export default App
