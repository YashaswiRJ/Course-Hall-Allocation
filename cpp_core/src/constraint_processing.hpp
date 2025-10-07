#pragma once

#include <map>
#include <string>
#include <vector>
#include "ds.hpp"
#include "../helpers/json.hpp"

void constraint_processing(std::map<std::string, std::vector<Venue>> &processed_venue_list, std::vector<nlohmann::json> constraint_list);