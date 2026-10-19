import { Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    CalendarDays,
    CreditCard,
    LoaderCircle,
    LogOut,
    Menu,
    ShieldCheck,
    X,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import SubmissionError from '@/components/auth/SubmissionError';
import { Button } from '@/components/ui/button';
import { useSubmissionError } from '@/hooks/useSubmissionError';
import type { SharedData } from '@/types/auth';

export default function AdminLayout({
    children,
    title = 'Administration',
    className = '',
}: {
    children: ReactNode;
    title?: string;
    className?: string;
}) {
    const { auth } = usePage<SharedData>().props;
    const [menu, setMenu] = useState(false);
    const logout = useForm({});
    const { submissionError, clearSubmissionError } = useSubmissionError(
        logout.processing,
    );

    function signOut() {
        clearSubmissionError();
        logout.post('/logout');
    }

    const navigation = (
        <nav aria-label="Administration navigation" className="grid gap-2">
            <Button
                asChild
                variant={title === 'Administration' ? 'secondary' : 'ghost'}
                className="h-11 justify-start text-muted-foreground"
            >
                <Link
                    href="/admin"
                    aria-current={
                        title === 'Administration' ? 'page' : undefined
                    }
                >
                    <ShieldCheck /> Administration
                </Link>
            </Button>
            <Button
                asChild
                variant={title === 'Membership plans' ? 'secondary' : 'ghost'}
                className="h-11 justify-start text-muted-foreground"
            >
                <Link
                    href="/admin/membership-plans"
                    aria-current={
                        title === 'Membership plans' ? 'page' : undefined
                    }
                >
                    <CreditCard /> Membership plans
                </Link>
            </Button>
            {[
                {
                    label: 'Course types',
                    href: '/admin/course-types',
                    icon: BookOpen,
                },
                {
                    label: 'Class sessions',
                    href: '/admin/class-sessions',
                    icon: CalendarDays,
                },
            ].map(({ label, href, icon: Icon }) => (
                <Button
                    asChild
                    key={href}
                    variant={title === label ? 'secondary' : 'ghost'}
                    className="h-11 justify-start text-muted-foreground"
                >
                    <Link
                        href={href}
                        aria-current={title === label ? 'page' : undefined}
                    >
                        <Icon /> {label}
                    </Link>
                </Button>
            ))}
            <Button
                asChild
                variant="ghost"
                className="h-11 justify-start text-muted-foreground"
            >
                <Link href="/">
                    <ArrowLeft /> Visit website
                </Link>
            </Button>
        </nav>
    );

    return (
        <div
            className={`studio-admin flex min-h-screen flex-col text-foreground md:flex-row ${className}`}
        >
            <aside className="admin-sidebar hidden w-60 shrink-0 border-r border-border bg-white p-5 md:block">
                <Link
                    href="/"
                    className="admin-brand display ml-2 text-3xl font-bold"
                >
                    Studio<span className="text-primary">Flow</span>
                    <span className="ml-1 inline-block h-2 w-2 bg-primary" />
                </Link>
                <p className="mt-12 px-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">
                    ADMINISTRATION
                </p>
                <div className="mt-3">{navigation}</div>
            </aside>
            <div className="flex min-h-screen min-w-0 flex-1 flex-col">
                <header className="relative border-b border-border bg-white px-5 py-4 sm:px-8 lg:px-12">
                    <div className="flex min-h-11 flex-wrap items-center justify-between gap-3">
                        <div className="flex w-full items-center justify-between gap-3 md:hidden">
                            <Link
                                href="/"
                                className="admin-brand display text-2xl font-bold"
                            >
                                Studio<span className="text-primary">Flow</span>
                                <span className="ml-1 inline-block h-2 w-2 bg-primary" />
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11"
                                aria-label={
                                    menu
                                        ? 'Close administration navigation'
                                        : 'Open administration navigation'
                                }
                                aria-expanded={menu}
                                aria-controls="admin-mobile-navigation"
                                onClick={() => setMenu((value) => !value)}
                            >
                                {menu ? <X /> : <Menu />}
                            </Button>
                        </div>
                        <span className="hidden text-sm text-muted-foreground md:inline">
                            {title}
                        </span>
                        <div className="ml-auto flex min-w-0 items-center gap-2">
                            <span
                                className="max-w-36 truncate text-sm"
                                title={auth.user?.name}
                            >
                                {auth.user?.name}
                            </span>
                            <Button
                                variant="outline"
                                onClick={signOut}
                                disabled={logout.processing}
                                aria-label="Log out"
                                title="Log out"
                                className="h-11 w-11 px-0 sm:w-auto sm:px-4"
                            >
                                {logout.processing ? (
                                    <LoaderCircle className="animate-spin" />
                                ) : (
                                    <LogOut />
                                )}
                                <span className="hidden sm:inline">
                                    Log out
                                </span>
                            </Button>
                        </div>
                    </div>
                    {menu && (
                        <div
                            id="admin-mobile-navigation"
                            className="mt-4 border-t border-border pt-4 md:hidden"
                        >
                            {navigation}
                        </div>
                    )}
                </header>
                <main className="flex-1 px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
                    <SubmissionError message={submissionError} />
                    {children}
                </main>
                <footer className="border-t border-border px-5 py-5 text-xs text-muted-foreground sm:px-8 lg:px-12">
                    StudioFlow · Fitness Studio Membership &amp; Class Booking
                    Platform
                </footer>
            </div>
        </div>
    );
}
