<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class PasswordByteLength implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Bcrypt only includes the first 72 bytes in the password hash.
        if (is_string($value) && strlen($value) > 72) {
            $fail('The password must not exceed 72 bytes.');
        }

        if (is_string($value) && str_contains($value, "\0")) {
            $fail('The password must not contain null characters.');
        }
    }
}
