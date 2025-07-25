import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useLocation, useParams } from 'react-router-dom';
import './App.css';

function Navbar({ cart, adminLoggedIn, handleAdminLogout, consumer, handleConsumerLogout, profileOpen, setProfileOpen, profileRef }) {
  const location = useLocation();
  // Hide login/signup on auth pages
  const hideAuthLinks = [
    '/consumer/auth',
    '/consumer/login',
    '/consumer/signup'
  ].includes(location.pathname);

  return (
    <nav className="navbar">
      <div className="navbar-logo">HOMYA Shop</div>
      <ul className="navbar-links">
        {/* Admin-only navbar */}
        {adminLoggedIn ? (
          <>
            <li><Link to="/admin">Admin</Link></li>
            <li><Link to="/admin/orders">Orders</Link></li>
            <li><button className="logout-btn" onClick={handleAdminLogout}>Logout (Admin)</button></li>
          </>
        ) : (
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/cart">Cart ({cart.length})</Link></li>
            {/* My Orders link for consumers */}
            {consumer && <li><Link to="/my-orders">My Orders</Link></li>}
            {/* Hide Admin link for consumers */}
            {!consumer && <li><Link to="/admin">Admin</Link></li>}
            {consumer ? (
              <>
                <li style={{ position: 'relative' }} ref={profileRef}>
                  <button
                    className="avatar-btn"
                    onClick={() => setProfileOpen((open) => !open)}
                    aria-label="User profile"
                  >
                    <span className="avatar-circle">
                      {consumer.fullName ? consumer.fullName[0].toUpperCase() : '?'}
                    </span>
                  </button>
                  {profileOpen && (
                    <div className="profile-popover">
                      <div className="profile-row">
                        <div className="profile-label">{consumer.fullName}</div>
                        <div className="profile-email">{consumer.email}</div>
                      </div>
                      <div className="profile-row">
                        <button
                          className="change-password-btn"
                          onClick={() => { setProfileOpen(false); window.location.href = '/consumer/forget-password'; }}
                        >
                          Change password
                        </button>
                      </div>
                      <div className="profile-row">
                        <button className="logout-btn" onClick={handleConsumerLogout}>Logout</button>
                      </div>
                    </div>
                  )}
                </li>
              </>
            ) : (
              !hideAuthLinks ? (
                <>
                  <li>
                    <Link to="/consumer/auth">
                      <button style={{ background: '#fff', color: 'var(--main-green)', border: '2px solid var(--main-green)', borderRadius: 6, padding: '0.3rem 1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>Login</button>
                    </Link>
                  </li>
                </>
              ) : null
            )}
          </>
        )}
      </ul>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <span>© {new Date().getFullYear()} HOMYA Shop</span>
        <span className="footer-links">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <span style={{ margin: '0 0.5rem' }}>|</span>
          <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
        </span>
      </div>
    </footer>
  );
}

function App() {
  const [cart, setCart] = useState([]);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [consumer, setConsumer] = useState(null); // { fullName, email }
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [alert, setAlertState] = useState({ open: false, message: '', type: 'info' });
  const [authLoaded, setAuthLoaded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // Hide footer on admin, admin login, cart, and login/signup pages
  const hideFooter =
    location.pathname.startsWith('/admin') ||
    location.pathname === '/login' ||
    location.pathname === '/cart' ||
    location.pathname.startsWith('/consumer/forget-password') ||
    location.pathname.startsWith('/consumer/auth');

  const setAlert = (message, type = 'info') => {
    setAlertState({ open: true, message, type });
    setTimeout(() => setAlertState(a => ({ ...a, open: false })), 3000);
  };

  // Restore login state from localStorage on mount
  useEffect(() => {
    const storedConsumer = localStorage.getItem('consumer');
    if (storedConsumer) {
      try {
        setConsumer(JSON.parse(storedConsumer));
      } catch {}
    }
    const storedAdmin = localStorage.getItem('adminLoggedIn');
    if (storedAdmin === 'true') {
      setAdminLoggedIn(true);
    }
    setAuthLoaded(true);
  }, []);

  // Save consumer to localStorage on login
  useEffect(() => {
    if (consumer) {
      localStorage.setItem('consumer', JSON.stringify(consumer));
    } else {
      localStorage.removeItem('consumer');
    }
  }, [consumer]);

  // Save admin login to localStorage
  useEffect(() => {
    if (adminLoggedIn) {
      localStorage.setItem('adminLoggedIn', 'true');
    } else {
      localStorage.removeItem('adminLoggedIn');
    }
  }, [adminLoggedIn]);

  // Close profile popover on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  // Fetch cart from backend
  const fetchCart = async (email) => {
    const res = await fetch('http://localhost:5001/api/consumer/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.cart) setCart(data.cart);
    else setCart([]);
  };

  // Add product to cart (backend)
  const addToCart = async (product) => {
    if (!consumer) return;
    await fetch('http://localhost:5001/api/consumer/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: consumer.email, productId: product._id })
    });
    fetchCart(consumer.email);
    setAlert('Product added to cart!', 'success');
  };

  // Remove product from cart (backend)
  const removeFromCart = async (productId) => {
    if (!consumer) return;
    await fetch('http://localhost:5001/api/consumer/cart/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: consumer.email, productId })
    });
    fetchCart(consumer.email);
    setAlert('Product removed from cart!', 'info');
  };

  // On consumer login, fetch cart
  useEffect(() => {
    if (consumer) fetchCart(consumer.email);
    else setCart([]);
  }, [consumer]);

  // Logout admin
  const handleAdminLogout = () => {
    setAdminLoggedIn(false);
    setAlert('Logged out successfully', 'success');
  };
  // Logout consumer
  const handleConsumerLogout = () => {
    setConsumer(null);
    setAlert('Logged out successfully', 'success');
  };

  if (!authLoaded) return null;

  return (
    <>
      <GlobalAlert {...alert} onClose={() => setAlertState(a => ({ ...a, open: false }))} />
      <LoginRequiredDialog
        open={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
        onLogin={() => { setLoginDialogOpen(false); navigate('/consumer/auth'); }}
      />
      <Navbar
        cart={cart}
        adminLoggedIn={adminLoggedIn}
        handleAdminLogout={handleAdminLogout}
        consumer={consumer}
        handleConsumerLogout={handleConsumerLogout}
        profileOpen={profileOpen}
        setProfileOpen={setProfileOpen}
        profileRef={profileRef}
      />
      <Routes>
        <Route path="/" element={<Home addToCart={addToCart} consumer={consumer} noContainer={true} setLoginDialogOpen={setLoginDialogOpen} setAlert={setAlert} />} />
        <Route path="/product/:id" element={<ProductDetails setLoginDialogOpen={setLoginDialogOpen} consumer={consumer} setAlert={setAlert} />} />
        <Route path="/cart" element={consumer ? <Cart cart={cart} removeFromCart={removeFromCart} setAlert={setAlert} setCart={setCart} consumer={consumer} /> : <Navigate to="/consumer/login" />} />
        <Route path="/checkout" element={<Checkout consumer={consumer} setAlert={setAlert} setCart={setCart} />} />
        <Route path="/my-orders" element={<MyOrders consumer={consumer} setAlert={setAlert} />} />
        <Route path="/admin" element={adminLoggedIn ? <Admin setAlert={setAlert} /> : <Navigate to="/login" />} />
        <Route path="/admin/orders" element={adminLoggedIn ? <AdminOrders setAlert={setAlert} /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login setAdminLoggedIn={setAdminLoggedIn} setAlert={setAlert} />} />
        <Route path="/consumer/auth" element={<AuthPage setConsumer={setConsumer} setAlert={setAlert} />} />
        <Route path="/consumer/login" element={<Navigate to="/consumer/auth" />} />
        <Route path="/consumer/signup" element={<Navigate to="/consumer/auth" />} />
        <Route path="/consumer/forget-password" element={<ConsumerForgetPassword setAlert={setAlert} />} />
        {/* Placeholder routes for policy pages */}
        <Route path="/privacy-policy" element={<div style={{padding: '2rem', textAlign: 'center'}}>Privacy Policy page coming soon.</div>} />
        <Route path="/terms-and-conditions" element={<div style={{padding: '2rem', textAlign: 'center'}}>Terms &amp; Conditions page coming soon.</div>} />
      </Routes>
      {!hideFooter && <Footer />}
    </>
  );
}

// --- AuthPage: Combined Login/Signup for Consumers ---
function AuthPage({ setConsumer, setAlert }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  // Shared state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Signup only
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/consumer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        setConsumer({ fullName: data.fullName, email: data.email });
        navigate('/');
        setAlert('Logged in successfully!', 'success');
      } else {
        setError(data.error || 'Login failed');
        setAlert(data.error || 'Login failed', 'error');
      }
    } catch {
      setError('Login failed');
      setAlert('Login failed', 'error');
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!fullName || !email || !password || !confirmPassword) {
      setError('All fields are required');
      setAlert('All fields are required', 'error');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setAlert('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/consumer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
      });
      const data = await res.json();
      if (data.success) {
        setConsumer({ fullName, email });
        navigate('/');
        setAlert('Signed up successfully!', 'success');
      } else {
        setError(data.error || 'Signup failed');
        setAlert(data.error || 'Signup failed', 'error');
      }
    } catch {
      setError('Signup failed');
      setAlert('Signup failed', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={mode === 'login' ? handleLogin : handleSignup}>
        <h2>{mode === 'login' ? 'Login' : 'Signup'}</h2>
        {mode === 'signup' && (
          <input type="text" placeholder="Full name" value={fullName} onChange={e => setFullName(e.target.value)} />
        )}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        {mode === 'signup' && (
          <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        )}
        <button type="submit" disabled={loading}>{mode === 'login' ? 'Login' : 'Signup'}</button>
        {mode === 'login' && (
          <div style={{ marginTop: '0.5rem' }}>
            <Link to="/consumer/forget-password" className="forget-link">Forgot password?</Link>
          </div>
        )}
        {error && <div className="feedback" style={{ color: 'red' }}>{error}</div>}
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button type="button" className="forget-link" style={{ color: 'var(--main-green)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => setMode('signup')}>Sign up</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" className="forget-link" style={{ color: 'var(--main-green)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => setMode('login')}>Login</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

function ConsumerForgetPassword({ setAlert }) {
  const [email, setEmail] = useState('');
  const [previousPassword, setPreviousPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5001/api/consumer/forget-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, previousPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Password updated! You can now login.');
        setAlert('Password updated! You can now login.', 'success');
        setTimeout(() => navigate('/consumer/login'), 1500);
      } else {
        setError(data.error || 'Failed to update password');
        setAlert(data.error || 'Failed to update password', 'error');
      }
    } catch {
      setError('Failed to update password');
      setAlert('Failed to update password', 'error');
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Previous password" value={previousPassword} onChange={e => setPreviousPassword(e.target.value)} />
        <input type="password" placeholder="New password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        <button type="submit">Update Password</button>
        {error && <div className="feedback" style={{ color: 'red' }}>{error}</div>}
        {success && <div className="feedback" style={{ color: 'green' }}>{success}</div>}
      </form>
    </div>
  );
}

function Login({ setAdminLoggedIn, setAlert }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5001/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setAdminLoggedIn(true);
        navigate('/admin');
        setAlert('Logged in as Admin!', 'success');
      } else {
        setError(data.error || 'Login failed');
        setAlert(data.error || 'Login failed', 'error');
      }
    } catch {
      setError('Login failed');
      setAlert('Login failed', 'error');
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && <div className="feedback" style={{ color: 'red' }}>{error}</div>}
      </form>
    </div>
  );
}

