import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import type { FormEvent } from 'react';
import AuthField from '@/components/auth/AuthField';
import SubmissionError from '@/components/auth/SubmissionError';
import { Button } from '@/components/ui/button';
import { useSubmissionError } from '@/hooks/useSubmissionError';
import StudioLayout from '@/layouts/StudioLayout';

export default function Register() {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const { submissionError, clearSubmissionError } = useSubmissionError(
        form.processing,
    );

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        clearSubmissionError();
        form.post('/register', {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    }

    return (
        <StudioLayout register>
            <Head title="Register" />
            <h1 className="display text-[32px] leading-tight font-semibold">
                Join StudioFlow
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Create your member account.
            </p>
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
                <AuthField
                    id="password"
                    name="password"
                    label="Password"
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
                    className="h-12 w-full text-sm"
                >
                    {form.processing ? (
                        <LoaderCircle className="animate-spin" />
                    ) : (
                        <ArrowRight />
                    )}
                    {form.processing ? 'Creating account...' : 'Create account'}
                </Button>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
                Already a member?{' '}
                <Link
                    href="/login"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                    Log in
                </Link>
            </p>
        </StudioLayout>
    );
}
