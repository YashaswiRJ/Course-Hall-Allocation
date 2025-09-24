#include <vector>
#include <string>
#include <map>
#include "../helpers/json.hpp"
#include "ds.hpp"

using json = nlohmann::json;

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

bool if_just_first_half(std::string course_code){
    for(auto c: course_code){
        if(c == '#')return false;
    }
    return true;
}

std::pair<std::string, std::string> split_by_hash(std::string hash_string){
    std::string first_half; std::string second_half;
    for(int ind = 0; ind < hash_string.length(); ind++){
        if(hash_string[ind] == '#'){
            return {first_half, hash_string.substr(ind+1)};
        }
        first_half.push_back(hash_string[ind]);
    }
    return {first_half, second_half};
}

nlohmann::json prepareOutput(std::map<std::string, std::vector<Venue>> &venues, std::vector<Lecture> &lectures, std::vector<Tutorial> &tutorials){
    
    json output_json;
    output_json["allocation_result"] = json::array();

    std::unordered_map<std::string, int> lecture_index;
    std::unordered_map<std::string, int> tutorial_index;
    
    for(int i = 0; i < lectures.size(); i++){
        lecture_index[lectures[i].course_code] = i;
    }

    for(int i = 0; i < tutorials.size(); i++){
        tutorial_index[tutorials[i].course_code] = i;
    }

    // Lecture processing unit to output

    for(auto building: venues){
        output_json["allocation_result"][building.first] = json::array();

        for(auto venue: building.second){
            for(auto & [time, availability]: venue.is_available){
                if(availability == 0)continue;
                if(venue.assignment_type[time] == "Lecture"){
                    Lecture lecture = lectures[lecture_index[venue.assignment[time]]];
                    std::string section;
                    std::string course_code;
                    std::string schedule;
                    if(lecture.is_modular == true){
                        int modular_course = 1;
                        if(lecture.course_code[0] == '#'){
                            modular_course = 2;
                            std::tie(section, course_code) = retrieve_section_course_code(lecture.course_code.substr(1));
                            output_json["allocation_result"][building.first].push_back({    
                                {"Section", section},
                                {"Course_Code", course_code},
                                {"Course Name", lecture.course_name.substr(1)},
                                {"Lecture Hall Allocated", venue.hall_name},
                                {"Type", "Lecture"},
                                {"Schedule", lecture.string_lecture_schedule},
                                {"Modular Course", 2}
                            });
                        } else if(if_just_first_half(lecture.course_code)){
                            std::tie(section, course_code) = retrieve_section_course_code(lecture.course_code);
                            output_json["allocation_result"][building.first].push_back({    
                                {"Section", section},
                                {"Course_Code", course_code},
                                {"Course Name", lecture.course_name},
                                {"Lecture Hall Allocated", venue.hall_name},
                                {"Type", "Lecture"},
                                {"Schedule", lecture.string_lecture_schedule},
                                {"Modular Course", 1}
                            });
                        } else {
                            std::string section_sec;
                            std::string course_code_sec;
                            std::string schedule_sec;
                            std::string course_name; std::string course_name_sec;
                            std::tie(course_code, course_code_sec) = split_by_hash(lecture.course_code);
                            std::tie(course_name, course_name_sec) = split_by_hash(lecture.course_name);
                            std::tie(section, course_code) = retrieve_section_course_code(course_code);
                            std::tie(section_sec, course_code_sec) = retrieve_section_course_code(course_code_sec);
                            std::tie(section, course_code) = retrieve_section_course_code(lecture.course_code);
                            output_json["allocation_result"][building.first].push_back({    
                                {"Section", section},
                                {"Course_Code", course_code},
                                {"Course Name", course_name},
                                {"Lecture Hall Allocated", venue.hall_name},
                                {"Type", "Lecture"},
                                {"Schedule", lecture.string_lecture_schedule},
                                {"Modular Course", 1}
                            });
                            std::tie(section, course_code) = retrieve_section_course_code(lecture.course_code);
                            output_json["allocation_result"][building.first].push_back({    
                                {"Section", section_sec},
                                {"Course_Code", course_code_sec},
                                {"Course Name", course_name_sec},
                                {"Lecture Hall Allocated", venue.hall_name},
                                {"Type", "Lecture"},
                                {"Schedule", lecture.string_lecture_schedule},
                                {"Modular Course", 2}
                            });
                        }
                    } else {
                        std::tie(section, course_code) = retrieve_section_course_code(lecture.course_code);
                        output_json["allocation_result"][building.first].push_back({    
                            {"Section", section},
                            {"Course_Code", course_code},
                            {"Course Name", lecture.course_name},
                            {"Lecture Hall Allocated", venue.hall_name},
                            {"Type", "Lecture"},
                            {"Schedule", lecture.string_lecture_schedule},
                            {"Modular Course", 0}
                        });
                    }

                } else if(venue.assignment_type[time] == "Tutorial"){
                    Tutorial tutorial = tutorials[tutorial_index[venue.assignment[time]]];
                    std::string section;
                    std::string course_code;
                    std::string schedule;
                    if(tutorial.is_modular == true){
                        int modular_course = 1;
                        if(tutorial.course_code[0] == '#'){
                            modular_course = 2;
                            std::tie(section, course_code) = retrieve_section_course_code(tutorial.course_code.substr(1));
                            output_json["allocation_result"][building.first].push_back({    
                                {"Section", section},
                                {"Course_Code", course_code},
                                {"Course Name", tutorial.course_name.substr(1)},
                                {"Lecture Hall Allocated", venue.hall_name},
                                {"Type", "Tutorial"},
                                {"Schedule", tutorial.string_tutorial_schedule},
                                {"Modular Course", 2}
                            });
                        } else if(if_just_first_half(tutorial.course_code)){
                            std::tie(section, course_code) = retrieve_section_course_code(tutorial.course_code);
                            output_json["allocation_result"][building.first].push_back({    
                                {"Section", section},
                                {"Course_Code", course_code},
                                {"Course Name", tutorial.course_name},
                                {"Lecture Hall Allocated", venue.hall_name},
                                {"Type", "Tutorial"},
                                {"Schedule", tutorial.string_tutorial_schedule},
                                {"Modular Course", 1}
                            });
                        } else {
                            std::string section_sec;
                            std::string course_code_sec;
                            std::string schedule_sec;
                            std::string course_name; std::string course_name_sec;
                            std::tie(course_code, course_code_sec) = split_by_hash(tutorial.course_code);
                            std::tie(course_name, course_name_sec) = split_by_hash(tutorial.course_name);
                            std::tie(section, course_code) = retrieve_section_course_code(course_code);
                            std::tie(section_sec, course_code_sec) = retrieve_section_course_code(course_code_sec);
                            std::tie(section, course_code) = retrieve_section_course_code(tutorial.course_code);
                            output_json["allocation_result"][building.first].push_back({    
                                {"Section", section},
                                {"Course_Code", course_code},
                                {"Course Name", course_name},
                                {"Lecture Hall Allocated", venue.hall_name},
                                {"Type", "Tutorial"},
                                {"Schedule", tutorial.string_tutorial_schedule},
                                {"Modular Course", 1}
                            });
                            std::tie(section, course_code) = retrieve_section_course_code(tutorial.course_code);
                            output_json["allocation_result"][building.first].push_back({    
                                {"Section", section_sec},
                                {"Course_Code", course_code_sec},
                                {"Course Name", course_name_sec},
                                {"Lecture Hall Allocated", venue.hall_name},
                                {"Type", "Tutorial"},
                                {"Schedule", tutorial.string_tutorial_schedule},
                                {"Modular Course", 2}
                            });
                        }
                    } else {
                        std::tie(section, course_code) = retrieve_section_course_code(tutorial.course_code);
                        output_json["allocation_result"][building.first].push_back({    
                            {"Section", section},
                            {"Course_Code", course_code},
                            {"Course Name", tutorial.course_name},
                            {"Lecture Hall Allocated", venue.hall_name},
                            {"Type", "Tutorial"},
                            {"Schedule", tutorial.string_tutorial_schedule},
                            {"Modular Course", 0}
                        });
                    }
                } else {
                    // Not a valid assignment type
                }
            }
        }
    }
    return output_json;
}