import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/AdminLayout';
import type { SharedData } from '@/types/auth';

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;

    return (
        <AdminLayout title="Administration">
            <Head title="Administration" />
            <h1 className="display text-2xl font-semibold sm:text-3xl">
                Studio administration
            </h1>
            <section className="mt-3 max-w-xl">
                <p className="text-sm leading-6 [overflow-wrap:anywhere] text-muted-foreground">
                    Welcome, {auth.user?.name}.
                </p>
                <Button asChild variant="outline" className="mt-6 h-11">
                    <Link href="/">
                        <ArrowLeft /> Visit website
                    </Link>
                </Button>
            </section>
        </AdminLayout>
    );
}
