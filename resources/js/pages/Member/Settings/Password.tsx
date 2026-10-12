import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import AuthField from '@/components/auth/AuthField';
import AuthStatus from '@/components/auth/AuthStatus';
import SubmissionError from '@/components/auth/SubmissionError';
import { Button } from '@/components/ui/button';
import { useSubmissionError } from '@/hooks/useSubmissionError';
import AccountSettingsLayout from '@/layouts/AccountSettingsLayout';

export default function Password() {
    const form = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [showStatus, setShowStatus] = useState(true);
    const { submissionError, clearSubmissionError } = useSubmissionError(
        form.processing,
    );

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setShowStatus(false);
        clearSubmissionError();
        form.put('/settings/password', {
            onSuccess: () => {
                form.setDefaults({
                    current_password: '',
                    password: '',
                    password_confirmation: '',
                });
                setShowStatus(true);
            },
            onFinish: () => form.reset(),
        });
    }

    return (
        <AccountSettingsLayout active="password">
            <Head title="Update password" />
            <h2 className="display text-3xl font-semibold">Update password</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Enter your current password to set a new one.
            </p>
            {showStatus && <AuthStatus />}
            <SubmissionError message={submissionError} />
            <form onSubmit={submit} noValidate className="mt-7 space-y-5">
                <AuthField
                    id="current_password"
                    name="current_password"
                    label="Current password"
                    type="password"
                    autoComplete="current-password"
                    maxLength={255}
                    value={form.data.current_password}
                    error={form.errors.current_password}
                    disabled={form.processing}
                    onChange={(event) =>
                        form.setData('current_password', event.target.value)
                    }
                />
                <AuthField
                    id="password"
                    name="password"
                    label="New password"
                    type="password"
                    autoComplete="new-password"
                    maxLength={255}
                    hint="Use at least 8 characters."
                    value={form.data.password}
                    error={form.errors.password}
                    disabled={form.processing}
                    onChange={(event) =>
                        form.setData('password', event.target.value)
                    }
                />
                <AuthField
                    id="password_confirmation"
                    name="password_confirmation"
                    label="Confirm password"
                    type="password"
                    autoComplete="new-password"
                    maxLength={255}
                    value={form.data.password_confirmation}
                    error={form.errors.password_confirmation}
                    disabled={form.processing}
                    onChange={(event) =>
                        form.setData(
                            'password_confirmation',
                            event.target.value,
                        )
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
                    {form.processing
                        ? 'Updating password...'
                        : 'Update password'}
                </Button>
            </form>
        </AccountSettingsLayout>
    );
}
