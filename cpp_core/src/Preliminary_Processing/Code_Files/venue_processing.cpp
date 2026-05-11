#include <algorithm>
#include <map>
#include <string>
#include <vector>

#include "../helpers/json.hpp"
#include "Data_Structures/Header_Files/ds.hpp"

/**
 * Builds a map of building name → sorted list of Venue objects from raw JSON
 * hall data.
 *
 * Each venue is grouped under its "building" key.  Within each building the
 * venues are sorted in ascending order of capacity so that downstream
 * allocation logic can iterate from smallest to largest.
 *
 * Entries that are missing the "building" field or have a non-string value are
 * silently skipped.
 */
std::map<std::string, std::vector<Venue>>
venue_processing(const std::vector<nlohmann::json>& hall_list)
{
    std::map<std::string, std::vector<Venue>> venues_by_building;

    for (const auto& hall : hall_list) {
        if (!hall.contains("building") || !hall.at("building").is_string())
            continue;

        const std::string building = hall.at("building").get<std::string>();
        venues_by_building[building].emplace_back(hall);
    }

    // Sort each building's venues by capacity (ascending).
    for (auto& [building, venues] : venues_by_building)
        std::sort(venues.begin(), venues.end(), Venue::compareByCapacity);

    return venues_by_building;
}