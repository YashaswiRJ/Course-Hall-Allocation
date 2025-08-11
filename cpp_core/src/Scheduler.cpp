#include "Scheduler.h"
#include <algorithm> // For std::sort

// Main scheduling algorithm implementation.
std::vector<Assignment> Scheduler::run_greedy_scheduler(std::vector<Course>& courses, std::vector<LectureHall>& halls) {
    std::vector<Assignment> assignments;

    // --- A key step in a greedy algorithm: Prioritize the "hardest" items first. ---
    // We sort courses by the number of students in descending order. This means
    // larger classes get the first pick of available rooms.
    std::sort(courses.begin(), courses.end(), [](const Course& a, const Course& b) {
        return a.student_count > b.student_count;
    });

    // Also sort halls by capacity in ascending order. This encourages the algorithm
    // to use the "best-fit" hall, leaving larger halls free for larger classes.
    std::sort(halls.begin(), halls.end(), [](const LectureHall& a, const LectureHall& b) {
        return a.capacity < b.capacity;
    });

    // --- Main Allocation Loop ---
    // Iterate through each course (now sorted from largest to smallest).
    for (const auto& course : courses) {
        bool course_fully_scheduled = true;

        // Iterate through each time slot required by the current course.
        for (const auto& pair : course.required_slots) {
            Day day = pair.first;
            const TimeSlot& required_slot = pair.second;
            bool slot_assigned = false;

            // Find a suitable hall for this specific time slot.
            // Iterate through the halls (now sorted from smallest to largest).
            for (auto& hall : halls) {
                // Check 1: Does the hall have enough capacity?
                if (hall.capacity >= course.student_count) {
                    // Check 2: Is the hall available at this specific day and time?
                    if (is_hall_available(hall, day, required_slot)) {
                        // --- Success! We found a suitable hall. ---
                        
                        // 1. Create the assignment record.
                        Assignment new_assignment;
                        new_assignment.course_id = course.id;
                        new_assignment.course_name = course.name;
                        new_assignment.hall_name = hall.name;
                        new_assignment.day = day;
                        new_assignment.slot = required_slot;
                        assignments.push_back(new_assignment);

                        // 2. "Book" the hall by adding the slot to its bookings.
                        // This prevents other courses from using it at the same time.
                        hall.bookings[day].push_back(required_slot);
                        
                        // 3. Mark this slot as assigned and break the inner loop to move to the next required slot.
                        slot_assigned = true;
                        break; 
                    }
                }
            } // End of hall loop

            // If after checking all halls, we couldn't assign this slot,
            // then the entire course cannot be scheduled successfully.
            if (!slot_assigned) {
                course_fully_scheduled = false;
                // We could add this to an "unscheduled" list here if needed.
                break; // Stop trying to schedule other slots for this failed course.
            }
        } // End of required slots loop
    } // End of course loop

    return assignments;
}

// Helper function to check for booking conflicts.
bool Scheduler::is_hall_available(const LectureHall& hall, Day day, const TimeSlot& required_slot) {
    // Find if there are any bookings for the given day.
    auto it = hall.bookings.find(day);
    if (it == hall.bookings.end()) {
        // No bookings for this day at all, so it's definitely available.
        return true;
    }

    // If there are bookings, check each one for an overlap.
    const std::vector<TimeSlot>& day_bookings = it->second;
    for (const auto& booked_slot : day_bookings) {
        if (required_slot.overlaps_with(booked_slot)) {
            // Conflict found! The hall is not available.
            return false;
        }
    }

    // No conflicts found after checking all bookings. The hall is available.
    return true;
}
