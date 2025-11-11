#include <map>
#include <string>
#include <vector>
#include "ds.hpp"
#include "../helpers/json.hpp"

bool check_availability(std::unordered_map<int, int> &is_available, std::vector<int> &lecture_schedule){
    for(auto time: lecture_schedule){
        if(is_available[time] == 0)return false;
    }
    return true;
}

void try_allocation_lecture(std::vector<Lecture>::iterator lecture, std::map<std::string, std::vector<Venue>> &venues, std::vector<std::string> &lecture_building_priority_order, int convenience_factor){

    int convenient_size = (lecture->students_registered * (convenience_factor + 100))/100;
        
    for(auto priority: lecture_building_priority_order){
        auto venue = lower_bound(venues[priority].begin(), venues[priority].end(), convenient_size, [](const Venue& v, int size) {return v.capacity < size;});

        while(true){
            if(venue == venues[priority].end())break;
                
                //check_logic if the venue can be given to the lecture
            if(check_availability(venue->is_available, lecture->lecture_schedule)){
                lecture->assignLectureHall(venue->hall_name);
                venue->assignLecture(*lecture);
                break;
            }
            venue++;
        }

        if(lecture->assignment.empty()){
            venue = lower_bound(venues[priority].begin(), venues[priority].end(), convenient_size, [](const Venue& v, int size) {
            return v.capacity < size;});
            if(venue != venues[priority].begin()){
                venue--;
                while(true){
                    if(venue->capacity < lecture->students_registered)break;

                    if(check_availability(venue->is_available, lecture->lecture_schedule)){
                        lecture->assignLectureHall(venue->hall_name);
                        venue->assignLecture(*lecture);
                        break;
                    }

                    if(venue == venues[priority].begin())break;
                        venue--;
                }
            }
        }
        if(!lecture->assignment.empty())break;
    }
}