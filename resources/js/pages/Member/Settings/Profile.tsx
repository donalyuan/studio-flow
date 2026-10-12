import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import AuthField from '@/components/auth/AuthField';
import AuthStatus from '@/components/auth/AuthStatus';
import SubmissionError from '@/components/auth/SubmissionError';
import { Button } from '@/components/ui/button';
import { useSubmissionError } from '@/hooks/useSubmissionError';
import AccountSettingsLayout from '@/layouts/AccountSettingsLayout';
import type { SharedData } from '@/types/auth';

export default function Profile() {
    const { auth } = usePage<SharedData>().props;
    const form = useForm({
        name: auth.user?.name ?? '',
        email: auth.user?.email ?? '',
    });
    const [showStatus, setShowStatus] = useState(true);
    const { submissionError, clearSubmissionError } = useSubmissionError(
        form.processing,
    );

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setShowStatus(false);
        clearSubmissionError();
        form.patch('/settings/profile', {
            onSuccess: (page) => {
                const user = (page.props.auth as SharedData['auth']).user;

                if (user) {
                    const details = { name: user.name, email: user.email };
                    form.setData(details);
                    form.setDefaults(details);
                }

                setShowStatus(true);
            },
        });
    }

    return (
        <AccountSettingsLayout active="profile">
            <Head title="Personal information" />
            <h2 className="display text-3xl font-semibold">
                Personal information
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Update your name and the email you use to log in.
            </p>
            {showStatus && <AuthStatus />}
            <SubmissionError message={submissionError} />
            <form onSubmit={submit} noValidate className="mt-7 space-y-5">
                <AuthField
                    id="name"
                    name="name"
                    label="Full name"
                    autoComplete="name"
                    maxLength={255}
                    value={form.data.name}
                    error={form.errors.name}
                    disabled={form.processing}
                    onChange={(event) =>
                        form.setData('name', event.target.value)
                    }
                />
                <AuthField
                    id="email"
                    name="email"
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    maxLength={255}
                    value={form.data.email}
                    error={form.errors.email}
                    disabled={form.processing}
                    onChange={(event) =>
                        form.setData('email', event.target.value)
                    }
                />
                <Button
                    type="submit"
                    disabled={form.processing}
                    className="h-12 w-full sm:w-auto sm:min-w-40"
                >
                    {form.processing && (
                        <LoaderCircle className="animate-spin" />
                    )}
                    {form.processing ? 'Saving...' : 'Save changes'}
                </Button>
            </form>
        </AccountSettingsLayout>
    );
}
