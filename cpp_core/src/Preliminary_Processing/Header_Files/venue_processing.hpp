#pragma once

#include <vector>
#include <string>
#include <map>
#include "Data_Structures/Header_Files/ds.hpp"

std::map<std::string, std::vector<Venue>> venue_processing(const std::vector<nlohmann::json>& hall_list);
