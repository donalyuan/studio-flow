import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import AuthField from '@/components/auth/AuthField';
import AuthStatus from '@/components/auth/AuthStatus';
import SubmissionError from '@/components/auth/SubmissionError';
import { Button } from '@/components/ui/button';
import { useSubmissionError } from '@/hooks/useSubmissionError';
import StudioLayout from '@/layouts/StudioLayout';

export default function ForgotPassword() {
    const form = useForm({ email: '' });
    const [showStatus, setShowStatus] = useState(true);
    const { submissionError, clearSubmissionError } = useSubmissionError(
        form.processing,
    );

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setShowStatus(false);
        clearSubmissionError();
        form.post('/forgot-password', { onSuccess: () => setShowStatus(true) });
    }

    return (
        <StudioLayout register>
            <Head title="Forgot password" />
            <h1 className="display text-[32px] leading-tight font-semibold">
                Forgot password?
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Enter your email address and we&apos;ll send you a password
                reset link.
            </p>
            {showStatus && <AuthStatus />}
            <SubmissionError message={submissionError} />
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
                        ? 'Sending reset link...'
                        : 'Send reset link'}
                </Button>
            </form>
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
