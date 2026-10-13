import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/AdminLayout';
import type { SharedData } from '@/types/auth';

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;

    return (
        <AdminLayout title="Administration">
            <Head title="Administration" />
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
                <h2 className="display text-3xl font-semibold [overflow-wrap:anywhere] break-words">
                    Welcome, {auth.user?.name}.
                </h2>
                <Button asChild variant="outline" className="mt-6 h-11">
                    <Link href="/">
                        <ArrowLeft /> Visit website
                    </Link>
                </Button>
            </section>
        </AdminLayout>
    );
}
