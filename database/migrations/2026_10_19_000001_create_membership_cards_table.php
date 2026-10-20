<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_cards', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('membership_plan_id')->constrained()->restrictOnDelete();
            $table->json('plan_snapshot');
            $table->dateTime('starts_at');
            $table->dateTime('expires_at');
            $table->unsignedInteger('total_classes')->nullable();
            $table->unsignedInteger('remaining_classes')->nullable();
            $table->boolean('is_demo')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_cards');
    }
};
