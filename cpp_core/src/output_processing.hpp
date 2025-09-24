#pragma once

#include <vector>
#include <string>
#include <map>
#include "../helpers/json.hpp"
#include "ds.hpp"

nlohmann::json prepareOutput(std::map<std::string, std::vector<Venue>> &venues, std::vector<Lecture> &lectures, std::vector<Tutorial> &tutorials);