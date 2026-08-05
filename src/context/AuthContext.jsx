import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase/config';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || null);
  const [loading, setLoading] = useState(true);
  
  // Use a ref to prevent onAuthStateChanged from doing duplicate Firestore fetches 
  // when we are actively logging in or registering.
  const isAuthActionInProgress = useRef(false);

  const login = async (email, password) => {
    isAuthActionInProgress.current = true;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    let role = 'student';
    if (userDoc.exists()) {
      role = userDoc.data().role;
    }
    setUserRole(role);
    localStorage.setItem('userRole', role);
    isAuthActionInProgress.current = false;
    return role;
  };

  const register = async (email, password, role, name) => {
    isAuthActionInProgress.current = true;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    setUserRole(role);
    localStorage.setItem('userRole', role);

    // Asynchronous background firestore profile creation (non-blocking)
    setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      role: role,
      name: name,
      createdAt: new Date().toISOString()
    }).catch(err => console.error("Background setDoc error:", err));
    
    isAuthActionInProgress.current = false;
    return userCredential;
  };

  const logout = async () => {
    localStorage.removeItem('userRole');
    await signOut(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If we are already handling this via login/register, skip duplicate fetch
        if (!isAuthActionInProgress.current) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const role = userDoc.data().role;
              setUserRole(role);
              localStorage.setItem('userRole', role);
            } else {
              setUserRole('student');
              localStorage.setItem('userRole', 'student');
            }
          } catch (error) {
            console.error("Error fetching user role:", error);
            // Keep existing cached role if network fails
          }
        }
      } else {
        setUserRole(null);
        localStorage.removeItem('userRole');
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    register,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Connecting to secure portal...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
