/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Register.tsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import Logo from '../assets/logo.svg';

interface Branch {
  province: string;
  city: string;
  municipality: string;
  place: string;
  phone: string;
  isHeadOffice: boolean;
}

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyEmail: '',
    businessType: '',
    vatOrPan: '',
  });
  const [branches, setBranches] = useState<Branch[]>([
    { province: '', city: '', municipality: '', place: '', phone: '', isHeadOffice: true },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const updateBranch = (i: number, key: keyof Branch, v: any) =>
    setBranches(b => b.map((br, idx) => (idx === i ? { ...br, [key]: v } : br)));
  const addBranch = () =>
    setBranches(b => [...b, { province: '', city: '', municipality: '', place: '', phone: '', isHeadOffice: false }]);
  const removeBranch = (i: number) =>
    setBranches(b => b.filter((_, idx) => idx !== i));
  const setHeadOffice = (i: number) =>
    setBranches(b => b.map((br, idx) => ({ ...br, isHeadOffice: idx === i })));

  const next = () => setStep(s => Math.min(3, s + 1) as 1 | 2 | 3);
  const back = () => setStep(s => Math.max(1, s - 1) as 1 | 2 | 3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ role: 'Company', ...form, branches });
      toast.success(`Registered successfully as ${form.companyName}`);
      navigate('/company');
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message : 'Registration failed';
      toast.error(m);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Navbar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-screen-xl mx-auto px-6 py-3 grid grid-cols-3 items-center">
          <Link to="/" className="col-start-1">
            <img src={Logo} alt="Logo" className="h-8 w-auto" />
          </Link>
          <div className="col-start-2 text-center">
            <span className="text-xl font-bold text-black">Harihar</span>
            <span className="text-xl font-bold text-red-600 ml-1">Infosys</span>
          </div>
          <div className="col-start-3 text-right">
            <Link to="/">
              <button className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-700 transition">
                Home
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center pt-8 px-6 overflow-hidden">
        <div className="w-full max-w-3xl flex flex-col h-full">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            {[1, 2, 3].map((n, i) => (
              <React.Fragment key={n}>
                <button
                  onClick={() => setStep(n as 1 | 2 | 3)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold
                    ${step === n
                      ? 'border-2 border-red-600 bg-white text-red-600'
                      : 'border-2 border-gray-300 bg-white text-gray-500'}`}
                >
                  {n}
                </button>
                {i < 2 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-colors
                      ${step > n ? 'bg-red-600' : 'bg-gray-300'}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 text-center">
            Register Your Company
          </h1>
          <p className="text-gray-600 text-center mt-1 mb-8">
            Welcome! Let’s get your business onboarded…
          </p>

          {/* Form area */}
          <div className="overflow-auto flex-1" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1 */}
              {step === 1 && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Step 1: Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-xl shadow border border-gray-200">
                    {[
                      { label: 'Full Name', name: 'name', type: 'text' },
                      { label: 'Email', name: 'email', type: 'email' },
                      { label: 'Phone Number', name: 'phone', type: 'text' },
                      { label: 'Create Password', name: 'password', type: 'password' },
                      { label: 'Confirm Password', name: 'confirmPassword', type: 'password' },
                    ].map(f => (
                      <div key={f.name}>
                        <label className="block text-sm font-medium text-gray-700">{f.label}</label>
                        <input
                          name={f.name}
                          type={f.type}
                          minLength={f.type === 'password' ? 6 : undefined}
                          value={(form as any)[f.name]}
                          onChange={handleChange}
                          required
                          className="mt-1 w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-red-500 focus:ring-0"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Step 2: Company Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-xl shadow border border-gray-200">
                    {/* Company Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Name</label>
                      <input
                        name="companyName"
                        type="text"
                        value={(form as any).companyName}
                        onChange={handleChange}
                        required
                        className="mt-1 w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-red-500 focus:ring-0"
                      />
                    </div>
                    {/* Company Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Email</label>
                      <input
                        name="companyEmail"
                        type="email"
                        value={(form as any).companyEmail}
                        onChange={handleChange}
                        required
                        className="mt-1 w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-red-500 focus:ring-0"
                      />
                    </div>
                    {/* Business Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Business Type</label>
                      <select
                        name="businessType"
                        value={(form as any).businessType}
                        onChange={handleChange}
                        required
                        className="mt-1 w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-red-500 focus:ring-0"
                      >
                        <option value="" disabled>Select Business Type</option>
                        <option>Education</option>
                        <option>Bank</option>
                        <option>IT Services</option>
                        <option>Manufacturing</option>
                        <option>Other</option>
                      </select>
                    </div>
                    {/* PAN/VAT */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">PAN/VAT Number</label>
                      <input
                        name="vatOrPan"
                        type="text"
                        value={(form as any).vatOrPan}
                        onChange={handleChange}
                        required
                        className="mt-1 w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-red-500 focus:ring-0"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Step 3: Branch Details
                  </h2>
                  <div className="bg-white p-8 rounded-xl shadow border border-gray-200 space-y-6">
                    {branches.map((b, i) => (
                      <div key={i} className="border-b pb-4 mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold">Branch #{i + 1}</h3>
                          {branches.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBranch(i)}
                              className="text-red-600 hover:underline text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { label: 'Province', key: 'province' },
                            { label: 'City', key: 'city' },
                            { label: 'Municipality', key: 'municipality' },
                            { label: 'Place', key: 'place' },
                            { label: 'Branch Phone', key: 'phone' },
                          ].map(f => (
                            <div key={f.key}>
                              <label className="block text-sm text-gray-700">{f.label}</label>
                              <input
                                value={(b as any)[f.key]}
                                onChange={e => updateBranch(i, f.key as any, e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-red-500 focus:ring-0"
                              />
                            </div>
                          ))}
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="headOffice"
                              checked={b.isHeadOffice}
                              onChange={() => setHeadOffice(i)}
                              className="mr-2"
                            />
                            <label className="text-sm text-gray-700">Head Office</label>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addBranch}
                      className="text-red-600 hover:underline text-sm"
                    >
                      + Add another branch
                    </button>
                  </div>
                </>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-4">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={back}
                    className="px-4 py-2 border rounded hover:bg-gray-100 transition"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={next}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Submit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Sticky footer */}
          <div className="py-4 text-center">
            <p className="text-sm italic text-gray-600">
              Already registered?{' '}
              <Link to="/login" className="text-red-600 font-medium hover:underline">
                Log in Here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
