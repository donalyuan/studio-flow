import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudioLayout from '@/layouts/StudioLayout';
import type { SharedData } from '@/types/auth';

export default function Home() {
    const { auth, flash } = usePage<SharedData>().props;

    return (
        <StudioLayout>
            <Head title="Home" />
            <section className="py-5">
                {auth.user && (
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-accent text-primary">
                        <Check />
                    </div>
                )}
                <h1 className="display text-3xl font-semibold">StudioFlow</h1>
                {flash.status && (
                    <p
                        role="status"
                        className="mt-3 text-sm leading-6 text-primary"
                    >
                        {flash.status}
                    </p>
                )}
                {auth.user ? (
                    <p className="mt-2 text-sm leading-6 [overflow-wrap:anywhere] text-muted-foreground">
                        Welcome, {auth.user.name}.
                    </p>
                ) : (
                    <>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            Fitness Studio Membership &amp; Class Booking
                            Platform
                        </p>
                        <div className="mt-7 flex flex-wrap gap-3">
                            <Button asChild>
                                <Link href="/register">
                                    Create an account <ArrowRight />
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/login">Log in</Link>
                            </Button>
                        </div>
                    </>
                )}
            </section>
        </StudioLayout>
    );
}
