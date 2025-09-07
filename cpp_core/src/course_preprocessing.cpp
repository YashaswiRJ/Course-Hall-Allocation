#pragma once

#include <vector>
#include <string>
#include "ds.hpp"
#include "helper.hpp"
#include <map>

std::vector<Course> course_preprocessing_function(std::vector<nlohmann::json> &course_list){
    
    int course_size = course_list.size();
    std::vector<Course> lecture_tutorial_lists;
    std::map <std::string, int> modular_first_index;

    std::vector<nlohmann::json> modular_second_part;

    for(int ind = 0; ind < course_size; ind++){
        std::string course_code;
        std::string course_name;
        std::vector<int> lecture_schedule;
        std::vector<int> tutorial_schedule;
        int students_registered;
        int tutorial_count;
        bool is_modular;

        if(course_list[ind].contains("Modular Course") && std::stoi(course_list[ind].at("Modular Course").get<std::string>()) == 2){
            modular_second_part.push_back(course_list[ind]); 
            continue;
        } 

        if(course_list[ind].contains("Course Name")){
            course_name = course_list[ind].at("Course Name");
        }

        if(course_list[ind].contains("Course Code")){
            course_code = course_list[ind].at("Course Code");
        }

        if(course_list[ind].contains("Section")){
            course_code = course_code + "_" + course_list[ind].at("Section").get<std::string>();
        }

        if(course_list[ind].contains("Lecture Schedule")){
            lecture_schedule = timeString_to_timeINT(course_list[ind].at("Lecture Schedule"));
            sort(lecture_schedule.begin(), lecture_schedule.end());
        }

        if(course_list[ind].contains("Tutorial Schedule")){
            tutorial_schedule = timeString_to_timeINT(course_list[ind].at("Tutorial Schedule"));
            sort(tutorial_schedule.begin(), tutorial_schedule.end());
        }

        if(course_list[ind].contains("Students Registered")){
            students_registered = std::stoi(course_list[ind].at("Students Registered").get<std::string>());
        } else {
            students_registered = 0;
        }

        if(course_list[ind].contains("Tutorial Count")){
            tutorial_count = std::stoi(course_list[ind].at("Tutorial Count").get<std::string>());

        } else {
            tutorial_count = 0;
        }
        
        if(course_list[ind].contains("Modular Course") && std::stoi(course_list[ind].at("Modular Course").get<std::string>()) == 1){
            modular_first_index[course_code] = lecture_tutorial_lists.size() - 1;
            is_modular = true;
        }

        Course course = Course(course_code, course_name, lecture_schedule, tutorial_schedule, tutorial_count, students_registered, is_modular);
        lecture_tutorial_lists.push_back(course);
    }

    for(int ind = 0; ind < modular_second_part.size(); ind++){
        std::string course_code;
        std::string course_name;
        std::vector<int> lecture_schedule;
        std::vector<int> tutorial_schedule;
        int students_registered;
        int tutorial_count;
        bool is_modular;

        if(course_list[ind].contains("Course Name")){
            course_name = course_list[ind].at("Course Name");
        }

        if(course_list[ind].contains("Course Code")){
            course_code = course_list[ind].at("Course Code");
        }

        if(course_list[ind].contains("Section")){
            course_code = course_code + "_" + course_list[ind].at("Section").get<std::string>();
        }

        if(course_list[ind].contains("Lecture Schedule")){
            lecture_schedule = timeString_to_timeINT(course_list[ind].at("Lecture Schedule"));
            sort(lecture_schedule.begin(), lecture_schedule.end());
        }

        if(course_list[ind].contains("Tutorial Schedule")){
            tutorial_schedule = timeString_to_timeINT(course_list[ind].at("Tutorial Schedule"));
            sort(tutorial_schedule.begin(), tutorial_schedule.end());
        }

        if(course_list[ind].contains("Students Registered")){
            students_registered = std::stoi(course_list[ind].at("Students Registered").get<std::string>());
        } else {
            students_registered = 0;
        }

        if(course_list[ind].contains("Tutorial Count")){
            tutorial_count = std::stoi(course_list[ind].at("Tutorial Count").get<std::string>());
        } else {
            tutorial_count = 0;
        }

        is_modular = true;

        if(course_list[ind].contains("Modular Course")){
            int index = modular_first_index[course_list[ind].at("Modular Course")];
            lecture_tutorial_lists[index].Append_course_code("#" + course_code);
            lecture_tutorial_lists[index].Append_course_name("#" + course_name);
            lecture_tutorial_lists[index].Update_max_registered_students(students_registered);
            lecture_tutorial_lists[index].Update_max_tutorial_count(tutorial_count);
        } else {
            Course course = Course(course_code, course_name, lecture_schedule, tutorial_schedule, tutorial_count, students_registered, is_modular);
            lecture_tutorial_lists.push_back(course);
        }
    }

    return lecture_tutorial_lists;
}