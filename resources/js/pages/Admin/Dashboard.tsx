import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ShieldCheck,
    LoaderCircle,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';
import SubmissionError from '@/components/auth/SubmissionError';
import { Button } from '@/components/ui/button';
import { useSubmissionError } from '@/hooks/useSubmissionError';
import type { SharedData } from '@/types/auth';

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const logout = useForm({});
    const [menu, setMenu] = useState(false);
    const { submissionError, clearSubmissionError } = useSubmissionError(
        logout.processing,
    );

    function signOut() {
        clearSubmissionError();
        logout.post('/logout');
    }

    return (
        <div className="flex min-h-screen flex-col text-foreground md:flex-row">
            <Head title="Administration" />
            <aside className="hidden w-60 shrink-0 border-r border-border bg-white p-5 md:block">
                <Link href="/" className="display ml-2 text-3xl font-bold">
                    Studio<span className="text-primary">Flow</span>
                    <span className="ml-1 inline-block h-2 w-2 bg-primary" />
                </Link>
                <p className="mt-12 px-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">
                    ADMINISTRATION
                </p>
                <nav
                    aria-label="Administration navigation"
                    className="mt-3 grid gap-2"
                >
                    <Button
                        asChild
                        variant="secondary"
                        className="h-11 justify-start text-primary"
                    >
                        <Link href="/admin" aria-current="page">
                            <ShieldCheck /> Administration
                        </Link>
                    </Button>
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
            </aside>
            <div className="flex min-h-screen min-w-0 flex-1 flex-col">
                <header className="border-b border-border bg-white px-5 py-4 sm:px-8 lg:px-12">
                    <div className="flex min-h-11 flex-wrap items-center justify-between gap-3">
                        <div className="flex w-full items-center justify-between gap-3 md:hidden">
                            <Link
                                href="/"
                                className="display text-2xl font-bold"
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
                            Administration
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
                        <nav
                            id="admin-mobile-navigation"
                            aria-label="Mobile administration navigation"
                            className="mt-4 grid gap-2 border-t border-border pt-4 md:hidden"
                        >
                            <Button
                                asChild
                                variant="secondary"
                                className="h-11 justify-start text-primary"
                            >
                                <Link href="/admin" aria-current="page">
                                    <ShieldCheck /> Administration
                                </Link>
                            </Button>
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
                    )}
                </header>
                <main className="flex-1 px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
                    <SubmissionError message={submissionError} />
                    <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground">
                        STUDIOFLOW
                    </p>
                    <h1 className="display mt-3 text-4xl font-semibold sm:text-5xl">
                        Studio administration
                    </h1>
                    <section className="mt-14 max-w-xl">
                        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-accent text-primary">
                            <ShieldCheck />
                        </div>
                        <h2 className="display text-3xl font-semibold [overflow-wrap:anywhere]">
                            Welcome, {auth.user?.name}.
                        </h2>
                        <Button asChild variant="outline" className="mt-6 h-11">
                            <Link href="/">
                                <ArrowLeft /> Visit website
                            </Link>
                        </Button>
                    </section>
                </main>
                <footer className="border-t border-border px-5 py-5 text-xs text-muted-foreground sm:px-8 lg:px-12">
                    StudioFlow · Fitness Studio Membership &amp; Class Booking
                    Platform
                </footer>
            </div>
        </div>
    );
}
