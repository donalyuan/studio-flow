import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudioLayout from '@/layouts/StudioLayout';
import type { SharedData } from '@/types/auth';

export default function Home() {
    const { auth, flash } = usePage<SharedData>().props;

    return (
        <StudioLayout variant="home">
            <Head title="Home" />
            <section className="home-split">
                <div className="home-photo">
                    <img
                        src="/assets/studio.jpg"
                        alt="Fitness studio with strength training equipment"
                        width="1000"
                        height="667"
                    />
                </div>
                <div className="home-content">
                    <h1 className="display text-3xl font-semibold">
                        StudioFlow
                    </h1>
                    {flash.status && (
                        <p
                            role="status"
                            className="mt-3 text-sm leading-6 text-primary"
                        >
                            {flash.status}
                        </p>
                    )}
                    {auth.user ? (
                        <>
                            <p className="mt-2 text-sm leading-6 [overflow-wrap:anywhere] text-muted-foreground">
                                Welcome, {auth.user.name}.
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <Button asChild className="h-11">
                                    <Link href="/settings/profile">
                                        Account settings
                                    </Link>
                                </Button>
                                {auth.user.role === 'admin' && (
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="h-11"
                                    >
                                        <Link href="/admin">
                                            <ShieldCheck /> Open administration{' '}
                                            <ArrowRight />
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                Fitness Studio Membership &amp; Class Booking
                                Platform
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <Button asChild className="h-11">
                                    <Link href="/register">
                                        Create an account <ArrowRight />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-11"
                                >
                                    <Link href="/login">Log in</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </StudioLayout>
    );
}
