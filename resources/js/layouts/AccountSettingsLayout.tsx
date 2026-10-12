import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import StudioLayout from '@/layouts/StudioLayout';
import type { SharedData } from '@/types/auth';

export default function AccountSettingsLayout({
    children,
    active,
}: {
    children: ReactNode;
    active: 'profile' | 'password';
}) {
    const { auth } = usePage<SharedData>().props;
    const admin = auth.user?.role === 'admin';

    return (
        <StudioLayout accountSettings>
            <Link
                href={admin ? '/admin' : '/'}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
            >
                <ArrowLeft size={16} />
                {admin ? 'Return to administration' : 'Return home'}
            </Link>
            <h1 className="display mt-6 text-4xl font-semibold sm:text-5xl">
                Account settings
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Manage your personal details and password.
            </p>
            <div className="mt-9 grid gap-7 sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-12">
                <nav
                    aria-label="Account settings navigation"
                    className="flex gap-2 border-b border-border pb-3 sm:flex-col sm:border-0 sm:p-0"
                >
                    <Button
                        asChild
                        variant={active === 'profile' ? 'secondary' : 'ghost'}
                        className="h-11 flex-1 justify-center sm:flex-none sm:justify-start"
                    >
                        <Link
                            href="/settings/profile"
                            aria-current={
                                active === 'profile' ? 'page' : undefined
                            }
                        >
                            Profile
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant={active === 'password' ? 'secondary' : 'ghost'}
                        className="h-11 flex-1 justify-center sm:flex-none sm:justify-start"
                    >
                        <Link
                            href="/settings/password"
                            aria-current={
                                active === 'password' ? 'page' : undefined
                            }
                        >
                            Password
                        </Link>
                    </Button>
                </nav>
                <section className="max-w-[560px] min-w-0">{children}</section>
            </div>
        </StudioLayout>
    );
}
