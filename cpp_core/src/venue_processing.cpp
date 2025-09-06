#include <string>
#include <vector>
#include <map>
#include "../helpers/json.hpp"
#include "ds.hpp"

std::map<std::string, std::vector<Venue>> venue_processing(const std::vector<nlohmann::json> &j){
    
    std::map<std::string, std::vector<Venue>> venues;

    for(auto venue: j){
        if(venue.contains("building") && venue.at("building").is_string()){
            venues[venue.at("building").get<std::string>()].push_back(venue);
        }
    }

    for(auto building: venues){
        std::sort(building.second.begin(), building.second.end(), Venue::compareByCapacity);
    }
    return venues;
}