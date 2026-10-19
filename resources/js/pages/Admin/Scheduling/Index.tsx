import { Head, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CalendarDays,
    Check,
    CirclePlus,
    LoaderCircle,
    Power,
    Trash2,
    X,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useRef, useState } from 'react';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useSubmissionError } from '@/hooks/useSubmissionError';
import AdminLayout from '@/layouts/AdminLayout';
import type { SchedulingProps } from '@/types/scheduling';
import '../../../../css/scheduling.css';

type Course = {
    id: number;
    name: string;
    description: string;
    duration: number;
    enabled: boolean;
    has_sessions: boolean;
};
type Session = {
    id: number;
    courseId: number;
    start: string;
    end: string;
    capacity: number;
    coach: string;
    cancelled: boolean;
};
type View = 'courses' | 'sessions';
type Modal = {
    kind: View;
    mode: 'new' | 'detail' | 'edit';
    id?: number;
} | null;
type Form = {
    name: string;
    description: string;
    duration: string;
    enabled: string;
    courseId: string;
    start: string;
    end: string;
    capacity: string;
    coach: string;
};
type Errors = Partial<Record<keyof Form, string>>;

const blankForm: Form = {
    name: '',
    description: '',
    duration: '',
    enabled: '',
    courseId: '',
    start: '',
    end: '',
    capacity: '',
    coach: '',
};
const asDate = (value: string) =>
    new Date(
        `${value.replace(/^(\d{5,6})-/, (_, year: string) => `+${year.padStart(6, '0')}-`)}:00Z`,
    );
const positiveInteger = (value: string) =>
    /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 4294967295;
