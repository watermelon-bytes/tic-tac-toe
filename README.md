# Tic-Tac-Toe ❌⭕
browser game, using ML for an opponent 🤖

## Overview ℹ️

Tic-Tac-Toe is a browser-based implementation of the classic game, enhanced with a machine learning-powered opponent. The project is designed to provide an engaging and challenging experience for players, whether they are competing against the computer 💻 or testing their own strategies 🤔.

## Features ✨

- **Interactive Gameplay**: Play Tic-Tac-Toe directly in your browser 🌐 with a responsive and visually appealing interface 😍.
- **AI Opponent**: The computer opponent uses logic and machine learning techniques to make strategic moves 🧠.
- **Customizable Styles**: Choose between different visual themes for the game board and pieces 🎨.
- **Dynamic Game Board**: The game board adjusts dynamically to fit the screen size for an optimal user experience 📱.
- **Session Management**: Each game session is tracked, allowing for seamless gameplay and move validation ✅.

## How It Works ⚙️

1. **Frontend**: The game interface is built using HTML, CSS, and JavaScript. The game logic is implemented in `script.js`, which handles user interactions, game state updates, and rendering 🖼️.
2. **Backend**: A Flask-based server (`server.py`) manages game sessions, validates moves, and communicates with the AI logic 📡.
3. **AI Logic**: The opponent's moves are determined using the logic defined in `basic_logic.py`, which includes strategies for winning 🏆, blocking 🛡️, and random moves when no immediate strategy is available 🎲.

## Installation 🛠️

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/tic-tac-toe.git
    cd tic-tac-toe
    ```
2. Install the required Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3. Run the Flask server:
    ```bash
    python server.py
    ```
4. Open your browser and navigate to `http://127.0.0.1:3000` 🚀.

## File Structure 📂

- **`static/`**: Contains the JavaScript (`script.js`) and CSS files for the frontend 🖼️.
- **`templates/`**: Includes the HTML templates for the game interface 📝.
- **`server.py`**: The Flask server that handles game sessions and API endpoints 🌐.
- **`basic_logic.py`**: Implements the AI logic for the computer opponent 🤖.
- **`README.md`**: Documentation for the project 📖.

## Gameplay 🕹️

1. Start the game by clicking the "Play" button ▶️.
2. Choose your symbol (X or O) ❌⭕.
3. Take turns placing your symbol on the board. The AI will respond with its move 🤔.
4. The game ends when a player wins or the board is full (draw) 🤝.

## Future Enhancements 🚀

- **Improved AI**: Integrate advanced machine learning models for a more challenging opponent 🧠.
- **Multiplayer Mode**: Allow two players to compete online 🧑‍🤝‍🧑.
- **Custom Board Sizes**: Enable users to play on boards larger than 4x4 📏.
- **Mobile Optimization**: Enhance the user experience on mobile devices 📱.

## Contributing 🤝

Contributions are welcome! Feel free to submit issues or pull requests to improve the project 💡.

## License 📜

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgments 🙏

Special thanks to the developers and contributors who made this project possible 💖.
