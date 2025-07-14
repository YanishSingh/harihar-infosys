/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Register.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register as apiRegister } from '../api/auth';
import Logo from '../assets/logo.svg';

// --------- REGION DATA -------------
const nepalRegions = [
  {
    province: "Bagmati Province",
    cities: [
      {
        city: "Kathmandu",
        municipalities: [
          "Kathmandu Metropolitan City",
          "Kirtipur Municipality",
          "Tokha Municipality",
          "Chandragiri Municipality",
          "Budhanilkantha Municipality"
        ]
      },
      {
        city: "Lalitpur",
        municipalities: [
          "Lalitpur Metropolitan City",
          "Godawari Municipality",
          "Mahalaxmi Municipality"
        ]
      },
      {
        city: "Bhaktapur",
        municipalities: [
          "Bhaktapur Municipality",
          "Madhyapur Thimi Municipality",
          "Suryabinayak Municipality",
          "Changunarayan Municipality"
        ]
      }
    ]
  },
  {
    province: "Gandaki Province",
    cities: [
      {
        city: "Pokhara",
        municipalities: [
          "Pokhara Metropolitan City",
          "Lekhnath Municipality"
        ]
      },
      {
        city: "Tanahun",
        municipalities: [
          "Byas Municipality",
          "Shuklagandaki Municipality"
        ]
      }
    ]
  },
  {
    province: "Lumbini Province",
    cities: [
      {
        city: "Butwal",
        municipalities: [
          "Butwal Sub-Metropolitan City"
        ]
      },
      {
        city: "Nepalgunj",
        municipalities: [
          "Nepalgunj Sub-Metropolitan City"
        ]
      }
    ]
  },
  {
    province: "Province 1 (Koshi)",
    cities: [
      {
        city: "Biratnagar",
        municipalities: [
          "Biratnagar Metropolitan City"
        ]
      },
      {
        city: "Dharan",
        municipalities: [
          "Dharan Sub-Metropolitan City"
        ]
      }
    ]
  },
  {
    province: "Madhesh Province",
    cities: [
      {
        city: "Janakpur",
        municipalities: [
          "Janakpurdham Sub-Metropolitan City"
        ]
      },
      {
        city: "Birgunj",
        municipalities: [
          "Birgunj Metropolitan City"
        ]
      }
    ]
  },
  {
    province: "Karnali Province",
    cities: [
      {
        city: "Birendranagar",
        municipalities: [
          "Birendranagar Municipality"
        ]
      }
    ]
  },
  {
    province: "Sudurpashchim Province",
    cities: [
      {
        city: "Dhangadhi",
        municipalities: [
          "Dhangadhi Sub-Metropolitan City"
        ]
      },
      {
        city: "Mahendranagar",
        municipalities: [
          "Bhimdatta Municipality"
        ]
      }
    ]
  }
];

// --------- HELPERS for dropdowns ----------
function getProvinceOptions() {
  return nepalRegions.map(r => r.province);
}

function getCityOptions(province: string) {
  const region = nepalRegions.find(r => r.province === province);
  return region ? region.cities.map(c => c.city) : [];
}

function getMunicipalityOptions(province: string, city: string) {
  const region = nepalRegions.find(r => r.province === province);
  const c = region?.cities.find(c => c.city === city);
  return c ? c.municipalities : [];
}

// --------- MAIN COMPONENT ----------
interface Branch {
  province: string;
  city: string;
  municipality: string;
  place: string;
  phone: string;
  isHeadOffice: boolean;
}

const BRANCH_FIELDS = ['province', 'city', 'municipality', 'place', 'phone'] as const;
type BranchField = typeof BRANCH_FIELDS[number];

