## Transportation Optimizer - Minimum Time to Transport All Individuals
A **web-based optimization and visualization system** that solves the problem _“Minimum Time to Transport All Individuals”_ under **dynamic environmental conditions**.  
Given `n` individuals with different crossing times, a vehicle with capacity `k`, and `m` environmental stages that multiply travel time, the system computes the **minimum total time** required to transport everyone from the left bank to the destination — or determines if the task is impossible.

## 🔗 Live Demo  
https://transportationoptimizer.netlify.app/


## 🧠Core Concept

The application uses an **optimized bitmask-based state search with Min-Heap priority queue (Dijkstra-style)** to explore all feasible forward and return trips.  
Unlike classical versions of the problem, this project introduces:

 - Dynamic environmental stages with time multipliers
 - Full reconstruction of the optimal solution path
 - Real-time visual animation of each transport step
 
## ✨Key Features
|Category|  Description|
|--|--|
| 🚀 Solver |Computes the minimum transport time or identifies infeasibility  |
|🔁 Reconstruction|Extracts step-by-step forward and return trips|
|🎬 Simulation|Real-time 2D transport animation|
|🌦 Scenarios|Flood (boat), Fire evacuation (fire truck), Mountain rescue (helicopter)|
|📱 Responsive|Works on both Desktop and Mobile|
|⚠ Validation|Detects invalid inputs and displays _Alert_ messages|

## 📁 Project Structure
```
Minimum-Time-to-Transport-All-Individuals
│
├── index.html           # Main HTML file – layout, scenario cards, forms, and containers
│                        # for visualization and results
│
├── CSS/
│   └── style.css        # Global styling, responsive layout, panels, buttons,
│                        # visualization and results panel design
│
├── JS/
│   ├── algorithm.js     # Core solver:
│   │                    #  - Bitmask & priority-queue (Dijkstra-style) algorithm
│   │                    #  - minTime(...)  → minimal total time
│   │                    #  - solveWithPath(...) → minimal time + step breakdown
│   │
│   └── index.js         # Front-end logic:
│                        #  - Reads and validates user input
│                        #  - Switches scenes (flood / fire / mountain)
│                        #  - Sets up D3 visualization (river, road, mountains)
│                        #  - Animates vehicle and individuals step-by-step
│                        #  - Updates HUD and Results panel
│
└── Images/              # Icons and visual assets (boat, fire truck, helicopter,
                         # weather icons, apartment, smoke, etc.)
```

 

## How to Run
No installation or external dependencies are required.

 - Download or clone the repository:
`` git clone https://github.com/EltonPajaziti/Minimum-Time-to-Transport-All-Individuals.git``

## 🛠️ Technologies Used
|  Technology| Purpose |
|--|--|
|  HTML5| Defines the structure of the web interface, layout, forms, UI panels, and container elements |
|CSS3|Provides responsive design, animations, panels, buttons, themes, and adaptive mobile layout|
|JavaScript (ES6)|Implements application logic, input validation, scene switching, animation control, and results processing|
|D3.js|Used to render the real-time transport visualization, including environment animation, movement of individuals, vehicle motion, and HUD updates|

## 📚 Academic Context
This application was developed as part of the Bachelor Thesis project at the Faculty of Electrical and Computer Engineering, University of Prishtina.  
The full thesis title is:

> **“Development of a Web Application for Solving and Graphically Visualizing the Minimum-Time Transport Problem for a Group of Individuals.”**


## 👤 Author
**Elton Pajaziti**  
 Bachelor Thesis — 2025  
