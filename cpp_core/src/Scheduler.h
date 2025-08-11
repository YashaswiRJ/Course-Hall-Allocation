#ifndef SCHEDULER_H
#define SCHEDULER_H

#include "DataStructures.hpp"
#include <vector>

// This class contains the core logic for the scheduling algorithm.
class Scheduler {
public:
    // The main entry point for the algorithm.
    // It takes the parsed courses and halls, performs the allocation,
    // and returns a vector of successful assignments.
    std::vector<Assignment> run_greedy_scheduler(std::vector<Course>& courses, std::vector<LectureHall>& halls);

private:
    // A helper function to check if a specific hall is available for a
    // given day and time slot. It checks for any overlapping bookings.
    bool is_hall_available(const LectureHall& hall, Day day, const TimeSlot& required_slot);
};

#endif // SCHEDULER_H
