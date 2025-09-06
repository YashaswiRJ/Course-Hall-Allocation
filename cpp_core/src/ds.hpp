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
    std::string assignment;
    bool is_modular;

    Lecture(const std::string Course_Name, const std::string Course_Code, const std::vector<int> Lecture_Schedule, const int Students_Registered, const bool Is_Modular)
        : course_name(Course_Name),
            course_code(Course_Code),
            lecture_schedule(Lecture_Schedule),
            students_registered(Students_Registered),
            is_modular(Is_Modular)
    {}

    static bool compareByStudents(const Lecture& a, const Lecture& b) {
        return a.students_registered < b.students_registered; // ascending
    }

    void assignLectureHall(std::string &lecture_hall){
        assignment = lecture_hall;
    }
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
    bool is_modular;

    Tutorial(const std::string Course_Name, const std::string Course_Code, const std::vector<int> Tutorial_Schedule, const int Students_Registered, const int Tutorial_Count, const bool Is_Modular)
        : course_name(Course_Name),
            course_code(Course_Code),
            tutoial_schedule(Tutorial_Schedule),
            students_registered(Students_Registered),
            tutorial_count(Tutorial_Count),
            is_modular(Is_Modular)
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
    std::string building;

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

public:
    void assignLectureTutorial(const Lecture &lecture){
        for(auto time: lecture.lecture_schedule){
            is_available[time] = 0;
            assignment[time] = lecture.course_code;
        }
        return;
    }
};

class Course {
public:
    std::string course_code;
    std::string course_name;
    std::vector<int> lecture_schedule;
    std::vector<int> tutorial_schedule;
    int tutorial_count;
    int students_registered;
    bool is_modular;

    Course(const std::string Course_Code, const std::string Course_Name, const std::vector<int> Lecture_Schedule, const std::vector<int> Tutorial_Schedule, int Tutorial_Count, int Students_Registered, const bool Is_Modular)
        :
        course_code(Course_Code),
        course_name(Course_Name),
        lecture_schedule(Lecture_Schedule),
        tutorial_schedule(Tutorial_Schedule),
        tutorial_count(Tutorial_Count),
        students_registered(Students_Registered),
        is_modular(Is_Modular)
        {}

    void Course::Append_course_code(const std::string new_code);
    void Course::Append_course_name(const std::string new_name);
    void Course::Update_max_registered_students(const int new_students_registered);
    void Course::Update_max_tutorial_count(const int new_toturial_count);
};