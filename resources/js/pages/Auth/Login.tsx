import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import type { FormEvent } from 'react';
import AuthField from '@/components/auth/AuthField';
import AuthStatus from '@/components/auth/AuthStatus';
import SubmissionError from '@/components/auth/SubmissionError';
import { Button } from '@/components/ui/button';
import { useSubmissionError } from '@/hooks/useSubmissionError';
import StudioLayout from '@/layouts/StudioLayout';

export default function Login() {
    const form = useForm({ email: '', password: '' });
    const { submissionError, clearSubmissionError } = useSubmissionError(
        form.processing,
    );

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        clearSubmissionError();
        form.post('/login', { onFinish: () => form.reset('password') });
    }

    return (
        <StudioLayout>
            <Head title="Log in" />
            <h1 className="display text-[32px] leading-tight font-semibold">
                Welcome back
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Log in to your member account.
            </p>
            <AuthStatus />
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
                <AuthField
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    maxLength={255}
                    value={form.data.password}
                    error={form.errors.password}
                    disabled={form.processing}
                    onChange={(event) =>
                        form.setData('password', event.target.value)
                    }
                />
                <Button
                    type="submit"
                    disabled={form.processing}
                    className="h-12 w-full text-sm"
                >
                    {form.processing ? (
                        <LoaderCircle className="animate-spin" />
                    ) : (
                        <ArrowRight />
                    )}
                    {form.processing ? 'Logging in...' : 'Log in'}
                </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
                New to StudioFlow?{' '}
                <Link
                    href="/register"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                    Create an account
                </Link>
            </p>
        </StudioLayout>
    );
}
