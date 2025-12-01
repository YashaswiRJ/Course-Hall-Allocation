#pragma once

#include <string>
#include <vector>
#include <map>
#include "Data_Structures/Header_Files/ds.hpp"
#include "../helpers/json.hpp"

nlohmann::json output_formatter(std::map<std::string, std::vector<Venue>> &allocated_venues, std::vector<Lecture> &lectures, std::vector<Tutorial> &tutorials, std::vector<nlohmann::json> constraint_list);