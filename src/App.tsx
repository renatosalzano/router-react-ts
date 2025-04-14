// import { useState } from 'react';
import { Router, navigate } from 'react-router';
import './App.css';
import Header from './layout/Header';


function App() {


  // function to_user() {
  //   navigate("/user", 404)
  // }

  // function to_home() {
  //   navigate("/")
  // }

  // function to_admin() {
  //   navigate("/user/admin")
  // }



  return (
    <>
      <Header />
      <main>
        <Router />
      </main>
    </>
  )
}

export default App
