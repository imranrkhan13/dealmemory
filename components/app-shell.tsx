'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Activity, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasProject, setHasProject] = useState(false);
    const { data: session, status } = useSession();

    const toggleMenu = () => setIsOpen(!isOpen);
    const pathname = usePathname();
    const signInHref = `/auth/signin?callbackUrl=${encodeURIComponent(pathname || '/overview')}`;

    useEffect(() => {
        setHasProject(Boolean(localStorage.getItem('activation-memory-project')));
    }, []);

    const homeHref = '/';
    const navLinks = [
        { href: '/overview', label: 'Overview' },
        { href: '/journeys', label: 'Journeys' },
        { href: '/sdk', label: 'SDK Setup' },
        { href: '/settings', label: 'Settings' },
    ];

    return (
        <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
            <div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-xl border border-[#E7E2DA] bg-[#FFFDF9]/95 px-4 shadow-sm backdrop-blur-md transition-all duration-300">

                {/* Logo */}
                <Link href={homeHref} className="flex items-center gap-2 font-semibold tracking-tight text-[#29221D]">
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-[#29221D] text-white">
                        <Activity size={16} />
                    </span>
                    DealMemory
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-6 text-sm font-medium text-[#6B6B6B] md:flex">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="transition-colors hover:text-[#29221D]">
                            {link.label}
                        </Link>
                    ))}
                    {session ? (
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-[#29221D]">
                                    {session.user?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {session.user?.email}
                                </p>
                            </div>

                            <button
                                onClick={() => signOut()}
                                className="rounded-lg bg-[#29221D] px-3 py-2 text-sm text-white"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            className="rounded-lg bg-[#29221D] px-3.5 py-1.5 text-sm text-white"
                            href={signInHref}
                        >
                            Sign in
                        </Link>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMenu}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-[#E7E2DA] text-[#29221D] transition-colors hover:bg-[#F5F2EB] md:hidden"
                    aria-label="Toggle Menu"
                >
                    {isOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {isOpen && (
                <div className="mt-2 mx-auto max-w-7xl rounded-xl border border-[#E7E2DA] bg-[#FFFDF9] p-4 shadow-md md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <nav className="flex flex-col gap-3 text-sm font-medium text-[#6B6B6B]">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="rounded-lg px-2 py-1.5 transition-colors hover:bg-[#F5F2EB] hover:text-[#29221D]"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <hr className="my-1 border-[#E7E2DA]" />
                        {session ? (
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-semibold">
                                        {session.user?.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {session.user?.email}
                                    </p>
                                </div>

                                <button
                                    onClick={() => signOut()}
                                    className="rounded-lg bg-[#29221D] px-3 py-1.5 text-sm text-white"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                className="rounded-lg bg-[#29221D] px-3.5 py-1.5 text-sm text-white"
                                href={signInHref}
                            >
                                Sign in
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#FFFDF9] text-[#29221D] selection:bg-[#29221D] selection:text-white">
            <Navbar />
            {/* Container matching the wide layout with correct navbar offset padding */}
            <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-16">
                {children}
            </main>
        </div>
    );
}