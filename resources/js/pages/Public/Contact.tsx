import { Head, useForm, usePage } from '@inertiajs/react';
import { Check, LoaderCircle, Mail, MapPin } from 'lucide-react';
import type { FormEvent } from 'react';
import SubmissionError from '@/components/auth/SubmissionError';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSubmissionError } from '@/hooks/useSubmissionError';
import StudioLayout from '@/layouts/StudioLayout';
import type { SharedData } from '@/types/auth';

export default function Contact() {
    const { flash } = usePage<SharedData>().props;
    const form = useForm({ name: '', email: '', message: '' });
    const { submissionError, clearSubmissionError } = useSubmissionError(
        form.processing,
    );

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        clearSubmissionError();
        form.post('/contact', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
            },
        });
    }

    return (
        <StudioLayout variant="plain">
            <Head title="Contact" />
            <div className="public-page-workspace contact-workspace">
                <div className="public-page-heading">
                    <div>
                        <p className="eyebrow">Contact</p>
                        <h1 className="display">
                            Let&apos;s talk about your training.
                        </h1>
                    </div>
                    <p>
                        Ask about memberships, the studio, or finding the right
                        place to start.
                    </p>
                </div>
                <div className="contact-grid">
                    <aside className="contact-aside">
                        <p className="eyebrow">Studio details</p>
                        <div className="mt-7 space-y-6 text-sm leading-6">
                            <p className="flex gap-3">
                                <MapPin className="mt-1 size-4 shrink-0 text-primary" />
                                <span>
                                    StudioFlow Training Studio
                                    <br />
                                    14 Meridian Street
                                    <br />
                                    Open daily, 06:00–21:00
                                </span>
                            </p>
                            <p className="flex gap-3">
                                <Mail className="mt-1 size-4 shrink-0 text-primary" />
                                <span>hello@studioflow.example</span>
                            </p>
                        </div>
                    </aside>
                    <section
                        className="contact-form-panel"
                        aria-labelledby="contact-form-title"
                    >
                        <h2
                            id="contact-form-title"
                            className="text-xl font-semibold"
                        >
                            Send a message
                        </h2>
                        {flash.status && (
                            <p
                                role="status"
                                className="mt-5 flex items-center gap-2 border-l-2 border-primary bg-accent p-3 text-sm text-primary"
                            >
                                <Check className="size-4 shrink-0" />
                                {flash.status}
                            </p>
                        )}
                        <SubmissionError message={submissionError} />
                        <form
                            onSubmit={submit}
                            noValidate
                            className="mt-7 space-y-5"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="contact-name">Name</Label>
                                <Input
                                    id="contact-name"
                                    name="name"
                                    autoComplete="name"
                                    maxLength={255}
                                    value={form.data.name}
                                    aria-invalid={Boolean(form.errors.name)}
                                    disabled={form.processing}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                />
                                {form.errors.name && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact-email">
                                    Email address
                                </Label>
                                <Input
                                    id="contact-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    maxLength={255}
                                    value={form.data.email}
                                    aria-invalid={Boolean(form.errors.email)}
                                    disabled={form.processing}
                                    onChange={(event) =>
                                        form.setData(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                />
                                {form.errors.email && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.email}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact-message">Message</Label>
                                <Textarea
                                    id="contact-message"
                                    name="message"
                                    rows={6}
                                    maxLength={5000}
                                    value={form.data.message}
                                    aria-invalid={Boolean(form.errors.message)}
                                    disabled={form.processing}
                                    onChange={(event) =>
                                        form.setData(
                                            'message',
                                            event.target.value,
                                        )
                                    }
                                />
                                {form.errors.message && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.message}
                                    </p>
                                )}
                            </div>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="h-12 w-full sm:w-auto"
                            >
                                {form.processing && (
                                    <LoaderCircle className="animate-spin" />
                                )}
                                {form.processing
                                    ? 'Sending message...'
                                    : 'Send message'}
                            </Button>
                        </form>
                    </section>
                </div>
            </div>
        </StudioLayout>
    );
}
