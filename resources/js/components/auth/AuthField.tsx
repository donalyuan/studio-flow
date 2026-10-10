import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = ComponentProps<typeof Input> & {
    id: string;
    label: string;
    error?: string;
    hint?: string;
};

export default function AuthField({
    id,
    label,
    error,
    hint,
    type = 'text',
    ...props
}: Props) {
    const [visible, setVisible] = useState(false);
    const secret = type === 'password';
    const description = error ? `${id}-error` : hint ? `${id}-help` : undefined;

    return (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-sm font-medium">
                {label}
            </Label>
            <div className="relative">
                <Input
                    {...props}
                    id={id}
                    type={secret && visible ? 'text' : type}
                    aria-invalid={!!error}
                    aria-describedby={description}
                    className={`auth-input ${secret ? 'pr-12' : ''}`}
                />
                {secret && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={props.disabled}
                        className="absolute top-0.5 right-0.5 h-11 w-11 text-muted-foreground"
                        onClick={() => setVisible((value) => !value)}
                        aria-label={
                            visible
                                ? `Hide ${label.toLowerCase()}`
                                : `Show ${label.toLowerCase()}`
                        }
                        title={
                            visible
                                ? `Hide ${label.toLowerCase()}`
                                : `Show ${label.toLowerCase()}`
                        }
                    >
                        {visible ? <EyeOff /> : <Eye />}
                    </Button>
                )}
            </div>
            {error ? (
                <p
                    id={`${id}-error`}
                    role="alert"
                    className="text-sm text-destructive"
                >
                    {error}
                </p>
            ) : (
                hint && (
                    <p
                        id={`${id}-help`}
                        className="text-xs text-muted-foreground"
                    >
                        {hint}
                    </p>
                )
            )}
        </div>
    );
}
