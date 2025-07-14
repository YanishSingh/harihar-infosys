import React from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { FaLaptop, FaTools, FaDesktop, FaNetworkWired, FaServer } from "react-icons/fa";

// Company logos
import teletalk from "../assets/companies/teletalk.png";
import telenet from "../assets/companies/telenet.png";
import litmus from "../assets/companies/litmus.png";
import nuplast from "../assets/companies/nuplast.png";
import kajaria from "../assets/companies/kajaria.png";
import ganpati from "../assets/companies/ganpati.png";
import atlas from "../assets/companies/atlas.png";
import vayodha from "../assets/companies/vayodha.png";
import edubridge from "../assets/companies/edubridge.png";

const logos = [
  { src: teletalk, alt: "Teletalk" },
  { src: telenet, alt: "Telenet" },
  { src: litmus, alt: "Litmus" },
  { src: nuplast, alt: "Nuplast" },
  { src: kajaria, alt: "Kajaria" },
  { src: ganpati, alt: "Ganpati" },
  { src: atlas, alt: "Atlas Group" },
  { src: vayodha, alt: "Vayodha Hospital" },
  { src: edubridge, alt: "Edu-Bridge" },
];

const services = [
  {
    title: "AMC & Preventive Maintenance",
    desc: "Reduce downtime with proactive site visits and scheduled maintenance.",
  },
  {
    title: "Hardware Repair & Custom PC Builds",
    desc: "Expert hardware solutions and custom computers for every need.",
  },
  {
    title: "CCTV & Networking Solutions",
    desc: "Secure, scalable networks and modern CCTV installations.",
  },
  {
    title: "Remote Software Assistance",
    desc: "Instant remote help or on-site dispatch for critical IT issues.",
  },
  {
    title: "On-Site Technician Dispatch",
    desc: "Get a real technician at your premises, tracked live.",
  },
];

const faqs = [
  {
    q: "What locations do you serve?",
    a: "We currently serve businesses within Kathmandu Valley and selected nearby areas.",
  },
  {
    q: "Do you offer emergency support?",
    a: "Yes, both remote and same-day on-site emergency services are available.",
  },
  {
    q: "How much do services cost?",
    a: "Costs are based on service type and urgency. You’ll receive a transparent quote before work begins.",
  },
  {
    q: "Can we request specific technicians?",
    a: "Based on past satisfaction, you may request specific technicians for recurring needs.",
  },
];

// Animated Hero Icons Component
function AnimatedHeroIcons() {
  const icons = [FaTools, FaLaptop, FaDesktop, FaNetworkWired, FaServer];
  return (
    <div className="flex gap-7 justify-center mb-8">
      {icons.map((Icon, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.17, duration: 0.8, type: "spring" }}
          whileHover={{ scale: 1.18, rotate: [-6, 6, 0] }}
          className="bg-gray-100 rounded-full shadow-lg p-6 flex items-center justify-center"
          style={{ fontSize: 44, color: "#D6212A", cursor: "pointer" }}
        >
          <Icon />
        </motion.div>
      ))}
    </div>
  );
}

