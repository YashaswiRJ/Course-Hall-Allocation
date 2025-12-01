#include <vector>
#include <string>
#include <iostream>
#include <sstream> // Required for std::stringstream
#include <cstdio>  // Required for sscanf

// Helper function to trim whitespace from the start and end of a string
std::string trim(const std::string& str) {
    const std::string WHITESPACE = " \t\n\r\f\v";
    size_t first = str.find_first_not_of(WHITESPACE);
    if (std::string::npos == first) {
        return "";
    }
    size_t last = str.find_last_not_of(WHITESPACE);
    return str.substr(first, (last - first + 1));
}

std::vector<int> timeString_to_timeINT(std::string timeStr) {
    std::vector<int> timeINT;
    std::stringstream ss(timeStr);
    std::string segment;

    // 1. Split the input string by commas into segments
    while (std::getline(ss, segment, ',')) {
        std::string processed_str = trim(segment);
        if (processed_str.empty()) {
            continue;
        }

        // 2. Find the last space to separate the day part from the time part
        size_t space_pos = processed_str.find_last_of(' ');
        if (space_pos == std::string::npos) {
            std::cerr << "Error: Invalid format in '" << processed_str << "'\n";
            continue;
        }

        std::string days_part = processed_str.substr(0, space_pos);
        std::string time_part = processed_str.substr(space_pos + 1);

        int start_hour, start_min, end_hour, end_min;

        // 3. Use sscanf for robust parsing of time. It handles "8:00" and "08:00" equally well.
        if (sscanf(time_part.c_str(), "%d:%d-%d:%d", &start_hour, &start_min, &end_hour, &end_min) != 4) {
            std::cerr << "Error: Could not parse time in '" << time_part << "'\n";
            continue;
        }
        
        // --- Your original rounding logic (it's good!) ---
        start_min = (start_min < 30) ? 0 : 30;

        if (end_min == 0) {
            end_hour--;
            end_min = 59;
        } else if (end_min <= 29) {
            end_min = 29;
        } else {
            end_min = 59;
        }
        
        // --- Your original slot generation logic (also good!) ---
        std::vector<int> time_vec;
        int curr_hour = start_hour;
        int curr_min = start_min;
        while ((curr_hour * 100 + curr_min) <= (end_hour * 100 + end_min)) {
            time_vec.push_back(curr_hour * 100 + curr_min);
            curr_min += 30;
            if (curr_min >= 60) {
                curr_min = 0;
                curr_hour++;
            }
        }
    
        // --- Your original day-parsing logic (clever and it works!) ---
        for (int i = days_part.length() - 1; i >= 0;) {
            int day_code = 0;
            if (days_part[i] == 'M') {
                day_code = 10000; i--;
            } else if (days_part[i] == 'W') {
                day_code = 30000; i--;
            } else if (days_part[i] == 'F') {
                day_code = 50000; i--;
            } else if (days_part[i] == 'h') {
                if (i > 0 && days_part[i-1] == 'T') {
                    day_code = 40000; i -= 2; // Thursday
                } else { i--; } // Stray 'h', ignore
            } else if (days_part[i] == 'T') {
                day_code = 20000; i--; // Tuesday
            } else {
                i--; // Ignore spaces or other characters
                continue;
            }

            for (auto s_time : time_vec) {
                timeINT.push_back(s_time + day_code);
            }
        }   
    }
    return timeINT;
}