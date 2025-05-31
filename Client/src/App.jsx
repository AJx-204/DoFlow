import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Members, ProfilePage, TeamMembers, Projects, Org } from './Views'
import Topbar from './Topbar'


const App = () => {
  
  return (
    <>
      <div
       className='min-h-screen w-full flex bg-zinc-50 dark:bg-[#1c1c1c] text-zinc-800 dark:text-zinc-200 scrollbar-hidden' 
       >
        <Sidebar/>
        <div
         className='flex flex-col w-full'
         >
          <Topbar/>
          <div
            className='flex-1 overflow-y-auto h-screen'
            >
             <Routes>
                <Route
                  path='/:orgName/:orgId'
                  element={<Org/>}
                />
                <Route
                  path='/:org/members'
                  element={<Members/>}
                />
                <Route
                  path='/:org/:team/TeamMembers/:teamId'
                  element={<TeamMembers/>}
                />
                 <Route
                  path='/:org/:project/:projectId/*'
                  element={<Projects/>}
                >
                  <Route path=':section/:sectionId' element={<Projects />} />
                </Route>
                <Route
                  path='/:orgName/dashboard'
                  element={<ProfilePage/>}
                />
                <Route
                  path='/profile/:userName'
                  element={<ProfilePage/>}
                />
             </Routes>
          </div>
        </div>
      </div>
    </>
  )
}

export default App