const endFor = (start: string, duration: number): string | null => {
    const end = new Date(asDate(start).getTime() + duration * 60000);

    return Number.isFinite(end.getTime()) &&
        end.getUTCFullYear() >= 1000 &&
        end.getUTCFullYear() <= 9999
        ? end
              .toISOString()
              .replace(/^\+0*(\d{4,6})-/, '$1-')
              .replace(/:\d{2}\.\d{3}Z$/, '')
        : null;
};
const dateLabel = (value: string) =>
    asDate(value).toLocaleDateString('en-GB', {
        timeZone: 'UTC',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
const timeLabel = (value: string) =>
    asDate(value).toLocaleTimeString('en-GB', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
    });
const sessionState = (session: Session) =>
    session.cancelled
        ? 'Cancelled'
        : asDate(session.end) <= new Date()
          ? 'Ended'
          : asDate(session.start) <= new Date()
            ? 'Started'
            : 'Scheduled';

function Field({
    name,
    label,
    error,
    hint,
    children,
}: {
    name: keyof Form;
    label: string;
    error?: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <div className="schedule-field">
            <Label htmlFor={name}>{label}</Label>
            {children}
            {hint && <p id={`${name}-hint`}>{hint}</p>}
            {error && (
                <p id={`${name}-error`} className="field-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

export default function SchedulingIndex({
    view,
    courseTypes,
    classSessions,
}: SchedulingProps) {
    const { flash } = usePage<SchedulingProps>().props;
    const courses: Course[] = courseTypes.map((course) => ({
        ...course,
        duration: course.default_duration_minutes,
    }));
    const sessions: Session[] = classSessions.map((session) => ({
        id: session.id,
        courseId: session.course_type_id,
        start: session.starts_at,
        end: session.ends_at,
        capacity: session.capacity,
        coach: session.instructor_name,
        cancelled: session.status === 'cancelled',
    }));
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState<Modal>(null);
    const [deleting, setDeleting] = useState<Course | null>(null);
    const [form, setForm] = useState<Form>({ ...blankForm });
    const [errors, setErrors] = useState<Errors>({});
    const [busy, setBusy] = useState(false);
    const message = flash.status;
    const [actionError, setRequestError] = useState('');
    const { submissionError, clearSubmissionError } = useSubmissionError(busy);
    const requestError = actionError || submissionError;
    const submitting = useRef(false);
    useEffect(() => {
        const start = router.on('start', (event) => {
            if (event.detail.visit.method === 'get') {
                setLoading(true);
            }
        });
        const finish = router.on('finish', () => setLoading(false));

        return () => {
            start();
            finish();
        };
    }, []);
    const trigger = useRef<HTMLElement | null>(null);
    const createTrigger = useRef<HTMLButtonElement>(null);
    const display = loading ? 'loading' : 'normal';
    const visibleCourses = courses;
    const visibleSessions = sessions;
    const selectedCourse = courses.find((course) => course.id === modal?.id);
    const selectedSession = sessions.find(
        (session) => session.id === modal?.id,
    );
    const courseFor = (id: number) =>
        courses.find((course) => course.id === id);
    const hasSessions = (course: Course) => course.has_sessions;
    const update = (key: keyof Form, value: string) =>
        setForm((previous) => ({ ...previous, [key]: value }));
    const fieldProps = (key: keyof Form) => ({
        id: key,
        'aria-invalid': !!errors[key],
        'aria-describedby': errors[key] ? `${key}-error` : undefined,
    });

    function navigate(target: View) {
        if (busy) {
            return;
        }

        router.get(
            target === 'courses'
                ? '/admin/course-types'
                : '/admin/class-sessions',
        );
    }
    function open(kind: View, mode: 'new' | 'detail' | 'edit', id?: number) {
        trigger.current = document.activeElement as HTMLElement;
        setErrors({});
        setRequestError('');
        clearSubmissionError();
        const course = courses.find((item) => item.id === id);
        const session = sessions.find((item) => item.id === id);
        setForm(
            kind === 'courses' && course
                ? {
                      ...blankForm,
                      name: course.name,
                      description: course.description,
                      duration: String(course.duration),
                      enabled: course.enabled ? '1' : '0',
                  }
                : kind === 'sessions' && session
                  ? {
                        ...blankForm,
                        courseId: String(session.courseId),
                        start: session.start,
                        end: session.end,
                        capacity: String(session.capacity),
                        coach: session.coach,
                    }
                  : { ...blankForm },
        );
        setModal({ kind, mode, id });
    }
    function restoreFocus(event: Event) {
        event.preventDefault();
        const target = trigger.current?.isConnected
            ? trigger.current
            : createTrigger.current;
        target?.focus();
    }
    function startEditing() {
        if (!modal) {
            return;
        }

        const originalTrigger = trigger.current;
        open(modal.kind, 'edit', modal.id);
        trigger.current = originalTrigger;
        window.requestAnimationFrame(() =>
            document
                .getElementById(modal.kind === 'courses' ? 'name' : 'courseId')
                ?.focus(),
        );
    }
    function send(
        method: 'post' | 'patch' | 'delete',
        url: string,
        data: Record<string, string | number | boolean>,
        onSuccess: () => void,
    ) {
        if (submitting.current) {
            return;
        }

        submitting.current = true;
        setBusy(true);
        setRequestError('');
        clearSubmissionError();
        const keys: Record<string, keyof Form> = {
            default_duration_minutes: 'duration',
            course_type_id: 'courseId',
            starts_at: 'start',
            ends_at: 'end',
            instructor_name: 'coach',
            name: 'name',
            description: 'description',
            enabled: 'enabled',
            capacity: 'capacity',
        };
        router.visit(url, {
            method,
            data,
            preserveScroll: true,
            preserveState: true,
            onSuccess,
            onError: (serverErrors) => {
                const fields: Errors = {};

                for (const [key, value] of Object.entries(serverErrors)) {
                    if (keys[key]) {
                        fields[keys[key]] = value;
                    } else {
                        setRequestError(value);
                    }
                }

                setErrors(fields);
                requestAnimationFrame(() =>
                    document.getElementById(Object.keys(fields)[0])?.focus(),
                );
            },
            onFinish: () => {
                submitting.current = false;
                setBusy(false);
            },
        });
    }
    function chooseCourse(id: string) {
        const course = courseFor(Number(id));
        const end =
            form.start && course
                ? endFor(form.start, course.duration)
                : form.end;
        setForm((previous) => ({ ...previous, courseId: id, end: end ?? '' }));

        if (end === null) {
            setErrors((previous) => ({
                ...previous,
                end: 'Choose dates within the supported date range.',
            }));
        }
    }
    function chooseStart(start: string) {
        const course = courseFor(Number(form.courseId));
        const parsed = asDate(start);
        const end =
            course && Number.isFinite(parsed.getTime())
                ? endFor(start, course.duration)
                : form.end;
        setForm((previous) => ({ ...previous, start, end: end ?? '' }));

        if (end === null) {
            setErrors((previous) => ({
                ...previous,
                end: 'Choose dates within the supported date range.',
            }));
        }
    }
    function submit(event: FormEvent) {
        event.preventDefault();

        if (!modal || busy) {
            return;
        }

        const next: Errors = {};

        if (modal.kind === 'courses') {
            if (!form.name.trim()) {
                next.name = 'Enter a course name.';
            }

            if (!form.description.trim()) {
                next.description = 'Enter a course description.';
            }

            if (!positiveInteger(form.duration)) {
                next.duration =
                    Number(form.duration) > 4294967295
                        ? 'The duration cannot exceed 4,294,967,295 minutes.'
                        : 'Enter a positive whole number of minutes.';
            }

            if (form.enabled === '') {
                next.enabled = 'Choose availability for new sessions.';
            }
        } else {
            const course = courseFor(Number(form.courseId));

            if (
                !course ||
                (!course.enabled &&
                    Number(form.courseId) !== selectedSession?.courseId)
            ) {
                next.courseId = 'Choose an available course type.';
            }

            if (!form.start || !Number.isFinite(asDate(form.start).getTime())) {
                next.start = 'Enter a valid start date and time.';
            } else if (asDate(form.start) <= new Date()) {
                next.start = 'The session must start in the future.';
            }

            if (!form.end || !Number.isFinite(asDate(form.end).getTime())) {
                next.end = 'Enter a valid end date and time.';
            } else if (form.start && asDate(form.end) <= asDate(form.start)) {
                next.end = 'The end time must be after the start time.';
            }

            if (!positiveInteger(form.capacity)) {
                next.capacity =
                    Number(form.capacity) > 4294967295
                        ? 'The capacity cannot exceed 4,294,967,295 places.'
                        : 'Enter a positive whole number of places.';
            }

            if (!form.coach.trim()) {
                next.coach = 'Enter the instructor’s name.';
            }
        }

        setErrors(next);
        setRequestError('');

        if (Object.keys(next).length) {
            window.requestAnimationFrame(() =>
                document.getElementById(Object.keys(next)[0])?.focus(),
            );

            return;
        }

        const data: Record<string, string | number | boolean> =
            modal.kind === 'courses'
                ? {
                      name: form.name,
                      description: form.description,
                      default_duration_minutes: form.duration,
                      enabled: form.enabled === '1',
                  }
                : {
                      course_type_id: form.courseId,
                      starts_at: form.start,
                      ends_at: form.end,
                      capacity: form.capacity,
                      instructor_name: form.coach,
                  };
        const path =
            modal.kind === 'courses'
                ? '/admin/course-types'
                : '/admin/class-sessions';
        send(
            modal.mode === 'new' ? 'post' : 'patch',
            modal.mode === 'new' ? path : `${path}/${modal.id}`,
            data,
            () => setModal(null),
        );
    }
    function toggle(course: Course) {
        send(
            'patch',
            `/admin/course-types/${course.id}/status`,
            { enabled: !course.enabled },
            () => {},
        );
    }
    function deleteCourse() {
        if (!deleting || hasSessions(deleting) || busy) {
            return;
        }

        send('delete', `/admin/course-types/${deleting.id}`, {}, () => {
            trigger.current = createTrigger.current;
            setDeleting(null);
        });
    }
    const courseActions = (course: Course) => (
        <div className="schedule-actions">
            <Button
                variant="outline"
                onClick={() => open('courses', 'detail', course.id)}
                disabled={busy}
                aria-label={`View ${course.name}`}
            >
                View
            </Button>
            <Button
                variant="outline"
                disabled={busy}
                onClick={() => toggle(course)}
                aria-label={`${course.enabled ? 'Disable' : 'Enable'} ${course.name}`}
            >
                <Power />
                {course.enabled ? 'Disable' : 'Enable'}
            </Button>
            <Button
                variant="outline"
                disabled={busy || hasSessions(course)}
                title={
                    hasSessions(course)
                        ? 'Course types used by sessions cannot be deleted.'
                        : `Delete ${course.name}`
                }
                aria-label={`Delete ${course.name}`}
                onClick={() => {
                    trigger.current = document.activeElement as HTMLElement;
                    setRequestError('');
                    clearSubmissionError();
                    setDeleting(course);
                }}
            >
                <Trash2 />
                Delete
            </Button>
        </div>
    );
    const timeRange = (session: Session) => (
        <div className="schedule-time">
            <strong>{dateLabel(session.start)}</strong>
            <span>
                {timeLabel(session.start)}–
                {session.start.split('T')[0] !== session.end.split('T')[0] &&
                    `${dateLabel(session.end)} `}
                {timeLabel(session.end)} UTC
            </span>
        </div>
    );
    const stateBadge = (session: Session) => (
        <Badge
            variant="secondary"
            className={
                sessionState(session) === 'Scheduled'
                    ? 'bg-accent text-primary'
                    : 'text-muted-foreground'
            }
        >
            {sessionState(session)}
        </Badge>
    );
    const feedback = (error: boolean, text: string) => (
        <p
            className={`schedule-feedback ${error ? 'error' : ''}`}
            role={error ? 'alert' : 'status'}
        >
            {error ? <X /> : <Check />}
            {text}
        </p>
    );

    return (
        <AdminLayout
            title={view === 'courses' ? 'Course types' : 'Class sessions'}
        >
            <Head
                title={view === 'courses' ? 'Course types' : 'Class sessions'}
            />
            {message && feedback(false, message)}
            {requestError &&
                !modal &&
                !deleting &&
                feedback(true, requestError)}
            <div className="schedule-heading">
                <div>
                    <h1>
                        {view === 'courses' ? 'Course types' : 'Class sessions'}
                    </h1>
                    <p>
                        {view === 'courses'
                            ? 'Define the classes offered at your studio.'
                            : 'Manage your studio schedule. All times are shown in UTC.'}
                    </p>
                </div>
                <Button
                    ref={createTrigger}
                    disabled={
                        busy ||
                        display === 'loading' ||
                        (view === 'sessions' &&
                            !courses.some((course) => course.enabled))
                    }
                    onClick={() => open(view, 'new')}
                >
                    <CirclePlus />
                    {view === 'courses'
                        ? 'Create course type'
                        : 'Create session'}
                </Button>
            </div>
            <div className="schedule-view-links" aria-label="Scheduling views">
                <Button
                    variant={view === 'courses' ? 'secondary' : 'outline'}
                    aria-current={view === 'courses' ? 'page' : undefined}
                    onClick={() => navigate('courses')}
                >
                    <BookOpen />
                    Course types
                </Button>
                <Button
                    variant={view === 'sessions' ? 'secondary' : 'outline'}
                    aria-current={view === 'sessions' ? 'page' : undefined}
                    onClick={() => navigate('sessions')}
                >
                    <CalendarDays />
                    Class sessions
                </Button>
            </div>
            <section
                className="schedule-catalog"
                aria-label={
                    view === 'courses'
                        ? 'Course type catalog'
                        : 'Class session schedule'
                }
                aria-busy={display === 'loading'}
            >
                <div className="schedule-catalog-heading">
                    <h2>
                        {view === 'courses'
                            ? 'Course catalog'
                            : 'Studio schedule'}
                    </h2>
                    <span>
                        {display === 'loading'
                            ? 'Loading…'
                            : `${view === 'courses' ? visibleCourses.length : visibleSessions.length} ${view === 'courses' ? 'course types' : 'sessions'}`}
                    </span>
                </div>
                {display === 'loading' ? (
                    <div role="status" className="py-4">
                        <span className="sr-only">
                            Loading{' '}
                            {view === 'courses'
                                ? 'course types'
                                : 'class sessions'}
                            .
                        </span>
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="schedule-skeleton" />
                        ))}
                    </div>
                ) : (view === 'courses'
                      ? visibleCourses.length
                      : visibleSessions.length) === 0 ? (
                    <div className="schedule-empty">
                        {view === 'courses' ? (
                            <BookOpen className="size-7 text-primary" />
                        ) : (
                            <CalendarDays className="size-7 text-primary" />
                        )}
                        <h3>
                            {view === 'courses'
                                ? 'No course types yet'
                                : 'No class sessions yet'}
                        </h3>
                        <p>
                            {view === 'courses'
                                ? 'Create a course type before adding it to the studio schedule.'
                                : courses.some((course) => course.enabled)
                                  ? 'Create a future session to start building the studio schedule.'
                                  : 'Create and enable a course type before scheduling a session.'}
                        </p>
                        <Button
                            disabled={busy}
                            onClick={() =>
                                view === 'sessions' &&
                                !courses.some((course) => course.enabled)
                                    ? navigate('courses')
                                    : open(view, 'new')
                            }
                        >
                            {view === 'courses' ||
                            !courses.some((course) => course.enabled)
                                ? 'Create course type'
                                : 'Create session'}
                        </Button>
                    </div>
                ) : view === 'courses' ? (
                    <>
                        <div className="schedule-desktop">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Course type</TableHead>
                                        <TableHead>Default duration</TableHead>
                                        <TableHead>Availability</TableHead>
                                        <TableHead>
                                            <span className="sr-only">
                                                Actions
                                            </span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleCourses.map((course) => (
                                        <TableRow key={course.id}>
                                            <TableCell>
                                                <strong className="font-semibold">
                                                    {course.name}
                                                </strong>
                                                <small>
                                                    {course.description}
                                                </small>
                                                {hasSessions(course) && (
                                                    <small>
                                                        Used by class sessions ·
                                                        cannot delete
                                                    </small>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {course.duration} minutes
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {course.enabled
                                                        ? 'Enabled'
                                                        : 'Disabled'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {courseActions(course)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="schedule-mobile">
                            {visibleCourses.map((course) => (
                                <article
                                    className="schedule-card"
                                    key={course.id}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <h3>{course.name}</h3>
                                        <Badge variant="secondary">
                                            {course.enabled
                                                ? 'Enabled'
                                                : 'Disabled'}
                                        </Badge>
                                    </div>
                                    <p>{course.description}</p>
                                    <p>
                                        {course.duration} minutes
                                        {hasSessions(course) &&
                                            ' · Used by sessions; cannot delete'}
                                    </p>
                                    {courseActions(course)}
                                </article>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="schedule-desktop">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            Date &amp; time · UTC
                                        </TableHead>
                                        <TableHead>
                                            Course type / instructor
                                        </TableHead>
                                        <TableHead>Capacity</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>
                                            <span className="sr-only">
                                                Actions
                                            </span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleSessions.map((session) => (
                                        <TableRow key={session.id}>
                                            <TableCell>
                                                {timeRange(session)}
                                            </TableCell>
                                            <TableCell>
                                                <strong className="font-semibold">
                                                    {
                                                        courseFor(
                                                            session.courseId,
                                                        )?.name
                                                    }
                                                </strong>
                                                <small>{session.coach}</small>
                                            </TableCell>
                                            <TableCell>
                                                {session.capacity} places
                                            </TableCell>
                                            <TableCell>
                                                {stateBadge(session)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="schedule-actions">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() =>
                                                            open(
                                                                'sessions',
                                                                'detail',
                                                                session.id,
                                                            )
                                                        }
                                                        aria-label={`View ${courseFor(session.courseId)?.name} on ${dateLabel(session.start)}`}
                                                    >
                                                        View
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="schedule-mobile">
                            {visibleSessions.map((session) => (
                                <article
                                    className="schedule-card"
                                    key={session.id}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <h3>
                                            {courseFor(session.courseId)?.name}
                                        </h3>
                                        {stateBadge(session)}
                                    </div>
                                    <div className="mt-4">
                                        {timeRange(session)}
                                    </div>
                                    <dl>
                                        <div>
                                            <dt>Instructor</dt>
                                            <dd>{session.coach}</dd>
                                        </div>
                                        <div>
                                            <dt>Capacity</dt>
                                            <dd>{session.capacity} places</dd>
                                        </div>
                                    </dl>
                                    <div className="schedule-actions">
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                open(
                                                    'sessions',
                                                    'detail',
                                                    session.id,
                                                )
                                            }
                                        >
                                            View session
                                        </Button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </section>
            <p className="schedule-preview-note">
                {view === 'courses'
                    ? 'Disabling a course type prevents new scheduling and keeps existing sessions.'
                    : 'Session status follows the scheduled times. Cancelled sessions remain visible.'}
            </p>
            <Dialog
                open={!!modal}
                onOpenChange={(value) => {
                    if (!value && !busy) {
                        setModal(null);
                        setRequestError('');
                    }
                }}
            >
                <DialogContent
                    className="schedule-modal"
                    showCloseButton={!busy}
                    onEscapeKeyDown={(event) => {
                        if (busy) {
                            event.preventDefault();
                        }
                    }}
                    onInteractOutside={(event) => {
                        if (busy) {
                            event.preventDefault();
                        }
                    }}
                    onCloseAutoFocus={restoreFocus}
                >
                    <DialogHeader>
                        <DialogTitle>
                            {modal?.mode === 'detail'
                                ? modal.kind === 'courses'
                                    ? selectedCourse?.name
                                    : courseFor(selectedSession?.courseId ?? 0)
                                          ?.name
                                : `${modal?.mode === 'new' ? 'Create' : 'Edit'} ${modal?.kind === 'courses' ? 'course type' : 'class session'}`}
                        </DialogTitle>
                        <DialogDescription>
                            {modal?.kind === 'courses'
                                ? modal.mode === 'detail'
                                    ? 'Course information and availability for new sessions.'
                                    : 'Set the class description and default session duration.'
                                : modal?.mode === 'detail'
                                  ? 'Class session information. All times are shown in UTC.'
                                  : 'Schedule a future class. All dates and times are entered in UTC.'}
                        </DialogDescription>
                    </DialogHeader>
                    {modal?.mode === 'detail' ? (
                        <>
                            <div className="schedule-modal-body">
                                {modal.kind === 'courses' && selectedCourse ? (
                                    <>
                                        <p className="schedule-description">
                                            {selectedCourse.description}
                                        </p>
                                        <dl className="schedule-details">
                                            <div>
                                                <dt>Default duration</dt>
                                                <dd>
                                                    {selectedCourse.duration}{' '}
                                                    minutes
                                                </dd>
                                            </div>
                                            <div>
                                                <dt>New scheduling</dt>
                                                <dd>
                                                    {selectedCourse.enabled
                                                        ? 'Enabled'
                                                        : 'Disabled'}
                                                </dd>
                                            </div>
                                        </dl>
                                    </>
                                ) : (
                                    selectedSession && (
                                        <>
                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                                {timeRange(selectedSession)}
                                                {stateBadge(selectedSession)}
                                            </div>
                                            <dl className="schedule-details">
                                                <div>
                                                    <dt>Instructor</dt>
                                                    <dd>
                                                        {selectedSession.coach}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt>Capacity</dt>
                                                    <dd>
                                                        {
                                                            selectedSession.capacity
                                                        }{' '}
                                                        places
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt>Course type</dt>
                                                    <dd>
                                                        {
                                                            courseFor(
                                                                selectedSession.courseId,
                                                            )?.name
                                                        }
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt>Timezone</dt>
                                                    <dd>UTC</dd>
                                                </div>
                                            </dl>
                                        </>
                                    )
                                )}
                            </div>
                            <div className="schedule-modal-footer">
                                <Button
                                    variant="outline"
                                    onClick={() => setModal(null)}
                                >
                                    Close
                                </Button>
                                {(modal.kind === 'courses' ||
                                    (selectedSession &&
                                        sessionState(selectedSession) ===
                                            'Scheduled')) && (
                                    <Button
                                        id="edit-scheduling-action"
                                        onClick={startEditing}
                                    >
                                        Edit{' '}
                                        {modal.kind === 'courses'
                                            ? 'course type'
                                            : 'session'}
                                    </Button>
                                )}
                            </div>
                        </>
                    ) : (
                        <form noValidate onSubmit={submit}>
                            <div className="schedule-modal-body">
                                {requestError && feedback(true, requestError)}
                                <fieldset
                                    disabled={busy}
                                    className="schedule-fields"
                                >
                                    {modal?.kind === 'courses' ? (
                                        <>
                                            <Field
                                                name="name"
                                                label="Course name"
                                                error={errors.name}
                                            >
                                                <Input
                                                    {...fieldProps('name')}
                                                    value={form.name}
                                                    onChange={(event) =>
                                                        update(
                                                            'name',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </Field>
                                            <Field
                                                name="description"
                                                label="Description"
                                                error={errors.description}
                                            >
                                                <Textarea
                                                    {...fieldProps(
                                                        'description',
                                                    )}
                                                    value={form.description}
                                                    onChange={(event) =>
                                                        update(
                                                            'description',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </Field>
                                            <div className="schedule-form-row">
                                                <Field
                                                    name="duration"
                                                    label="Default duration (minutes)"
                                                    error={errors.duration}
                                                    hint="Used to prefill the session end time. You can adjust it when scheduling."
                                                >
                                                    <Input
                                                        {...fieldProps(
                                                            'duration',
                                                        )}
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={form.duration}
                                                        onChange={(event) =>
                                                            update(
                                                                'duration',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </Field>
                                                <Field
                                                    name="enabled"
                                                    label="Availability for new sessions"
                                                    error={errors.enabled}
                                                >
                                                    <NativeSelect
                                                        {...fieldProps(
                                                            'enabled',
                                                        )}
                                                        value={form.enabled}
                                                        onChange={(event) =>
                                                            update(
                                                                'enabled',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Choose availability
                                                        </option>
                                                        <option value="1">
                                                            Enabled
                                                        </option>
                                                        <option value="0">
                                                            Disabled
                                                        </option>
                                                    </NativeSelect>
                                                </Field>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Field
                                                name="courseId"
                                                label="Course type"
                                                error={errors.courseId}
                                            >
                                                <NativeSelect
                                                    {...fieldProps('courseId')}
                                                    value={form.courseId}
                                                    onChange={(event) =>
                                                        chooseCourse(
                                                            event.target.value,
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Choose a course type
                                                    </option>
                                                    {courses
                                                        .filter(
                                                            (course) =>
                                                                course.enabled ||
                                                                course.id ===
                                                                    selectedSession?.courseId,
                                                        )
                                                        .map((course) => (
                                                            <option
                                                                key={course.id}
                                                                value={
                                                                    course.id
                                                                }
                                                            >
                                                                {course.name} ·{' '}
                                                                {
                                                                    course.duration
                                                                }{' '}
                                                                min
                                                                {!course.enabled &&
                                                                    ' · Disabled'}
                                                            </option>
                                                        ))}
                                                </NativeSelect>
                                            </Field>
                                            <div className="schedule-form-row">
                                                <Field
                                                    name="start"
                                                    label="Starts at · UTC"
                                                    error={errors.start}
                                                >
                                                    <Input
                                                        {...fieldProps('start')}
                                                        type="datetime-local"
                                                        value={form.start}
                                                        onChange={(event) =>
                                                            chooseStart(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </Field>
                                                <Field
                                                    name="end"
                                                    label="Ends at · UTC"
                                                    error={errors.end}
                                                    hint="Must be after the start time."
                                                >
                                                    <Input
                                                        {...fieldProps('end')}
                                                        type="datetime-local"
                                                        value={form.end}
                                                        onChange={(event) =>
                                                            update(
                                                                'end',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </Field>
                                            </div>
                                            <div className="schedule-form-row">
                                                <Field
                                                    name="capacity"
                                                    label="Capacity"
                                                    error={errors.capacity}
                                                    hint="Number of available places for the class."
                                                >
                                                    <Input
                                                        {...fieldProps(
                                                            'capacity',
                                                        )}
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={form.capacity}
                                                        onChange={(event) =>
                                                            update(
                                                                'capacity',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </Field>
                                                <Field
                                                    name="coach"
                                                    label="Instructor name"
                                                    error={errors.coach}
                                                >
                                                    <Input
                                                        {...fieldProps('coach')}
                                                        value={form.coach}
                                                        onChange={(event) =>
                                                            update(
                                                                'coach',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </Field>
                                            </div>
                                        </>
                                    )}
                                </fieldset>
                            </div>
                            <div className="schedule-modal-footer">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={busy}
                                    onClick={() => {
                                        setErrors({});
                                        setRequestError('');

                                        if (modal?.mode === 'edit') {
                                            setModal({
                                                ...modal,
                                                mode: 'detail',
                                            });
                                            window.requestAnimationFrame(() =>
                                                document
                                                    .getElementById(
                                                        'edit-scheduling-action',
                                                    )
                                                    ?.focus(),
                                            );
                                        } else {
                                            setModal(null);
                                        }
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={busy}>
                                    {busy && (
                                        <LoaderCircle className="animate-spin" />
                                    )}
                                    {busy
                                        ? 'Saving…'
                                        : modal?.mode === 'new'
                                          ? `Create ${modal.kind === 'courses' ? 'course type' : 'session'}`
                                          : 'Save changes'}
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
            <Dialog
                open={!!deleting}
                onOpenChange={(value) => {
                    if (!value && !busy) {
                        setDeleting(null);
                        setRequestError('');
                    }
                }}
            >
                <DialogContent
                    className="schedule-modal sm:max-w-lg"
                    showCloseButton={!busy}
                    onCloseAutoFocus={restoreFocus}
                    onEscapeKeyDown={(event) => {
                        if (busy) {
                            event.preventDefault();
                        }
                    }}
                    onInteractOutside={(event) => {
                        if (busy) {
                            event.preventDefault();
                        }
                    }}
                >
                    <DialogHeader>
                        <DialogTitle>Delete course type?</DialogTitle>
                        <DialogDescription>
                            Delete “{deleting?.name}”? Only course types that
                            have never been used by a class session can be
                            deleted.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="schedule-modal-body">
                        {requestError && feedback(true, requestError)}
                        <p className="schedule-description">
                            This course type will no longer be available for
                            scheduling.
                        </p>
                    </div>
                    <div className="schedule-modal-footer">
                        <Button
                            variant="outline"
                            disabled={busy}
                            onClick={() => setDeleting(null)}
                        >
                            Keep course type
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={busy}
                            onClick={deleteCourse}
                        >
                            {busy && <LoaderCircle className="animate-spin" />}
                            {busy ? 'Deleting…' : 'Delete course type'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
