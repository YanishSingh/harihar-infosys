/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import Logo from '../assets/logo.svg';
import Illustration from '../assets/login-illustration.svg';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email))
      newErrors.email = 'Invalid email address';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    let loginResult: any = null;
    try {
      loginResult = await login({ email, password });
    } catch (err: any) {
      setLoading(false);
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again."
      );
      return;
    }

    setLoading(false);

    // Defensive: check for shape and type
    if (!loginResult || typeof loginResult !== "object" || !("user" in loginResult) || !loginResult.user) {
      toast.error("Login failed: No user data returned.");
      return;
    }

    const user = loginResult.user;
    toast.success('Login successful!');

    // Role-based dashboard navigation
    if (user.role === 'Admin') {
      navigate('/admin/dashboard');
    } else if (user.role === 'Company') {
      navigate('/company/dashboard');
    } else if (user.role === 'Technician') {
      navigate('/technician/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-screen-xl mx-auto px-6 py-3 grid grid-cols-3 items-center">
          <Link to="/" className="col-start-1">
            <img src={Logo} alt="Logo" className="h-8 w-auto" />
          </Link>
          <div className="col-start-2 text-center">
            <span className="text-xl font-bold text-black">Harihar</span>
            <span className="text-xl font-bold text-primary ml-1">Infosys</span>
          </div>
          <div className="col-start-3 text-right">
            <Link to="/">
              <button className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded hover:bg-primary/90 transition">
                Home
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col-reverse lg:flex-row items-center justify-center max-w-screen-xl mx-auto px-6 py-16 lg:gap-32 gap-16">
        <div className="hidden lg:block lg:flex-1 lg:max-w-lg">
          <img
            src={Illustration}
            alt="Tech support"
            className="w-full h-auto object-contain"
          />
        </div>

        <div className="flex-1 max-w-md w-full">
          <h1 className="text-4xl font-bold text-black mb-2">Log In</h1>
          <p className="text-gray mb-8">
            Access your tickets, track technicians…
          </p>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-xl shadow-md border border-gray-light space-y-6"
            noValidate
          >
            <h2 className="text-2xl font-semibold text-black mb-4">
              Enter Your Credentials
            </h2>

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-black">
                Email
              </label>
              <input
                id="email"
                type="text"
                className={`w-full p-3 border ${
                  errors.email ? 'border-primary' : 'border-gray-light'
                } rounded focus:outline-none focus:border-primary`}
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="username"
                required
                disabled={loading}
              />
              {errors.email && (
                <span className="text-xs text-primary">{errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1 relative">
              <label htmlFor="password" className="block text-sm font-medium text-black">
                Password
              </label>
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                className={`w-full p-3 pr-12 border ${
                  errors.password ? 'border-primary' : 'border-gray-light'
                } rounded focus:outline-none focus:border-primary`}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
              {/* Eye icon */}
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray"
                onClick={() => setShowPwd(v => !v)}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && (
                <span className="text-xs text-primary">{errors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white font-semibold rounded hover:bg-primary/90 transition"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

            <p className="text-center text-sm text-gray mt-4">
              Don’t have an account?{' '}
              <Link
                to="/register"
                className="inline-block px-4 py-1 border border-primary text-primary rounded hover:bg-primary/10 transition"
              >
                Register
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
