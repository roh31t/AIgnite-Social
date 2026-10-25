import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface User {
    _id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (userData: User, token: string)=> void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children})=>{

    const [user, setUser] = useState<User | null>(() => {
        const lastActive = localStorage.getItem("lastActiveTime");
        if (lastActive && Date.now() - Number(lastActive) > ONE_DAY_MS) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("lastActiveTime");
            return null;
        }

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try { return JSON.parse(storedUser); } catch { return null; }
        }
        return null;
    });

    const [token, setToken] = useState<string | null>(() => {
        const lastActive = localStorage.getItem("lastActiveTime");
        if (lastActive && Date.now() - Number(lastActive) > ONE_DAY_MS) {
            return null;
        }

        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
            return storedToken;
        }
        return null;
    });

    const [isLoading] = useState(false);

    const login = (userData: User, newToken: string)=>{
        setUser(userData)
        setToken(newToken)
        localStorage.setItem("user", JSON.stringify(userData))
        localStorage.setItem("token", newToken)
        localStorage.setItem("lastActiveTime", String(Date.now()))
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    }

    const logout = ()=>{
        setUser(null)
        setToken(null)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        localStorage.removeItem("lastActiveTime")
        delete api.defaults.headers.common["Authorization"];
    }

    // Inactivity tracker: update lastActiveTime on user interaction & check every minute
    useEffect(() => {
        if (!token) return;

        const updateActivity = () => {
            const now = Date.now();
            const lastSaved = Number(localStorage.getItem("lastActiveTime") || "0");
            // Throttle write to localStorage to once every minute
            if (now - lastSaved > 60 * 1000) {
                localStorage.setItem("lastActiveTime", String(now));
            }
        };

        const checkInactivity = () => {
            const lastActive = Number(localStorage.getItem("lastActiveTime") || "0");
            if (lastActive && Date.now() - lastActive > ONE_DAY_MS) {
                logout();
                window.location.href = "/login?expired=true";
            }
        };

        const events = ["mousedown", "keydown", "scroll", "touchstart"];
        events.forEach((ev) => window.addEventListener(ev, updateActivity, { passive: true }));
        const intervalId = setInterval(checkInactivity, 60 * 1000);

        return () => {
            events.forEach((ev) => window.removeEventListener(ev, updateActivity));
            clearInterval(intervalId);
        };
    }, [token]);

    return <AuthContext.Provider value={{user, token, isLoading, login, logout, isAuthenticated: !!token}}>
        {children}
    </AuthContext.Provider>

}

export const useAuth = ()=>{
    const context = useContext(AuthContext);
    if(context === undefined){
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
    
