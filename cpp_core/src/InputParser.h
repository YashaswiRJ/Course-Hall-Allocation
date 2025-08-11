#ifndef INPUT_PARSER_H
#define INPUT_PARSER_H

#include <string>
#include <vector>
#include "DataStructures.hpp"
#include "../helpers/json.hpp" // nlohmann's json library

using json = nlohmann::json;

// This class is responsible for parsing the JSON input from Node.js
// into the C++ data structures we can work with.
class InputParser {
public:
    // Main parsing function.
    // Takes the raw JSON string and populates the course and hall vectors.
    void parse(const std::string& json_string, std::vector<Course>& courses, std::vector<LectureHall>& halls);

private:
    // --- Helper functions for parsing specific parts of the JSON ---

    // Parses the array of course data.
    void parse_courses(const json& course_data, std::vector<Course>& courses);

    // Parses the array of lecture hall data.
    void parse_halls(const json& hall_data, std::vector<LectureHall>& halls);

    // Extracts the unique course code from a string like "INTRO TO CS (CSO201)".
    std::string extract_course_code(const std::string& course_name_field);

    // The most complex helper: parses the "Lecture Schedule" string.
    // e.g., "MTh 12:00-13:15" or "M 09:00-10:00, W 14:00-15:30"
    std::map<Day, TimeSlot> parse_lecture_schedule(const std::string& schedule_str);

    // Converts a day string like "M", "T", "W", "Th", "F" into a Day enum.
    Day string_to_day(const std::string& day_str);

    // Converts a time string like "12:00" into minutes from midnight.
    int time_to_minutes(const std::string& time_str);
};

#endif // INPUT_PARSER_H
