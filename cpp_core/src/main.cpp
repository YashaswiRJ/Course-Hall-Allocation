#include <iostream>
#include <string>
#include <io.h>      // for _dup2, _close
#include <fcntl.h>   // for _open
#include <cstdlib>
#include "../helpers/json.hpp" // Make sure this path is correct

// for convenience
using json = nlohmann::json;

int main() {
    // The C++ program will now wait for input from stdin
    // instead of looking for a file argument.
    json j;

    int fd = _open("outputYASH.txt", _O_WRONLY | _O_CREAT | _O_TRUNC, 0644);
    if (fd < 0) {
        perror("open");
        exit(1);
    }

    // Redirect stdout (1) to the file descriptor
    if (_dup2(fd, 1) < 0) {
        perror("dup2");
        _close(fd);
        exit(1);
    }
    
    _close(fd);

    try {
        // Read directly from the standard input stream (std::cin)
        std::cin >> j;

        // --- Your verification logic starts here ---
        // This part just prints what it received to confirm it's working.
        
        // Use std::cout for normal output that Node.js will capture.
        std::cout << "🚀 C++ program received and parsed JSON successfully!\n";
        std::cout << "✅ Received Data:\n" << j.dump(4) << "\n";

        // Example: Check for a specific key to prove it's working
        if (j.contains("courseData") && j.at("courseData").is_array()) {
            std::cout << "📚 Found courses array with " << j.at("courseData").size() << " items.\n";
        }
        
        // In the future, you will return your final schedule JSON here.
        // For now, we're just confirming receipt.
        
    } catch (const std::exception& e) {
        // Use std::cerr for errors. Node.js will capture this in the 'stderr' event.
        std::cerr << "JSON parse error in C++: " << e.what() << "\n";
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}