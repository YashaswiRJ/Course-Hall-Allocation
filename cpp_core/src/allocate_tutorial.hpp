#pragma once

#include <map>
#include <string>
#include <vector>
#include "ds.hpp"
#include "../helpers/json.hpp"

void try_allocate_tutorial(std::vector<Tutorial>::iterator tutorial, std::map<std::string, std::vector<Venue>> &venues, std::vector<std::string> &tutorial_building_priority_order, int convenience_factor);