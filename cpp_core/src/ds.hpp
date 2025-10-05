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
    std::string string_lecture_schedule;

    Lecture(const std::string Course_Name, const std::string Course_Code, const std::vector<int> Lecture_Schedule, const int Students_Registered, const bool Is_Modular, const std::string String_Lecture_Schedule)
        : course_name(Course_Name),
            course_code(Course_Code),
            lecture_schedule(Lecture_Schedule),
            students_registered(Students_Registered),
            is_modular(Is_Modular),
            string_lecture_schedule(String_Lecture_Schedule)
    {}

    static bool compareByStudents(const Lecture& a, const Lecture& b) {
        return a.students_registered > b.students_registered; // descending
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
    std::vector<int> tutorial_schedule;
    int students_registered;
    int tutorial_count;
    std::vector<std::string> assignment;
    bool is_modular;
    std::string string_tutorial_schedule;

    Tutorial(const std::string Course_Name, const std::string Course_Code, const std::vector<int> Tutorial_Schedule, const int Students_Registered, const int Tutorial_Count, const bool Is_Modular, const std::string String_Tutorial_Schedule)
        : course_name(Course_Name),
            course_code(Course_Code),
            tutorial_schedule(Tutorial_Schedule),
            students_registered(Students_Registered),
            tutorial_count(Tutorial_Count),
            is_modular(Is_Modular),
            string_tutorial_schedule(String_Tutorial_Schedule)
    {}

    static bool compareByTutorialCount(const Tutorial& a, const Tutorial& b) {
        return a.tutorial_count > b.tutorial_count; // descending
    }

    void assignTutorialHall(std::string &lecture_hall){
        assignment.push_back(lecture_hall);
    }
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
    std::unordered_map<int, std::string> assignment_type;

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
    void assignLecture(const Lecture &lecture){
        for(auto time: lecture.lecture_schedule){
            is_available[time] = 0;
            assignment[time] = lecture.course_code;
            assignment_type[time] = "Lecture";
        }
        return;
    }

    void assignTutorial(const Tutorial &tutorial){
        for(auto time: tutorial.tutorial_schedule){
            is_available[time] = 0;
            assignment[time] = tutorial.course_code;
            assignment_type[time] = "Tutorial";
        }
        return;
    }

    static bool compareByCapacity(const Venue& a, const Venue& b) {
        return a.capacity < b.capacity;
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
    std::string string_lecture_schedule;
    std::string string_tutorial_schedule;

    Course(const std::string Course_Code, const std::string Course_Name, const std::vector<int> Lecture_Schedule, const std::vector<int> Tutorial_Schedule, int Tutorial_Count, int Students_Registered, const bool Is_Modular, const std::string String_Lecture_Schedule, const std::string String_Tutorial_Schedule)
        :
        course_code(Course_Code),
        course_name(Course_Name),
        lecture_schedule(Lecture_Schedule),
        tutorial_schedule(Tutorial_Schedule),
        tutorial_count(Tutorial_Count),
        students_registered(Students_Registered),
        is_modular(Is_Modular),
        string_lecture_schedule(String_Lecture_Schedule),
        string_tutorial_schedule(String_Tutorial_Schedule)
        {}

    void Append_course_code(const std::string new_code);
    void Append_course_name(const std::string new_name);
    void Update_max_registered_students(const int new_students_registered);
    void Update_max_tutorial_count(const int new_toturial_count);
};