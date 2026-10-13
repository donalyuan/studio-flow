<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MembershipPlanRequest extends FormRequest
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
            'price' => ['required', 'string', 'regex:/\A\d{1,8}(?:\.\d{1,2})?\z/'],
            'type' => ['required', Rule::in(['monthly', 'class_pack'])],
            'valid_days' => ['required', 'integer', 'min:1', 'max:4294967295'],
            'total_classes' => [
                Rule::requiredIf($this->input('type') === 'class_pack'),
                Rule::prohibitedIf($this->input('type') === 'monthly'),
                'nullable',
                'integer',
                'min:1',
                'max:4294967295',
            ],
            'enabled' => ['required', 'boolean'],
        ];
    }
}
