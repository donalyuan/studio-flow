import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Check,
    CirclePlus,
    CreditCard,
    LoaderCircle,
    Pencil,
    Power,
    Trash2,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import SubmissionError from '@/components/auth/SubmissionError';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useSubmissionError } from '@/hooks/useSubmissionError';
import AdminLayout from '@/layouts/AdminLayout';
import type { MembershipPlan, SharedData } from '@/types/auth';

type PlanForm = {
    name: string;
    description: string;
    price: string;
    type: 'monthly' | 'class_pack';
    valid_days: string;
    total_classes: string;
    enabled: string;
};
type Props = SharedData & {
    plans: MembershipPlan[];
    selectedPlanId: number | null;
};

const emptyForm: PlanForm = {
    name: '',
    description: '',
    price: '',
    type: 'monthly',
    valid_days: '',
    total_classes: '',
    enabled: '',
};
const toForm = (plan: MembershipPlan): PlanForm => ({
    name: plan.name,
    description: plan.description,
    price: plan.price,
    type: plan.type,
    valid_days: String(plan.valid_days),
    total_classes:
        plan.total_classes === null ? '' : String(plan.total_classes),
    enabled: plan.enabled ? '1' : '0',
});

export default function MembershipPlansIndex() {
    const { plans, flash } = usePage<Props>().props;
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [mode, setMode] = useState<'detail' | 'new' | 'edit'>('detail');
    const [detailOpen, setDetailOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const detailTrigger = useRef<HTMLElement | null>(null);
    const deleteTrigger = useRef<HTMLElement | null>(null);
    const [dialogMessage, setDialogMessage] = useState('');
    const form = useForm<PlanForm>({ ...emptyForm });
    const statusForm = useForm<{ enabled: boolean }>({
        enabled: false,
    });
    const selected = plans.find((plan) => plan.id === selectedId) ?? null;
    const deleteForm = useForm<{ plan?: string }>({});
    const { submissionError, clearSubmissionError } = useSubmissionError(
        form.processing || statusForm.processing || deleteForm.processing,
    );
    const busy =
        form.processing || statusForm.processing || deleteForm.processing;

    function selectPlan(plan: MembershipPlan, trigger: HTMLElement) {
        detailTrigger.current = trigger;
        setSelectedId(plan.id);
        setMode('detail');
        setDetailOpen(true);
        setDialogMessage('');
        clearSubmissionError();
        form.clearErrors();
        form.setDefaults(toForm(plan));
        form.setData(toForm(plan));
    }
    function createPlan() {
        detailTrigger.current = document.activeElement as HTMLElement;
        setSelectedId(null);
        setMode('new');
        setDialogMessage('');
        setDetailOpen(true);
        clearSubmissionError();
        form.clearErrors();
        form.setDefaults(emptyForm);
        form.setData({ ...emptyForm });
    }
    function editPlan() {
        if (selected) {
            setMode('edit');
            setDialogMessage('');
            clearSubmissionError();
            form.clearErrors();
            form.setData(toForm(selected));
        }
    }
    function onSuccess(page: { props: Record<string, unknown> }) {
        const props = page.props as Partial<Props> & {
            flash?: { status?: string };
        };
        setSelectedId(props.selectedPlanId ?? null);
        setMode('detail');
        setDialogMessage(props.flash?.status ?? '');
        setDetailOpen(true);
        window.requestAnimationFrame(() =>
            document.getElementById('edit-plan-action')?.focus(),
        );
    }
    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        clearSubmissionError();
        form.clearErrors();
        form.transform((data) => ({
            ...data,
            total_classes: data.type === 'monthly' ? null : data.total_classes,
            enabled: data.enabled === '' ? '' : data.enabled === '1',
        }));

        if (mode === 'edit' && selected) {
            form.patch(`/admin/membership-plans/${selected.id}`, {
                preserveScroll: true,
                onSuccess,
            });
        } else {
            form.post('/admin/membership-plans', {
                preserveScroll: true,
                onSuccess,
            });
        }
    }
    function toggleStatus(plan: MembershipPlan) {
        clearSubmissionError();
        statusForm.clearErrors();
        statusForm.transform(() => ({ enabled: !plan.enabled }));
        statusForm.patch(`/admin/membership-plans/${plan.id}/status`, {
            preserveScroll: true,
            onSuccess: () => {
                setDialogMessage(
                    plan.enabled ? 'Plan disabled.' : 'Plan enabled.',
                );
                window.requestAnimationFrame(() => {
                    const actions = [
                        `toggle-plan-${plan.id}`,
                        `toggle-plan-mobile-${plan.id}`,
                    ];
                    const target = actions
                        .map((id) => document.getElementById(id))
                        .find((element) => element?.getClientRects().length);
                    target?.focus();
                });
            },
        });
    }
    function deletePlan() {
        if (!selected || selected.has_paid_orders || busy) {
            return;
        }

        clearSubmissionError();
        deleteForm.clearErrors();
        deleteForm.delete(`/admin/membership-plans/${selected.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmDelete(false);
                setSelectedId(null);
                setMode('detail');
                setDetailOpen(false);
                deleteTrigger.current = null;
            },
        });
    }
    const allowance = (plan: MembershipPlan) =>
        plan.type === 'monthly'
            ? 'Unlimited classes'
            : `${plan.total_classes} class visits`;
    const price = (plan: MembershipPlan) => `USD ${plan.price}`;

    function cancelEditor() {
        if (mode === 'new') {
            setDetailOpen(false);
            setSelectedId(null);
        }

        setMode('detail');
        form.clearErrors();
        clearSubmissionError();
    }

    return (
        <AdminLayout
            title="Membership plans"
            className="membership-plans-console"
        >
            <Head title="Membership plans" />
            {!detailOpen && !confirmDelete && (
                <SubmissionError message={submissionError} />
            )}
            {flash.status && (
                <p
                    role="status"
                    className="mb-5 flex items-center gap-2 border-l-2 border-primary bg-white p-3 text-sm text-primary"
                >
                    <Check size={16} />
                    {flash.status}
                </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Membership plans
                    </h1>
                    <span className="border-l border-border pl-3 text-xs text-muted-foreground">
                        {plans.length} plans
                    </span>
                </div>
                <Button
                    id="create-plan-action"
                    onClick={createPlan}
                    disabled={busy}
                    className="h-11"
                >
                    <CirclePlus /> Create plan
                </Button>
            </div>
            <div className="mt-6">
                <section
                    aria-label="Membership plans"
                    className="min-w-0 overflow-hidden border border-border bg-white"
                >
                    <div className="flex min-h-18 items-center justify-between gap-3 border-b border-border p-5">
                        <h2 className="text-sm font-semibold">Plan catalog</h2>
                        <span className="text-xs text-muted-foreground">
                            Select a plan
                        </span>
                    </div>
                    {plans.length > 0 ? (
                        <>
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                Plan / allowance
                                            </TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>
                                                <span className="sr-only">
                                                    Plan actions
                                                </span>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {plans.map((plan) => (
                                            <TableRow
                                                key={plan.id}
                                                className={
                                                    plan.id === selectedId
                                                        ? 'bg-accent/40'
                                                        : ''
                                                }
                                            >
                                                <TableCell className="pl-5 whitespace-normal">
                                                    <strong className="font-semibold">
                                                        {plan.name}
                                                    </strong>
                                                    <small className="mt-1 block text-xs text-muted-foreground">
                                                        {allowance(plan)} ·{' '}
                                                        {plan.valid_days} days
                                                    </small>
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap tabular-nums">
                                                    {price(plan)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className={
                                                            plan.enabled
                                                                ? 'bg-accent text-primary'
                                                                : 'text-muted-foreground'
                                                        }
                                                    >
                                                        {plan.enabled
                                                            ? 'Enabled'
                                                            : 'Disabled'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div
                                                        className="flex items-center justify-end gap-2"
                                                        role="group"
                                                        aria-label={`Actions for ${plan.name}`}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            className="h-10"
                                                            disabled={busy}
                                                            onClick={(event) =>
                                                                selectPlan(
                                                                    plan,
                                                                    event.currentTarget,
                                                                )
                                                            }
                                                            aria-label={`View ${plan.name}`}
                                                        >
                                                            View
                                                        </Button>
                                                        <Button
                                                            id={`toggle-plan-${plan.id}`}
                                                            variant="outline"
                                                            className="h-9 w-9 px-0 lg:h-10 lg:w-auto lg:px-3"
                                                            disabled={busy}
                                                            onClick={() =>
                                                                toggleStatus(
                                                                    plan,
                                                                )
                                                            }
                                                            aria-label={`${plan.enabled ? 'Disable' : 'Enable'} ${plan.name}`}
                                                            title={`${plan.enabled ? 'Disable' : 'Enable'} ${plan.name}`}
                                                        >
                                                            <Power />
                                                            <span className="hidden lg:inline">
                                                                {plan.enabled
                                                                    ? 'Disable'
                                                                    : 'Enable'}
                                                            </span>
                                                        </Button>
                                                        <Button
                                                            id={`delete-plan-${plan.id}`}
                                                            variant="outline"
                                                            className="h-9 w-9 border-destructive/40 px-0 text-destructive lg:h-10 lg:w-auto lg:px-3"
                                                            disabled={
                                                                busy ||
                                                                plan.has_paid_orders
                                                            }
                                                            onClick={(
                                                                event,
                                                            ) => {
                                                                deleteTrigger.current =
                                                                    event.currentTarget;
                                                                setSelectedId(
                                                                    plan.id,
                                                                );
                                                                deleteForm.clearErrors();
                                                                clearSubmissionError();
                                                                setConfirmDelete(
                                                                    true,
                                                                );
                                                            }}
                                                            aria-label={`Delete ${plan.name}`}
                                                            title={`Delete ${plan.name}`}
                                                        >
                                                            <Trash2 />
                                                            <span className="hidden lg:inline">
                                                                Delete
                                                            </span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="md:hidden">
                                {plans.map((plan) => (
                                    <article
                                        key={plan.id}
                                        className={`border-t border-border p-5 ${plan.id === selectedId ? 'border-l-2 border-l-primary bg-accent/30' : ''}`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <h3 className="text-sm font-semibold">
                                                {plan.name}
                                            </h3>
                                            <Badge
                                                variant="secondary"
                                                className={
                                                    plan.enabled
                                                        ? 'bg-accent text-primary'
                                                        : 'text-muted-foreground'
                                                }
                                            >
                                                {plan.enabled
                                                    ? 'Enabled'
                                                    : 'Disabled'}
                                            </Badge>
                                        </div>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {allowance(plan)} ·{' '}
                                            {plan.valid_days} days
                                        </p>
                                        <div className="mt-4">
                                            <strong className="text-sm tabular-nums">
                                                {price(plan)}
                                            </strong>
                                        </div>
                                        <div className="mt-4 grid gap-2">
                                            <Button
                                                variant="outline"
                                                className="h-11"
                                                disabled={busy}
                                                onClick={(event) =>
                                                    selectPlan(
                                                        plan,
                                                        event.currentTarget,
                                                    )
                                                }
                                                aria-label={`View ${plan.name}`}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                id={`toggle-plan-mobile-${plan.id}`}
                                                variant="outline"
                                                className="h-11"
                                                disabled={busy}
                                                onClick={() =>
                                                    toggleStatus(plan)
                                                }
                                                aria-label={`${plan.enabled ? 'Disable' : 'Enable'} ${plan.name}`}
                                            >
                                                <Power />
                                                {plan.enabled
                                                    ? 'Disable'
                                                    : 'Enable'}
                                            </Button>
                                            <Button
                                                id={`delete-plan-mobile-${plan.id}`}
                                                variant="outline"
                                                className="h-11 border-destructive/40 text-destructive"
                                                disabled={
                                                    busy || plan.has_paid_orders
                                                }
                                                onClick={(event) => {
                                                    deleteTrigger.current =
                                                        event.currentTarget;
                                                    setSelectedId(plan.id);
                                                    deleteForm.clearErrors();
                                                    clearSubmissionError();
                                                    setConfirmDelete(true);
                                                }}
                                                aria-label={`Delete ${plan.name}`}
                                            >
                                                <Trash2 /> Delete
                                            </Button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                            <p className="border-t border-border p-4 text-xs text-muted-foreground">
                                Disabled plans remain in your catalog. Purchased
                                plans cannot be deleted.
                            </p>
                        </>
                    ) : (
                        <div className="grid justify-items-center gap-4 p-10 text-center">
                            <CreditCard className="text-primary" size={28} />
                            <h3 className="font-semibold">
                                No membership plans yet
                            </h3>
                            <p className="max-w-xs text-sm text-muted-foreground">
                                Create a monthly plan or a class pack to get
                                started.
                            </p>
                            <Button
                                onClick={createPlan}
                                disabled={busy}
                                className="h-11"
                            >
                                Create your first plan
                            </Button>
                        </div>
                    )}
                </section>
                <Dialog
                    open={detailOpen}
                    onOpenChange={(open) => {
                        if (!busy) {
                            setDetailOpen(open);

                            if (!open) {
                                setMode('detail');
                                form.clearErrors();
                                clearSubmissionError();
                            }
                        }
                    }}
                >
                    <DialogContent
                        className="membership-plans-console plan-modal max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-[900px] overflow-y-auto p-0 sm:max-h-[90dvh] sm:max-w-[900px] [&_[data-slot=dialog-close]]:top-2 [&_[data-slot=dialog-close]]:right-2 [&_[data-slot=dialog-close]]:size-11"
                        showCloseButton={!busy}
                        onCloseAutoFocus={(event) => {
                            event.preventDefault();
                            const trigger = detailTrigger.current;
                            (trigger?.isConnected
                                ? trigger
                                : document.getElementById('create-plan-action')
                            )?.focus();
                        }}
                    >
                        <DialogHeader className="sr-only">
                            <DialogTitle>
                                {mode === 'new'
                                    ? 'Create a plan'
                                    : mode === 'edit'
                                      ? `Edit ${selected?.name ?? 'plan'}`
                                      : (selected?.name ?? 'Plan details')}
                            </DialogTitle>
                            <DialogDescription>
                                {mode === 'detail'
                                    ? 'Membership plan details.'
                                    : 'Membership plan information, terms and availability.'}
                            </DialogDescription>
                        </DialogHeader>
                        <section
                            aria-label={
                                mode === 'detail'
                                    ? 'Plan details'
                                    : 'Plan editor'
                            }
                            className="min-w-0"
                        >
                            {mode !== 'detail' ? (
                                <>
                                    <div className="border-b border-border px-5 py-5 pr-16 sm:px-6 sm:pr-18">
                                        <h2 className="display text-xl font-semibold">
                                            {mode === 'new'
                                                ? 'Create a plan'
                                                : `Edit ${selected?.name ?? 'plan'}`}
                                        </h2>
                                    </div>
                                    <SubmissionError
                                        message={submissionError}
                                    />
                                    <div className="p-5 sm:p-6">
                                        <PlanEditor
                                            mode={mode}
                                            form={form}
                                            onSubmit={submit}
                                            onCancel={cancelEditor}
                                        />
                                    </div>
                                </>
                            ) : selected ? (
                                <>
                                    <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4 pr-16 sm:px-6 sm:pr-18">
                                        <span className="mr-auto text-sm font-semibold">
                                            Plan details
                                        </span>
                                        <Badge
                                            variant="secondary"
                                            className={
                                                selected.enabled
                                                    ? 'bg-accent text-primary'
                                                    : 'text-muted-foreground'
                                            }
                                        >
                                            {selected.enabled
                                                ? 'Enabled'
                                                : 'Disabled'}
                                        </Badge>
                                        <Button
                                            id="edit-plan-action"
                                            variant="outline"
                                            className="h-11 sm:h-9"
                                            onClick={editPlan}
                                            disabled={busy}
                                        >
                                            <Pencil /> Edit plan
                                        </Button>
                                    </div>
                                    <div className="px-5 py-6 sm:px-6">
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                {selected.type === 'monthly'
                                                    ? 'Monthly membership'
                                                    : 'Class pack'}
                                            </p>
                                            <h2 className="display mt-2 text-2xl font-semibold sm:text-3xl">
                                                {selected.name}
                                            </h2>
                                        </div>
                                        <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                            {selected.description}
                                        </p>
                                        <dl className="mt-6 grid grid-cols-2 gap-5 border-y border-border py-5 sm:grid-cols-3">
                                            <div className="col-span-2 sm:col-span-1">
                                                <dt className="text-xs text-muted-foreground">
                                                    Price
                                                </dt>
                                                <dd className="mt-2 font-mono text-lg font-semibold tabular-nums">
                                                    {price(selected)}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-muted-foreground">
                                                    Class allowance
                                                </dt>
                                                <dd className="mt-2 font-semibold">
                                                    {selected.type === 'monthly'
                                                        ? 'Unlimited'
                                                        : `${selected.total_classes} visits`}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-muted-foreground">
                                                    Validity
                                                </dt>
                                                <dd className="mt-2 font-semibold">
                                                    {selected.valid_days} days
                                                </dd>
                                            </div>
                                        </dl>
                                        <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
                                            Disabling prevents new orders.
                                            Existing valid unpaid orders can
                                            still complete using their saved
                                            purchase details. Plan changes
                                            preserve purchased benefits and
                                            history. These rules take effect
                                            with the purchase flow.
                                        </p>
                                        {dialogMessage && (
                                            <p
                                                role="status"
                                                className="mt-4 flex items-center gap-2 border-l-2 border-primary bg-accent/50 p-3 text-sm text-primary"
                                            >
                                                <Check size={16} />
                                                {dialogMessage}
                                            </p>
                                        )}
                                    </div>
                                </>
                            ) : null}
                        </section>
                    </DialogContent>
                </Dialog>
            </div>
            {selected && (
                <Dialog
                    open={confirmDelete}
                    onOpenChange={(open) => {
                        if (!busy) {
                            setConfirmDelete(open);
                            deleteForm.clearErrors();
                            clearSubmissionError();
                        }
                    }}
                >
                    <DialogContent
                        className="membership-plans-console"
                        showCloseButton={false}
                        onCloseAutoFocus={(event) => {
                            event.preventDefault();
                            const trigger = deleteTrigger.current;
                            (trigger?.isConnected
                                ? trigger
                                : document.getElementById('create-plan-action')
                            )?.focus();
                        }}
                    >
                        <DialogHeader>
                            <DialogTitle className="display text-3xl">
                                Delete {selected.name}?
                            </DialogTitle>
                            <DialogDescription className="leading-6">
                                {selected.has_paid_orders
                                    ? 'Purchased plans cannot be deleted.'
                                    : 'This plan has not been purchased. It will be removed from the default list. Its record will be kept, and there is no restore action.'}
                            </DialogDescription>
                        </DialogHeader>
                        {deleteForm.errors.plan && (
                            <p
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {deleteForm.errors.plan}
                            </p>
                        )}
                        <SubmissionError message={submissionError} />
                        <DialogFooter>
                            <Button
                                variant="outline"
                                className="h-11"
                                disabled={busy}
                                onClick={() => {
                                    setConfirmDelete(false);
                                    deleteForm.clearErrors();
                                    clearSubmissionError();
                                }}
                            >
                                Keep plan
                            </Button>
                            <Button
                                variant="destructive"
                                className="h-11"
                                disabled={busy || selected.has_paid_orders}
                                onClick={deletePlan}
                            >
                                {deleteForm.processing && (
                                    <LoaderCircle className="animate-spin" />
                                )}
                                {deleteForm.processing
                                    ? 'Deleting...'
                                    : 'Delete plan'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </AdminLayout>
    );
}

function PlanEditor({
    mode,
    form,
    onSubmit,
    onCancel,
}: {
    mode: 'new' | 'edit';
    form: ReturnType<typeof useForm<PlanForm>>;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
}) {
    const fieldError = (key: keyof PlanForm) => form.errors[key];

    return (
        <>
            <form
                onSubmit={onSubmit}
                noValidate
                className="plan-form space-y-5"
                aria-busy={form.processing}
            >
                <fieldset disabled={form.processing} className="space-y-5">
                    <p className="border-b border-border pb-3 text-xs font-semibold">
                        Plan information
                    </p>
                    <FormField
                        id="name"
                        label="Plan name"
                        error={fieldError('name')}
                    >
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            placeholder="e.g. Monthly Unlimited"
                            aria-invalid={Boolean(fieldError('name'))}
                            aria-describedby={
                                fieldError('name') ? 'name-error' : undefined
                            }
                        />
                    </FormField>
                    <FormField
                        id="description"
                        label="Description"
                        error={fieldError('description')}
                    >
                        <Textarea
                            id="description"
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData('description', event.target.value)
                            }
                            placeholder="Describe the membership benefits."
                            aria-invalid={Boolean(fieldError('description'))}
                            aria-describedby={
                                fieldError('description')
                                    ? 'description-error'
                                    : undefined
                            }
                        />
                    </FormField>
                    <p className="border-b border-border pb-3 text-xs font-semibold">
                        Terms and availability
                    </p>
                    <div className="grid gap-5">
                        <FormField
                            id="price"
                            label="Price (USD)"
                            error={fieldError('price')}
                        >
                            <Input
                                id="price"
                                value={form.data.price}
                                onChange={(event) =>
                                    form.setData('price', event.target.value)
                                }
                                inputMode="decimal"
                                placeholder="0.00"
                                aria-invalid={Boolean(fieldError('price'))}
                                aria-describedby={
                                    fieldError('price')
                                        ? 'price-error'
                                        : undefined
                                }
                            />
                        </FormField>
                        <FormField
                            id="type"
                            label="Plan type"
                            error={fieldError('type')}
                        >
                            <NativeSelect
                                id="type"
                                value={form.data.type}
                                onChange={(event) =>
                                    form.setData(
                                        'type',
                                        event.target.value as PlanForm['type'],
                                    )
                                }
                                aria-invalid={Boolean(fieldError('type'))}
                                aria-describedby={
                                    fieldError('type')
                                        ? 'type-error'
                                        : undefined
                                }
                            >
                                <option value="monthly">Monthly</option>
                                <option value="class_pack">Class pack</option>
                            </NativeSelect>
                        </FormField>
                    </div>
                    <div className="grid gap-5">
                        <FormField
                            id="valid_days"
                            label="Valid days"
                            error={fieldError('valid_days')}
                        >
                            <Input
                                id="valid_days"
                                value={form.data.valid_days}
                                onChange={(event) =>
                                    form.setData(
                                        'valid_days',
                                        event.target.value,
                                    )
                                }
                                inputMode="numeric"
                                placeholder="30"
                                aria-invalid={Boolean(fieldError('valid_days'))}
                                aria-describedby={
                                    fieldError('valid_days')
                                        ? 'valid_days-error'
                                        : undefined
                                }
                            />
                        </FormField>
                        {form.data.type === 'monthly' ? (
                            <div className="plan-field">
                                <Label>Class allowance</Label>
                                <div className="flex h-9 items-center text-sm font-medium">
                                    Unlimited classes
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Monthly plans do not deduct visits.
                                </p>
                            </div>
                        ) : (
                            <FormField
                                id="total_classes"
                                label="Total classes"
                                error={fieldError('total_classes')}
                            >
                                <Input
                                    id="total_classes"
                                    value={form.data.total_classes}
                                    onChange={(event) =>
                                        form.setData(
                                            'total_classes',
                                            event.target.value,
                                        )
                                    }
                                    inputMode="numeric"
                                    placeholder="10"
                                    aria-invalid={Boolean(
                                        fieldError('total_classes'),
                                    )}
                                    aria-describedby={
                                        fieldError('total_classes')
                                            ? 'total_classes-error'
                                            : undefined
                                    }
                                />
                            </FormField>
                        )}
                    </div>
                    <FormField
                        id="enabled"
                        label="Availability"
                        error={fieldError('enabled')}
                    >
                        <NativeSelect
                            id="enabled"
                            value={form.data.enabled}
                            onChange={(event) =>
                                form.setData('enabled', event.target.value)
                            }
                            aria-invalid={Boolean(fieldError('enabled'))}
                            aria-describedby={
                                fieldError('enabled')
                                    ? 'enabled-error'
                                    : undefined
                            }
                        >
                            <option value="" disabled>
                                Choose availability
                            </option>
                            <option value="1">Enabled</option>
                            <option value="0">Disabled</option>
                        </NativeSelect>
                        <p className="text-xs text-muted-foreground">
                            Enabled plans can be offered for new purchases.
                        </p>
                    </FormField>
                </fieldset>
                <div className="flex justify-end gap-2 border-t border-border pt-5">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={form.processing}
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={form.processing}>
                        {form.processing && (
                            <LoaderCircle className="animate-spin" />
                        )}
                        {form.processing
                            ? 'Saving...'
                            : mode === 'new'
                              ? 'Create plan'
                              : 'Save changes'}
                    </Button>
                </div>
            </form>
        </>
    );
}

function FormField({
    id,
    label,
    error,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="plan-field grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            {children}
            {error && (
                <p id={`${id}-error`} className="text-xs text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}
