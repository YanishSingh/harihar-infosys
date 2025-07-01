// src/pages/Login.tsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import Logo from '../assets/logo.svg';
import Illustration from '../assets/login-illustration.svg';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const user = await login({ email, password });

      // Custom toast based on role
      let msg: string;
      if (user.role === 'Admin') {
        msg = 'Logged in as Admin';
      } else if (user.role === 'Company') {
        // @ts-expect-error: companyName may be on the returned user object
        msg = `Logged in as ${user.companyName}`;
      } else if (user.role === 'Technician') {
        msg = 'Logged in as Technician';
      } else {
        msg = `Logged in as ${user.role}`;
      }
      toast.success(msg);

      // Redirect by role
      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'Company') navigate('/company');
      else navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-screen-xl mx-auto px-6 py-3 grid grid-cols-3 items-center">
          {/* Logo in left corner */}
          <Link to="/" className="col-start-1">
            <img src={Logo} alt="Logo" className="h-8 w-auto" />
          </Link>

          {/* Brand centered */}
          <div className="col-start-2 text-center">
            <span className="text-xl font-bold text-black">Harihar</span>
            <span className="text-xl font-bold text-red-600 ml-1">Infosys</span>
          </div>

          {/* Home button in right corner */}
          <div className="col-start-3 text-right">
            <Link to="/">
              <button className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-700 transition">
                Home
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col-reverse lg:flex-row items-center justify-center max-w-screen-xl mx-auto px-6 py-16 lg:gap-32 gap-16">
        {/* Illustration */}
        <div className="hidden lg:block lg:flex-1 lg:max-w-lg">
          <img
            src={Illustration}
            alt="Tech support"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Form card */}
        <div className="flex-1 max-w-md w-full">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Log In</h1>
          <p className="text-gray-600 mb-8">
            Access your tickets, track technicians…
          </p>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-xl shadow-md border border-gray-200 space-y-6"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Enter Your Credentials
            </h2>

            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email or Company Name
              </label>
              <input
                id="email"
                type="text"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition"
            >
              Log In
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Don’t have an account?{' '}
              <Link
                to="/register"
                className="inline-block px-4 py-1 border border-red-600 text-red-600 rounded hover:bg-red-50 transition"
              >
                Register as a New Company
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
