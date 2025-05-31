import { createContext, useState, useContext, useEffect } from 'react';
import useOrg from './OrgContext';
import { useLocation } from 'react-router-dom';

export const TeamContext = createContext();

export const TeamProvider = ({ children }) => {

  const { orgData } = useOrg();

  const location = useLocation();

  const teamId = location.pathname.split('/').pop();

  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    if (!selectedTeam && orgData?.teams?.length > 0 && teamId) {
      const foundTeam = orgData.teams.find(p => p._id === teamId);
      if (foundTeam) {
        setSelectedTeam(foundTeam);
      }
    }
  }, [selectedTeam, orgData, location.pathname]);

  const value = {
     selectedTeam,
     setSelectedTeam
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => useContext(TeamContext);