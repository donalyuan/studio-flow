export default function SubmissionError({
    message,
}: {
    message: string | null;
}) {
    return message ? (
        <p
            role="alert"
            className="mt-5 border-l-2 border-destructive bg-white p-3 text-sm text-destructive"
        >
            {message}
        </p>
    ) : null;
}
