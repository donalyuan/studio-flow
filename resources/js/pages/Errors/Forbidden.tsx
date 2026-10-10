import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudioLayout from '@/layouts/StudioLayout';

export default function Forbidden({ status = 403 }: { status?: number }) {
    return (
        <StudioLayout>
            <Head title="Access restricted" />
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-accent text-primary">
                <ShieldX />
            </div>
            <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground">
                {status}
            </p>
            <h1 className="display mt-3 text-[32px] leading-tight font-semibold">
                Access restricted
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                This area is for studio administrators.
            </p>
            <Button asChild className="mt-7 h-12">
                <Link href="/">
                    <ArrowLeft /> Return home
                </Link>
            </Button>
        </StudioLayout>
    );
}
