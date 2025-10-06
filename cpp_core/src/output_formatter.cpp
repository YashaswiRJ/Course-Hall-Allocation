#pragma once

#include <string>
#include <vector>
#include <map>
#include "ds.hpp"
#include "../helpers/json.hpp"

std::pair<std::string, std::string> retrieve_section_course_code(std::string code){
    std::string section;
    std::string course_code;
    bool underscore_encountered = false;
    for(auto c: code){
        if(c == '_'){
            underscore_encountered = true;
        } else if(underscore_encountered == false){
            course_code.push_back(c);
        } else {
            section.push_back(c);
        }
    }
    return {section, course_code};
}

std::pair<std::string, std::string> retrieve_modular_pairs(std::string code){
    std::string modular_first;
    std::string modular_second;
    bool hash_encountered = false;
    for(auto c: code){
        if(c == '#'){
            hash_encountered = true;
        } else if(hash_encountered == false){
            modular_first.push_back(c);
        } else {
            modular_second.push_back(c);
        }
    }
    return {modular_first, modular_second};
}

std::string stringify(std::vector<std::string> &vec){
    std::string ret_str;
    for(int ind = 0; ind <vec.size()-1; ind++){
        for(auto c: vec[ind])ret_str.push_back(c);
        ret_str.push_back(',');
    }
    for(auto c: vec.back())ret_str.push_back(c);
    return ret_str;
}

nlohmann::json output_formatter(std::map<std::string, std::vector<Venue>> &allocated_venues, std::vector<Lecture> &lectures, std::vector<Tutorial> &tutorials, std::vector<nlohmann::json> constraint_list){
    nlohmann::json output_json = nlohmann::json::object();

    output_json["Allocation Result"] = nlohmann::json::array();
    
    std::unordered_map<std::string, int> lecture_index;
    std::unordered_map<std::string, int> tutorial_index;
    
    for(int i = 0; i < lectures.size(); i++){
        lecture_index[lectures[i].course_code] = i;
    }

    for(int i = 0; i < tutorials.size(); i++){
        tutorial_index[tutorials[i].course_code] = i;
    }

    std::map<std::string, bool> visited_lecture_code;
    std::map<std::string, bool> visited_tutorial_code; 
    output_json["Allocation Result"].push_back({
        {"lsize", lectures.size()},
        {"tsize", tutorials.size()}
    });

    // for(auto lecture: lectures){
    //     output_json["Allocation Result"].push_back({
    //         {"course code", lecture.course_code},
    //         {"course_name", lecture.course_name},
    //         {"students reg", lecture.students_registered},
    //         {"sched", lecture.string_lecture_schedule},
    //         {"modular", lecture.is_modular}
    //     });
    // }
    for(auto building: allocated_venues){

        for(auto venue: building.second){
            for(auto & [time, availability]: venue.is_available){
                if(availability == 1)continue;
                if(venue.assignment_type[time] == "Lecture"){
                    Lecture lecture = lectures[lecture_index[venue.assignment[time]]];
                    if(visited_lecture_code[lecture.course_code] == true)continue;
                    std::string section_first;
                    std::string course_code_first;
                    std::string section_second;
                    std::string course_code_second;
                    std::tie(course_code_first, course_code_second) = retrieve_modular_pairs(lecture.course_code);
                    std::string course_name_first;
                    std::string course_name_second;
                    std::tie(course_name_first, course_name_second) = retrieve_modular_pairs(lecture.course_name);

                    if(course_code_first != ""){
                        std::tie(section_first, course_code_first) = retrieve_section_course_code(course_code_first);

                        output_json["Allocation Result"].push_back({
                            {"Course Code", course_code_first},
                            {"Course Name", course_name_first},
                            {"Lecture Hall Allocated", venue.hall_name},
                            {"Modular Course", lecture.is_modular == true ? 1 : 0},
                            {"Schedule", lecture.string_lecture_schedule},
                            {"Section", section_first},
                            {"Students Registered", lecture.students_registered},
                            {"Type", "Lecture"}
                        });
                    }

                    if(course_code_second != ""){
                        std::tie(section_second, course_code_second) = retrieve_section_course_code(course_code_second);

                        output_json["Allocation Result"].push_back({
                            {"Course Code", course_code_second},
                            {"Course Name", course_name_second},
                            {"Lecture Hall Allocated", venue.hall_name},
                            {"Modular Course", 2},
                            {"Schedule", lecture.string_lecture_schedule},
                            {"Section", section_second},
                            {"Students Registered", lecture.students_registered},
                            {"Type", "Lecture"}
                        });
                    }
                    visited_lecture_code[lecture.course_code] = true;

                } else if (venue.assignment_type[time] == "Tutorial"){
                    Tutorial tutorial = tutorials[tutorial_index[venue.assignment[time]]];
                    if(visited_tutorial_code[tutorial.course_code] == true)continue;
                    std::string section_first;
                    std::string course_code_first;
                    std::string section_second;
                    std::string course_code_second;
                    std::tie(course_code_first, course_code_second) = retrieve_modular_pairs(tutorial.course_code);
                    std::string course_name_first;
                    std::string course_name_second;
                    std::tie(course_name_first, course_name_second) = retrieve_modular_pairs(tutorial.course_name);

                    if(course_code_first != ""){
                        std::tie(section_first, course_code_first) = retrieve_section_course_code(course_code_first);

                        output_json["Allocation Result"].push_back({
                            {"Course Code", course_code_first},
                            {"Course Name", course_name_first},
                            {"Lecture Hall Allocated", stringify(tutorial.assignment)},
                            {"Modular Course", tutorial.is_modular == true ? 1 : 0},
                            {"Schedule", tutorial.string_tutorial_schedule},
                            {"Section", section_first},
                            {"Students Registered", tutorial.students_registered},
                            {"Type", "Tutorial"}
                        });
                    }

                    if(course_code_second != ""){
                        std::tie(section_second, course_code_second) = retrieve_section_course_code(course_code_second);

                        output_json["Allocation Result"].push_back({
                            {"Course Code", course_code_second},
                            {"Course Name", course_name_second},
                            {"Lecture Hall Allocated", stringify(tutorial.assignment)},
                            {"Modular Course", 2},
                            {"Schedule", tutorial.string_tutorial_schedule},
                            {"Section", section_second},
                            {"Students Registered", tutorial.students_registered},
                            {"Type", "Tutorial"}
                        });
                    }

                    visited_tutorial_code[tutorial.course_code] = true;
                } else {
                    break;
                }
            }
        }
    }

    for(auto constraint: constraint_list){
        output_json["Allocation Result"].push_back(constraint);
    }
    return output_json;
    
}