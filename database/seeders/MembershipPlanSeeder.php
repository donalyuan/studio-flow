<?php

namespace Database\Seeders;

use App\Models\MembershipPlan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MembershipPlanSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            if (MembershipPlan::withTrashed()->exists()) {
                return;
            }

            MembershipPlan::create([
                'name' => 'Monthly Unlimited',
                'description' => 'Train as often as you like while your membership is active.',
                'price' => '89.00',
                'type' => 'monthly',
                'valid_days' => 30,
                'total_classes' => null,
                'enabled' => true,
            ]);

            MembershipPlan::create([
                'name' => '10-Class Pack',
                'description' => 'Ten class visits, with time to find your rhythm.',
                'price' => '149.00',
                'type' => 'class_pack',
                'valid_days' => 90,
                'total_classes' => 10,
                'enabled' => true,
            ]);
        });
    }
}
