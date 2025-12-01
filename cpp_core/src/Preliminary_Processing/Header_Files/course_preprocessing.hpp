#pragma once 

#include <vector>
#include <string>
#include "../../Data_Structures/Header_Files/ds.hpp"

std::vector<Course> course_preprocessing_function(std::vector<nlohmann::json> &course_list, std::vector<nlohmann::json> &lowStrengthCourses);