#pragma once

#include "ds.hpp"
#include <stdexcept>
#include <algorithm>

// Venue constructor implementation
Venue::Venue(const nlohmann::json& j) : capacity(0) {
    if (j.contains("name") && j.at("name").is_string()) {
        this->hall_name = j.at("name").get<std::string>();
    }

    if (j.contains("capacity") && j.at("capacity").is_number()) {
        this->capacity = j.at("capacity").get<int>();
    }

    if(j.contains("building") && j.at("building").is_string()){
        this->building = j.at("building").get<std::string>();
    }

    if (j.contains("schedule")) {
        // Function to write the operational time
        Operational_Time_Marker(j.at("schedule"), "monday", 1);
        Operational_Time_Marker(j.at("schedule"), "tuesday", 2);
        Operational_Time_Marker(j.at("schedule"), "wednesday", 3);
        Operational_Time_Marker(j.at("schedule"), "thursday", 4);
        Operational_Time_Marker(j.at("schedule"), "friday", 5);
    }
}

// Venue::Operational_Time_Marker implementation
void Venue::Operational_Time_Marker(const nlohmann::json& j, std::string day, int prefix_number) {
    if (j.contains(day) && j.at(day).is_array()) {
        for (const auto& interval : j.at(day)) {
            if (interval.contains("open") && interval.at("open").is_string() &&
                interval.contains("close") && interval.at("close").is_string()) {
                
                std::string open_str = interval.at("open").get<std::string>();
                std::string close_str = interval.at("close").get<std::string>();

                if (open_str.length() != 5 || close_str.length() != 5 || open_str[2] != ':' || close_str[2] != ':') {
                    // Skip malformed time strings
                    continue;
                }

                try {
                    int start_hour = std::stoi(open_str.substr(0, 2));
                    int start_min = std::stoi(open_str.substr(3, 2));

                    int end_hour = std::stoi(close_str.substr(0, 2));
                    int end_min = std::stoi(close_str.substr(3, 2));
                    
                    // The loop will mark slots up to, but not including, the end time.
                    // Example: 09:00 to 10:00 marks all slots from 09:00 to 09:59.
                    int curr_hour = start_hour;
                    int curr_min = start_min;

                    while ((curr_hour * 100 + curr_min) < (end_hour * 100 + end_min)) {
                        this->is_available[prefix_number * 10000 + (curr_hour * 100 + curr_min)] = 1;
                        
                        // Increment time by 30 minute
                        curr_min+=30;
                        if (curr_min == 60) {
                            curr_min = 0;
                            curr_hour++;
                        }
                    }
                } catch (const std::invalid_argument& e) {
                    // Handle cases where stoi fails (e.g., non-numeric characters)
                    // For now, we just skip this interval
                    continue;
                }
            }
        }
    }
}

void Course::Append_course_code(const std::string new_code){
    course_code = course_code + new_code;
}

void Course::Append_course_name(const std::string new_name){
    course_name = course_name + new_name;
}

void Course::Update_max_registered_students(const int new_students_registered){
    students_registered = std::max(students_registered, new_students_registered);
}

void Course::Update_max_tutorial_count(const int new_toturial_count){
    tutorial_count = std::max(tutorial_count, new_toturial_count);
}