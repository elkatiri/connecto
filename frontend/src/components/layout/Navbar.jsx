"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 glass-nav"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo-mark.png"
            alt="CONNECTO"
            width={36}
            height={36}
            priority
            className="w-9 h-9 transition-transform duration-300 group-hover:scale-105"
          />
          <span className="text-base font-bold gradient-text tracking-tight">CONNECTO</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-7">
          <Link href="/#features"     className="text-sm text-muted hover:text-text transition-colors duration-200">Features</Link>
          <Link href="/#how-it-works" className="text-sm text-muted hover:text-text transition-colors duration-200">How It Works</Link>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/entry">Login</Link>
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link href="/entry">Start Chat</Link>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
