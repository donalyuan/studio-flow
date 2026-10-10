export interface SharedData {
    [key: string]: unknown;
    auth: { user: { id: number; name: string; email: string } | null };
    flash: { status: string | null };
}
