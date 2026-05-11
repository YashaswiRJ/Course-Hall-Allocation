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
    src/Data_Structures/Header_Files/ds.hpp
    src/Allocation_Strategy/Header_Files/allocation_logic.hpp
    src/Allocation_Strategy/Header_Files/allocate_lecture.hpp
    src/Allocation_Strategy/Header_Files/allocate_tutorial.hpp
    src/Preliminary_Processing/Header_Files/course_preprocessing.hpp
    src/Preliminary_Processing/Header_Files/course_processing.hpp
    src/Preliminary_Processing/Header_Files/venue_processing.hpp
    src/Preliminary_Processing/Header_Files/constraint_processing.hpp
    src/Utils/Header_Files/helper.hpp
    src/Output_Formatter/Header_Files/output_formatter.hpp
    src/Data_Structures/Code_Files/ds.cpp
    src/Allocation_Strategy/Code_Files/allocation_logic.cpp
    src/Allocation_Strategy/Code_Files/allocate_lecture.cpp
    src/Allocation_Strategy/Code_Files/allocate_tutorial.cpp
    src/Preliminary_Processing/Code_Files/course_preprocessing.cpp
    src/Preliminary_Processing/Code_Files/course_processing.cpp
    src/Preliminary_Processing/Code_Files/venue_processing.cpp
    src/Preliminary_Processing/Code_Files/constraint_processing.cpp
    src/Utils/Code_Files/helper.cpp
    src/Output_Formatter/Code_Files/output_formatter.cpp
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