import React from "react";
import { motion } from "framer-motion";

interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  delay = 0.1,
  className = "",
}) => (
  <motion.section
    className={className}
    initial={{ opacity: 0, y: 64 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.9, delay, type: "spring" }}
    viewport={{ once: true, amount: 0.3 }}
  >
    {children}
  </motion.section>
);

export default AnimatedSection;
