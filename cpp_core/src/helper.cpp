#include <vector>
#include <string>
#include <iostream>

std::vector<int> timeString_to_timeINT(std::string timeStr){
    std::vector<std::string> split_str;
    std::string temp;

    if(timeStr.back() != ',')timeStr.push_back(',');
    for(auto c: timeStr){
        if(c == ','){
            split_str.push_back(temp);
            temp.clear();
        } else {
            temp.push_back(c);
        }
    }
    
    std::vector<int> timeINT;
    for(auto str: split_str){
        int space_ind = -1;
        for(int ind = 0; ind < str.length(); ind++){
            if(str[ind] == ' '){
                space_ind = ind;
            }
        }
        if(space_ind == -1)continue;
        int start_hour = std::stoi(str.substr(space_ind+1, 2)); 
        int start_min = std::stoi(str.substr(space_ind+4, 2));
        int end_hour = std::stoi(str.substr(space_ind+7, 2));
        int end_min = std::stoi(str.substr(space_ind+10, 2));

        if((0 <= start_min) && (start_min <= 29)){
            start_min = 0;
        } else {
            start_min = 30;
        }

        if(end_min == 0){
            end_min  = 59;
            end_hour--;
        } else if((1 <= end_min) && (end_min <= 29)){
            end_min = 29;
        } else {
            end_min = 59;
        }
        
        std::vector<int> time_vec;
        int curr_hour = start_hour;
        int curr_min = start_min;
        while((curr_hour*100+curr_min) <= (end_hour*100+end_min)){
            time_vec.push_back(curr_hour*100 + curr_min);
            curr_min += 30;
            if(curr_min == 60){
                curr_min = 0;
                curr_hour ++;
            }
        }
    
        for(int i = space_ind-1; i>=0;){
            if(str[i] == 'M'){
                for(auto s_time: time_vec){
                    timeINT.push_back(s_time + 10000);
                }
                i--;
            } else if(str[i] == 'T'){
                for(auto s_time: time_vec){
                    timeINT.push_back(s_time + 20000);
                }
                i--;
            } else if(str[i] == 'W'){
                for(auto s_time: time_vec){
                    timeINT.push_back(s_time + 30000);
                }
                i--;
            } else if(str[i] == 'h'){
                if(i>0 && str[i-1] == 'T'){
                    for(auto s_time: time_vec){
                        timeINT.push_back(s_time + 40000);
                    }
                    i-=2;
                } else {
                    std::cerr << "Error Encountered while converting time to appropriate format\n";
                    break;
                }
            } else if(str[i] == 'F'){
                for(auto s_time: time_vec){
                    timeINT.push_back(s_time + 50000);
                }
                i--;
            } else {
                std::cerr << "Error Encountered while converting time to appropriate format\n";
                break;
            }
        }   
    }
    return timeINT;
}