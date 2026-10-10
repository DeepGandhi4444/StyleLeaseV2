import "./App.css";
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./routes/Home";
import Products from "./routes/Products";
import Singleproduct from "./routes/Singleproduct";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Profile from "./routes/Profile";
import Cart from "./routes/Cart";
import CheckoutPayment from "./routes/CheckoutPayment";
import PaymentSuccess from "./routes/PaymentSuccess";
import AdminPanel from "./routes/AdminPanel";
import Login from "./auth/login";
import Signup from "./auth/Signup";
import { PrimeReactProvider } from "primereact/api";

function App() {
  const value = {
    ripple: true,
  };
  return (
    <PrimeReactProvider value={value}>
      <Router>
        <Main />
      </Router>
    </PrimeReactProvider>
  );
}

function Main() {
  const location = useLocation();
  const noNavbarPaths = ["/", "/signup"];
  const noFooterPaths = ["/", "/signup"];
  const [cartItems, setCartItems] = useState([]);

  return (
    <>
      {!noNavbarPaths.includes(location.pathname) && (
        <Navbar cartItems={cartItems} />
      )}
      <Routes>
        <Route index element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route
          path="/one"
          element={
            <Singleproduct cartItems={cartItems} setCartItems={setCartItems} />
          }
        />
        <Route
          path="/products/:id"
          element={
            <Singleproduct cartItems={cartItems} setCartItems={setCartItems} />
          }
        />
        <Route
          path="/cart"
          element={<Cart cartItems={cartItems} setCartItems={setCartItems} />}
        />
        <Route
          path="/checkout"
          element={
            <CheckoutPayment
              cartItems={cartItems}
              setCartItems={setCartItems}
            />
          }
        />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="*"
          element={
            <div style={{ padding: "80px 20px", textAlign: "center" }}>
              <h2 style={{ fontSize: "28px", fontWeight: 800 }}>404 - Page Not Found</h2>
              <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>
                The page you're looking for does not exist or has moved.
              </p>
            </div>
          }
        />
      </Routes>
      {!noFooterPaths.includes(location.pathname) && (
        <Footer cartItems={cartItems} />
      )}
    </>
  );
}

export default App;
