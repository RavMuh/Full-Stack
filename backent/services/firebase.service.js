const admin = require('firebase-admin');

// Firebase admin initialization
const initializeFirebase = () => {
  try {
    // Agar Firebase sozlamalari mavjud bo'lsa, ularni ishlat
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      // Private key ni to'g'ri formatda olish
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // Agar private key string bo'lsa va \n belgilari bo'lsa, ularni to'g'ri formatga o'tkazish
      if (typeof privateKey === 'string') {
        // \n belgilarini haqiqiy yangi qatorlarga o'tkazish
        privateKey = privateKey.replace(/\\n/g, '\n');
        
        // Agar private key BEGIN va END belgilari yo'q bo'lsa, ularni qo'shish
        if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
          privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
        }
      }

      const serviceAccount = {
        type: process.env.FIREBASE_TYPE || 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: privateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
        token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      
      console.log('✅ Firebase initialized successfully with service account');
    } else {
      // Firebase sozlamalari yo'q bo'lsa, default app yaratish
      try {
        admin.initializeApp();
        console.log('✅ Firebase initialized with default configuration');
      } catch (defaultError) {
        console.log('⚠️  Firebase default configuration failed, continuing without Firebase...');
        console.log('💡 Firebase Admin SDK ni o\'rnatish uchun FIREBASE_SETUP.md faylini o\'qing');
      }
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    // Firebase xatoligiga qaramay, server ishlashini davom ettirish
    console.log('⚠️  Continuing without Firebase...');
    console.log('💡 Firebase Admin SDK ni o\'rnatish uchun FIREBASE_SETUP.md faylini o\'qing');
  }
};

// Verify Firebase ID token
const verifyIdToken = async (idToken) => {
  try {
    if (!admin.apps.length) {
      throw new Error('Firebase not initialized');
    }
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Firebase token verification error:', error.message);
    throw new Error('Invalid ID token');
  }
};

// Check if Firebase is available
const isFirebaseAvailable = () => {
  return admin.apps.length > 0;
};

module.exports = {
  initializeFirebase,
  verifyIdToken,
  isFirebaseAvailable,
  admin
}; 