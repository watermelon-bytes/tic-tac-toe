// script.ts - the main script 
//------------IMPORTS-ARE-HERE------------------------------
import Game from "./game.js";
import { createPlayButton } from "./utils.js";
//import { gothic, classical } from "./utils.js"; // Uncomment if you want to change game style 
//----------------------------------------------------------
var gameInstance;
window.onload = function () {
    gameInstance = new Game();
    createPlayButton();
    let playButton = document.getElementById('playbutton');
    playButton?.addEventListener('click', () => {
        gameInstance.startGame().catch(console.error);
    });
    playButton ? document.body.appendChild(playButton) : console.error('Error: Cannot find the neccessary elements in DOM.');
};
//# sourceMappingURL=script.js.map