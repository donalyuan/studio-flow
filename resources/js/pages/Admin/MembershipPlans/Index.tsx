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
import { useMemo, useState } from 'react';
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
    const { plans, selectedPlanId, flash } = usePage<Props>().props;
    const initial = useMemo(
        () =>
            plans.find((plan) => plan.id === selectedPlanId) ??
            plans[0] ??
            null,
        [plans, selectedPlanId],
    );
    const [selectedId, setSelectedId] = useState<number | null>(
        initial?.id ?? null,
    );
    const [mode, setMode] = useState<'detail' | 'new' | 'edit'>('detail');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const form = useForm<PlanForm>(initial ? toForm(initial) : emptyForm);
    const statusForm = useForm<{ enabled: boolean }>({
        enabled: initial?.enabled ?? false,
    });
    const selected = plans.find((plan) => plan.id === selectedId) ?? null;
    const deleteForm = useForm<{ plan?: string }>({});
    const { submissionError, clearSubmissionError } = useSubmissionError(
        form.processing || statusForm.processing || deleteForm.processing,
    );
    const busy =
        form.processing || statusForm.processing || deleteForm.processing;

    function selectPlan(plan: MembershipPlan) {
        setSelectedId(plan.id);
        setMode('detail');
        clearSubmissionError();
        form.clearErrors();
        form.setDefaults(toForm(plan));
        form.setData(toForm(plan));
    }
    function createPlan() {
        setMode('new');
        clearSubmissionError();
        form.clearErrors();
        form.setDefaults(emptyForm);
        form.setData({ ...emptyForm });
    }
    function editPlan() {
        if (selected) {
            setMode('edit');
            clearSubmissionError();
            form.clearErrors();
            form.setData(toForm(selected));
        }
    }
    function onSuccess(page: { props: Record<string, unknown> }) {
        setSelectedId((page.props as Partial<Props>).selectedPlanId ?? null);
        setMode('detail');
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
    function toggleStatus() {
        if (!selected) {
            return;
        }

        clearSubmissionError();
        statusForm.clearErrors();
        statusForm.transform(() => ({ enabled: !selected.enabled }));
        statusForm.patch(`/admin/membership-plans/${selected.id}/status`, {
            preserveScroll: true,
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
            },
        });
    }
    const allowance = (plan: MembershipPlan) =>
        plan.type === 'monthly'
            ? 'Unlimited classes'
            : `${plan.total_classes} class visits`;
    const price = (plan: MembershipPlan) => `USD ${plan.price}`;

    return (
        <AdminLayout title="Membership plans">
            <Head title="Membership plans" />
            <SubmissionError message={submissionError} />
            {flash.status && (
                <p
                    role="status"
                    className="mb-5 flex items-center gap-2 border-l-2 border-primary bg-white p-3 text-sm text-primary"
                >
                    <Check size={16} />
                    {flash.status}
                </p>
            )}
            <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                    <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground">
                        STUDIOFLOW
                    </p>
                    <h1 className="display mt-3 text-4xl font-semibold sm:text-5xl">
                        Membership plans
                    </h1>
                    <p className="mt-3 text-sm text-muted-foreground">
                        Set the price, validity and class allowance for each
                        plan.
                    </p>
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
            <div className="mt-8 grid items-start gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,1fr)]">
                <section
                    aria-label="Membership plans"
                    className="min-w-0 overflow-hidden rounded-lg border border-border bg-white"
                >
                    <div className="flex items-center justify-between gap-3 p-5">
                        <h2 className="display text-2xl font-semibold">
                            Your plans
                        </h2>
                        <span className="text-xs text-muted-foreground">
                            {plans.length} plans
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
                                                    Action
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
                                                <TableCell className="pl-5">
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
                                                    <Button
                                                        variant="outline"
                                                        className="h-10"
                                                        disabled={busy}
                                                        onClick={() =>
                                                            selectPlan(plan)
                                                        }
                                                        aria-label={`View ${plan.name}`}
                                                    >
                                                        View
                                                    </Button>
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
                                        <div className="mt-4 flex items-center justify-between gap-3">
                                            <strong className="text-sm tabular-nums">
                                                {price(plan)}
                                            </strong>
                                            <Button
                                                variant="outline"
                                                className="h-11"
                                                disabled={busy}
                                                onClick={() => selectPlan(plan)}
                                                aria-label={`View ${plan.name}`}
                                            >
                                                View
                                            </Button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                            <p className="border-t border-border p-4 text-xs text-muted-foreground">
                                Disabled plans remain in your catalog.
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
                <section
                    aria-label="Plan details and form"
                    className="min-w-0 rounded-lg border border-border bg-white p-5 sm:p-6"
                >
                    {mode !== 'detail' ? (
                        <PlanEditor
                            mode={mode}
                            form={form}
                            onSubmit={submit}
                            onCancel={() => setMode('detail')}
                        />
                    ) : selected ? (
                        <>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground">
                                        PLAN DETAILS
                                    </p>
                                    <h2 className="display mt-2 text-3xl font-semibold">
                                        {selected.name}
                                    </h2>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className={
                                        selected.enabled
                                            ? 'bg-accent text-primary'
                                            : 'text-muted-foreground'
                                    }
                                >
                                    {selected.enabled ? 'Enabled' : 'Disabled'}
                                </Badge>
                            </div>
                            <div className="mt-6 grid gap-2 border-l-4 border-primary bg-accent p-5">
                                <span className="text-xs font-semibold tracking-[0.08em] text-muted-foreground">
                                    CLASS ALLOWANCE
                                </span>
                                <strong className="display text-3xl font-semibold">
                                    {allowance(selected)}
                                </strong>
                                <span className="text-sm text-muted-foreground">
                                    {price(selected)} · valid for{' '}
                                    {selected.valid_days} days
                                </span>
                            </div>
                            <p className="mt-5 text-sm leading-6 text-muted-foreground">
                                {selected.description}
                            </p>
                            <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-border py-5 text-sm">
                                <div>
                                    <dt className="text-xs text-muted-foreground">
                                        Plan type
                                    </dt>
                                    <dd className="mt-2 font-semibold">
                                        {selected.type === 'monthly'
                                            ? 'Monthly'
                                            : 'Class pack'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-muted-foreground">
                                        Valid for
                                    </dt>
                                    <dd className="mt-2 font-semibold">
                                        {selected.valid_days} days
                                    </dd>
                                </div>
                            </dl>
                            <div className="mt-6 flex flex-wrap gap-2">
                                <Button onClick={editPlan} disabled={busy}>
                                    <Pencil /> Edit plan
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={toggleStatus}
                                    disabled={busy}
                                >
                                    {statusForm.processing ? (
                                        <LoaderCircle className="animate-spin" />
                                    ) : (
                                        <Power />
                                    )}
                                    {statusForm.processing
                                        ? 'Saving...'
                                        : selected.enabled
                                          ? 'Disable plan'
                                          : 'Enable plan'}
                                </Button>
                                <Button
                                    id="delete-plan-action"
                                    variant="outline"
                                    className="border-destructive/40 text-destructive"
                                    disabled={busy || selected.has_paid_orders}
                                    onClick={() => {
                                        deleteForm.clearErrors();
                                        clearSubmissionError();
                                        setConfirmDelete(true);
                                    }}
                                >
                                    <Trash2 /> Delete plan
                                </Button>
                            </div>
                            <p className="mt-3 text-xs leading-5 text-muted-foreground">
                                {selected.has_paid_orders
                                    ? 'Purchased plans cannot be deleted.'
                                    : 'Deleted plans are hidden from the default list. There is no restore action.'}
                            </p>
                            <p className="mt-6 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">
                                Disabling prevents new orders. Existing valid
                                unpaid orders can still complete using their
                                saved purchase details. Plan changes preserve
                                purchased benefits and history. These rules take
                                effect with the purchase flow.
                            </p>
                        </>
                    ) : (
                        <div className="grid justify-items-center gap-4 py-12 text-center text-sm text-muted-foreground">
                            <CreditCard size={28} />
                            <h3 className="font-semibold text-foreground">
                                Select a plan
                            </h3>
                            <p>
                                View an existing plan or create your first one.
                            </p>
                        </div>
                    )}
                </section>
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
                        showCloseButton={false}
                        onCloseAutoFocus={(event) => {
                            event.preventDefault();
                            const focusTarget =
                                document.querySelector<HTMLButtonElement>(
                                    '#delete-plan-action:not(:disabled)',
                                ) ??
                                document.getElementById('create-plan-action');
                            focusTarget?.focus();
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
            <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground">
                {mode === 'new' ? 'NEW PLAN' : 'EDIT PLAN'}
            </p>
            <h2 className="display mt-2 text-3xl font-semibold">
                {mode === 'new' ? 'Create a plan' : 'Edit plan'}
            </h2>
            <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
                <fieldset disabled={form.processing} className="space-y-5">
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
                    <div className="grid gap-5 sm:grid-cols-2">
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
                    <div className="grid gap-5 sm:grid-cols-2">
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
                            <div>
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
        <div className="grid gap-2">
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
