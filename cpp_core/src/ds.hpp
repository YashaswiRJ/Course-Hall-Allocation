#pragma once

#include <string>
#include <vector>
#include <unordered_map>
#include "../helpers/json.hpp"

/**
 * @class Lecture
 * @brief Represents a single lecture session for a course.
 */
class Lecture {
public:
    std::string course_code;
    std::string course_name;
    std::vector<int> lecture_schedule;
    int students_registered;
    std::string section;
    std::string assignment;

    Lecture(const std::string Course_Name, const std::string Course_Code, const std::vector<int> Lecture_Schedule, const int Students_Registered, const std::string Section)
        : course_name(Course_Name),
            course_code(Course_Code),
            lecture_schedule(Lecture_Schedule),
            students_registered(Students_Registered),
            section(Section)
    {}
};

/**
 * @class Tutorial
 * @brief Represents a single tutorial session for a course.
 */
class Tutorial {
public:
    std::string course_code;
    std::string course_name;
    std::vector<int> tutoial_schedule;
    int students_registered;
    int tutorial_count;
    std::vector<std::string> assignment;

    Tutorial(const std::string Course_Name, const std::string Course_Code, const std::vector<int> Tutorial_Schedule, const int Students_Registered, const int Tutorial_Count)
        : course_name(Course_Name),
            course_code(Course_Code),
            tutoial_schedule(Tutorial_Schedule),
            students_registered(Students_Registered),
            tutorial_count(Tutorial_Count)
    {}
};

/**
 * @class Venue
 * @brief Represents a physical location (hall) where classes can be held.
 * Manages the venue's capacity and availability schedule.
 */
class Venue {
public:
    std::string hall_name;
    int capacity;
    std::unordered_map<int, std::string> assignment;
    std::unordered_map<int, int> is_available;

    /**
     * @brief Constructs a Venue object from a JSON object.
     * @param j The nlohmann::json object containing venue data.
     */
    Venue(const nlohmann::json& j);

private:
    /**
     * @brief Parses the operational time for a given day from a JSON object and marks the venue as available.
     * @param j The nlohmann::json object for the schedule.
     * @param day The string representation of the day (e.g., "monday").
     * @param prefix_number A numerical prefix representing the day of the week.
     */
    void Operational_Time_Marker(const nlohmann::json& j, std::string day, int prefix_number);
};
