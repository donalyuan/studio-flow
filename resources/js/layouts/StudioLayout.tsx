import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, LoaderCircle, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import SubmissionError from '@/components/auth/SubmissionError';
import { Button } from '@/components/ui/button';
import { useSubmissionError } from '@/hooks/useSubmissionError';
import type { SharedData } from '@/types/auth';

export default function StudioLayout({
    children,
    register = false,
    accountSettings = false,
}: {
    children: ReactNode;
    register?: boolean;
    accountSettings?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;
    const [menu, setMenu] = useState(false);
    const logout = useForm({});
    const { submissionError, clearSubmissionError } = useSubmissionError(
        logout.processing,
    );
    const labels = ['Home', 'Classes', 'Memberships', 'Contact'];

    return (
        <div className="flex min-h-screen flex-col">
            <header className="border-b border-border bg-white">
                <div className="flex h-20 w-full items-center justify-between gap-2 px-5 sm:gap-6 sm:px-8 lg:px-12">
                    <Link
                        href="/"
                        aria-label="StudioFlow home"
                        className={`display shrink-0 font-bold ${auth.user ? 'text-2xl sm:text-3xl' : 'text-3xl'}`}
                    >
                        Studio<span className="text-primary">Flow</span>
                        <span className="ml-1 inline-block h-2 w-2 bg-primary" />
                    </Link>
                    <nav
                        aria-label="Main navigation"
                        className="hidden items-center gap-8 lg:flex"
                    >
                        {labels.map((label) =>
                            label === 'Home' ? (
                                <Link
                                    key={label}
                                    href="/"
                                    className="text-sm font-medium text-muted-foreground"
                                >
                                    {label}
                                </Link>
                            ) : (
                                <span
                                    key={label}
                                    className="text-sm font-medium text-muted-foreground"
                                >
                                    {label}
                                </span>
                            ),
                        )}
                    </nav>
                    <div className="flex min-w-0 items-center gap-2">
                        {auth.user ? (
                            <>
                                <span
                                    className="hidden max-w-36 truncate text-sm md:inline"
                                    title={auth.user.name}
                                >
                                    {auth.user.name}
                                </span>
                                <Button
                                    asChild
                                    variant="ghost"
                                    className="hidden h-11 sm:inline-flex"
                                >
                                    <Link href="/settings/profile">
                                        Account settings
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={logout.processing}
                                    aria-label="Log out"
                                    title="Log out"
                                    className="hidden h-11 w-11 shrink-0 px-0 sm:inline-flex sm:w-auto sm:px-4"
                                    onClick={() => {
                                        clearSubmissionError();
                                        logout.post('/logout', {
                                            onSuccess: () => setMenu(false),
                                        });
                                    }}
                                >
                                    {logout.processing ? (
                                        <LoaderCircle className="animate-spin" />
                                    ) : (
                                        <LogOut />
                                    )}
                                    <span className="hidden md:inline">
                                        Log out
                                    </span>
                                </Button>
                            </>
                        ) : (
                            <Button
                                asChild
                                variant="outline"
                                className="hidden sm:inline-flex"
                            >
                                <Link href={register ? '/login' : '/register'}>
                                    {register ? 'Log in' : 'Join the studio'}
                                    {!register && <ArrowRight />}
                                </Link>
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={
                                menu ? 'Close navigation' : 'Open navigation'
                            }
                            title={
                                menu ? 'Close navigation' : 'Open navigation'
                            }
                            aria-expanded={menu}
                            aria-controls="mobile-navigation"
                            className="h-11 w-11 shrink-0 lg:hidden"
                            onClick={() => setMenu((value) => !value)}
                        >
                            {menu ? <X /> : <Menu />}
                        </Button>
                    </div>
                </div>
                {menu && (
                    <nav
                        id="mobile-navigation"
                        aria-label="Mobile navigation"
                        className="grid gap-4 border-t border-border px-5 py-5 lg:hidden"
                    >
                        {labels.map((label) =>
                            label === 'Home' ? (
                                <Link
                                    key={label}
                                    href="/"
                                    onClick={() => setMenu(false)}
                                    className="text-sm font-medium text-muted-foreground"
                                >
                                    {label}
                                </Link>
                            ) : (
                                <span
                                    key={label}
                                    className="text-sm font-medium text-muted-foreground"
                                >
                                    {label}
                                </span>
                            ),
                        )}
                        {auth.user ? (
                            <>
                                <span className="truncate text-sm text-muted-foreground">
                                    {auth.user.name}
                                </span>
                                <Link
                                    href="/settings/profile"
                                    className="text-sm font-medium text-primary"
                                    onClick={() => setMenu(false)}
                                >
                                    Account settings
                                </Link>
                                <Button
                                    variant="outline"
                                    className="h-11 justify-start"
                                    disabled={logout.processing}
                                    onClick={() => {
                                        clearSubmissionError();
                                        logout.post('/logout', {
                                            onSuccess: () => setMenu(false),
                                        });
                                    }}
                                >
                                    {logout.processing ? (
                                        <LoaderCircle className="animate-spin" />
                                    ) : (
                                        <LogOut />
                                    )}
                                    {logout.processing
                                        ? 'Logging out...'
                                        : 'Log out'}
                                </Button>
                            </>
                        ) : (
                            <Link
                                href={register ? '/login' : '/register'}
                                className="text-sm font-medium text-primary"
                                onClick={() => setMenu(false)}
                            >
                                {register ? 'Log in' : 'Create an account'}
                            </Link>
                        )}
                    </nav>
                )}
            </header>
            <main
                className={
                    accountSettings
                        ? 'mx-auto w-full max-w-[960px] flex-1 px-5 pt-9 pb-14 sm:px-8 sm:pt-12'
                        : 'mx-auto w-full max-w-[560px] flex-1 px-5 pt-8 pb-12 sm:pt-12'
                }
            >
                <SubmissionError message={submissionError} />
                {!accountSettings && (
                    <img
                        src="/assets/studio.jpg"
                        alt="Fitness studio with strength training equipment"
                        width="1000"
                        height="246"
                        className="mb-7 h-28 w-full object-cover object-center sm:h-32"
                    />
                )}
                {children}
            </main>
            <footer className="flex w-full flex-wrap justify-between gap-2 border-t border-border px-5 py-5 text-xs text-muted-foreground sm:px-8 lg:px-12">
                <span>StudioFlow</span>
                <span>
                    Fitness Studio Membership &amp; Class Booking Platform
                </span>
            </footer>
        </div>
    );
}
