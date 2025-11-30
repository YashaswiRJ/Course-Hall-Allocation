#include <iostream>
#include <string>
#include <vector>
#include <unistd.h>
#include <fcntl.h>
#include <cstdlib>
#include "../helpers/json.hpp"
#include <map>

using json = nlohmann::json;

// --- Helper function to safely get a string, returning "" if null ---
std::string safe_string(const json& j, const std::string& key) {
    if (j.contains(key) && !j[key].is_null()) {
        return j[key].get<std::string>();
    }
    return ""; // Return empty string if key is missing or null
}

std::vector<std::string> day_processing(const std::string &schedule_str) {
    std::vector<std::string> days;
    if (schedule_str.empty()) return days; // Handle empty schedule safely

    for(int i=0; i<schedule_str.size(); i++) {
        if(schedule_str[i] == 'M') days.push_back("Monday");
        else if(schedule_str[i] == 'W') days.push_back("Wednesday");
        else if(schedule_str[i] == 'F') days.push_back("Friday");
        else if(schedule_str[i] == 'T') {
            if(i+1 < schedule_str.size() && schedule_str[i+1] == 'h') {
                days.push_back("Thursday");
                i++; 
            } else {
                days.push_back("Tuesday");
            }
        }
    }
    return days;
}

int main() {
    json j;

    // 1. Setup Output File (No changes here)
    int fd = open("outputYASH.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd < 0) { perror("open"); exit(1); }
    if (dup2(fd, 1) < 0) { perror("dup2"); close(fd); exit(1); }

    // 2. Read Input
    try {
        std::cin >> j;
    } catch (...) {
        std::cerr << "Error: Invalid JSON input." << std::endl;
        return 1;
    }

    std::map<std::string, std::string> already_seen_courses;
    json output_json = json::object();
    output_json["Errored courses"] = json::array();
    output_json["Formatted courses"] = json::array();

    // 3. Process Logic
    for (const auto& course : j) {
        
        // FIX: Use safe_string() to handle nulls in Section or Type
        std::string code = safe_string(course, "Course Code");
        std::string section = safe_string(course, "Section");
        std::string type = safe_string(course, "Type");
        std::string venue = safe_string(course, "Lecture Hall Allocated");
        std::string schedule = safe_string(course, "Schedule");

        std::string uniqueKey = code + "#" + section + "#" + type;

        auto course_obj = already_seen_courses.find(uniqueKey);
        
        if(course_obj != already_seen_courses.end()) {
            if(course_obj->second == venue) {
                continue;
            } else {
                json errored_course;
                errored_course["Course"] = code + " Section " + section + " already allocated to " + course_obj->second;   
                output_json["Errored courses"].push_back(errored_course);
            }
        } else {
            already_seen_courses[uniqueKey] = venue;
            
            json formatted_course;
            formatted_course["Course"] = code;
            formatted_course["Section"] = (section != "") ? section : "All";
            formatted_course["Class Type"] = "Lecture";
            formatted_course["Class"] = type;
            formatted_course["Venue"] = venue;
            
            // FIX: Pass the safely retrieved 'schedule' string
            for(auto string_day: day_processing(schedule)){
                formatted_course["Day"] = string_day;
                output_json["Formatted courses"].push_back(formatted_course);
            }
        }
    }

    // 4. Output Result
    // std::cout << output_json.dump(4) << std::endl;

    close(fd);

    // std::cout << output_json.dump(4) << std::endl;
    return 0;
}