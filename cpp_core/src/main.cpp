#include <iostream>
#include <string>
#include <unistd.h>      // for dup2, close
#include <fcntl.h>   // for open
#include <cstdlib>
#include "../helpers/json.hpp" // Make sure this path is correct
#include "Data_Structures/Header_Files/ds.hpp"
#include "Preliminary_Processing/Header_Files/course_preprocessing.hpp"
#include "Preliminary_Processing/Header_Files/course_processing.hpp"
#include "Preliminary_Processing/Header_Files/venue_processing.hpp"
#include "Preliminary_Processing/Header_Files/constraint_processing.hpp"
#include "Allocation_Strategy/Header_Files/allocation_logic.hpp"
#include "Output_Formatter/Header_Files/output_formatter.hpp"

using json = nlohmann::json;

int main() {
    /*
    Reads input JSON data from stdin using nlohmann::json.
    The variable `j` stores all input data required for course allocation processing.
    */
    json j;
    std::cin >> j;

    std::vector<Course> preprocessed_course_list; 
    std::map<std::string, std::vector<Venue>> processed_venue_list;
    std::vector<Lecture>  processed_lecture_lists;
    std::vector<Tutorial> processed_tutorial_lists;
    std::vector<std::string> lecture_building_priority_order;
    std::vector<std::string> tutorial_building_priority_order;
    int convenience_factor = 0;
    std::vector<nlohmann::json> lowStrengthCourses;

    if(j.contains("courseData") && j.at("courseData").is_array()){
        auto courseData = j.at("courseData").get<std::vector<json>>();
        preprocessed_course_list = course_preprocessing_function(courseData, lowStrengthCourses); 
    }

    json o1 = json::array();
    for(auto course: preprocessed_course_list){
        o1.push_back({
            {"course_code", course.course_code},
            {"course_name", course.course_name},
            {"lect_sched", course.lecture_schedule},
            {"tut_sched", course.tutorial_schedule},
            {"tut_count", course.tutorial_count},
            {"stud_count", course.students_registered},
            {"is_modular", course.is_modular},
            {"str_lect", course.string_lecture_schedule},
            {"str_tut", course.string_tutorial_schedule}
        });
    }
    // std::cout<<o1.dump(4)<<std::endl;

    if(j.contains("hallData") && j.at("hallData").is_array()){
        processed_venue_list = venue_processing(j.at("hallData").get<std::vector<json>>());
    }

    // std::cout << "Reached lap 1" << std::endl;

    /*
    === DEBUG === 
    std::string hall_name;
    int capacity;
    std::unordered_map<int, std::string> assignment;
    std::unordered_map<int, int> is_available;
    std::string building;
    std::unordered_map<int, std::string> assignment_type;
    */
    json o3 = json::array();
    for(auto str: processed_venue_list){
        for(auto venue: str.second){
            o3.push_back({
                {"name", venue.hall_name},
                {"capacity", venue.capacity},
                {"building", venue.building}
            });
        }
    }
    // std::cout << o3.dump(4) << std::endl;


    /*
    === CONSTRAINT HANDLING ===
    */
    if(j.contains("preallocatedConstraints") && j.at("preallocatedConstraints").is_array()){
        // constraint_processing(processed_venue_list, j.at("preallocatedConstraints").get<std::vector<json>>());
        // Fix: Use a variable
        auto constraint_list = j.at("preallocatedConstraints").get<std::vector<json>>();
        constraint_processing(processed_venue_list, constraint_list);
    }

    std::tie(processed_lecture_lists, processed_tutorial_lists) = course_processing(preprocessed_course_list);

    if(j.contains("lectureBuildingPriorities") && j.at("lectureBuildingPriorities").is_array()){
        lecture_building_priority_order = j.at("lectureBuildingPriorities").get<std::vector<std::string>>();
    }

    if(j.contains("tutorialBuildingPriorities") && j.at("tutorialBuildingPriorities").is_array()){
        tutorial_building_priority_order = j.at("tutorialBuildingPriorities").get<std::vector<std::string>>();
    }

    if(j.contains("convenienceFactor") && j.at("convenienceFactor").is_string()){
        convenience_factor = std::stoi(j.at("convenienceFactor").get<std::string>());
    }

    if(j.contains("convenienceFactor") && j.at("convenienceFactor").is_number()){
        convenience_factor = j.at("convenienceFactor").get<int>();
    }

    // std::cout << convenience_factor << std::endl;
    json unallocated_course = json::object();
    unallocated_course["Unallocated courses"] = json::array();

    core_allocation_logic(processed_lecture_lists, processed_tutorial_lists, processed_venue_list, lecture_building_priority_order, tutorial_building_priority_order, convenience_factor);
    
    // json output_json = prepareOutput(processed_venue_list, processed_lecture_lists, processed_tutorial_lists);

    json output_json = output_formatter(processed_venue_list, processed_lecture_lists, processed_tutorial_lists, j.at("preallocatedConstraints").get<std::vector<json>>());
    output_json["Low Strength Courses"] = json::array();
    output_json["Low Strength Courses"] = lowStrengthCourses;

    std::cout << output_json.dump(4)<< std::endl;
    std::cout.flush();

    int fd = open("outputYASH.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd < 0) {
        perror("open");
        exit(1);
    }

    // Redirect stdout (1) to the file descriptor
    if (dup2(fd, 1) < 0) {
        perror("dup2");
        close(fd);
        exit(1);
    }
    
    close(fd);

    std::cout << "Trying to debug \n";
    std::cout << output_json["Low strength Courses"].dump(4) << std::endl;
    std::cout << output_json.dump(4) << std::endl;
    return 0;
}