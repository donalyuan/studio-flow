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
            <div className="settings-workspace">
                <Link
                    href={admin ? '/admin' : '/'}
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
                >
                    <ArrowLeft size={16} />
                    {admin ? 'Return to administration' : 'Return home'}
                </Link>
                <div className="settings-heading">
                    <h1 className="display">Account settings</h1>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Manage your personal details and password.
                    </p>
                </div>
                <div className="settings-columns">
                    <nav
                        aria-label="Account settings navigation"
                        className="flex gap-2 md:flex-col"
                    >
                        <Button
                            asChild
                            variant={
                                active === 'profile' ? 'secondary' : 'ghost'
                            }
                            className="h-11 flex-1 justify-center md:flex-none md:justify-start"
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
                            variant={
                                active === 'password' ? 'secondary' : 'ghost'
                            }
                            className="h-11 flex-1 justify-center md:flex-none md:justify-start"
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
                    <section className="settings-form">{children}</section>
                </div>
            </div>
        </StudioLayout>
    );
}
