import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import type { FormEvent } from 'react';
import AuthField from '@/components/auth/AuthField';
import SubmissionError from '@/components/auth/SubmissionError';
import { Button } from '@/components/ui/button';
import { useSubmissionError } from '@/hooks/useSubmissionError';
import StudioLayout from '@/layouts/StudioLayout';

export default function ResetPassword({
    token,
    email,
    resetLinkInvalid,
}: {
    token: string;
    email: string;
    resetLinkInvalid: boolean;
}) {
    const form = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });
    const { submissionError, clearSubmissionError } = useSubmissionError(
        form.processing,
    );
    const invalid = resetLinkInvalid || !!form.errors.token;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        clearSubmissionError();
        form.post('/reset-password', {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    }

    return (
        <StudioLayout register>
            <Head title="Reset password" />
            <h1 className="display text-[32px] leading-tight font-semibold">
                Reset your password
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Choose a new password for your StudioFlow account.
            </p>
            <SubmissionError message={submissionError} />
            {invalid ? (
                <div className="mt-6">
                    <p
                        role="alert"
                        className="border-l-2 border-destructive bg-white p-3 text-sm leading-6 text-destructive"
                    >
                        This password reset link is invalid or has expired.
                        Request a new link to continue.
                    </p>
                    <Button asChild className="mt-6 h-12 w-full">
                        <Link href="/forgot-password">
                            Request a new reset link
                        </Link>
                    </Button>
                </div>
            ) : (
                <form onSubmit={submit} noValidate className="mt-7 space-y-5">
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
                        className="h-12 w-full"
                    >
                        {form.processing ? (
                            <LoaderCircle className="animate-spin" />
                        ) : (
                            <ArrowRight />
                        )}
                        {form.processing
                            ? 'Resetting password...'
                            : 'Reset password'}
                    </Button>
                </form>
            )}
            <div className="mt-6 text-center text-sm font-semibold text-primary">
                <Link
                    href="/login"
                    className="underline-offset-4 hover:underline"
                >
                    Back to log in
                </Link>
            </div>
        </StudioLayout>
    );
}
