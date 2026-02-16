import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantList from './pages/RestaurantList';
import RestaurantMenu from './pages/RestaurantMenu';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import RestaurantAdmin from './pages/RestaurantAdmin';
import Profile from './pages/Profile';
import Search from './pages/Search';
import EditProfile from './pages/EditProfile';
import Security from './pages/Security';
import Favorites from './pages/Favorites';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';

import { LocationProvider } from './context/LocationContext';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Simple utility to scroll to top on page change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <LocationProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Navbar />
              <div className="flex-grow container mx-auto px-4 py-8 mb-16 md:mb-0">
                <Routes>
                  <Route path="/" element={<RestaurantList />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/restaurant/:id" element={<RestaurantMenu />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/search" element={<Search />} />

                  {/* Private Routes */}
                  <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute><RestaurantAdmin /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                  <Route path="/profile/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
                  <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                </Routes>
              </div>
              <BottomNav />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </LocationProvider>
  );
}

export default App;
