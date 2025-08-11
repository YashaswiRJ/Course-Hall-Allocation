#ifndef DATA_STRUCTURES_HPP
#define DATA_STRUCTURES_HPP

#include <string>
#include <vector>
#include <map>

// Represents the day of the week for clarity.
// Monday = 0, Tuesday = 1, ..., Friday = 4
enum class Day { M, T, W, Th, F, Unknown };

// Represents a single time block, e.g., 09:00 - 10:00.
struct TimeSlot {
    int start_time_minutes; // Time in minutes from midnight (e.g., 9:00 AM is 540)
    int end_time_minutes;   // e.g., 10:00 AM is 600

    // A simple check to see if two time slots overlap.
    bool overlaps_with(const TimeSlot& other) const {
        return std::max(start_time_minutes, other.start_time_minutes) < std::min(end_time_minutes, other.end_time_minutes);
    }
};

// Represents a university course to be scheduled.
struct Course {
    std::string id;       // The unique course code, e.g., "CSO201"
    std::string name;     // The full name of the course for reference
    int student_count;    // Number of registered students, used for capacity checks

    // A course can have multiple time slots on different days.
    // For example, one lecture on Monday and another on Wednesday.
    std::map<Day, TimeSlot> required_slots;
};

// Represents a lecture hall where courses can be held.
struct LectureHall {
    std::string name;       // The name of the hall, e.g., "L01"
    int capacity;           // The maximum number of students it can hold

    // Keeps track of which time slots are booked on which days.
    std::map<Day, std::vector<TimeSlot>> bookings;
};

// Represents a successful assignment of a course to a hall.
struct Assignment {
    std::string course_id;
    std::string course_name;
    std::string hall_name;
    Day day;
    TimeSlot slot;
};

#endif // DATA_STRUCTURES_HPP
