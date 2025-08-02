import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyC1QxAr1d44IerpLbjtGCs4Rc-0TDbdMu0",
  authDomain: "online-shop-12740.firebaseapp.com",
  projectId: "online-shop-12740",
  storageBucket: "online-shop-12740.firebasestorage.app",
  messagingSenderId: "583027796410",
  appId: "1:583027796410:web:f0cb7e572dc76bd0261583",
  measurementId: "G-4CC6R77M9H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.log('Analytics initialization failed:', error);
  }
}

export { analytics };
export default app; 