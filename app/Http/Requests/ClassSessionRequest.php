<?php

namespace App\Http\Requests;

use Carbon\CarbonImmutable;
use Closure;
use DateTimeImmutable;
use DateTimeZone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ClassSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        $utcMinute = function (string $attribute, mixed $value, Closure $fail): void {
            if (! preg_match('/\A[1-9][0-9]{3}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}\z/', $value)) {
                $fail('Enter a valid UTC date and time in YYYY-MM-DDTHH:mm format (years 1000–9999).');

                return;
            }

            $date = DateTimeImmutable::createFromFormat('!Y-m-d\TH:i', $value, new DateTimeZone('UTC'));
            $errors = DateTimeImmutable::getLastErrors();

            if ($date === false || ($errors !== false && ($errors['warning_count'] > 0 || $errors['error_count'] > 0)) || $date->format('Y-m-d\TH:i') !== $value) {
                $fail('Enter a valid UTC date and time.');
            }
        };

        return [
            'course_type_id' => ['required', 'integer', 'exists:course_types,id'],
            'starts_at' => ['bail', 'required', 'string', $utcMinute],
            'ends_at' => ['bail', 'required', 'string', $utcMinute],
            'capacity' => ['required', 'integer', 'min:1', 'max:4294967295'],
            'instructor_name' => ['required', 'string', 'max:255'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->has('starts_at') || $validator->errors()->has('ends_at')) {
                return;
            }

            $startsAt = CarbonImmutable::createFromFormat('!Y-m-d\TH:i', $this->input('starts_at'), 'UTC');
            $endsAt = CarbonImmutable::createFromFormat('!Y-m-d\TH:i', $this->input('ends_at'), 'UTC');

            if ($startsAt->lessThanOrEqualTo(CarbonImmutable::now('UTC'))) {
                $validator->errors()->add('starts_at', 'The start time must be in the future.');
            }

            if ($endsAt->lessThanOrEqualTo($startsAt)) {
                $validator->errors()->add('ends_at', 'The end time must be after the start time.');
            }
        }];
    }
}
