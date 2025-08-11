#include <iostream>
#include <string>
#include <vector>
#include <set>
#include "InputParser.h"
#include "Scheduler.h"
#include "../helpers/json.hpp"

using json = nlohmann::json;

// Helper functions (day_to_string, minutes_to_time_string) remain the same...
std::string day_to_string(Day day) {
    switch (day) {
        case Day::M: return "Monday";
        case Day::T: return "Tuesday";
        case Day::W: return "Wednesday";
        case Day::Th: return "Thursday";
        case Day::F: return "Friday";
        default: return "Unknown";
    }
}

std::string minutes_to_time_string(int total_minutes) {
    int hours = total_minutes / 60;
    int minutes = total_minutes % 60;
    char buffer[6];
    sprintf(buffer, "%02d:%02d", hours, minutes);
    return std::string(buffer);
}


int main() {
    std::string json_input_string;
    std::string line;
    while (std::getline(std::cin, line)) {
        json_input_string += line;
    }

    InputParser parser;
    Scheduler scheduler;
    std::vector<Course> courses;
    std::vector<LectureHall> halls;

    parser.parse(json_input_string, courses, halls);

    std::vector<Assignment> assignments = scheduler.run_greedy_scheduler(courses, halls);

    json output_json;
    output_json["message"] = "Schedule generation complete.";
    output_json["total_courses_processed"] = courses.size();
    output_json["successful_assignments"] = assignments.size();
    
    // --- START OF NEW LOGIC ---

    // 1. Create a set of assigned course IDs for quick lookup
    std::set<std::string> assigned_course_ids;
    for (const auto& assignment : assignments) {
        assigned_course_ids.insert(assignment.course_id);
    }

    // 2. Find unassigned courses and add them to a new JSON array
    json unassigned_courses_array = json::array();
    for (const auto& course : courses) {
        if (assigned_course_ids.find(course.id) == assigned_course_ids.end()) {
            json unassigned_obj;
            unassigned_obj["course_id"] = course.id;
            unassigned_obj["course_name"] = course.name;
            unassigned_obj["student_count"] = course.student_count;
            unassigned_courses_array.push_back(unassigned_obj);
        }
    }
    
    // --- END OF NEW LOGIC ---

    json assignments_array = json::array();
    for (const auto& assignment : assignments) {
        json assignment_obj;
        assignment_obj["course_id"] = assignment.course_id;
        assignment_obj["course_name"] = assignment.course_name;
        assignment_obj["hall_name"] = assignment.hall_name;
        assignment_obj["day"] = day_to_string(assignment.day);
        assignment_obj["start_time"] = minutes_to_time_string(assignment.slot.start_time_minutes);
        assignment_obj["end_time"] = minutes_to_time_string(assignment.slot.end_time_minutes);
        assignments_array.push_back(assignment_obj);
    }
    
    output_json["generated_assignments"] = assignments_array;
    // Add the new array to the final output
    output_json["unassigned_courses"] = unassigned_courses_array;

    std::cout << output_json.dump(4) << std::endl;

    return 0;
}