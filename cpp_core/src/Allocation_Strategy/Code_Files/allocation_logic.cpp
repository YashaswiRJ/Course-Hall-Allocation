#include <vector>
#include <string>
#include <map>
#include <unordered_map>
#include "../../Data_Structures/Header_Files/ds.hpp"
#include "../Header_Files/allocate_lecture.hpp"
#include "../Header_Files/allocate_tutorial.hpp"
#include <iostream>

void core_allocation_logic(std::vector<Lecture> &lectures, std::vector<Tutorial> &tutorials, std::map<std::string, std::vector<Venue>> &venues, std::vector<std::string> &lecture_building_priority_order, std::vector<std::string> &tutorial_building_priority_order, int convenience_factor){
    
    std::sort(lectures.begin(), lectures.end(), Lecture::compareByStudents);
    std::sort(tutorials.begin(), tutorials.end(), Tutorial::compareByTutorialCount);

    auto lec = lectures.begin();
    auto tut = tutorials.begin();

    while((lec != lectures.end()) && (tut != tutorials.end())){
        if(lec->students_registered >= tut->students_registered){
            try_allocation_lecture(lec, venues, lecture_building_priority_order, convenience_factor);
            lec++; 
        } else {
            try_allocate_tutorial(tut, venues, tutorial_building_priority_order, convenience_factor);
            tut++;
        }
    }

    while(lec != lectures.end()){
        try_allocation_lecture(lec, venues, lecture_building_priority_order, convenience_factor);
        lec++;
    }

    while(tut != tutorials.end()){
        try_allocate_tutorial(tut, venues, tutorial_building_priority_order, convenience_factor);
        tut++;
    }

    return;
}