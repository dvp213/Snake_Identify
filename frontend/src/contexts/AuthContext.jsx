import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Function to check if a JWT token is expired
const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
        // Extract the payload part of the JWT (second part)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        // Check the expiration time
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        return payload.exp < currentTime;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true; // Assume expired if there's an error
    }
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [authToken, setAuthToken] = useState(null);

    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            const adminStatus = localStorage.getItem('isAdmin') === 'true';
            
            // Validate the token
            if (token && !isTokenExpired(token)) {
                setAuthToken(token);
                setIsAuthenticated(true);
                setIsAdmin(adminStatus);
                console.log('Valid token found in localStorage');
            } else if (token) {
                console.log('Expired token found in localStorage, clearing');
                localStorage.removeItem('token');
                localStorage.removeItem('isAdmin');
            }
        } catch (error) {
            console.error('Error loading auth state:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = (token, adminStatus) => {
        localStorage.setItem('token', token);
        localStorage.setItem('isAdmin', adminStatus);
        setAuthToken(token);
        setIsAuthenticated(true);
        setIsAdmin(adminStatus);
        console.log('Login successful, token stored');
    };

    const logout = () => {
        try {
            localStorage.clear(); // Clear all items from localStorage
            console.log('Logged out, localStorage cleared');
            setAuthToken(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // Helper function to get auth headers
    const getAuthHeaders = () => {
        return authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
    };

    return (
        <AuthContext.Provider value={{ 
            isAuthenticated, 
            isAdmin, 
            login, 
            logout, 
            isLoading,
            getAuthHeaders,
            token: authToken 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);