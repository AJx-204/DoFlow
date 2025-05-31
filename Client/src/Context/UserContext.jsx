import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import useOrg from "./OrgContext";

export const UserContext = createContext();

export const UserProvider = ({children}) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [userEmail, setUserEmail] = useState('')
    const [user, setUser] = useState(null);
    const [authError, setAuthError] = useState('')
    const [authLoding, setAuthLoding] = useState(false);
    const [hasFetchedUser, setHasFetchedUser] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);

    useEffect(()=>{
        if(!user){
            fetchUser();
        }
    },[]);

    const fetchUser = async () => {
        setAuthLoding(true);
        try {
            const res = await axios.get(`${backendUrl}/auth/getUser`,{
                withCredentials: true,
            });
            setUser(res?.data?.data)
        } catch (error) {
            setUser(null)
        }finally{
            setAuthLoding(false)
            setHasFetchedUser(true);
        }
    };

    const singUp = async (userName, profilePhoto, email, password) => {
        setAuthLoding(true);
        try {
            const formData = new FormData();
            formData.append("userName", userName);
            if (profilePhoto) {
                formData.append("profilePhoto", profilePhoto);
            }
            formData.append("email", email);
            formData.append("password", password);
            const res = await axios.post(`${backendUrl}/auth/register`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            const registeredEmail = res.data?.data?.userEmail;
            setUserEmail(registeredEmail);
            return true
        } catch (error) {
            if (error.response && error.response.data?.message) {
               setAuthError(error.response.data.message);
            }else{
               setAuthError("Something went wrong. Please try again."); 
            }
        } finally {
            setAuthLoding(false)
        };
    };

    const verifyOtp = async (otpCode, email) => {
        setAuthLoding(true);
        try {
            const res = await axios.post(`${backendUrl}/auth/verifyOtp`,{
                otpCode,
                email
            },{ withCredentials:true});
            setUser(res.data?.data)
            return true;
        } catch (error) {
            if (error.response && error.response.data?.message) {
               setAuthError(error.response.data.message);
            }else{
               setAuthError("Something went wrong. Please try again."); 
            }
        } finally {
            setAuthLoding(false)
        }
    };

    const resendOtp = async (email) => {
        setAuthLoding(true);
        try {
            await axios.put(`${backendUrl}/auth/resendOtp`,{
                email
            });
        } catch (error) {
            if (error.response && error.response.data?.message) {
               setAuthError(error.response.data.message);
            }else{
               setAuthError("Something went wrong. Please try again."); 
            }
        } finally {
            setAuthLoding(false)
        }
    };

    const login = async (email, password) => {
        setAuthLoding(true);
        try {
            const res = await axios.post(`${backendUrl}/auth/login`,{
                email,
                password
            },{ withCredentials:true});
            setUser(res.data?.data)
            return {success : true}
        } catch (error) {
            const res = error.response;
            if (res?.data?.needsVerification) {
              setUserEmail(res?.data?.userEmail);
              return { success: false, redirectToVerify: true, message: res.data.message };
            }
            if(!res?.data.needsVerification){
              if (error.response && error.response.data?.message) {
                 setAuthError(error.response.data.message);
              }else{
                 setAuthError("Something went wrong. Please try again."); 
              }
            }
        } finally {
            setAuthLoding(false)
        }
    };

    const logout = async () => {
        setAuthLoding(true);
        try {
            const res = await axios.post(`${backendUrl}/auth/logout`,{},{
                withCredentials:true
            });
            if(res.data){
                setUser(null)
            };
            localStorage.removeItem("currentOrgId")
        } catch (error) {
            if (error.response && error.response.data?.message) {
               setAuthError(error.response.data.message);
            }else{
               setAuthError("Something went wrong. Please try again."); 
            }
        } finally {
            setAuthLoding(false)
        }
    };

    const resetPasswordOtp = async (email) => {
        setUpdateLoading(true)
        try {
            const res = await axios.post(`${backendUrl}/auth/resetPasswordOtp`,{email});
            if(res.data) return true
        } catch (error) {
            if (error.response && error.response.data?.message) {
               setAuthError(error.response.data.message);
            }else{
               setAuthError("Something went wrong. Please try again."); 
            }
        }finally {
            setUpdateLoading(false)
        }
    };

    const forgotPassword = async (otpCode, password, email) => {
        setUpdateLoading(true)
        try {
            const res = await axios.put(`${backendUrl}/auth/forgotPassword`,{
                otpCode,
                password,
                email
            });
            if(res?.data) return true;
        } catch (error) {
            if (error.response && error.response.data?.message) {
               setAuthError(error.response.data.message);
            }else{
               setAuthError("Something went wrong. Please try again."); 
            }
        } finally {
            setUpdateLoading(false)
        }
    };

    const updateUser = async (userName, profilePhoto) => {
        setUpdateLoading(true)
        try {
            const formData = new FormData();
            if(userName){
                formData.append("userName", userName);
            }
            if (profilePhoto) {
                formData.append("profilePhoto", profilePhoto);
            }
            const res = await axios.put(`${backendUrl}/auth/updateUser`, formData,{
                withCredentials:true
            });
            setUser(res.data?.data)
            return { success: true };
        } catch (error) {
            if (error.response && error.response.data?.message) {
               setAuthError(error.response.data.message);
            }else{
               setAuthError("Something went wrong. Please try again."); 
            }
        } finally {
            setUpdateLoading(false)
        }

    };

    const value = {
        userEmail,
        user,
        authError,
        setAuthError,
        authLoding,
        setAuthLoding,
        singUp,
        login,
        verifyOtp,
        resendOtp,
        hasFetchedUser,
        logout,
        resetPasswordOtp,
        forgotPassword,
        updateUser,
        updateLoading, 
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
};


export default function useUser(){
    return useContext(UserContext)
};