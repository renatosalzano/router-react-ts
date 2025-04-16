// import { useState } from 'react';
import { Router, navigate } from 'react-router';
import './App.css';
import Header from './layout/Header';
import { Routes } from './pages/routes';

function App() {


  function to_user() {
    navigate<Routes>("/mimmo/store", 404)
  }

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
