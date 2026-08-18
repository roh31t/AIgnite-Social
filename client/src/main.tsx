import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
<<<<<<< HEAD
import { AuthProvider } from "./context/AuthContext.tsx";
=======
>>>>>>> 70268fad140b4ac606f76666c42810099aaf6e9e

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
<<<<<<< HEAD
            <AuthProvider>
                <App />
            </AuthProvider>
=======
            <App />
>>>>>>> 70268fad140b4ac606f76666c42810099aaf6e9e
        </BrowserRouter>
    </StrictMode>
);
