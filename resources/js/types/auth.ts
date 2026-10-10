export interface SharedData {
    [key: string]: unknown;
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: 'member' | 'admin';
        } | null;
    };
    flash: { status: string | null };
}
