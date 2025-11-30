# Set the minimum required version of CMake.
cmake_minimum_required(VERSION 3.10)

# Set the project name.
project(ScheduleEngine)

# Set the C++ standard to C++17.
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Tell CMake where to find include files for the nlohmann/json library.
# Assuming 'helpers' contains json.hpp or similar
include_directories(helpers)

# --- Executable 1: Main Schedule Engine ---
set(MAIN_EXECUTABLE_NAME schedule_engine)

set(MAIN_SOURCES
    src/main.cpp
    src/ds.hpp
    src/allocation_logic.hpp
    src/allocate_lecture.hpp
    src/allocate_tutorial.hpp
    src/course_preprocessing.hpp
    src/course_processing.hpp
    src/venue_processing.hpp
    src/constraint_processing.hpp
    src/helper.hpp
    src/output_formatter.hpp
    src/ds.cpp
    src/allocation_logic.cpp
    src/allocate_lecture.cpp
    src/allocate_tutorial.cpp
    src/course_preprocessing.cpp
    src/course_processing.cpp
    src/venue_processing.cpp
    src/constraint_processing.cpp
    src/helper.cpp
    src/output_formatter.cpp
)

add_executable(${MAIN_EXECUTABLE_NAME} ${MAIN_SOURCES})
target_include_directories(${MAIN_EXECUTABLE_NAME} PUBLIC "src")

# --- Executable 2: Pingala Processor (New) ---
set(PINGALA_EXECUTABLE_NAME pingala_processor)

# This executable only needs the pingala source file 
# (and generic helpers if you include them inside pingala_processor.cpp)
set(PINGALA_SOURCES
    src/pingala_processor.cpp
)

add_executable(${PINGALA_EXECUTABLE_NAME} ${PINGALA_SOURCES})
target_include_directories(${PINGALA_EXECUTABLE_NAME} PUBLIC "src")


# --- OS Specific Configurations ---
if(WIN32)
    set_target_properties(${MAIN_EXECUTABLE_NAME} PROPERTIES SUFFIX ".exe")
    set_target_properties(${PINGALA_EXECUTABLE_NAME} PROPERTIES SUFFIX ".exe")
endif()