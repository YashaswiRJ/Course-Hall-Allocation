#pragma once

#include <vector>
#include <string>
#include "../../Data_Structures/Header_Files/ds.hpp"

std::pair<std::vector<Lecture>, std::vector<Tutorial>> course_processing(std::vector<Course> & preprocessed_course_list);