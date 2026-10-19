<?php

namespace App\Services;

use App\Enums\ClassSessionStatus;
use App\Models\ClassSession;
use App\Models\CourseType;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SchedulingService
{
    public function courseTypesForIndex(): Collection
    {
        return CourseType::query()
            ->withExists('classSessions as has_sessions')
            ->orderBy('name')
            ->orderBy('id')
            ->get()
            ->map(fn (CourseType $courseType): array => [
                'id' => $courseType->id,
                'name' => $courseType->name,
                'description' => $courseType->description,
                'default_duration_minutes' => $courseType->default_duration_minutes,
                'enabled' => $courseType->enabled,
                'has_sessions' => (bool) $courseType->has_sessions,
            ]);
    }

    public function classSessionsForIndex(): Collection
    {
        return ClassSession::query()
            ->orderBy('starts_at')
            ->orderBy('id')
            ->get()
            ->map(fn (ClassSession $classSession): array => [
                'id' => $classSession->id,
                'course_type_id' => $classSession->course_type_id,
                'starts_at' => $classSession->starts_at->setTimezone('UTC')->format('Y-m-d\TH:i'),
                'ends_at' => $classSession->ends_at->setTimezone('UTC')->format('Y-m-d\TH:i'),
                'capacity' => $classSession->capacity,
                'instructor_name' => $classSession->instructor_name,
                'status' => $classSession->status->value,
            ]);
    }

    /** @param array<string, mixed> $data */
    public function createCourseType(array $data): CourseType
    {
        return DB::transaction(fn (): CourseType => CourseType::create($data));
    }

    /** @param array<string, mixed> $data */
    public function updateCourseType(CourseType $courseType, array $data): CourseType
    {
        return DB::transaction(function () use ($courseType, $data): CourseType {
            $lockedCourseType = CourseType::query()->lockForUpdate()->findOrFail($courseType->id);
            $lockedCourseType->update($data);

            return $lockedCourseType;
        });
    }

    public function setCourseTypeEnabled(CourseType $courseType, bool $enabled): CourseType
    {
        return $this->updateCourseType($courseType, ['enabled' => $enabled]);
    }

    public function deleteCourseType(CourseType $courseType): void
    {
        DB::transaction(function () use ($courseType): void {
            $lockedCourseType = CourseType::query()->lockForUpdate()->findOrFail($courseType->id);

            if ($lockedCourseType->classSessions()->exists()) {
                throw ValidationException::withMessages([
                    'course_type' => 'Course types used by class sessions cannot be deleted. Disable the course type instead.',
                ]);
            }

            $lockedCourseType->delete();
        });
    }

    /** @param array<string, mixed> $data */
    public function createClassSession(array $data): ClassSession
    {
        return DB::transaction(function () use ($data): ClassSession {
            $courseType = CourseType::query()->lockForUpdate()->find($data['course_type_id']);
            $this->assertCourseTypeAvailable($courseType);
            $payload = $this->sessionPayload($data);
            $this->assertFutureStart($payload['starts_at']);

            return ClassSession::create([
                ...$payload,
                'status' => ClassSessionStatus::Scheduled,
            ]);
        });
    }

    /** @param array<string, mixed> $data */
    public function updateClassSession(ClassSession $classSession, array $data): ClassSession
    {
        return DB::transaction(function () use ($classSession, $data): ClassSession {
            $lockedSession = ClassSession::query()->lockForUpdate()->findOrFail($classSession->id);
            $courseTypes = CourseType::query()
                ->whereIn('id', [$lockedSession->course_type_id, $data['course_type_id']])
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            if ($lockedSession->status !== ClassSessionStatus::Scheduled || $lockedSession->starts_at->lessThanOrEqualTo(CarbonImmutable::now('UTC'))) {
                throw ValidationException::withMessages([
                    'class_session' => 'Only scheduled class sessions that have not started can be edited.',
                ]);
            }

            $courseType = $courseTypes->get((int) $data['course_type_id']);
            $this->assertCourseTypeAvailable($courseType, (int) $data['course_type_id'] === $lockedSession->course_type_id);
            $payload = $this->sessionPayload($data);
            $this->assertFutureStart($payload['starts_at']);
            $lockedSession->update($payload);

            return $lockedSession;
        });
    }

    private function assertCourseTypeAvailable(?CourseType $courseType, bool $keepingCurrentType = false): void
    {
        if ($courseType === null) {
            throw ValidationException::withMessages([
                'course_type_id' => 'The selected course type is invalid.',
            ]);
        }

        if (! $courseType->enabled && ! $keepingCurrentType) {
            throw ValidationException::withMessages([
                'course_type_id' => 'Select an enabled course type for new scheduling.',
            ]);
        }
    }

    /** @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    private function sessionPayload(array $data): array
    {
        return [
            'course_type_id' => (int) $data['course_type_id'],
            'starts_at' => CarbonImmutable::createFromFormat('!Y-m-d\TH:i', $data['starts_at'], 'UTC'),
            'ends_at' => CarbonImmutable::createFromFormat('!Y-m-d\TH:i', $data['ends_at'], 'UTC'),
            'capacity' => (int) $data['capacity'],
            'instructor_name' => $data['instructor_name'],
        ];
    }

    private function assertFutureStart(CarbonImmutable $startsAt): void
    {
        if ($startsAt->lessThanOrEqualTo(CarbonImmutable::now('UTC'))) {
            throw ValidationException::withMessages([
                'starts_at' => 'The start time must be in the future.',
            ]);
        }
    }
}
