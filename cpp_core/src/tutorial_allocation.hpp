#pragma once

#include <vector>
#include <string>
#include <map>
#include "ds.hpp"

void core_lecture_allocation_logic(std::vector<Tutorial> &tutorials, std::map<std::string, std::vector<Venue>> &venues, std::vector<std::string> &tutorial_building_priority_order, int convenience_factor);