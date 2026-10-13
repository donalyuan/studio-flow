<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->string('type', 20);
            $table->unsignedInteger('valid_days');
            $table->unsignedInteger('total_classes')->nullable();
            $table->boolean('enabled');
            $table->timestamps();

            $table->index(['enabled', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_plans');
    }
};
