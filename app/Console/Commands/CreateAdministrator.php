<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Rules\PasswordByteLength;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class CreateAdministrator extends Command
{
    protected $signature = 'studioflow:create-admin';

    protected $description = 'Create a separate administrator account during initialization';

    public function handle(): int
    {
        $name = $this->ask('Full name');
        $email = Str::lower((string) $this->ask('Email address'));
        $password = $this->secret('Password');
        $confirmation = $this->secret('Confirm password');
        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'password_confirmation' => $confirmation,
        ], [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email:rfc', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'string', Password::min(8), new PasswordByteLength, 'confirmed'],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $user = new User([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
        ]);
        $user->role = 'admin';
        $user->save();

        $this->info('Administrator account created. Log in at /login.');

        return self::SUCCESS;
    }
}
