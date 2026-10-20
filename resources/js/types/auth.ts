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

export interface MembershipPlan {
    id: number;
    name: string;
    description: string;
    price: string;
    type: 'monthly' | 'class_pack';
    valid_days: number;
    total_classes: number | null;
    enabled: boolean;
    has_paid_orders: boolean;
}

export interface PublicMembershipPlan {
    id: number;
    name: string;
    description: string;
    price: string;
    type: 'monthly' | 'class_pack';
    valid_days: number;
    total_classes: number | null;
}

export interface MemberCenterCard {
    name: string;
    type: 'monthly' | 'class_pack';
    startsAt: string;
    expiresAt: string;
    totalClasses: number | null;
    remainingClasses: number | null;
}
