import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Details from './Details.jsx'
import Login from './Login.jsx'
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RelatedSpecies from './RelatedSpecies.jsx'
import CreateAccount from './CreateAccount.jsx';
import Chatbot from './chatbot.jsx';
import Admin from './Admin.jsx';
import AdminCeylonkrait from './AdminCeylonkrait.jsx';
import EditCategory from './EditCategory.jsx';
import AddRelatedSpecies from './AddRelatedSpecies.jsx';

import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/Details/:snakeId" element={<Details />} />
        <Route path="/Details" element={<Details />} />
        <Route path="/related" element={<RelatedSpecies />} />
        <Route path="/Delated" element={<RelatedSpecies />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/CreateAccount" element={<CreateAccount />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/edit-category/:id" element={<EditCategory />} />
        <Route path="/add-related-species" element={<AddRelatedSpecies />} />
        <Route path="/AdminCeylonkrait" element={<AdminCeylonkrait />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);