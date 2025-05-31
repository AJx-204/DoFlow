import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { ThemeProvider } from './Context/ThemeContext.jsx'
import { UserProvider } from './Context/UserContext.jsx'
import Layout from './Layout.jsx'
import { OrgProvider } from './Context/OrgContext.jsx'
import { TeamProvider } from './Context/TeamContext.jsx'
import { ProjectProvider } from './Context/ProjectContext.jsx'


createRoot(document.getElementById('root')).render(
   <BrowserRouter> 
      <ThemeProvider>
         <UserProvider>
            <OrgProvider>
               <TeamProvider>
                  <ProjectProvider>
                    <Layout /> 
                  </ProjectProvider>
               </TeamProvider>
            </OrgProvider>
         </UserProvider>
      </ThemeProvider>
   </BrowserRouter> 
)
