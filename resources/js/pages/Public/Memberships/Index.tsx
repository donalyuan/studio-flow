import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Check, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudioLayout from '@/layouts/StudioLayout';
import type { PublicMembershipPlan, SharedData } from '@/types/auth';

interface MembershipsPageProps extends SharedData {
    plans: PublicMembershipPlan[];
}

function PlanCard({ plan }: { plan: PublicMembershipPlan }) {
    const allowance =
        plan.type === 'monthly'
            ? 'Unlimited classes'
            : `${plan.total_classes} class visits`;

    return (
        <article className="public-plan-card">
            <div className="flex items-start justify-between gap-5">
                <div>
                    <p className="eyebrow">
                        {plan.type === 'monthly'
                            ? 'Monthly membership'
                            : 'Class pack'}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold">{plan.name}</h2>
                </div>
                <p className="text-right text-lg font-semibold text-primary">
                    USD {plan.price}
                </p>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">
                {plan.description}
            </p>
            <dl className="mt-7 grid gap-4 border-y border-border py-5 sm:grid-cols-2">
                <div>
                    <dt className="eyebrow">Access</dt>
                    <dd className="mt-2 flex items-center gap-2 text-sm font-medium">
                        <Check className="size-4 text-primary" /> {allowance}
                    </dd>
                </div>
                <div>
                    <dt className="eyebrow">Validity</dt>
                    <dd className="mt-2 flex items-center gap-2 text-sm font-medium">
                        <Clock3 className="size-4 text-primary" />{' '}
                        {plan.valid_days} days from activation
                    </dd>
                </div>
            </dl>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs leading-5 text-muted-foreground">
                    Virtual payment only. No real charge is made.
                </p>
                <Button asChild className="h-11">
                    <Link href="/register">
                        Choose this plan <ArrowRight />
                    </Link>
                </Button>
            </div>
        </article>
    );
}

export default function MembershipsIndex() {
    const { plans } = usePage<MembershipsPageProps>().props;

    return (
        <StudioLayout variant="plain">
            <Head title="Memberships" />
            <div className="public-page-workspace">
                <div className="public-page-heading">
                    <div>
                        <p className="eyebrow">Memberships</p>
                        <h1 className="display">
                            A plan that keeps you moving.
                        </h1>
                    </div>
                    <p>Simple options, clear terms, and a pace you can keep.</p>
                </div>
                {plans.length > 0 ? (
                    <div className="public-plans-list">
                        {plans.map((plan) => (
                            <PlanCard key={plan.id} plan={plan} />
                        ))}
                    </div>
                ) : (
                    <p className="public-empty-state">
                        No memberships are available right now. Please check
                        back soon.
                    </p>
                )}
            </div>
        </StudioLayout>
    );
}
