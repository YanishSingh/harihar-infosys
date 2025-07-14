import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.svg"; // Adjust path if needed

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      onFinish();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.img
            src={logo}
            alt="Harihar Infosys Logo"
            className="w-20 h-20 mb-5"
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, type: "spring" }}
            draggable={false}
          />
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold text-black tracking-widest mb-6"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.1 }}
            style={{ fontFamily: "Roboto, sans-serif" }}
          >
            SIMPLE. SECURE. SMART.
          </motion.h1>
          <motion.div
            className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: "16rem" }}
            transition={{ duration: 2 }}
          >
            <motion.div
              className="h-full"
              style={{ background: "#D6212A" }}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.2, delay: 0.1 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
