#include <map>
#include <string>
#include <vector>
#include "helper.hpp"
#include "ds.hpp"

void constraint_processing(std::map<std::string, std::vector<Venue>> processed_venue_list, const nlohmann::json &constraint_list){

    for(auto &venues: processed_venue_list){
        for(auto &venue: venues.second){
            // venue.
        }
    }

    // Iterate through each constraint
    for (const auto &constraint : constraint_list) {
        std::string course_code = constraint.at("Course Code").get<std::string>() + constraint.at("Section").get<std::string>();
        std::vector<int> schedule = timeString_to_timeINT(constraint.at("Schedule").get<std::string>());
        std::string lec_hall_aloc = constraint.at("Lecture Hall Allocated").get<std::string>();
        std::string type = constraint.at("Type");
        
        for(auto &venues: processed_venue_list){
            for(auto &venue: venues.second){
                if(venue.hall_name == lec_hall_aloc){
                    for(auto time: schedule){
                        venue.is_available[time] = 0;
                        venue.assignment[time] = course_code;
                        venue.assignment_type[time] = type;
                    }
                }
            }
        }
    }
    return;
}