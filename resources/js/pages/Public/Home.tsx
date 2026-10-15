import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudioLayout from '@/layouts/StudioLayout';
import type { PublicMembershipPlan, SharedData } from '@/types/auth';

interface HomePageProps extends SharedData {
    plans: PublicMembershipPlan[];
}

function PlanCard({ plan }: { plan: PublicMembershipPlan }) {
    const allowance =
        plan.type === 'monthly'
            ? 'Unlimited classes'
            : `${plan.total_classes} class visits`;

    return (
        <article className="home-plan-card">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="eyebrow">
                        {plan.type === 'monthly' ? 'Monthly' : 'Class pack'}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">{plan.name}</h3>
                </div>
                <p className="text-right text-sm font-semibold text-primary">
                    USD {plan.price}
                    <span className="mt-1 block text-xs font-normal text-muted-foreground">
                        {plan.valid_days} days
                    </span>
                </p>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {plan.description}
            </p>
            <p className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-sm font-medium">
                <Check className="size-4 text-primary" />
                {allowance}
            </p>
        </article>
    );
}

export default function Home() {
    const { auth, flash, plans } = usePage<HomePageProps>().props;

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
                    <p className="eyebrow">Fitness studio membership</p>
                    <h1 className="display mt-4 text-3xl font-semibold">
                        Train with intention.
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
                                Fitness Studio Membership & Class Booking
                                Platform
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <Button asChild className="h-11">
                                    <Link href="/memberships">
                                        Explore memberships <ArrowRight />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-11"
                                >
                                    <Link href="/contact">
                                        Contact the studio
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </section>
            <section id="classes" className="home-section">
                <div className="public-section-inner">
                    <div className="section-heading">
                        <p className="eyebrow">The studio rhythm</p>
                        <h2 className="display">Move well. Feel stronger.</h2>
                        <p>
                            Focused sessions for building strength, finding
                            flow, and making time for recovery.
                        </p>
                    </div>
                    <div className="home-classes-grid">
                        <article className="home-class-card">
                            <p className="eyebrow">Strength</p>
                            <h3>Build a reliable base</h3>
                            <p>
                                Progressive training with clear coaching and
                                steady pacing.
                            </p>
                        </article>
                        <article className="home-class-card">
                            <p className="eyebrow">Flow</p>
                            <h3>Find your focus</h3>
                            <p>
                                Intentional movement that leaves room to breathe
                                and reset.
                            </p>
                        </article>
                        <article className="home-class-card">
                            <p className="eyebrow">Recovery</p>
                            <h3>Make space to restore</h3>
                            <p>
                                Low-impact sessions to support the work you put
                                in.
                            </p>
                        </article>
                    </div>
                </div>
            </section>
            <section className="home-section home-section-muted">
                <div className="public-section-inner">
                    <div className="section-heading section-heading-row">
                        <div>
                            <p className="eyebrow">Memberships</p>
                            <h2 className="display">Choose your rhythm.</h2>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="h-11 shrink-0"
                        >
                            <Link href="/memberships">
                                View all memberships <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                    {plans.length > 0 ? (
                        <div className="home-plans-grid">
                            {plans.map((plan) => (
                                <PlanCard key={plan.id} plan={plan} />
                            ))}
                        </div>
                    ) : (
                        <p className="public-empty-state">
                            Memberships will be available soon.
                        </p>
                    )}
                </div>
            </section>
            <section className="home-contact-band">
                <div className="public-section-inner flex flex-wrap items-center justify-between gap-5">
                    <div>
                        <p className="eyebrow">Questions before you start?</p>
                        <h2 className="display mt-2 text-2xl font-semibold">
                            Talk with the studio.
                        </h2>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        className="h-11 border-white/60 bg-transparent text-white hover:bg-white hover:text-foreground"
                    >
                        <Link href="/contact">
                            Get in touch <ArrowRight />
                        </Link>
                    </Button>
                </div>
            </section>
        </StudioLayout>
    );
}
