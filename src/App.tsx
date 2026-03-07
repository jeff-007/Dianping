import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MerchantRegister from './pages/merchant/Register';
import MerchantDashboard from './pages/merchant/Dashboard';
import Placeholder from './components/Placeholder';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Placeholder title="Search & Filters" />} />
          <Route path="merchant/:id" element={<Placeholder title="Merchant Details" />} />
          <Route path="profile" element={<Placeholder title="User Profile" />} />
          <Route path="favorites" element={<Placeholder title="My Favorites" />} />
          <Route path="about" element={<Placeholder title="About Us" />} />
          <Route path="*" element={<Placeholder title="404 Not Found" />} />
        </Route>
        
        {/* Auth Routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        
        {/* Merchant Routes */}
        <Route path="/merchant/register" element={<MerchantRegister />} />
        <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
