<?php

namespace App\Http\Requests;

use App\Rules\PasswordByteLength;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class PasswordUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['bail', 'required', 'string', new PasswordByteLength, 'current_password'],
            'password' => ['required', 'string', Password::min(8), new PasswordByteLength],
            'password_confirmation' => ['required', 'string', 'same:password'],
        ];
    }
}
