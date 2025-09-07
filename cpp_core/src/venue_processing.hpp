#pragma once

#include <vector>
#include <string>
#include <map>
#include "ds.hpp"

std::map<std::string, std::vector<Venue>> venue_processing(const std::vector<nlohmann::json> &j);