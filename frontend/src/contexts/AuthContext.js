import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { 
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Local storage dan foydalanuvchi ma'lumotlarini olish
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Local storage parse error:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Firebase auth state o'zgarishini kuzatish (faqat Google login uchun)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Google user uchun local storage ga saqlash
        const userData = {
          id: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          role: 'user',
          firebaseUid: user.uid
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setCurrentUser(userData);
        toast.success('Google orqali muvaffaqiyatli kirdingiz!');
      }
    });

    return unsubscribe;
  }, []);

  // Email/parol bilan ro'yxatdan o'tish (local storage)
  const register = async (email, password, name) => {
    try {
      // Local storage da foydalanuvchi yaratish
      const userData = {
        id: Date.now().toString(), // Unique ID
        email: email.toLowerCase(),
        name: name.trim(),
        role: 'user',
        createdAt: new Date().toISOString()
      };
      
      // Local storage ga saqlash
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentUser(userData);
      
      toast.success('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!');
      return userData;
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Ro\'yxatdan o\'tishda xatolik');
      throw error;
    }
  };

  // Email/parol bilan kirish (local storage)
  const login = async (email, password) => {
    try {
      // Local storage dan foydalanuvchini topish
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.email === email.toLowerCase()) {
          setCurrentUser(user);
          toast.success('Muvaffaqiyatli kirdingiz!');
          return user;
        }
      }
      
      // Foydalanuvchi topilmadi
      toast.error('Noto\'g\'ri email yoki parol');
      throw new Error('Noto\'g\'ri email yoki parol');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Kirishda xatolik');
      throw error;
    }
  };

  // Google bilan kirish
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Google user ma'lumotlari avtomatik saqlanadi onAuthStateChanged da
      return result.user;
    } catch (error) {
      console.error('Google login error:', error);
      
      // Firebase popup yopilgan bo'lsa
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Google oynasi yopildi. Qayta urinib ko\'ring.');
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Google oynasi bloklangan. Popup blocker ni o\'chiring.');
      } else {
        toast.error('Google bilan kirishda xatolik. Firebase sozlamalarini tekshiring.');
      }
      throw error;
    }
  };

  // Chiqish
  const logout = async () => {
    try {
      // Firebase dan chiqish (agar Google user bo'lsa)
      if (currentUser?.firebaseUid) {
        await signOut(auth);
      }
      
      // Local state va storage ni tozalash
      setCurrentUser(null);
      localStorage.removeItem('user');
      
      toast.success('Muvaffaqiyatli chiqdingiz!');
    } catch (error) {
      console.error('Logout error:', error);
      // Firebase xatoligiga qaramay, local state ni tozalash
      setCurrentUser(null);
      localStorage.removeItem('user');
      toast.error('Chiqishda xatolik');
    }
  };

  const value = {
    currentUser,
    register,
    login,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 