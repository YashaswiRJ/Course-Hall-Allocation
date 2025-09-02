#pragma once

#include <string>
#include <vector>
#include <unordered_map>

struct TimeSlot {
    /*
    The data structure storing the timeslot has 3 members:
    - day (std::string)
    - start_time (int)
    - end_time (int)

    Members:
    - day: Day of the week (e.g., "M", "T", "W", "Th", "F")
    - start_time: Start time in HHMM format (e.g., 930 = 09:30)
    - end_time: End time in HHMM format (e.g., 1100 = 11:00)
    
    The last two digits represent the minutes.
    */

    std::string day;
    int start_time;
    int end_time;

    // Constructor
    TimeSlot(const std::string& Day, int Start_time, int End_time)
        : day(Day), start_time(Start_time), end_time(End_time) {}
};

class Course {
public:
    /*
    The Course class stores details about a course and its scheduled slots.

    Members:
    - course_code: The official course code + the section ('_' in case of no section) (e.g., "CS201_", "ESC111MC", "TA111A").
    - course_name: The full name of the course (e.g., "Theory of Computation").
    - student_registered: Total number of students registered for the course.
    - lecture_slots: A list (std::vector) of TimeSlot objects for lecture timings.
    - tutorial_slots: A list (std::vector) of TimeSlot objects for tutorial timings.
    - tutorial_count: Number of tutorial groups allocated for this course.
    - lecture_times: std::vector of slot start times normalized to half-hour quanta (e.g., 17:10 → 17:00).
    - tutorial_times: std::vector of slot start times normalized to half-hour quanta (e.g., 17:10 → 17:00).
    - assignment: std::string representing Venue of Lecture Allocated
    - tutotial_assignment: std::vector of std::string representing Venues of Tutorials Allocated

    Constructor:
    Initializes a Course object with the provided details.
    Parameters are not necessarily passed by const reference (for std::strings and std::vectors) 
    */
    std::string course_code;
    std::string course_name;
    int student_registered;
    std::vector<TimeSlot> lecture_slots;
    std::vector<TimeSlot> tutorial_slots;
    int tutorial_count;
    std::vector<int> lecture_times;
    std::vector<int> tutorial_times;
    std::string assignment;
    std::vector<std::string> tutorial_assignment;

    // Constructor
    Course(std::string& Course_code,
            std::string& Course_name,
            int Student_registered,
            std::vector<TimeSlot>& Lecture_slots,
            std::vector<TimeSlot>& Tutorial_slots,
            int Tutorial_count)

        : course_code(Course_code),
            course_name(Course_name),
            student_registered(Student_registered),
            lecture_slots(Lecture_slots),
            tutorial_slots(Tutorial_slots),
            tutorial_count(Tutorial_count) {}
};

class Venue {
    /*
    The Venue class represents a lecture hall or tutorial room.

    Members:
    - venue_name: The name of the lecture hall 
                    (e.g., "L01", "DJAC: 203H").
    - capacity: The total number of students that can be accommodated.
    - location: The building or area where the lecture hall is located
                (e.g., "LHC", "TB", "DJAC", "WL").
    - availability: An unordered_map<int, bool> that stores availability 
                    of the hall for different time slots.
                    (Key: integer time slot ID, Value: true if available).
    */
public:
    std::string venue_name;
    int capacity;
    std::string location;
    std::unordered_map<int, bool> availability;

    // Constructor
    Venue(const std::string& Venue_name,
            int Capacity,
            const std::string& Location)
        : venue_name(Venue_name),
            capacity(Capacity),
            location(Location) {}
};
