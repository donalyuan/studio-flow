<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CourseTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:2000'],
            'default_duration_minutes' => ['required', 'integer', 'min:1', 'max:4294967295'],
            'enabled' => ['required', 'boolean'],
        ];
    }
}
