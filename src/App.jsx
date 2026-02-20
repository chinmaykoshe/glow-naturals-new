import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import BestSellers from "./pages/Best-Sellers";
import Categories from "./pages/Categories";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import NewArrivals from "./pages/New-Arrivals";
import Shop from "./pages/Shop";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import ForgetPassword from "./components/Forget-Password";
import Navig from "./components/Navig";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import { CartProvider, useCart } from "./context/CartContext";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ScrollToTop from "./components/ScrollToTop";

// Admin Imports
import AdminLayout from "./admin/components/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminInventory from "./admin/pages/AdminInventory";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminUsers from "./admin/pages/AdminUsers";
import AdminHero from "./admin/pages/AdminHero";
import AdminMessages from "./admin/pages/AdminMessages";

function AppContent() {
  const { isCartOpen, setIsCartOpen } = useCart();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="relative">
      <ScrollToTop />
      {!isAdminPath && <Navig />}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <Routes>
        {/* Main Site Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/new-arrivals" element={<NewArrivals />} />
        <Route path="/best-sellers" element={<BestSellers />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="hero" element={<AdminHero />} />
          <Route path="messages" element={<AdminMessages />} />
        </Route>
      </Routes>

      {!isAdminPath && <Footer />}
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;
