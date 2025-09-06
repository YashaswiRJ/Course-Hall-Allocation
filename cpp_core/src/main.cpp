#include <iostream>
#include <string>
#include <io.h>      // for _dup2, _close
#include <fcntl.h>   // for _open
#include <cstdlib>
#include "../helpers/json.hpp" // Make sure this path is correct
#include "ds.hpp"
#include "course_preprocessing.cpp"
#include "course_processing.cpp"
#include "venue_processing.cpp"

// for convenience
using json = nlohmann::json;

int main() {
    // The C++ program will now wait for input from stdin
    // instead of looking for a file argument.
    json j;

    int fd = _open("outputYASH.txt", _O_WRONLY | _O_CREAT | _O_TRUNC, 0644);
    if (fd < 0) {
        perror("open");
        exit(1);
    }

    // Redirect stdout (1) to the file descriptor
    if (_dup2(fd, 1) < 0) {
        perror("dup2");
        _close(fd);
        exit(1);
    }
    
    _close(fd);

    std::cin >> j;

    std::vector<Course> preprocessed_course_list; 
    std::map<std::string, std::vector<Venue>> processed_venue_list;
    std::vector<Lecture>  processed_lecture_lists;
    std::vector<Tutorial> processed_tutorial_lists;
    std::vector<std::string> lecture_building_priority_order;
    std::vector<std::string> tutorial_building_priority_order;

    if(j.contains("courseData") && j.at("courseData").is_array()){
        preprocessed_course_list = course_preprocessing_function(j.at("courseData").get<std::vector<json>>());    
    }

    if(j.contains("hallData") && j.at("hallData").is_array()){
        processed_venue_list = venue_processing(j.at("hallData").get<std::vector<json>>());
    }

    std::tie(processed_lecture_lists, processed_tutorial_lists) = course_processing(preprocessed_course_list);

    if(j.contains("lectureBuildingPriorityOrder") && j.at("lectureBuildingPriorityOrder").is_array()){
        lecture_building_priority_order = j.at("lectureBuildingPriorityOrder").get<std::vector<std::string>>();
    }

    if(j.contains("tutorialBuildingPriorityOrder") && j.at("tutorialBuildingPriorityOrder").is_array()){
        tutorial_building_priority_order = j.at("tutorialBuildingPriorityOrder").get<std::vector<std::string>>();
    }

    
}