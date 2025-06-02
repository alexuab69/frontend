import { FISH_BIT_TIMEOUT_MS, PULL_ROD_TIMEOUT_MS, ATTEMPTS_DIFFICULTY, DIFFICULTY_TO_FISH_SPEED } from './public/globals.js';
import ProgressBar from './progress_bar.js';
import CatchBar from './catch_bar.js';
import Fish from './fish.js';

function CatchingMinigame(finishCallback) {
  // inicializar variables locales, todas seran objetos
  let progressBar;
  let catchBar;
  let fish;

  return {
    start(difficulty) {
      // Especificar la velocidad
      const velocidad = DIFFICULTY_TO_FISH_SPEED[difficulty];

      // inicializar progressBar
      progressBar = ProgressBar(velocidad, () => {
        fish.finish(); // Stop the fish's internal timer
        finishCallback(); // Signal the end of the mini-game
      });

      // inicializar catchBar
      catchBar = CatchBar(() => {
        progressBar.catchBarSwappedDirection(
          catchBar.getInfo().direction,
          catchBar.getInfo().lastSwapAt,
          catchBar.getInfo().lastSwapPosition
        );
      });

      // inicializar Fish
      fish = Fish(velocidad, () => {
        progressBar.fishSwappedDirection(
          fish.getInfo().direction,
          fish.getInfo().lastSwapAt,
          fish.getInfo().lastSwapPosition
        );
      });

      // llamada a los metodos start de cada objeto
      progressBar.start();
      catchBar.start();
      fish.start();
    },

    // Llamar al getInfo de cada objeto y devolver el resultado
    getInfo() {
      return {
        progressBarInfo: progressBar.getInfo(),
        catchBarInfo: catchBar.getInfo(),
        fishInfo: fish.getInfo(),
      };
    },

    // actualiza newDirection
    updateCatchBarDirection(newDirection) {
      catchBar.updateDirection(newDirection);
    },
  };
}

export default CatchingMinigame;