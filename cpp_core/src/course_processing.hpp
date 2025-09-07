#pragma once

#include <vector>
#include <string>
#include "ds.hpp"

std::pair<std::vector<Lecture>, std::vector<Tutorial>> course_processing(std::vector<Course> & preprocessed_course_list);