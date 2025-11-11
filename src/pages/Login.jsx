import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

function AuthLanding() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "", // ✅ new field for phone number
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleMode = () => {
    setError("");
    setIsLogin(!isLogin);
    setFormData({ name: "", email: "", password: "", phone: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // ✅ Login flow
        const { data } = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem("userInfo", JSON.stringify(data.user || data));
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        // ✅ Register flow
        const { data } = await authAPI.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone, // ✅ send phone number to backend
        });

        // 🌀 Instead of navigating directly to home, switch to login mode with animation
        setTimeout(() => {
          setIsLogin(true);
          setFormData({
            name: "",
            email: formData.email, // ✅ keep email for quick login
            password: "",
            phone: "",
          });
          setError("");
        }, 600); // slight delay for smooth transition

        // Optional success message
        alert("Registration successful! Please login to continue.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-4"
      >
        <h1 className="fw-bold display-5">TejaCommerce</h1>
        <p className="text-light fs-5">
          Your one-stop destination for all things amazing ✨
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? "login" : "register"}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="card shadow-lg p-4"
          style={{
            width: "100%",
            maxWidth: "420px",
            borderRadius: "1rem",
            background: "#fff",
            color: "#333",
          }}
        >
          <h2 className="text-center mb-4">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                    required={!isLogin}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Enter your phone number"
                    pattern="[0-9]{10}"
                    title="Enter a valid 10-digit phone number"
                    required={!isLogin}
                  />
                </div>
              </>
            )}

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading
                ? isLogin
                  ? "Logging in..."
                  : "Creating account..."
                : isLogin
                ? "Login"
                : "Register"}
            </button>
          </form>

          <p className="text-center mt-3 mb-0">
            {isLogin ? (
              <>
                Don’t have an account?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="btn btn-link p-0"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="btn btn-link p-0"
                >
                  Login
                </button>
              </>
            )}
          </p>
        </motion.div>
      </AnimatePresence>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-5 text-light-50"
        style={{ fontSize: "0.9rem" }}
      >
        © {new Date().getFullYear()} TejaCommerce. All rights reserved.
      </motion.footer>
    </div>
  );
}

export default AuthLanding;
