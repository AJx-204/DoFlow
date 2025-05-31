import React from 'react'
import App from './App';
import Auth from './Auth/Auth';
import { Route, Routes } from 'react-router-dom';
import { Otp, ResetPassword, Sing } from './Auth';

const Layout = () => {


  return (
   <Routes>
    <Route
      path="*"
      element={
        <Auth>
          <App />
        </Auth>
    }/>
    <Route path="/auth" element={
      <div className="h-screen w-full bg-zinc-100 dark:bg-zinc-900 flex justify-center items-center dark:text-zinc-300 text-zinc-800">
        <Sing />
      </div>
    } />
    <Route path='/verify-otp' element={
      <div className="h-screen w-full bg-zinc-100 dark:bg-zinc-900 flex justify-center items-center dark:text-zinc-300 text-zinc-800">
        <Otp />
      </div>
    } />
    <Route path='/reset-password' element={
      <div className="h-screen w-full bg-zinc-100 dark:bg-zinc-900 flex justify-center items-center dark:text-zinc-300 text-zinc-800">
        <ResetPassword />
      </div>
    } />
  </Routes>

  )
}

export default Layout;