function Home({ addToCart, consumer, noContainer, setLoginDialogOpen, setAlert }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5001/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch products');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  const handleBuyOrCart = (product, type) => {
    if (!consumer) {
      setLoginDialogOpen(true);
      return;
    }
    if (type === 'buy') {
      navigate('/checkout', {
        state: {
          products: [{
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
          }],
        },
      });
    } else {
      addToCart(product);
      setAlert('Added to cart!', 'success');
    }
  };
  const content = (
    <div className="products-grid">
      {products.length === 0 ? (
        <div>No products found.</div>
      ) : (
        products.map((product) => (
          <div className="product-card clickable" key={product._id} onClick={() => navigate(`/product/${product._id}`)} style={{ cursor: 'pointer' }}>
            <img src={product.imageUrl} alt={product.name} className="product-image" />
            <div className="product-price">${product.price}</div>
            <h3>{product.name}</h3>
            <div className="product-actions" onClick={e => e.stopPropagation()}>
              <button className="buy-now-btn" onClick={() => handleBuyOrCart(product, 'buy')}>Buy now</button>
              <button className="add-to-cart-btn" aria-label="Add to cart" onClick={() => handleBuyOrCart(product, 'cart')}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
  return noContainer ? content : <div className="container">{content}</div>;
}

function Cart({ cart, removeFromCart, setAlert, setCart, consumer }) {
  const totalPrice = cart.reduce((sum, item) => sum + Number(item.productId.price) * (item.quantity || 1), 0);
  const navigate = useNavigate();

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <div>Your cart is empty.</div>
      ) : (
        <div className="cart-list">
          {cart.map((item) => (
            <div className="cart-row" key={item.productId._id}>
              <img src={item.productId.imageUrl} alt={item.productId.name} className="cart-product-image" />
              <div className="cart-product-info">
                <h3>{item.productId.name}</h3>
                <div className="product-price">${item.productId.price}</div>
                {item.quantity > 1 && <div>Qty: {item.quantity}</div>}
              </div>
              <button className="remove-from-cart-btn" onClick={() => removeFromCart(item.productId._id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Sticky bottom bar */}
      {cart.length > 0 && (
        <div className="cart-sticky-bar">
          <div>Total items: <b>{cart.reduce((sum, item) => sum + (item.quantity || 1), 0)}</b></div>
          <div>Total price: <b>${totalPrice.toFixed(2)}</b></div>
          <button className="checkout-btn" onClick={() => {
            // Prepare products array for checkout
            const products = cart.map(item => ({
              productId: item.productId._id,
              name: item.productId.name,
              price: item.productId.price,
              quantity: item.quantity || 1,
              imageUrl: item.productId.imageUrl,
            }));
            navigate('/checkout', { state: { products, fromCart: true } });
          }}>
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}

function Admin({ setAlert }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', imageUrl: '' });
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  // Fetch products
  const fetchProducts = () => {
    setLoading(true);
    fetch('http://localhost:5001/api/products')
      .then((res) => res.json())
      .then((data) => {
        // Sort by createdAt descending if available, else reverse
        let sorted = data;
        if (data.length && data[0].createdAt) {
          sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else {
          sorted = [...data].reverse();
        }
        setProducts(sorted);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch products');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update product
  const handleSubmit = (e) => {
    e.preventDefault();
    setFeedback('');
    if (!form.name || !form.description || !form.price || !form.imageUrl) {
      setFeedback('All fields are required.');
      setAlert('All fields are required.', 'error');
      return;
    }
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `http://localhost:5001/api/products/${editingId}`
      : 'http://localhost:5001/api/products';
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        imageUrl: form.imageUrl,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setFeedback(data.error);
          setAlert(data.error, 'error');
        } else {
          setFeedback(editingId ? 'Product updated!' : 'Product added!');
          setForm({ name: '', description: '', price: '', imageUrl: '' });
          setEditingId(null);
          fetchProducts();
          setAlert(editingId ? 'Product updated!' : 'Product added!', 'success');
        }
      })
      .catch(() => {
        setFeedback('Error saving product.');
        setAlert('Error saving product.', 'error');
      });
  };

  // Edit product
  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    setEditingId(product._id);
    setFeedback('Editing product...');
  };

  // Delete product
  const handleDelete = (id) => {
    if (!window.confirm('Delete this product?')) return;
    fetch(`http://localhost:5001/api/products/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then(() => {
        setFeedback('Product deleted!');
        fetchProducts();
        setAlert('Product deleted!', 'success');
      })
      .catch(() => {
        setFeedback('Error deleting product.');
        setAlert('Error deleting product.', 'error');
      });
  };

  return (
    <div>
      <h2 style={{ marginLeft: '2rem' }}>Admin Page</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit Product' : 'Add Product'}</h3>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
        />
        <input
          type="text"
          name="imageUrl"
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={handleChange}
        />
        <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', description: '', price: '', imageUrl: '' }); setFeedback(''); }}>Cancel</button>
        )}
        {feedback && <div className="feedback">{feedback}</div>}
      </form>
      <hr />
      <h3 style={{ marginLeft: '2rem' }}>Product List</h3>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td><img src={product.imageUrl} alt={product.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} /></td>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>${product.price}</td>
                <td>
                  <button onClick={() => handleEdit(product)}>Edit</button>
                  <button onClick={() => handleDelete(product._id)} style={{ marginLeft: 8, color: 'red', background: 'white', border: '1px solid red' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AdminOrders({ setAlert }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, orderId: null });
  const statusOptions = ['Placed', 'Shipped', 'Delivered', 'Cancelled'];

  useEffect(() => {
    fetch('http://localhost:5001/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setAlert('Failed to fetch orders', 'error');
        setLoading(false);
      });
  }, [setAlert]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5001/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(orders => orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        setAlert('Order status updated.', 'success');
      } else {
        setAlert('Failed to update status.', 'error');
      }
    } catch {
      setAlert('Failed to update status.', 'error');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(orders => orders.filter(o => o._id !== orderId));
        setAlert('Order deleted.', 'success');
      } else {
        setAlert('Failed to delete order.', 'error');
      }
    } catch {
      setAlert('Failed to delete order.', 'error');
    }
    setDeleteDialog({ open: false, orderId: null });
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</div>;
  if (!orders.length) return <div style={{ padding: '2rem', textAlign: 'center' }}>No orders found.</div>;

  return (
    <div className="admin-orders-page" style={{ maxWidth: '96%', margin: '2rem' }}>
      <h2 style={{ color: 'var(--main-green)', marginBottom: '2rem', fontWeight: 700 }}>All Orders</h2>
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-orders-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Consumer</th>
              <th>Email</th>
              <th>Products</th>
              <th>Address</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>{order.consumerName}</td>
                <td>{order.consumerEmail}</td>
                <td>
                  <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                    {order.products.map((p, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 5, background: 'var(--main-green, #014421)' }} />}
                        <span style={{ fontWeight: 500 }}>{p.name}</span> x{p.quantity} <span style={{ color: '#888' }}>(${p.price})</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  {order.address.fullName}<br/>
                  {order.address.phone}<br/>
                  {order.address.street}, {order.address.city}<br/>
                  {order.address.postalCode}, {order.address.country}
                </td>
                <td>{order.paymentMethod}</td>
                <td>${order.total.toFixed(2)}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={e => handleStatusChange(order._id, e.target.value)}
                    style={{ padding: '0.3rem 0.7rem', borderRadius: 5, fontWeight: 600 }}
                  >
                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem' }}>
                    <button className="admin-order-action-btn" onClick={() => setViewOrder(order)}>View</button>
                    <button className="admin-order-action-btn delete" onClick={() => setDeleteDialog({ open: true, orderId: order._id })}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* View Order Modal */}
      {viewOrder && (
        <div className="admin-order-modal-overlay">
          <div className="admin-order-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ color: 'var(--main-green)', fontWeight: 700 }}>Order Details</h3>
              <button className="admin-order-modal-close" onClick={() => setViewOrder(null)}>&times;</button>
            </div>
            <div style={{ marginBottom: 10, color: '#555', fontSize: '1.05rem' }}>
              <b>Order Date:</b> {new Date(viewOrder.createdAt).toLocaleString()}<br/>
              <b>Status:</b> <span style={{ color: 'var(--main-green)', fontWeight: 600 }}>{viewOrder.status}</span>
            </div>
            <div style={{ marginBottom: 10 }}>
              <b>Products:</b>
              <div className="order-products-column">
                {viewOrder.products.map((p, i) => (
                  <div key={i} className="order-product-row order-product-row-vertical">
                    {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="order-product-img" />}
                    <div className="order-product-info">
                      <span className="order-product-name">{p.name}</span>
                      <span className="order-product-qty">x{p.quantity}</span>
                      <span className="order-product-price">${p.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <hr className="checkout-divider" />
            <div className="checkout-totals">
              <div>Subtotal: <b>${viewOrder.products.reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0).toFixed(2)}</b></div>
              <div>Delivery: <b>$20.00</b></div>
              <div>Tax (10%): <b>${(Math.round(viewOrder.products.reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0) * 0.10 * 100) / 100).toFixed(2)}</b></div>
              <div className="checkout-grand-total">Total: <b>${viewOrder.total.toFixed(2)}</b></div>
            </div>
            <div style={{ marginTop: 10, color: '#1976d2', fontWeight: 500 }}>
              Estimated delivery: {(() => {
                const orderDate = new Date(viewOrder.createdAt);
                const estDeliveryStart = new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000);
                const estDeliveryEnd = new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000);
                return `${estDeliveryStart.toLocaleDateString()} - ${estDeliveryEnd.toLocaleDateString()}`;
              })()}
            </div>
            <div style={{ marginTop: 18, fontSize: '1.01rem', color: '#222' }}>
              <b>Address:</b><br/>
              {viewOrder.address.fullName}<br/>
              {viewOrder.address.phone}<br/>
              {viewOrder.address.street}, {viewOrder.address.city}<br/>
              {viewOrder.address.postalCode}, {viewOrder.address.country}
            </div>
            <div style={{ marginTop: 8 }}><b>Payment:</b> {viewOrder.paymentMethod}</div>
          </div>
        </div>
      )}
      {/* Delete confirmation dialog */}
      {deleteDialog.open && (
        <div className="cancel-dialog-overlay">
          <div className="cancel-dialog">
            <div style={{ marginBottom: 18, fontWeight: 500, color: '#222' }}>Are you sure you want to delete this order?</div>
            <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'flex-end' }}>
              <button className="cancel-dialog-btn" onClick={() => setDeleteDialog({ open: false, orderId: null })}>No</button>
              <button className="cancel-dialog-btn confirm" onClick={() => handleDeleteOrder(deleteDialog.orderId)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductDetails({ setLoginDialogOpen, consumer, setAlert }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5001/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch product details');
        setLoading(false);
      });
  }, [id]);

  const handleBuyOrCart = (type) => {
    if (!consumer) {
      setLoginDialogOpen(true);
      return;
    }
    if (type === 'buy') {
      // Go to checkout with this product
      navigate('/checkout', {
        state: {
          products: [{
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
          }],
        },
      });
    } else {
      // Add to cart logic (if you want to keep it here)
      setAlert('Added to cart!', 'success');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (error || !product) return <div style={{ color: 'red', padding: '2rem' }}>{error || 'Product not found.'}</div>;

  return (
    <div className="product-details-page">
      <div className="product-details-left">
        <img src={product.imageUrl} alt={product.name} className="product-details-image" />
        <h2>{product.name}</h2>
        <div className="product-details-price">${product.price}</div>
        <p className="product-details-description">{product.description}</p>
      </div>
      <div className="product-details-right">
        <div className="product-details-info">
          <div><b>Delivery charge:</b> $20</div>
          <div><b>Cash on delivery:</b> Available</div>
          <div><b>Estimated delivery:</b> 2-3 days</div>
        </div>
        <div className="product-details-actions">
          <button className="buy-now-btn" onClick={() => handleBuyOrCart('buy')}>Buy now</button>
          <button className="add-to-cart-btn" onClick={() => handleBuyOrCart('cart')} style={{ borderRadius: 6, marginLeft: 12, width: 48, height: 48 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function Checkout({ consumer, setAlert, setCart }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    fullName: consumer?.fullName || '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [loading, setLoading] = useState(false);
  const products = location.state?.products || [];
  const fromCart = location.state?.fromCart;
  if (!products.length) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>No products to checkout.</div>;
  }
  const subtotal = products.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const delivery = 20;
  const tax = Math.round(subtotal * 0.10 * 100) / 100;
  const total = subtotal + delivery + tax;
  const allFieldsFilled = Object.values(address).every(Boolean) && paymentMethod;
  const handleInput = e => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };
  const handleCheckout = async e => {
    e.preventDefault();
    if (!allFieldsFilled) {
      setAlert('Please fill all address fields and select payment method.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consumerEmail: consumer.email,
          consumerName: consumer.fullName,
          products,
          address,
          paymentMethod,
          total,
        })
      });
      const data = await res.json();
      if (res.ok) {
        if (fromCart) {
          setCart([]);
          await fetch('http://localhost:5001/api/consumer/cart/clear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: consumer.email })
          });
        }
        setAlert('Order placed successfully!', 'success');
        navigate('/my-orders');
      } else {
        setAlert(data.error || 'Failed to place order', 'error');
      }
    } catch {
      setAlert('Failed to place order', 'error');
    }
    setLoading(false);
  };
  return (
    <div className="checkout-page improved-checkout">
      <div className="checkout-card">
        <div className="checkout-left">
          <h2 className="checkout-title">Order Summary</h2>
          <div className="checkout-products-list">
            {products.map((item, idx) => (
              <React.Fragment key={idx}>
                <div className="checkout-product-row">
                  {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="checkout-product-img" />}
                  <div className="checkout-product-info">
                    <div className="checkout-product-name">{item.name}</div>
                    <div className="checkout-product-qty">x{item.quantity || 1}</div>
                    <div className="checkout-product-price">${item.price}</div>
                  </div>
                </div>
                {idx === products.length - 1 && (
                  <>
                    <hr className="checkout-divider" />
                    <div className="checkout-totals">
                      <div>Subtotal: <b>${subtotal.toFixed(2)}</b></div>
                      <div>Delivery: <b>${delivery.toFixed(2)}</b></div>
                      <div>Tax (10%): <b>${tax.toFixed(2)}</b></div>
                      <div className="checkout-grand-total">Total: <b>${total.toFixed(2)}</b></div>
                    </div>
                  </>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="checkout-right">
          <h2 className="checkout-title">Shipping & Payment</h2>
          <form onSubmit={handleCheckout} className="checkout-form">
            <input name="fullName" placeholder="Full Name" value={address.fullName} onChange={handleInput} required />
            <input name="phone" placeholder="Phone" value={address.phone} onChange={handleInput} required />
            <input name="street" placeholder="Street Address" value={address.street} onChange={handleInput} required />
            <input name="city" placeholder="City" value={address.city} onChange={handleInput} required />
            <input name="postalCode" placeholder="Postal Code" value={address.postalCode} onChange={handleInput} required />
            <input name="country" placeholder="Country" value={address.country} onChange={handleInput} required />
            <div className="checkout-payment-label">Payment Method:</div>
            <div className="checkout-payment-options">
              <label><input type="radio" name="paymentMethod" value="Cash" checked={paymentMethod === 'Cash'} onChange={e => setPaymentMethod(e.target.value)} /> Cash</label>
              <label><input type="radio" name="paymentMethod" value="Credit Card" checked={paymentMethod === 'Credit Card'} onChange={e => setPaymentMethod(e.target.value)} /> Credit Card</label>
              <label><input type="radio" name="paymentMethod" value="Online Payment" checked={paymentMethod === 'Online Payment'} onChange={e => setPaymentMethod(e.target.value)} /> Online Payment</label>
            </div>
            <button className="checkout-btn checkout-btn-wide" type="submit" disabled={!allFieldsFilled || loading}>
              {loading ? 'Placing Order...' : 'Checkout'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function MyOrders({ consumer, setAlert }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState({ open: false, orderId: null });

  useEffect(() => {
    if (!consumer) return;
    fetch(`http://localhost:5001/api/orders?email=${encodeURIComponent(consumer.email)}`)
      .then(res => res.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setAlert('Failed to fetch orders', 'error');
        setLoading(false);
      });
  }, [consumer, setAlert]);

  const handleCancelOrder = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/orders/${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(orders => orders.filter(o => o._id !== orderId));
        setAlert('Order cancelled successfully.', 'success');
      } else {
        setAlert('Failed to cancel order.', 'error');
      }
    } catch {
      setAlert('Failed to cancel order.', 'error');
    }
    setCancelDialog({ open: false, orderId: null });
  };

  if (!consumer) return <div style={{ padding: '2rem', textAlign: 'center' }}>Please login to view your orders.</div>;
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</div>;
  if (!orders.length) return <div style={{ padding: '2rem', textAlign: 'center' }}>No orders found.</div>;

  return (
    <div className="my-orders-page" style={{ maxWidth: 900, margin: '2.5rem auto 3rem auto' }}>
      <h2 style={{ color: 'var(--main-green)', marginBottom: '2rem', fontWeight: 700 }}>My Orders</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {orders.map((order, idx) => {
          // Calculate fees breakdown
          const subtotal = order.products.reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0);
          const delivery = 20;
          const tax = Math.round(subtotal * 0.10 * 100) / 100;
          const total = order.total;
          // Estimated delivery: 2-3 days after order.createdAt
          const orderDate = new Date(order.createdAt);
          const estDeliveryStart = new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000);
          const estDeliveryEnd = new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000);
          return (
            <div key={order._id || idx} className="order-card" style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px rgba(1,68,33,0.08)', padding: '2rem', display: 'flex', flexDirection: 'row', gap: '2.5rem', alignItems: 'flex-start', position: 'relative' }}>
              {/* Left: Products (vertical list) */}
              <div style={{ flex: 2 }}>
                <div style={{ marginBottom: 10, color: '#555', fontSize: '1.05rem' }}>
                  <b>Order Date:</b> {orderDate.toLocaleString()}<br/>
                  <b>Status:</b> <span style={{ color: 'var(--main-green)', fontWeight: 600 }}>{order.status}</span>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <b>Products:</b>
                  <div className="order-products-column">
                    {order.products.map((p, i) => (
                      <div key={i} className="order-product-row order-product-row-vertical">
                        {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="order-product-img" />}
                        <div className="order-product-info">
                          <span className="order-product-name">{p.name}</span>
                          <span className="order-product-qty">x{p.quantity}</span>
                          <span className="order-product-price">${p.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <hr className="checkout-divider" />
                <div className="checkout-totals">
                  <div>Subtotal: <b>${subtotal.toFixed(2)}</b></div>
                  <div>Delivery: <b>${delivery.toFixed(2)}</b></div>
                  <div>Tax (10%): <b>${tax.toFixed(2)}</b></div>
                  <div className="checkout-grand-total">Total: <b>${total.toFixed(2)}</b></div>
                </div>
                <div style={{ marginTop: 10, color: '#1976d2', fontWeight: 500 }}>
                  Estimated delivery: {estDeliveryStart.toLocaleDateString()} - {estDeliveryEnd.toLocaleDateString()}
                </div>
              </div>
              {/* Right: Address & Payment */}
              <div style={{ flex: 1, background: '#f8f8f8', borderRadius: 10, padding: '1.2rem 1rem', fontSize: '1.01rem', color: '#222', minWidth: 220 }}>
                <div style={{ marginBottom: 8 }}>
                  <b>Address:</b><br/>
                  {order.address.fullName}<br/>
                  {order.address.phone}<br/>
                  {order.address.street}, {order.address.city}<br/>
                  {order.address.postalCode}, {order.address.country}
                </div>
                <div><b>Payment:</b> {order.paymentMethod}</div>
              </div>
              {/* Cancel button (bottom right) */}
              {order.status === 'Placed' && (
                <button
                  className="cancel-order-btn"
                  style={{ position: 'absolute', right: 24, bottom: 18 }}
                  onClick={() => setCancelDialog({ open: true, orderId: order._id })}
                >
                  Cancel
                </button>
              )}
            </div>
          );
        })}
      </div>
      {/* Cancel confirmation dialog */}
      {cancelDialog.open && (
        <div className="cancel-dialog-overlay">
          <div className="cancel-dialog">
            <div style={{ marginBottom: 18, fontWeight: 500, color: '#222' }}>Are you sure you want to cancel this order?</div>
            <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'flex-end' }}>
              <button className="cancel-dialog-btn" onClick={() => setCancelDialog({ open: false, orderId: null })}>No</button>
              <button className="cancel-dialog-btn confirm" onClick={() => handleCancelOrder(cancelDialog.orderId)}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Modal Dialog for Login Required ---
function LoginRequiredDialog({ open, onClose, onLogin }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.25)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '2rem 2.5rem', minWidth: 320, boxShadow: '0 4px 32px rgba(1,68,33,0.16)', textAlign: 'center' }}>
        <div style={{ fontSize: '1.15rem', marginBottom: '1.5rem', color: 'var(--main-green)' }}>
          You need to login/signup to perform this action.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <button onClick={onClose} style={{ padding: '0.6rem 1.5rem', borderRadius: 4, border: '1px solid #ccc', background: '#fff', color: '#222', fontWeight: 500, cursor: 'pointer', minWidth: 90 }}>Cancel</button>
          <button onClick={onLogin} style={{ padding: '0.6rem 2.5rem', borderRadius: 4, border: 'none', background: 'var(--main-green)', color: 'var(--main-yellow)', fontWeight: 600, fontSize: '1.05rem', cursor: 'pointer', minWidth: 140 }}>Login/Signup</button>
        </div>
      </div>
    </div>
  );
}

// --- GlobalAlert component ---
function GlobalAlert({ message, type, open, onClose }) {
  if (!open) return null;
  return (
    <div className={`global-alert global-alert-${type || 'info'}`}>{message}</div>
  );
}

export default App;
