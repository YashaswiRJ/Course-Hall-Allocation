#include <vector>
#include <string>
#include <map>
#include <unordered_map>
#include "ds.hpp"

bool check_availibility(std::unordered_map<int, int> &is_available, std::vector<int> &tutor_schedule){
    for(auto time: tutor_schedule){
        if(is_available[time] == 0)return false;
    }
    return true;
}

void core_tutorial_allocation_logic(std::vector<Tutorial> &tutorials, std::map<std::string, std::vector<Venue>> &venues, std::vector<std::string> &tutorial_building_priority_order, int convenience_factor){

    std::sort(tutorials.begin(), tutorials.end(), Tutorial::compareByTutorialCount);

    for(auto tutorial: tutorials){
        int convenient_size = ((tutorial.students_registered) * ((convenience_factor + 100)/100))/(tutorial.tutorial_count);

        for(auto priority: tutorial_building_priority_order){
            auto venue = lower_bound(venues[priority].begin(), venues[priority].end(), convenient_size, [](const Venue& v, int size) {
            return v.capacity < size;});

            while(true){
                auto check_venue = venue;

                int tutorial_found = 0;
                while(tutorial_found < tutorial.tutorial_count){
                    if(check_venue == venues[priority].end())break;
                    if(check_availibility(venue->is_available, tutorial.tutoial_schedule)){
                        tutorial_found++;
                    }
                    check_venue++;
                }

                if(tutorial_found < tutorial.tutorial_count){
                    check_venue = venue;
                    while(tutorial_found < tutorial.tutorial_count){
                        if(check_venue == venues[priority].begin())break;
                        check_venue--;
                        if(venue->capacity >= convenience_factor){
                            tutorial_found++;
                        }
                    }
                    if(tutorial_found = tutorial.tutorial_count){
                        venue = check_venue;
                    }
                }

                if(tutorial_found == tutorial.tutorial_count){
                    int tutorial_allocated = 0;
                    auto assign_venue = venue;
                    while(tutorial_allocated < tutorial.tutorial_count){
                        if(check_availibility(venue->is_available, tutorial.tutoial_schedule)){
                            tutorial.assignTutorialHall(venue->hall_name);
                            venue->assignTutorial(tutorial);
                        }
                    }
                    break;
                }
            }

            if(!tutorial.assignment.empty()){
                break;
            }
        }
    }    
    return;   
}