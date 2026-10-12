import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export function useSubmissionError(processing: boolean) {
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    useEffect(() => {
        if (!processing) {
            return;
        }

        const removeInvalid = router.on('invalid', (event) => {
            const status = event.detail.response.status;

            if (status >= 500 || status === 419 || status === 429) {
                console.error(
                    'Authentication request failed with HTTP status',
                    status,
                );
                event.preventDefault();
                setSubmissionError(
                    status === 419
                        ? 'Your session has expired. Refresh the page and try again.'
                        : status === 429
                          ? 'Too many attempts. Please wait before trying again.'
                          : "We couldn't complete your request. Please try again.",
                );
            }
        });
        const removeException = router.on('exception', (event) => {
            if (event.detail.exception.name !== 'AxiosError') {
                return;
            }

            console.error(
                'Authentication request failed:',
                event.detail.exception.message,
            );
            event.preventDefault();
            setSubmissionError(
                'Could not connect. Check your connection and try again.',
            );
        });

        return () => {
            removeInvalid();
            removeException();
        };
    }, [processing]);

    return {
        submissionError,
        clearSubmissionError: () => setSubmissionError(null),
    };
}
