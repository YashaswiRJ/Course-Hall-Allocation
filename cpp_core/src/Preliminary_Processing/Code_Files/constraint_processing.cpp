#include <map>
#include <string>
#include <vector>

#include "../../Data_Structures/Header_Files/ds.hpp"
#include "../../Utils/Header_Files/helper.hpp"
#include "../helpers/json.hpp"

/**
 * Applies pre-allocation constraints to the venue map.
 *
 * For every constraint entry the named hall is located and each time slot
 * covered by the constraint's schedule is marked unavailable, recording both
 * the assigned course code and the assignment type (e.g. "Lecture",
 * "Tutorial").
 *
 * Constraints whose target hall is not found in the venue map are silently
 * ignored.
 */
void constraint_processing(
    std::map<std::string, std::vector<Venue>>& venues_by_building,
    std::vector<nlohmann::json> &constraint_list)
{
    for (const auto& constraint : constraint_list) {
        const std::string course_code =
            constraint.at("Course Code").get<std::string>() +
            constraint.at("Section").get<std::string>();

        const std::string target_hall = constraint.at("Lecture Hall Allocated").get<std::string>();
        const std::string type        = constraint.at("Type").get<std::string>();
        const std::vector<int> slots  = timeString_to_timeINT(
            constraint.at("Schedule").get<std::string>());

        // Find the target hall across all buildings and mark its slots.
        for (auto& [building, venues] : venues_by_building) {
            for (auto& venue : venues) {
                if (venue.hall_name != target_hall)
                    continue;

                for (int slot : slots) {
                    venue.is_available[slot]    = 0;
                    venue.assignment[slot]       = course_code;
                    venue.assignment_type[slot]  = type;
                }
            }
        }
    }
}