#pragma once

#include <map>
#include <string>
#include <vector>
#include "../../Data_Structures/Header_Files/ds.hpp"
#include "../helpers/json.hpp"

void constraint_processing(
    std::map<std::string, std::vector<Venue>>& venues_by_building,
    std::vector<nlohmann::json> &constraint_list);