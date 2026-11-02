// SANMATI CONSTRUCTIONS ERP - App Root Component
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ERPDataProvider } from './context/ERPDataContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ERPDataProvider>
          <AppRoutes />
        </ERPDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
