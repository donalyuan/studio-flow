import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    Clock3,
    Home,
    UserRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StudioLayout from '@/layouts/StudioLayout';
import type { MemberCenterCard, SharedData } from '@/types/auth';

interface MemberCenterPageProps extends SharedData {
    membershipCard: MemberCenterCard | null;
    nextBooking: null;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(value));
}

export default function Center() {
    const { auth, membershipCard } = usePage<MemberCenterPageProps>().props;
    const firstName = auth.user?.name.trim().split(/\s+/)[0] ?? 'there';

    return (
        <StudioLayout variant="plain">
            <Head title="Member center" />
            <div className="mx-auto w-[calc(100%-2rem)] max-w-7xl py-8 pb-24 sm:w-[calc(100%-3.5rem)] sm:py-11">
                <header className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                    <div>
                        <p className="text-xs font-bold text-primary uppercase">
                            Member center
                        </p>
                        <h1 className="mt-2 text-3xl leading-tight font-bold">
                            Good morning, {firstName}.
                        </h1>
                    </div>
                    <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                        Your membership and next visit, together in one place.
                    </p>
                </header>

                {membershipCard ? (
                    <div className="mt-5 grid gap-4 lg:mt-7 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] lg:gap-5">
                        <section
                            className="relative flex min-h-[222px] flex-col justify-between gap-6 overflow-hidden rounded-sm bg-primary p-5 text-primary-foreground after:pointer-events-none after:absolute after:-right-14 after:-bottom-24 after:h-[280px] after:w-[280px] after:rounded-full after:border after:border-white/20 after:content-[''] sm:p-7 lg:min-h-[254px]"
                            aria-label="Membership overview"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-bold text-white/80 uppercase">
                                        Current membership
                                    </p>
                                    <p className="mt-2 text-sm">
                                        {membershipCard.type === 'monthly'
                                            ? 'Monthly membership'
                                            : 'Class pack'}
                                    </p>
                                </div>
                                <Badge
                                    variant="outline"
                                    className="shrink-0 border-white/40 bg-transparent text-white"
                                >
                                    Active
                                </Badge>
                            </div>
                            <h2 className="text-2xl leading-tight font-bold break-words sm:text-[26px]">
                                {membershipCard.name}
                            </h2>
                            <dl className="flex items-end justify-between gap-3">
                                <div className="grid min-w-0 gap-1.5">
                                    <dt className="text-[11px] font-bold text-white/80 uppercase">
                                        Valid through
                                    </dt>
                                    <dd className="text-sm font-semibold">
                                        {formatDate(membershipCard.expiresAt)}
                                    </dd>
                                </div>
                                <div className="grid min-w-0 gap-1.5 text-right">
                                    <dt className="text-[11px] font-bold text-white/80 uppercase">
                                        {membershipCard.type === 'monthly'
                                            ? 'Class visits'
                                            : 'Visits remaining'}
                                    </dt>
                                    <dd className="text-sm font-semibold">
                                        {membershipCard.type === 'monthly'
                                            ? 'Unlimited'
                                            : `${membershipCard.remainingClasses} of ${membershipCard.totalClasses}`}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <section
                            className="min-h-[206px] rounded-sm border border-border bg-white p-5 sm:p-6 lg:min-h-[254px]"
                            aria-labelledby="member-next-title"
                        >
                            <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                                <h2
                                    id="member-next-title"
                                    className="text-base font-bold"
                                >
                                    Next booking
                                </h2>
                                <span
                                    className="text-xs font-semibold whitespace-nowrap text-muted-foreground"
                                    aria-disabled="true"
                                >
                                    My bookings
                                </span>
                            </div>
                            <div className="grid min-h-32 content-center justify-items-start">
                                <p className="max-w-[260px] text-[13px] leading-relaxed text-muted-foreground">
                                    You have no upcoming bookings.
                                </p>
                                <Link
                                    className="mt-2 inline-flex min-h-11 items-center gap-2 text-[13px] font-bold text-primary"
                                    href="/#classes"
                                >
                                    Browse classes{' '}
                                    <ArrowRight aria-hidden="true" />
                                </Link>
                            </div>
                        </section>
                    </div>
                ) : (
                    <section className="mt-5 grid min-h-[222px] content-center justify-items-start border border-l-[3px] border-border border-l-primary bg-white p-6 lg:mt-7 lg:min-h-[254px] lg:p-8">
                        <p className="text-xs font-bold text-primary uppercase">
                            Membership
                        </p>
                        <h2 className="mt-2 text-xl font-bold">
                            No active membership
                        </h2>
                        <p className="mt-2 max-w-[430px] text-sm leading-relaxed text-muted-foreground">
                            Choose a membership to start booking classes at the
                            studio.
                        </p>
                        <Button asChild className="mt-5 h-11">
                            <Link href="/memberships">
                                Browse memberships <ArrowRight />
                            </Link>
                        </Button>
                    </section>
                )}

                <section
                    className="mt-5 grid gap-3 sm:mt-6 lg:grid-cols-2 lg:gap-5"
                    aria-label="Member shortcuts"
                >
                    <article className="grid min-h-[130px] grid-cols-[22px_minmax(0,1fr)] items-center gap-x-3.5 gap-y-4 border-t-2 border-border bg-white p-5 sm:min-h-[146px] sm:p-6 lg:grid-cols-[22px_minmax(0,1fr)_auto]">
                        <CalendarDays
                            aria-hidden="true"
                            className="text-primary"
                        />
                        <div>
                            <h2 className="text-base font-bold">My bookings</h2>
                            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                                Review upcoming and past classes.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            disabled
                            className="col-start-2 h-10 justify-self-start lg:col-start-auto"
                        >
                            View bookings
                        </Button>
                    </article>
                    <article className="grid min-h-[130px] grid-cols-[22px_minmax(0,1fr)] items-center gap-x-3.5 gap-y-4 border-t-2 border-border bg-white p-5 sm:min-h-[146px] sm:p-6 lg:grid-cols-[22px_minmax(0,1fr)_auto]">
                        <Clock3 aria-hidden="true" className="text-primary" />
                        <div>
                            <h2 className="text-base font-bold">My orders</h2>
                            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                                Check your purchase history and order details.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            disabled
                            className="col-start-2 h-10 justify-self-start lg:col-start-auto"
                        >
                            View orders
                        </Button>
                    </article>
                </section>
            </div>
            <nav
                className="fixed inset-x-0 bottom-0 z-30 grid min-h-[68px] grid-cols-4 border-t border-border bg-white px-[max(8px,env(safe-area-inset-right))] pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] pl-[max(8px,env(safe-area-inset-left))] sm:hidden"
                aria-label="Member navigation"
            >
                <Link
                    href="/"
                    className="grid min-h-12 content-center justify-items-center gap-1 text-[10px] text-muted-foreground"
                >
                    <Home aria-hidden="true" />
                    <span>Home</span>
                </Link>
                <Link
                    href="/#classes"
                    className="grid min-h-12 content-center justify-items-center gap-1 text-[10px] text-muted-foreground"
                >
                    <CalendarDays aria-hidden="true" />
                    <span>Classes</span>
                </Link>
                <span
                    className="grid min-h-12 content-center justify-items-center gap-1 text-[10px] text-muted-foreground opacity-55"
                    aria-disabled="true"
                    title="Booking navigation becomes available with the booking stage."
                >
                    <CalendarDays aria-hidden="true" />
                    <span>My bookings</span>
                </span>
                <Link
                    href="/member"
                    className="grid min-h-12 content-center justify-items-center gap-1 text-[10px] font-bold text-primary"
                    aria-current="page"
                >
                    <UserRound aria-hidden="true" />
                    <span>Me</span>
                </Link>
            </nav>
        </StudioLayout>
    );
}
