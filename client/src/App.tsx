import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Layout from "./components/Layout";
<<<<<<< HEAD
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Scheduler from "./pages/Scheduler";
import AIComposer from "./pages/AIComposer";
import { Toaster } from "react-hot-toast";

export default function App() {
    return (
        <>
            <Toaster position="top-right"/>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route element={<Layout />}>
                    <Route path="/dashboard" element={<Dashboard />}/>
                    <Route path="/accounts" element={<Accounts />}/>
                    <Route path="/schedule" element={<Scheduler />}/>
                    <Route path="/ai-composer" element={<AIComposer />}/>

                </Route>
            </Routes>
        </>
    );
=======
import Sidebar from "./components/Sidebar";
import { Dashboard } from "./pages/Dashboard";
import { Accounts } from "./pages/Accounts";
import Scheduler from "./pages/Scheduler";
import AIComposer  from "./pages/AIComposer";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/schedule" element={<Scheduler />} />
          <Route path="/ai-composer" element={<AIComposer />} />
        </Route>
      </Routes>
    </>
  );
>>>>>>> 70268fad140b4ac606f76666c42810099aaf6e9e
}
