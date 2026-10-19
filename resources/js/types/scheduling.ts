import type { SharedData } from '@/types/auth';

export type CourseType = {
    id: number;
    name: string;
    description: string;
    default_duration_minutes: number;
    enabled: boolean;
    has_sessions: boolean;
};
export type ClassSession = {
    id: number;
    course_type_id: number;
    starts_at: string;
    ends_at: string;
    capacity: number;
    instructor_name: string;
    status: 'scheduled' | 'cancelled';
};
export type SchedulingProps = SharedData & {
    view: 'courses' | 'sessions';
    courseTypes: CourseType[];
    classSessions: ClassSession[];
    timezone: 'UTC';
};
