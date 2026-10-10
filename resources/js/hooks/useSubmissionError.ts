import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export function useSubmissionError(processing: boolean) {
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    useEffect(() => {
        if (!processing) {
            return;
        }

        const removeInvalid = router.on('invalid', (event) => {
            if (event.detail.response.status >= 500) {
                console.error(
                    'Authentication request failed with HTTP status',
                    event.detail.response.status,
                );
                event.preventDefault();
                setSubmissionError(
                    "We couldn't complete your request. Please try again.",
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
