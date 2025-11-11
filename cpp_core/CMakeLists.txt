# Set the minimum required version of CMake.
cmake_minimum_required(VERSION 3.10)

# Set the project name.
project(ScheduleEngine)

# Set the C++ standard to C++17.
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Define the name of the executable file.
set(EXECUTABLE_NAME schedule_engine)

# Explicitly list ALL your source (.cpp) files.
# NOTE: helper.cpp has been removed as its code is now inline in helper.hpp
set(SOURCES
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

# Tell CMake where to find include files for the nlohmann/json library.
include_directories(helpers)

# Create the executable from the listed source files.
add_executable(${EXECUTABLE_NAME} ${SOURCES})

# Tell CMake where to find our project's own header files (e.g., ds.hpp).
target_include_directories(${EXECUTABLE_NAME} PUBLIC "src")

# On Windows, add the .exe extension automatically.
if(WIN32)
    set_target_properties(${EXECUTABLE_NAME} PROPERTIES SUFFIX ".exe")
endif()

# A message to show when configuration is done.
message(STATUS "Configuration complete. Run 'cmake --build .' to compile ${EXECUTABLE_NAME}")

