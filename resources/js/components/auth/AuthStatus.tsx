import { usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import type { SharedData } from '@/types/auth';

export default function AuthStatus() {
    const { flash } = usePage<SharedData>().props;

    return flash.status ? (
        <p
            role="status"
            className="mt-5 flex items-center gap-2 border-l-2 border-primary bg-white p-3 text-sm text-primary"
        >
            <Check size={16} className="shrink-0" />
            {flash.status}
        </p>
    ) : null;
}
