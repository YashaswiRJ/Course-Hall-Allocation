# Set the minimum required version of CMake.
cmake_minimum_required(VERSION 3.10)

# Set the project name.
project(ScheduleEngine)

# Set the C++ standard to C++17. This is a good modern standard.
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Define the name of the executable file that will be created.
# This is the file your Node.js server will run.
set(EXECUTABLE_NAME schedule_engine)

# Find all our source files in the src/ directory.
# It's better to explicitly list the files for clarity and to avoid issues
# if other files are added to the directory.
set(SOURCES
    src/main.cpp
    src/InputParser.cpp
    src/Scheduler.cpp
)

# --- Include the nlohmann/json library ---
# For a header-only library like this, we just need to tell CMake
# where to find the header files. We'll assume json.hpp is in a 'helpers'
# directory alongside your 'src' directory.
include_directories(helpers)

# Create the executable by linking our source files.
add_executable(${EXECUTABLE_NAME} ${SOURCES})

# Tell CMake where to find our header files.
target_include_directories(${EXECUTABLE_NAME} PUBLIC "src")

# On Windows, add the .exe extension automatically.
if(WIN32)
    set_target_properties(${EXECUTABLE_NAME} PROPERTIES SUFFIX ".exe")
endif()

# A message to show when configuration is done.
message(STATUS "Configuration complete. Executable will be named: ${EXECUTABLE_NAME}")