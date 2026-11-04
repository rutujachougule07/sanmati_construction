// SANMATI CONSTRUCTIONS ERP - Authentication Context
import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS } from '../services/mockData';
import { USER_ROLES } from '../utils/constants';
import { isFirebaseConfigured, auth, signInWithEmailAndPassword, signOut as fbSignOut, sendPasswordResetEmail } from '../services/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Default to null so user starts at the Login page; once logged in, stored in localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sanmati_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null;
  });
  const [allUsers, setAllUsers] = useState(() => {
    const saved = localStorage.getItem('sanmati_all_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_USERS;
  });
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sanmati_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sanmati_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sanmati_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      if (isFirebaseConfigured && auth) {
        // Attempt live Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const matched = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || {
          id: userCredential.user.uid,
          name: userCredential.user.displayName || email.split('@')[0],
          email: userCredential.user.email,
          role: USER_ROLES.SUPER_ADMIN,
          status: 'Active'
        };
        setCurrentUser(matched);
        return { success: true, user: matched };
      } else {
        // Mock authentication lookup
        const found = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (found) {
          if (found.status === 'Inactive') {
            throw new Error('This user account has been deactivated by Super Admin.');
          }
          setCurrentUser(found);
          return { success: true, user: found };
        } else {
          // Allow demo login with auto-assigned role if email matches keywords
          const roleKey = Object.values(USER_ROLES).find(r => email.toLowerCase().includes(r.toLowerCase().split(' ')[0])) || USER_ROLES.EMPLOYEE;
          const newUser = {
            id: `usr_${Date.now()}`,
            name: email.split('@')[0].toUpperCase(),
            email,
            role: roleKey,
            designation: roleKey,
            department: 'General Operations',
            phone: '+91 98000 00000',
            status: 'Active',
            assignedProjects: ['PRJ-KLP-001']
          };
          setCurrentUser(newUser);
          setAllUsers(prev => [...prev, newUser]);
          return { success: true, user: newUser };
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Switch role quickly for convenient demonstration & role-testing
  const switchRole = (roleName) => {
    const matched = allUsers.find(u => u.role === roleName);
    if (matched) {
      setCurrentUser(matched);
    } else {
      setCurrentUser(prev => ({ ...prev, role: roleName }));
    }
  };

  // Logout
  const logout = async () => {
    try {
      if (isFirebaseConfigured && auth) {
        await fbSignOut(auth);
      }
    } catch (err) {
      console.warn("Sign out error", err);
    } finally {
      setCurrentUser(null);
      localStorage.removeItem('sanmati_user');
    }
  };

  // Forgot password
  const resetPassword = async (email) => {
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
    }
    return { success: true, message: `Password reset email dispatched to ${email}` };
  };

  // Update profile
  const updateCurrentUser = (updatedFields) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...updatedFields };
      setAllUsers(users => users.map(u => u.id === prev.id ? updated : u));
      return updated;
    });
  };

  // User Management: Create User
  const createUser = (userData) => {
    const newUser = {
      id: `usr_${Date.now()}`,
      status: 'Active',
      assignedProjects: ['PRJ-KLP-001'],
      ...userData
    };
    setAllUsers(prev => [newUser, ...prev]);
    return newUser;
  };

  // Toggle user activation
  const toggleUserStatus = (userId) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        loading,
        authError,
        login,
        logout,
        switchRole,
        resetPassword,
        updateCurrentUser,
        createUser,
        toggleUserStatus,
        isSuperAdmin: currentUser?.role === USER_ROLES.SUPER_ADMIN,
        isProjectManager: currentUser?.role === USER_ROLES.PROJECT_MANAGER,
        isSiteEngineer: currentUser?.role === USER_ROLES.SITE_ENGINEER,
        isAccountant: currentUser?.role === USER_ROLES.ACCOUNTANT
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
