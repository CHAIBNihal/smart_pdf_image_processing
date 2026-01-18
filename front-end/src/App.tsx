import React, { useEffect } from "react";
import { AuthStore } from "./Store/auth/AuthStore";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SignIn from "./components/Auth/SignIn";
import Dashboard from "./components/Main/Dashboard";
import NotFound from "./NotFound"
import CreateUpload from "./components/Upload/CreateUpload";
import UploadFile from "./components/Upload/UploadFile";
import Uploads from "./components/Upload/Uploads";
import SingleUpload from "./components/Upload/SingleUpload";
// PUBLIC - PIVATE ROUTE:
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token } = AuthStore();
  return token !== null ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = AuthStore();
  return !token ? <> {children} </> : <Navigate to="/dashboard" replace />;
};

function App() {
  const token = AuthStore((s) => s.token);
  const verifyToken = AuthStore((s) => s.verifyToken);

  useEffect(() => {
    if (!verifyToken) return;
    if (token) {
      verifyToken();
    } else {
      console.debug("App: no token present, skipping verifyToken");
    }
  }, [token, verifyToken]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          }
        />
        <Route path="*" element={<NotFound/>}/>
        <Route path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard/>
            </PrivateRoute>
          }
        />
        <Route path="/uploads" element={
          <PrivateRoute>
            <Uploads/>
          </PrivateRoute>
        }/>
        <Route path="/details-upload/:id" element={
          <PrivateRoute>
            <SingleUpload/>
          </PrivateRoute>
        }/>
        <Route path="/upload" 
        element={
          <PrivateRoute>
           <CreateUpload/>
          </PrivateRoute>
        }
        />
        <Route path="/uploadFile/:id" 
        element={
          <PrivateRoute>
            <UploadFile/>
          </PrivateRoute>
        }/>
      </Routes>

      {/* Ton Router ici */}
    </BrowserRouter>
  );
}

export default App;
