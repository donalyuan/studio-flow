<?php

namespace App\Http\Requests;

use App\Rules\PasswordByteLength;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class PasswordResetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => Str::lower($this->input('email'))]);
        }
    }

    public function rules(): array
    {
        return [
            'token' => ['required', 'string'],
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
            'password' => ['required', 'string', Password::min(8), new PasswordByteLength],
            'password_confirmation' => ['required', 'string', 'same:password'],
        ];
    }
}
