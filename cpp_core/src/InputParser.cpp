#include "InputParser.h"
#include <iostream>
#include <sstream>
#include <algorithm>

// Main public method to orchestrate parsing.
void InputParser::parse(const std::string& json_string, std::vector<Course>& courses, std::vector<LectureHall>& halls) {
    try {
        json data = json::parse(json_string);
        if (data.contains("courseData")) {
            parse_courses(data["courseData"], courses);
        }
        if (data.contains("lectureHalls")) {
            parse_halls(data["lectureHalls"], halls);
        }
    } catch (const json::parse_error& e) {
        // It's good practice to output errors to stderr so Node.js can catch them.
        std::cerr << "JSON parse error: " << e.what() << std::endl;
    }
}

// Parses the array of course objects from the JSON.
void InputParser::parse_courses(const json& course_data, std::vector<Course>& courses) {
    for (const auto& item : course_data) {
        // Ensure required fields exist before trying to access them.
        if (!item.contains("Course Name/Group Name") || !item.contains("Lecture Schedule") || !item.contains("Registered Student")) {
            continue; // Skip this course if data is incomplete
        }

        Course course;
        course.name = item["Course Name/Group Name"];
        course.id = extract_course_code(course.name);
        
        // If no valid code could be extracted, skip this course.
        if (course.id.empty()) {
            continue;
        }

        // The student count might be a string or a number in JSON.
        if (item["Registered Student"].is_string()) {
            try {
                course.student_count = std::stoi(item["Registered Student"].get<std::string>());
            } catch(...) {
                course.student_count = 0; // Default to 0 if conversion fails
            }
        } else if (item["Registered Student"].is_number()) {
            course.student_count = item["Registered Student"];
        } else {
            course.student_count = 0;
        }

        course.required_slots = parse_lecture_schedule(item["Lecture Schedule"]);
        courses.push_back(course);
    }
}

// Parses the array of lecture hall objects from the JSON.
void InputParser::parse_halls(const json& hall_data, std::vector<LectureHall>& halls) {
    for (const auto& item : hall_data) {
        LectureHall hall;
        hall.name = item.value("name", "Unknown Hall");
        hall.capacity = item.value("capacity", 0);
        // The 'schedule' field from the database contains the availability.
        // We will treat all halls as fully available initially.
        // The scheduler will add bookings as it assigns courses.
        halls.push_back(hall);
    }
}

// Helper to find and return the course code inside parentheses.
std::string InputParser::extract_course_code(const std::string& course_name_field) {
    size_t open_paren = course_name_field.find('(');
    size_t close_paren = course_name_field.find(')');
    if (open_paren != std::string::npos && close_paren != std::string::npos && open_paren < close_paren) {
        return course_name_field.substr(open_paren + 1, close_paren - open_paren - 1);
    }
    return ""; // Return empty if not found
}

// Converts a time string like "HH:MM" to total minutes from midnight.
int InputParser::time_to_minutes(const std::string& time_str) {
    try {
        int hours = std::stoi(time_str.substr(0, 2));
        int minutes = std::stoi(time_str.substr(3, 2));
        return hours * 60 + minutes;
    } catch (...) {
        return -1; // Return an invalid value on error
    }
}

// Converts a day abbreviation string to our Day enum.
Day InputParser::string_to_day(const std::string& day_str) {
    if (day_str == "M") return Day::M;
    if (day_str == "T") return Day::T;
    if (day_str == "W") return Day::W;
    if (day_str == "Th") return Day::Th;
    if (day_str == "F") return Day::F;
    return Day::Unknown;
}

// This function breaks down the complex "Lecture Schedule" string.
std::map<Day, TimeSlot> InputParser::parse_lecture_schedule(const std::string& schedule_str) {
    std::map<Day, TimeSlot> slots;
    std::stringstream ss(schedule_str);
    std::string segment;

    // Handle multiple comma-separated schedules, e.g., "M 09:00-10:00, W 14:00-15:30"
    while (std::getline(ss, segment, ',')) {
        std::stringstream segment_ss(segment);
        std::string days_part;
        std::string time_part;

        segment_ss >> days_part >> time_part;
        
        // Find the time range, e.g., "12:00-13:15"
        size_t dash_pos = time_part.find('-');
        if (dash_pos == std::string::npos) continue;

        std::string start_str = time_part.substr(0, dash_pos);
        std::string end_str = time_part.substr(dash_pos + 1);

        TimeSlot slot;
        slot.start_time_minutes = time_to_minutes(start_str);
        slot.end_time_minutes = time_to_minutes(end_str);

        if (slot.start_time_minutes == -1 || slot.end_time_minutes == -1) continue;

        // Handle multi-day strings like "MTh"
        for (size_t i = 0; i < days_part.length(); ++i) {
            std::string day_char;
            if (i + 1 < days_part.length() && days_part[i] == 'T' && days_part[i+1] == 'h') {
                day_char = "Th";
                i++; // Increment extra to skip 'h'
            } else {
                day_char = days_part[i];
            }
            Day day = string_to_day(day_char);
            if (day != Day::Unknown) {
                slots[day] = slot;
            }
        }
    }
    return slots;
}
