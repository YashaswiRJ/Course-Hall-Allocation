#include <algorithm>
#include <map>
#include <string>
#include <vector>

#include "../../Data_Structures/Header_Files/ds.hpp"
#include "../../Utils/Header_Files/helper.hpp"

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

namespace {

// Returns true when the "Modular Course" field equals the given part number
// (accepts both numeric and string representations).
bool isModularPart(const nlohmann::json& entry, int part) {
    if (!entry.contains("Modular Course")) return false;

    const auto& field = entry.at("Modular Course");
    if (field.is_number())
        return field.get<int>() == part;
    if (field.is_string())
        return field.get<std::string>() == std::to_string(part);

    return false;
}

// Parsed representation of a single JSON course entry.
struct ParsedCourseEntry {
    std::string course_code;
    std::string course_name;
    std::vector<int> lecture_schedule;
    std::vector<int> tutorial_schedule;
    std::string string_lecture_schedule;
    std::string string_tutorial_schedule;
    int  students_registered = 0;
    int  tutorial_count      = 0;
};

// Extracts all common fields shared between first-half and second-half modular
// entries (and plain entries).  Returns the filled struct.
ParsedCourseEntry parseCourseEntry(const nlohmann::json& entry) {
    ParsedCourseEntry parsed;

    if (entry.contains("Course Name"))
        parsed.course_name = entry.at("Course Name").get<std::string>();

    if (entry.contains("Course Code"))
        parsed.course_code = entry.at("Course Code").get<std::string>();

    // Append section suffix when a non-empty section is present.
    if (entry.contains("Sections")) {
        const std::string section = entry.at("Sections").get<std::string>();
        if (!section.empty())
            parsed.course_code += "_" + section;
    }

    if (entry.contains("Lecture Schedule")) {
        const std::string raw = entry.at("Lecture Schedule").get<std::string>();
        parsed.lecture_schedule = timeString_to_timeINT(raw);
        std::sort(parsed.lecture_schedule.begin(), parsed.lecture_schedule.end());
        parsed.string_lecture_schedule = raw;
    }

    if (entry.contains("Tutorial Schedule")) {
        const std::string raw = entry.at("Tutorial Schedule").get<std::string>();
        parsed.tutorial_schedule = timeString_to_timeINT(raw);
        std::sort(parsed.tutorial_schedule.begin(), parsed.tutorial_schedule.end());
        parsed.string_tutorial_schedule = raw;
    }

    if (entry.contains("Students Registered") && entry.at("Students Registered").is_number())
        parsed.students_registered = entry.at("Students Registered").get<int>();

    if (entry.contains("Tutorial Count") && entry.at("Tutorial Count").is_number())
        parsed.tutorial_count = entry.at("Tutorial Count").get<int>();

    return parsed;
}

} // anonymous namespace

// ─────────────────────────────────────────────────────────────────────────────
// Public interface
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pre-processes raw JSON course data into Course objects.
 *
 * Modular courses are handled in two passes:
 *   - Part 1 entries are inserted into the output list and their list index is
 *     recorded so that Part 2 entries can be merged into them later.
 *   - Part 2 entries are deferred until all Part 1 entries have been processed.
 *
 * Courses with fewer than 10 registered students are excluded from allocation
 * and collected in `lowStrengthCourses` instead (per senate policy).
 */
std::vector<Course> course_preprocessing_function(
    std::vector<nlohmann::json>& course_list,
    std::vector<nlohmann::json>& lowStrengthCourses)
{
    std::vector<Course>           result;
    std::map<std::string, int>    modular_part1_index;  // course_code → index in result
    std::vector<nlohmann::json>   deferred_part2;

    // ── Pass 1: process all non-modular and modular-part-1 entries ────────────
    for (const auto& entry : course_list) {

        // Defer modular-part-2 entries; they must be merged after all part-1s.
        if (isModularPart(entry, 2)) {
            deferred_part2.push_back(entry);
            continue;
        }

        ParsedCourseEntry parsed = parseCourseEntry(entry);

        // Exclude courses below the senate-mandated minimum enrolment.
        if (parsed.students_registered < 10) {
            lowStrengthCourses.push_back(entry);
            continue;
        }

        bool is_modular = isModularPart(entry, 1);
        if (is_modular)
            modular_part1_index[parsed.course_code] = static_cast<int>(result.size());

        result.emplace_back(
            parsed.course_code,
            parsed.course_name,
            parsed.lecture_schedule,
            parsed.tutorial_schedule,
            parsed.tutorial_count,
            parsed.students_registered,
            is_modular,
            parsed.string_lecture_schedule,
            parsed.string_tutorial_schedule
        );
    }

    // ── Pass 2: merge or append deferred modular-part-2 entries ─────────────
    for (const auto& entry : deferred_part2) {
        ParsedCourseEntry parsed = parseCourseEntry(entry);

        if (parsed.students_registered < 10) {
            lowStrengthCourses.push_back(entry);
            continue;
        }

        if (entry.contains("Modular Binding")) {
            const std::string binding_code = entry.at("Modular Binding").get<std::string>();
            auto it = modular_part1_index.find(binding_code);

            if (it != modular_part1_index.end()) {
                // Merge into the matching part-1 entry.
                Course& parent = result[it->second];
                parent.Append_course_code("#" + parsed.course_code);
                parent.Append_course_name("#" + parsed.course_name);
                parent.Update_max_registered_students(parsed.students_registered);
                parent.Update_max_tutorial_count(parsed.tutorial_count);
            }
            // If the binding key is not found, the entry is silently dropped
            // (the part-1 counterpart was likely below minimum strength).

        } else {
            // No binding specified — treat as a standalone modular course.
            result.emplace_back(
                "#" + parsed.course_code,
                "#" + parsed.course_name,
                parsed.lecture_schedule,
                parsed.tutorial_schedule,
                parsed.tutorial_count,
                parsed.students_registered,
                /*is_modular=*/true,
                parsed.string_lecture_schedule,
                parsed.string_tutorial_schedule
            );
        }
    }

    return result;
}