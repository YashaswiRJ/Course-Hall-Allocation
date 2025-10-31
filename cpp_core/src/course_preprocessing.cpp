#include <vector>
#include <string>
#include "ds.hpp"
#include "helper.hpp"
#include <algorithm>
#include <map>

std::vector<Course> course_preprocessing_function(std::vector<nlohmann::json> &course_list, std::vector<nlohmann::json> &lowStrengthCourses){
    
    int course_size = course_list.size();
    std::vector<Course> lecture_tutorial_lists;
    std::map <std::string, int> modular_first_index;

    std::vector<nlohmann::json> modular_second_part;

    for(int ind = 0; ind < course_size; ind++){
        std::string course_code;
        std::string course_name;
        std::vector<int> lecture_schedule;
        std::vector<int> tutorial_schedule;
        int students_registered  = 0;
        int tutorial_count = 0;
        bool is_modular = false;
        std::string string_lecture_schedule;
        std::string string_tutorial_schedule;

        if(course_list[ind].contains("Modular Course") && (course_list[ind].at("Modular Course").get<int>()) == 2){
            modular_second_part.push_back(course_list[ind]); 
            continue;
        } 

        if(course_list[ind].contains("Course Name")){
            course_name = course_list[ind].at("Course Name");
        }

        if(course_list[ind].contains("Course Code")){
            course_code = course_list[ind].at("Course Code");
        }

        if(course_list[ind].contains("Sections") && course_list[ind].at("Sections").get<std::string>() != ""){
            course_code = course_code + "_" + course_list[ind].at("Sections").get<std::string>();
        }

        if(course_list[ind].contains("Lecture Schedule")){
            lecture_schedule = timeString_to_timeINT(course_list[ind].at("Lecture Schedule"));
            sort(lecture_schedule.begin(), lecture_schedule.end());
            string_lecture_schedule = course_list[ind].at("Lecture Schedule");
        }

        if(course_list[ind].contains("Tutorial Schedule")){
            tutorial_schedule = timeString_to_timeINT(course_list[ind].at("Tutorial Schedule"));
            sort(tutorial_schedule.begin(), tutorial_schedule.end());
            string_tutorial_schedule = course_list[ind].at("Tutorial Schedule");
        }

        if(course_list[ind].contains("Students Registered") && course_list[ind].at("Students Registered").is_number()){
            students_registered = (course_list[ind].at("Students Registered").get<int>());
        } else {
            students_registered = 0;
        }

        if(course_list[ind].contains("Tutorial Count") && course_list[ind].at("Tutorial Count").is_number()){
            tutorial_count = course_list[ind].at("Tutorial Count").get<int>();
        } else {
            tutorial_count = 0; // Default to 0 if key is missing OR not a number
        }
        
        if(course_list[ind].contains("Modular Course") && (course_list[ind].at("Modular Course").get<int>()) == 1){
            modular_first_index[course_code] = lecture_tutorial_lists.size();
            is_modular = true;
        }
        // Remove course having strength less than 10 as approved by senate
        if(students_registered < 10){
            lowStrengthCourses.push_back(course_list[ind]);
            continue;
        }

        Course course = Course(course_code, course_name, lecture_schedule, tutorial_schedule, tutorial_count, students_registered, is_modular, string_lecture_schedule, string_tutorial_schedule);
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
        std::string string_lecture_schedule;
        std::string string_tutorial_schedule;

        if(modular_second_part[ind].contains("Course Name")){
            course_name = modular_second_part[ind].at("Course Name");
        }

        if(modular_second_part[ind].contains("Course Code")){
            course_code = modular_second_part[ind].at("Course Code");
        }

        if(modular_second_part[ind].contains("Sections") && modular_second_part[ind].at("Sections").get<std::string>() != ""){
            course_code = course_code + "_" + modular_second_part[ind].at("Sections").get<std::string>();
        }

        if(modular_second_part[ind].contains("Lecture Schedule")){
            lecture_schedule = timeString_to_timeINT(modular_second_part[ind].at("Lecture Schedule"));
            sort(lecture_schedule.begin(), lecture_schedule.end());
            string_lecture_schedule = modular_second_part[ind].at("Lecture Schedule");
        }

        if(modular_second_part[ind].contains("Tutorial Schedule")){
            tutorial_schedule = timeString_to_timeINT(modular_second_part[ind].at("Tutorial Schedule"));
            sort(tutorial_schedule.begin(), tutorial_schedule.end());
            string_tutorial_schedule = modular_second_part[ind].at("Tutorial Schedule");
        }

        if(modular_second_part[ind].contains("Students Registered") && modular_second_part[ind].at("Students Registered").is_number()){
            students_registered = (modular_second_part[ind].at("Students Registered").get<int>());
        } else {
            students_registered = 0;
        }

        if(modular_second_part[ind].contains("Tutorial Count") && modular_second_part[ind].at("Tutorial Count").is_number()){
            tutorial_count = course_list[ind].at("Tutorial Count").get<int>();
        } else {
            tutorial_count = 0; // Default to 0 if key is missing OR not a number
        }

        is_modular = true;

        // Remove course having strength less than 10 as approved by senate
        if(students_registered < 10){
            lowStrengthCourses.push_back(modular_second_part[ind]);
            continue;
        }

        if(modular_second_part[ind].contains("Modular Binding")){
            int index = modular_first_index[modular_second_part[ind].at("Modular Binding")];
            lecture_tutorial_lists[index].Append_course_code("#" + course_code);
            lecture_tutorial_lists[index].Append_course_name("#" + course_name);
            lecture_tutorial_lists[index].Update_max_registered_students(students_registered);
            lecture_tutorial_lists[index].Update_max_tutorial_count(tutorial_count);
        } else {
            Course course = Course("#" + course_code, "#" + course_name, lecture_schedule, tutorial_schedule, tutorial_count, students_registered, is_modular, string_lecture_schedule, string_tutorial_schedule);
            lecture_tutorial_lists.push_back(course);
        }
    }

    return lecture_tutorial_lists;
}