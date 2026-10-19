<?php

use App\Enums\ClassSessionStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_type_id')->constrained()->restrictOnDelete();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->unsignedInteger('capacity');
            $table->string('instructor_name');
            $table->string('status', 20)->default(ClassSessionStatus::Scheduled->value);
            $table->timestamps();

            $table->index(['starts_at', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_sessions');
    }
};
