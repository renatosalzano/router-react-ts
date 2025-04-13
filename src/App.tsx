// import { useState } from 'react';
import { Router, navigate } from 'react-router';
import './App.css';


function App() {


  function to_user() {
    navigate("/user", 404)
  }

  function to_home() {
    navigate("/")
  }

  function to_admin() {
    navigate("/user/admin")
  }



  return (
    <div>
      <h1>App.tsx</h1>
      <div>
        <button onClick={to_home}>home page</button>
        <button onClick={to_user}>user page</button>
        <button onClick={to_admin}>user admin</button>
      </div>
      <Router />
    </div>
  )
}

export default App
