import { createContext, useContext, useEffect, useState } from "react";

export const Themecontext =  createContext();

export const ThemeProvider = ({children}) => {

    const [Theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    const lightTheme = () => {
      if(Theme == 'light') return
      const newTheme = "light"
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(newTheme);
    };

    const darkTheme = () => {
      if(Theme == 'dark') return
      const newTheme = "dark"
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(newTheme);
    };

    useEffect(() => {
      document.documentElement.classList.add(Theme);
    }, []); 

    return(
       <Themecontext.Provider value={{Theme, lightTheme, darkTheme}}>
            {children}
       </Themecontext.Provider>
    );

};

export default function useTheme(){
    return useContext(Themecontext)
}