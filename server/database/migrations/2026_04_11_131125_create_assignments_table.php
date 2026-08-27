<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('course_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            // assignment_type: homework | exam | project | reading | lab | presentation
            $table->string('assignment_type')->default('homework');
            // status: pending | in_progress | completed | overdue
            $table->string('status')->default('pending');
            // priority: low | medium | high | critical
            $table->string('priority')->default('medium');
            $table->date('due_date')->nullable();
            $table->time('due_time')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->boolean('is_public_progress_visible')->default(false);
            $table->string('attachment')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};
