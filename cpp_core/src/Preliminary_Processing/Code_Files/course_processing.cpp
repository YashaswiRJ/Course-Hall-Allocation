#include <vector>

#include "../../Data_Structures/Header_Files/ds.hpp"

/**
 * Splits a flat list of pre-processed Course objects into two separate lists:
 *   - One Lecture per course (every course has exactly one lecture slot).
 *   - One Tutorial per course, but only when tutorial_count > 0.
 */
std::pair<std::vector<Lecture>, std::vector<Tutorial>>
course_processing(std::vector<Course>& preprocessed_course_list)
{
    std::vector<Lecture>  lectures;
    std::vector<Tutorial> tutorials;

    lectures.reserve(preprocessed_course_list.size());

    for (const auto& course : preprocessed_course_list) {
        lectures.emplace_back(
            course.course_name,
            course.course_code,
            course.lecture_schedule,
            course.students_registered,
            course.is_modular,
            course.string_lecture_schedule
        );

        if (course.tutorial_count > 0) {
            tutorials.emplace_back(
                course.course_name,
                course.course_code,
                course.tutorial_schedule,
                course.students_registered,
                course.tutorial_count,
                course.is_modular,
                course.string_tutorial_schedule
            );
        }
    }

    return {std::move(lectures), std::move(tutorials)};
}