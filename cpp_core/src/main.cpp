#include <iostream>
#include <string>
#include <io.h>      // for _dup2, _close
#include <fcntl.h>   // for _open
#include <cstdlib>
#include "../helpers/json.hpp" // Make sure this path is correct
#include "ds.hpp"
#include "course_preprocessing.hpp"
#include "course_processing.hpp"
#include "venue_processing.hpp"
#include "lecture_allocation.hpp"
#include "tutorial_allocation.hpp"

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
    std::cout << j.dump(4);

    std::vector<Course> preprocessed_course_list; 
    std::map<std::string, std::vector<Venue>> processed_venue_list;
    std::vector<Lecture>  processed_lecture_lists;
    std::vector<Tutorial> processed_tutorial_lists;
    std::vector<std::string> lecture_building_priority_order;
    std::vector<std::string> tutorial_building_priority_order;
    int convenience_factor = 0;

    if(j.contains("courseData") && j.at("courseData").is_array()){
        preprocessed_course_list = course_preprocessing_function(j.at("courseData").get<std::vector<json>>());    
    }

    if(j.contains("hallData") && j.at("hallData").is_array()){
        processed_venue_list = venue_processing(j.at("hallData").get<std::vector<json>>());
    }

    std::tie(processed_lecture_lists, processed_tutorial_lists) = course_processing(preprocessed_course_list);

    if(j.contains("lectureBuildingPriorities") && j.at("lectureBuildingPriorities").is_array()){
        lecture_building_priority_order = j.at("lectureBuildingPriorities").get<std::vector<std::string>>();
    }

    if(j.contains("tutorialBuildingPriorities") && j.at("tutorialBuildingPriorities").is_array()){
        tutorial_building_priority_order = j.at("tutorialBuildingPriorities").get<std::vector<std::string>>();
    }

    if(j.contains("convenienceFactor") && j.at("convenienceFactor").is_string()){
        convenience_factor = std::stoi(j.at("convenience_factor").get<std::string>());
    }
    core_lecture_allocation_logic(processed_lecture_lists, processed_venue_list, lecture_building_priority_order, convenience_factor);

    json output_json;
    output_json["lectureSchedule"] = json::array();

    // for(auto lec: processed_lecture_lists){
    //     output_json["lectureSchedule"].push_back({
    //         {"Course Name", lec.course_name},
    //         {"Course Code", lec.course_code},
    //         {"Lecture Hall Assigned", lec.assignment}
    //     });
    // }

    std::cout << output_json.dump(4) << std::endl;

    return 0;
}