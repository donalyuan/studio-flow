<?php

namespace App\Http\Requests;

use App\Rules\PasswordByteLength;
use Illuminate\Support\Str;
use Laravel\Fortify\Http\Requests\LoginRequest as FortifyLoginRequest;

class LoginRequest extends FortifyLoginRequest
{
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => Str::lower($this->input('email'))]);
        }
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
            'password' => ['required', 'string', new PasswordByteLength],
        ];
    }
}
