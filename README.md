# Course Hall Allocation

A comprehensive solution for managing and allocating lecture halls for university courses. This project utilizes a Node.js backend, a React frontend, and a high-performance C++ core for complex allocation logic.

***

## ⚙️ Architecture and Data Flow

The application follows a simple, robust data flow:

1.  **Data Input:** The user inputs course and hall information on the frontend. This data is stored in the browser's `localStorage` as a JSON object.
2.  **API Call:** When the user clicks the **"Generate Schedule"** button, the frontend sends the JSON data to the backend via an API call.
3.  **Core Logic Execution:** The backend receives the JSON data and invokes the pre-compiled C++ executable, `schedule_engine`. It passes the JSON data as an input string to this executable.
4.  **Schedule Generation:** The C++ core processes the data and generates an optimized schedule. It returns this schedule to the backend as a JSON formatted string.
5.  **Response:** The backend sends the resulting JSON string back to the frontend, which then displays the generated schedule to the user.

***

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following software installed on your machine:
* Node.js and npm
* Git
* CMake and a C++ compiler (like GCC/g++)

### Installation and Setup

1.  **Clone the Repository**
    Open your terminal and run the following command to clone the project:
    ```bash
    git clone [https://github.com/YashaswiRJ/Course-Hall-Allocation.git](https://github.com/YashaswiRJ/Course-Hall-Allocation.git)
    cd Course-Hall-Allocation
    ```

2.  **Firebase Database Integration (Crucial Step!)**
    For security reasons, the Firebase Admin SDK configuration file (`firebase-admin.json`) is not included in the repository. You must obtain this file separately and place it inside the `backend` directory.

    * **Action:** Place your `firebase-admin.json` file in the `Course-Hall-Allocation/backend/` directory.

    > **Note:** The application requires an active internet connection to communicate with the Firebase database.

3.  **Run the Backend Server**
    Navigate to the backend directory, install dependencies, and start the server.
    ```bash
    cd backend/
    npm install
    npx nodemon server.js
    ```
    > **Recommendation:** We suggest using `nodemon` as it automatically restarts the server if it crashes, reducing manual effort. However, `npx node server.js` will also work.

4.  **Run the Frontend Application**
    Open a **new terminal window**, navigate to the frontend directory, install dependencies, and start the development server.
    ```bash
    cd frontend/
    npm install
    npm start
    ```
    The application should now be running on your local machine.

***

## 🔧 C++ Core Development

If you need to make changes to the C++ allocation logic located in `cpp_core/src/`, you must recompile the code to generate an updated executable.

### Compiling the C++ Core

1.  Navigate to the `build` directory within `cpp_core`:
    ```bash
    cd cpp_core/build
    ```
2.  Run CMake to check for dependencies and configure the build:
    ```bash
    cmake ..
    ```
3.  Compile the source files and build the executable:
    ```bash
    cmake --build .
    ```
    This will update the executable based on your code changes and operating system.

### Debugging the C++ Core

The Node.js backend communicates with the C++ executable via standard streams (`stdout`). For debugging purposes, you can redirect the `stdout` of the C++ program to a file to inspect its output.

The `main` function in the C++ source contains commented-out code to enable this. To use it, simply uncomment the relevant lines in the C++ code. This will write all output to `outputYASH.txt` inside the `backend` directory, allowing you to view logs and debug information without interfering with the server.

> For more detailed knowledge of how JSON and other data structures are handled, refer to the documentation of the C++ libraries being used.

***

## ⚠️ Troubleshooting

### Fixing Frontend/Backend Communication Errors

If the frontend and backend are not communicating correctly, it may be due to a hardcoded IP address. You may need to update the network address to match your machine's local IP.

* **Action:** Find any instances of `localhost` or a hardcoded IP like `172.27.5.210` in the files listed below and replace them with your machine's current local IP address.

* **Files to check:**
    1.  `backend/server.js`
    2.  `frontend/src/Components/lectureHallManager.jsx`
    3.  `frontend/src/services/apiServices.js`

> **Tip:** You can find your local IP address by running `ipconfig` on Windows or `ifconfig` / `ip addr` on macOS/Linux.

### Fixing a Corrupted C++ Build

In case the C++ core executable gets corrupted or enters an infinite loop, it is best to perform a clean rebuild.

1.  Navigate to the `cpp_core` directory:
    ```bash
    cd cpp_core
    ```
2.  Recursively delete the entire `build` folder:
    ```bash
    rm -rf build/
    ```
3.  Recreate the build directory and navigate into it:
    ```bash
    mkdir build
    cd build
    ```
4.  Re-run the compilation steps:
    ```bash
    cmake ..
    cmake --build .
    ```
