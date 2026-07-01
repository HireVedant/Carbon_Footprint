import { useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';

export default function DebugFirebase() {
  const [config, setConfig] = useState<any>(null);
  const [status, setStatus] = useState<string>('loading');

  useEffect(() => {
    try {
      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      };

      setConfig(firebaseConfig);

      // Try to check if Firebase is initialized
      const apps = getApps();
      if (apps.length > 0) {
        setStatus('Firebase app initialized successfully');
      } else {
        setStatus('Firebase app not yet initialized');
      }

      console.log('Firebase Config:', firebaseConfig);
      console.log('Existing apps:', apps.length);
    } catch (error) {
      setStatus(`Error: ${error}`);
      console.error('Debug error:', error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-800 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Firebase Debug Info</h1>
        
        <div className="bg-dark-800 rounded-lg p-6 mb-6 border border-white/10">
          <h2 className="text-xl font-semibold text-emerald-400 mb-4">Status</h2>
          <p className="text-white">{status}</p>
        </div>

        <div className="bg-dark-800 rounded-lg p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-emerald-400 mb-4">Configuration</h2>
          <pre className="bg-dark-900 p-4 rounded text-xs text-green-400 overflow-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
