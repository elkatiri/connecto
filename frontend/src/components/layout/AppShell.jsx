"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Shuffle, User, LogOut, Menu, X } from "lucide-react";
import { getSession, logout } from "@/lib/session";
import { avatarGradient, initials } from "@/lib/avatar";

const NAV = [
  { href: "/lobby",       label: "Browse People", icon: Users },
  { href: "/matchmaking", label: "Random Match",  icon: Shuffle },
  { href: "/profile",     label: "Profile",       icon: User },
];

function SidebarContent({ pathname, session, onNavigate, onLogout }) {
  const [from, to] = avatarGradient(session?.name || "Guest");

  return (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <Link href="/" onClick={onNavigate} className="flex items-center gap-2.5 px-2 py-2 mb-6">
        <Image src="/logo-mark.png" alt="CONNECTO" width={34} height={34} className="w-8 h-8" />
        <span className="font-bold gradient-text tracking-tight">CONNECTO</span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-1.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "text-white bg-linear-to-r from-primary/90 to-secondary/80 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                  : "text-muted hover:text-text hover:bg-white/5"
              }`}
            >
              <Icon size={17} /> {label}
            </Link>
          );
        })}
      </nav>

      {/* User block */}
      <div className="mt-auto">
        <div className="glass-sm rounded-2xl p-3 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
            style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            {initials(session?.name || "Guest")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text truncate">{session?.name || "Guest"}</p>
            <p className="text-[11px] text-muted">{session?.isAnonymous ? "Guest" : "Member"}</p>
          </div>
          <button
            onClick={onLogout}
            title="Log out"
            aria-label="Log out"
            className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSession(getSession());
  }, [pathname]);

  const handleLogout = () => logout(router);

  return (
    <div className="min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-40 glass-nav border-r border-white/6">
        <SidebarContent pathname={pathname} session={session} onLogout={handleLogout} />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 glass-nav h-16 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-mark.png" alt="CONNECTO" width={30} height={30} className="w-7 h-7" />
          <span className="font-bold gradient-text text-sm tracking-tight">CONNECTO</span>
        </Link>
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-2 rounded-lg text-muted hover:text-text">
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 z-50 bg-surface border-r border-white/8"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="absolute top-4 right-4 p-2 rounded-lg text-muted hover:text-text z-10"
              >
                <X size={18} />
              </button>
              <SidebarContent
                pathname={pathname}
                session={session}
                onNavigate={() => setOpen(false)}
                onLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="pt-16 lg:pt-0">{children}</div>
      </div>
    </div>
  );
}
