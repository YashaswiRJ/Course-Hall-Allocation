#include <vector>
#include <string>
#include "../../Data_Structures/Header_Files/ds.hpp"

std::pair<std::vector<Lecture>, std::vector<Tutorial>> course_processing(std::vector<Course> & preprocessed_course_list){

    std::vector<Lecture>  lectures;
    std::vector<Tutorial> tutorials;   
    
    for(auto course: preprocessed_course_list){
        Lecture lecture = Lecture(course.course_name, course.course_code, course.lecture_schedule, course.students_registered, course.is_modular, course.string_lecture_schedule);
        lectures.push_back(lecture);

        if(course.tutorial_count > 0){
            Tutorial tutorial = Tutorial(course.course_name, course.course_code, course.tutorial_schedule, course.students_registered, course.tutorial_count, course.is_modular, course.string_tutorial_schedule);
            tutorials.push_back(tutorial);
        }
    }

    return {lectures, tutorials};
}