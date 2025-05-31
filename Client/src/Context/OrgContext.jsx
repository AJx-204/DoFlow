import { createContext, useContext, useEffect, useState } from "react";
import useUser from "./UserContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const OrgContext = createContext();

export const OrgProvider = ({children}) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const { setAuthLoding } = useUser();

    const { user } = useUser();
    const [orgId, setOrgId] = useState(null);
    const [orgData, setOrgData] = useState(null);
    const [orgLoading, setOrgLoading] = useState(false);
    const [orgError,  setOrgError] = useState('')

    useEffect(() => {
        const storedOrgId = localStorage.getItem('currentOrgId');
        if(storedOrgId){
            setOrgId(storedOrgId);
        }else if(user?.inOrg?.length > 0){
            const firstOrgId = user.inOrg[0]?.org?._id;
            if(firstOrgId){
                localStorage.setItem("currentOrgId", firstOrgId);
                setOrgId(firstOrgId)
            };
        };
    }, [user]);

    const changeOrg = (orgId) => {
        localStorage.setItem("currentOrgId", orgId);
        setOrgId(orgId)
    };

    const getOrg = async (id) => {
        setAuthLoding(true);
        setOrgLoading(true);
        try {
            const res = await axios.get(`${backendUrl}/getOrg/${id}`,{
                withCredentials:true
            })
            setOrgData(res.data?.data)
        } catch (error) {
            if (error.response && error.response.data?.message) {
               setOrgError(error.response.data.message);
            }else{
               setOrgError("Something went wrong. Please try again."); 
            }
        } finally {
            setOrgLoading(false);
            setAuthLoding(false);
        };
    };

    const updateOrg = async (orgName, description, orgProfilePhoto) => {
        setOrgLoading(true);
        try {
            const formData = new FormData();
            formData.append("orgName", orgName);
            formData.append('description', description)
            if (orgProfilePhoto) {
                formData.append("orgProfilePhoto", orgProfilePhoto);
            }
            const res = await axios.put(`${backendUrl}/org/updateOrg/${orgId}`, formData, {
                withCredentials: true
            });
            if (res.data && res.data.data) {
              const updatedOrg = res.data.data;
              setOrgData({
                  ...orgData,
                  orgName: updatedOrg.orgName,
                  description: updatedOrg.description,
                  orgProfilePhoto: updatedOrg.orgProfilePhoto,
              });
            }
            return true
        } catch (error) {
             if (error.response && error.response.data?.message) {
               setOrgError(error.response.data.message);
            }else{
               setOrgError("Something went wrong. Please try again."); 
            }
        } finally {
            setOrgLoading(false);
        }
    };

    const leaveOrg = async () => {
        setOrgLoading(true);
        try {
            const res = await axios.post(`${backendUrl}/org/${orgId}/leaveOrg`, {}, {
                withCredentials:true
            })
            if(res.data){
                setOrgId(null)
                setOrgData(null)
                localStorage.removeItem("currentOrgId");
            };
            return true
        } catch (error) {
            if (error.response && error.response.data?.message) {
               setOrgError(error.response.data.message);
            }else{
               setOrgError("Something went wrong. Please try again."); 
            }
        } finally {
            setOrgLoading(false)
        }
    };

    useEffect(() => {
        if (orgId) {
            getOrg(orgId);
        }
    }, [orgId]);

    const value = {
        orgData,
        setOrgData,
        setOrgId,
        changeOrg,
        orgLoading,
        orgError,
        setOrgError,
        updateOrg,
        leaveOrg,
    };

    return(
        <OrgContext.Provider value={value}>
            {children}
        </OrgContext.Provider>
    );
};

export default function useOrg(){
    return  useContext(OrgContext)
};