/** Password input with its own show/hide toggle and centered eye icon */
function PasswordInput({
  label,
  name,
  value,
  onChange,
  error
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <div className="relative mt-1">
        <input
          name={name}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required
          className="w-full pr-10 p-3 border rounded focus:border-red-500 focus:ring-0"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute inset-y-0 right-3 flex items-center justify-center text-gray-500"
          tabIndex={-1}
        >
          {show ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 
                   9.96 0 011.175-4.125M19.35 6.64A9.96 
                   9.96 0 0112 5c-5.523 0-10 4.477-10 
                   10 0 .599.07 1.182.204 1.746M6.1 
                   6.1l11.8 11.8" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 
                   016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 
                   5s8.268 2.943 9.542 7c-1.274 4.057-5.065 
                   7-9.542 7s-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}

export default function Register() {
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
    { province: '', city: '', municipality: '', place: '', phone: '', isHeadOffice: true }
  ]);

  // Handle input changes (digits only for phone & VAT)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let val = e.target.value;
    if (e.target.name === 'phone' || e.target.name === 'vatOrPan') {
      val = val.replace(/\D/g, '');
    }
    setForm(f => ({ ...f, [e.target.name]: val }));
  };

  // Branch helpers
  const updateBranch = (i: number, key: BranchField, v: string) =>
    setBranches(bs => bs.map((b, idx) => idx === i ? { ...b, [key]: v } : b));
  const addBranch = () =>
    setBranches(bs => [
      ...bs,
      { province: '', city: '', municipality: '', place: '', phone: '', isHeadOffice: false }
    ]);
  const removeBranch = (i: number) =>
    setBranches(bs => bs.filter((_, idx) => idx !== i));
  const setHeadOffice = (i: number) =>
    setBranches(bs => bs.map((b, idx) => ({ ...b, isHeadOffice: idx === i })));

  // Step navigation
  const next = () => setStep(s => (s < 3 ? (s + 1) as 1 | 2 | 3 : s));
  const back = () => setStep(s => (s > 1 ? (s - 1) as 1 | 2 | 3 : s));

  // Validation flags
  const { name, email, phone, password, confirmPassword } = form;
  const isEmailValid    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid    = /^98\d{8}$/.test(phone);
  const isPassLong      = password.length >= 6;
  const isPassMatch     = password === confirmPassword;
  const step1Valid      = Boolean(name && isEmailValid && isPhoneValid && isPassLong && isPassMatch);

  const { companyName, companyEmail, businessType, vatOrPan } = form;
  const isCompEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail);
  const isVatValid       = /^\d{9}$/.test(vatOrPan);
  const step2Valid       = Boolean(companyName && isCompEmailValid && businessType && isVatValid);

  // Final submit
  const handleSubmit = async () => {
    try {
      await apiRegister({ role: 'Company', ...form, branches });
      toast.success(
        'Registration successful — please wait for admin approval.',
        {
          autoClose: false,
          onClose: () => navigate('/login'),
        }
      );
    } catch (err: any) {
      if (Array.isArray(err.errors)) {
        err.errors.forEach((e: any) => toast.error(e.msg));
      } else {
        toast.error(err.message || 'Registration failed');
      }
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
            <Link to="/"><button className="px-4 py-2 bg-red-600 text-white rounded">Home</button></Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center pt-8 px-6 overflow-hidden">
        <div className="w-full max-w-3xl flex flex-col h-full">

          {/* Steps */}
          <div className="flex items-center justify-center mb-6">
            {[1, 2, 3].map((n, i) => (
              <React.Fragment key={n}>
                <button
                  type="button"
                  onClick={() => setStep(n as 1 | 2 | 3)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold
                    ${step === n ? 'border-2 border-red-600 text-red-600' : 'border-gray-300 text-gray-500'}`}
                >
                  {n}
                </button>
                {i < 2 && (
                  <div className={`flex-1 h-1 mx-2 ${step > n ? 'bg-red-600' : 'bg-gray-300'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 text-center">Register Your Company</h1>
          <p className="text-gray-600 text-center mt-1 mb-8">Welcome! Let’s get your business onboarded…</p>

          {/* Wizard Content */}
          <div className="overflow-auto flex-1" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            <div className="space-y-6">

              {/* Step 1 */}
              {step === 1 && (
                <div className="grid md:grid-cols-2 gap-6 bg-white p-8 rounded-xl shadow border">
                  <div>
                    <label className="block text-sm font-medium">Full Name</label>
                    <input
                      name="name"
                      type="text"
                      value={name}
                      onChange={handleChange}
                      required
                      className="w-full mt-1 p-3 border rounded focus:border-red-500 focus:ring-0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={email}
                      onChange={handleChange}
                      required
                      className={`w-full mt-1 p-3 border rounded 
                        ${email && !isEmailValid ? 'border-red-600' : 'focus:border-red-500 focus:ring-0'}`}
                    />
                    {email && !isEmailValid && (
                      <p className="text-red-600 text-sm mt-1">Invalid email address</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Phone Number</label>
                    <input
                      name="phone"
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={handleChange}
                      required
                      className={`w-full mt-1 p-3 border rounded 
                        ${phone && !isPhoneValid ? 'border-red-600' : 'focus:border-red-500 focus:ring-0'}`}
                    />
                    {phone && !isPhoneValid && (
                      <p className="text-red-600 text-sm mt-1">Must start with 98 and be 10 digits</p>
                    )}
                  </div>
                  <PasswordInput
                    label="Create Password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    error={password && !isPassLong ? 'At least 6 characters' : undefined}
                  />
                  <PasswordInput
                    label="Confirm Password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    error={confirmPassword && !isPassMatch ? 'Passwords do not match' : undefined}
                  />
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="grid md:grid-cols-2 gap-6 bg-white p-8 rounded-xl shadow border">
                  {([
                    ['Company Name', 'companyName', 'text'],
                    ['Company Email', 'companyEmail', 'email'],
                    ['Business Type', 'businessType', 'select'],
                    ['PAN/VAT Number', 'vatOrPan', 'text'],
                  ] as [string, keyof typeof form, string][]).map(([lbl, key, type]) => {
                    const val = (form as any)[key];
                    const err = key === 'companyEmail'
                      ? companyEmail && !isCompEmailValid
                        ? 'Invalid email'
                        : undefined
                      : key === 'vatOrPan'
                        ? vatOrPan && !isVatValid
                          ? 'Must be 9 digits'
                          : undefined
                        : undefined;
                    return (
                      <div key={key}>
                        <label className="block text-sm font-medium">{lbl}</label>
                        {type === 'select' ? (
                          <select
                            name={key}
                            value={val}
                            onChange={handleChange}
                            required
                            className="w-full mt-1 p-3 border rounded focus:border-red-500 focus:ring-0"
                          >
                            <option value="" disabled>Select…</option>
                            <option>Education</option>
                            <option>Bank</option>
                            <option>IT Services</option>
                            <option>Manufacturing</option>
                            <option>Other</option>
                          </select>
                        ) : (
                          <input
                            name={key}
                            type={type}
                            value={val}
                            onChange={handleChange}
                            required
                            className={`w-full mt-1 p-3 border rounded 
                              ${err ? 'border-red-600' : 'focus:border-red-500 focus:ring-0'}`}
                          />
                        )}
                        {err && <p className="text-red-600 text-sm mt-1">{err}</p>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div className="bg-white p-8 rounded-xl shadow border space-y-6">
                  {branches.map((b, i) => (
                    <div key={i} className="border-b pb-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">Branch #{i + 1}</h3>
                        {branches.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBranch(i)}
                            className="text-red-600"
                          >Remove</button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">

                        {/* Province Dropdown */}
                        <div>
                          <label className="block text-sm">Province</label>
                          <select
                            className="w-full mt-1 p-2 border rounded focus:border-red-500 focus:ring-0"
                            value={b.province}
                            onChange={e => {
                              updateBranch(i, 'province', e.target.value);
                              updateBranch(i, 'city', '');
                              updateBranch(i, 'municipality', '');
                            }}
                            required
                          >
                            <option value="" disabled>Select Province…</option>
                            {getProvinceOptions().map(province => (
                              <option key={province} value={province}>{province}</option>
                            ))}
                          </select>
                        </div>

                        {/* City Dropdown */}
                        <div>
                          <label className="block text-sm">City</label>
                          <select
                            className="w-full mt-1 p-2 border rounded focus:border-red-500 focus:ring-0"
                            value={b.city}
                            onChange={e => {
                              updateBranch(i, 'city', e.target.value);
                              updateBranch(i, 'municipality', '');
                            }}
                            required
                            disabled={!b.province}
                          >
                            <option value="" disabled>
                              {b.province ? "Select City…" : "Choose Province first"}
                            </option>
                            {getCityOptions(b.province).map(city => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </select>
                        </div>

                        {/* Municipality Dropdown */}
                        <div>
                          <label className="block text-sm">Municipality</label>
                          <select
                            className="w-full mt-1 p-2 border rounded focus:border-red-500 focus:ring-0"
                            value={b.municipality}
                            onChange={e => updateBranch(i, 'municipality', e.target.value)}
                            required
                            disabled={!b.city}
                          >
                            <option value="" disabled>
                              {b.city ? "Select Municipality…" : "Choose City first"}
                            </option>
                            {getMunicipalityOptions(b.province, b.city).map(muni => (
                              <option key={muni} value={muni}>{muni}</option>
                            ))}
                          </select>
                        </div>

                        {/* Place (free text) */}
                        <div>
                          <label className="block text-sm">Place</label>
                          <input
                            value={b.place}
                            onChange={e => updateBranch(i, 'place', e.target.value)}
                            className="w-full mt-1 p-2 border rounded focus:border-red-500 focus:ring-0"
                            required
                          />
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm">Phone</label>
                          <input
                            value={b.phone}
                            onChange={e => updateBranch(i, 'phone', e.target.value.replace(/\D/g, ""))}
                            maxLength={10}
                            className="w-full mt-1 p-2 border rounded focus:border-red-500 focus:ring-0"
                            required
                          />
                        </div>

                        {/* Head Office radio */}
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="headOffice"
                            checked={b.isHeadOffice}
                            onChange={() => setHeadOffice(i)}
                            className="mr-2"
                          />
                          <label className="text-sm">Head Office</label>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addBranch}
                    className="text-red-600"
                  >+ Add another branch</button>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-4">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={back}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >Back</button>
                ) : <span />}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => { if (step === 1 ? step1Valid : step2Valid) next(); }}
                    disabled={step === 1 ? !step1Valid : !step2Valid}
                    className={`
                      px-4 py-2 rounded transition
                      ${step === 1
                        ? (!step1Valid
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-red-600 text-white')
                        : (!step2Valid
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-red-600 text-white')}`}
                  >Next</button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >Submit</button>
                )}
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="py-4 text-center">
            <Link to="/login" className="text-sm italic text-gray-600">
              Already registered? Log in Here
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
