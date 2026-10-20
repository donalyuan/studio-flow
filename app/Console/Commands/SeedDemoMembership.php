<?php

namespace App\Console\Commands;

use App\Models\MembershipCard;
use App\Models\MembershipPlan;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SeedDemoMembership extends Command
{
    protected $signature = 'studioflow:seed-demo-membership {email : Existing member account email} {type=monthly : monthly or class_pack}';

    protected $description = 'Create a local demo membership card for an existing member account';

    public function handle(): int
    {
        if (! app()->environment(['local', 'testing'])) {
            $this->error('Demo membership cards can only be created in local or testing environments.');

            return self::FAILURE;
        }

        $type = (string) $this->argument('type');
        if (! in_array($type, ['monthly', 'class_pack'], true)) {
            $this->error('Type must be monthly or class_pack.');

            return self::FAILURE;
        }

        $email = Str::lower((string) $this->argument('email'));

        try {
            $card = DB::transaction(function () use ($email, $type): MembershipCard {
                $user = User::query()->where('email', $email)->lockForUpdate()->first();

                if (! $user || $user->role !== 'member') {
                    throw ValidationException::withMessages([
                        'email' => 'An existing member account with this email is required.',
                    ]);
                }

                $hasActiveCard = MembershipCard::query()
                    ->where('user_id', $user->id)
                    ->where('expires_at', '>', now())
                    ->exists();

                if ($hasActiveCard) {
                    throw ValidationException::withMessages([
                        'membership' => 'This member already has an unexpired membership card.',
                    ]);
                }

                $plan = MembershipPlan::query()
                    ->where('enabled', true)
                    ->where('type', $type)
                    ->orderBy('id')
                    ->first();

                if (! $plan) {
                    throw ValidationException::withMessages([
                        'plan' => "No enabled {$type} membership plan is available.",
                    ]);
                }

                $startsAt = now();
                $snapshot = [
                    'name' => $plan->name,
                    'description' => $plan->description,
                    'price' => $plan->price,
                    'type' => $plan->type,
                    'valid_days' => $plan->valid_days,
                    'total_classes' => $plan->total_classes,
                ];

                return MembershipCard::create([
                    'user_id' => $user->id,
                    'membership_plan_id' => $plan->id,
                    'plan_snapshot' => $snapshot,
                    'starts_at' => $startsAt,
                    'expires_at' => $startsAt->copy()->addDays($plan->valid_days),
                    'total_classes' => $plan->total_classes,
                    'remaining_classes' => $plan->total_classes,
                    'is_demo' => true,
                ]);
            });
        } catch (ValidationException $exception) {
            $this->error(collect($exception->errors())->flatten()->first());

            return self::FAILURE;
        }

        $this->info("Demo {$type} membership card created for {$email} (card {$card->id}).");

        return self::SUCCESS;
    }
}
