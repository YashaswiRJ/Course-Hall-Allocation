#pragma once

#include <map>
#include <string>
#include <vector>
#include "../../Data_Structures/Header_Files/ds.hpp"
#include "../helpers/json.hpp"

void try_allocation_lecture(std::vector<Lecture>::iterator lecture, std::map<std::string, std::vector<Venue>> &venues, std::vector<std::string> &lecture_building_priority_order, int convenience_factor);