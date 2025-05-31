import { createContext, useState, useContext, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import useOrg from './OrgContext';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {

  const { orgData } = useOrg();

  const location = useLocation();
  
  const projectId = location.pathname.split('/')[3]

  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    if (!selectedProject && orgData?.projects?.length > 0 && projectId) {
      const foundProject = orgData.projects.find(p => p._id === projectId);
      if (foundProject) {
        setSelectedProject(foundProject);
      }
    }
  }, [selectedProject, orgData, location.pathname]);

  const value = {
     selectedProject,
     setSelectedProject
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);