const LandingPage: React.FC = () => (
  <div className="bg-white text-black min-h-screen">
    <Navbar public />

    {/* HERO SECTION */}
    <section className="pt-16 pb-12 max-w-3xl mx-auto px-6 flex flex-col items-center text-center">
      <AnimatedHeroIcons />
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
        Your IT Partner<br />in Every Step
      </h1>
      <p className="mb-7 text-lg text-gray-700 max-w-2xl mx-auto">
        Harihar Infosys delivers world-class IT solutions, proactive support, and transparent service to businesses across Kathmandu Valley.
      </p>
      <div className="flex gap-4 mb-10 justify-center">
        <button
          className="bg-[#D6212A] px-7 py-3 rounded-xl font-semibold text-white shadow hover:bg-[#c81620] transition text-lg"
          onClick={() => window.location.href = "/register"}
        >
          Register Now
        </button>
        <button
          className="bg-white border-2 border-[#D6212A] px-7 py-3 rounded-xl font-semibold text-[#D6212A] hover:bg-[#fff3f3] transition text-lg"
          onClick={() => window.location.href = "/login"}
        >
          Request IT Support
        </button>
      </div>
    </section>

    {/* CONTENT: All sections perfectly left-aligned */}
    <div className="max-w-6xl mx-auto px-4">
      {/* WHO WE ARE */}
      <section className="mt-10">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-left">Who We Are</h2>
        <p className="text-gray-700 mb-5 text-lg text-left">
          Harihar Infosys is Kathmandu’s leading IT service provider. We enable your digital world with quick, reliable, and professional solutions. Our mission is to empower businesses with secure, transparent, and on-demand IT services.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start justify-start text-base text-left">
          <span>
            <span className="font-semibold" style={{ color: "#D6212A" }}>Our Mission:</span> To empower businesses with efficient, transparent, and on-demand IT services.
          </span>
          <span>
            <span className="font-semibold text-blue-700">Our Vision:</span> Integrity. Reliability. Transparency. Excellence.
          </span>
        </div>
      </section>

      {/* WHO WE SERVE */}
      <section className="mt-14">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-8 text-left">Who We Serve</h2>
        <div className="flex flex-wrap justify-center gap-10 py-3">
          {logos.map((logo, i) => (
            <motion.div
              key={logo.alt}
              className="bg-white rounded-3xl shadow-lg flex items-center justify-center p-6"
              style={{
                width: 170,
                height: 96,
                minWidth: 140,
                minHeight: 86,
                boxShadow: "0 6px 32px rgba(0,0,0,0.08), 0 2px 12px rgba(214,33,42,0.13)",
                border: "2px solid #f3f4f6",
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.045 * i, duration: 0.7 }}
              viewport={{ once: true }}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                className="object-contain"
                style={{
                  maxWidth: 140,
                  maxHeight: 80,
                }}
                draggable={false}
              />
            </motion.div>
          ))}
        </div>
        <div className="flex flex-wrap gap-14 mt-8 text-gray-800 justify-center text-xl font-semibold">
          <span>Healthcare</span>
          <span>Manufacturing</span>
          <span>Logistics &amp; Cargo</span>
          <span>Telecommunications</span>
          <span>Education</span>
        </div>
      </section>

      {/* WHAT WE DO – OUR SERVICES */}
      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-7 text-left">What We Do – Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              className="bg-gray-100 rounded-2xl p-6 shadow flex flex-col items-center text-center border"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.7, type: "spring" }}
              viewport={{ once: true }}
            >
              <div className="font-semibold text-lg mb-1">{service.title}</div>
              <div className="text-gray-600">{service.desc}</div>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center justify-center mt-6">
          <div className="text-xl font-bold text-white bg-[#D6212A] px-6 py-2 rounded-xl shadow-lg select-none">
            360° Coverage
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-left">How It Works</h2>
        <ul className="space-y-3 text-gray-800 text-left">
          <li>Register Your Company: Apply for an account and get verified.</li>
          <li>Log In & Submit Ticket: Describe your issue with details.</li>
          <li>Support Assigned: An on-site or remote technician is dispatched.</li>
          <li>Resolution & Feedback: Continuous tracking and updates until resolution.</li>
        </ul>
        <p className="mt-6 font-semibold text-left" style={{ color: "#D6212A" }}>
          We believe every company deserves frictionless support.
        </p>
      </section>

      {/* WHY CHOOSE US */}
      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-left">Why Choose Us</h2>
        <ul className="space-y-3 text-gray-800 text-left">
          <li>Expert Support: All requests, systems, and technologies covered.</li>
          <li>Real-Time Technician Tracking.</li>
          <li>Fast Response, Superior Availability.</li>
          <li>Transparent Pricing, No Hidden Charges.</li>
          <li>Certified Technicians & Rapid Response Teams.</li>
        </ul>
      </section>

      {/* SUCCESS STORIES */}
      <section className="mt-16">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-left">Success Stories</h2>
        <div className="bg-gray-100 rounded-xl shadow-lg p-6 border">
          <span className="font-bold">How We Reduced Downtime for Ramesh Corp by 70%:</span>
          <br />
          <span className="text-gray-700 text-sm">
            Through our ticketing and dispatch workflow, Ramesh Corp. cut downtime across 100+ workstations by 70%. Our real-time support and instant technician allocation is a game-changer for Kathmandu’s leading organizations.
          </span>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-left">Frequently Asked Questions</h2>
        <div className="bg-gray-100 rounded-xl shadow-lg p-4 border">
          {faqs.map((faq, idx) => (
            <details
              key={faq.q}
              className="mb-3 group"
              open={idx === 0}
            >
              <summary className="font-semibold cursor-pointer flex items-center group-open:text-[#D6212A] transition-colors text-left">
                {faq.q}
                <span className="ml-2 group-open:rotate-90 transition-transform">▶</span>
              </summary>
              <div className="pl-4 mt-1 text-gray-700">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="mt-16 mb-20">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-left">Ready to Get Started?</h2>
        <form
          className="flex flex-col gap-4 bg-gray-100 p-6 rounded-xl shadow-xl border"
          onSubmit={e => { e.preventDefault(); alert("Submitted! (hook up to backend as needed)"); }}
        >
          <div className="flex gap-2">
            <input className="flex-1 p-2 rounded-lg bg-white border border-gray-300 text-black" placeholder="Full Name" required />
            <input className="flex-1 p-2 rounded-lg bg-white border border-gray-300 text-black" placeholder="Company Name" required />
          </div>
          <div className="flex gap-2">
            <input className="flex-1 p-2 rounded-lg bg-white border border-gray-300 text-black" placeholder="Email" type="email" required />
            <input className="flex-1 p-2 rounded-lg bg-white border border-gray-300 text-black" placeholder="Phone Number" required />
          </div>
          <textarea className="p-2 rounded-lg bg-white border border-gray-300 text-black" rows={3} placeholder="Your message/request..." required />
          <button
            type="submit"
            className="bg-[#D6212A] text-white font-bold py-2 rounded-xl mt-2 hover:bg-[#c81620] transition"
          >
            Submit
          </button>
        </form>
      </section>
    </div>

    {/* FOOTER */}
    <footer className="mt-20 py-6 bg-white text-gray-600 text-center text-xs border-t">
      &copy; {new Date().getFullYear()} Harihar Infosys. Designed by Harihar Infosys Team.
    </footer>
  </div>
);

export default LandingPage;
