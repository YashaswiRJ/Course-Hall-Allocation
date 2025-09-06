#include <vector>
#include <string>
#include "ds.hpp"

std::pair<std::vector<Lecture>, std::vector<Tutorial>> course_processing(std::vector<Course> & preprocessed_course_list){

    std::vector<Lecture>  lectures;
    std::vector<Tutorial> tutorials;   
    
    for(auto course: preprocessed_course_list){
        Lecture lec = Lecture(course.course_name, course.course_code, course.lecture_schedule, course.students_registered, course.is_modular);
        lectures.push_back(lec);

        if(course.tutorial_count > 0){
            Tutorial tut = Tutorial(course.course_name, course.course_code, course.tutorial_schedule, course.students_registered, course.tutorial_count, course.is_modular);
            tutorials.push_back(tut);
        }
    }

    return {lectures, tutorials};
}