import {
  PROGRESS_BAR_INITIAL_POSITION,
  PROGRESS_BAR_TICK_FREQUENCY,
  timeForProgressBarToReachLimit,
  computeCatchBarCurrentPosition,
  computeFishCurrentPosition,
  computeProgressBarCurrentPosition,
  catchBarAndFishTouch,
} from './public/globals.js';


function ProgressBar(fishSpeed, finishCallback) {
  // Local variables
  let lastSwapPosition;
  let lastSwapAt;
  let direction;
  let state;
  let fishInfo = {};
  let catchBarInfo = {};
  let t1, t2;

  return {
    start() {
      // Inicializar variables
      lastSwapPosition = PROGRESS_BAR_INITIAL_POSITION;
      lastSwapAt = Date.now();
      direction = "down";
      state = "in_progress";
      
      // función que irá llamando el t1
      const updateState = () => {
        if (direction === "up") {
          state = "successful";
        } else {
          state = "failed";
        }
        clearTimeout(t2);
        finishCallback();
      };
    
      // Función a ejecutar con t2
      const checkInteractions = () => 
        {
        // Obtener la posición actual del catch bar
        const catchBarPosition = computeCatchBarCurrentPosition(
          catchBarInfo.direction,
          catchBarInfo.lastSwapAt,
          catchBarInfo.lastSwapPosition
        );

        // Obtener la posicición del pez/cangrejo/lo que sea 
        const fishPosition = computeFishCurrentPosition(
          fishInfo.direction,
          fishInfo.lastSwapAt,
          fishInfo.lastSwapPosition,
          fishSpeed
        );

        // Cuando la progress bar baje y tanto el pez como el catchbar se tocan:
        // - Modificar lastSwapPosition
        // - Cambiar de dirección
        // - resetear el t1, que vaya llamando al update state y la frecuencia la dicta timeForProgressBarToReachLimit
        if (
          (direction === "down" && catchBarAndFishTouch(fishPosition, catchBarPosition)) ||
          (direction === "up" && !catchBarAndFishTouch(fishPosition, catchBarPosition))
        ) {
          lastSwapPosition = computeProgressBarCurrentPosition(
            direction,
            lastSwapAt,
            lastSwapPosition
          );
          direction = direction === "down" ? "up" : "down";
          lastSwapAt = Date.now();

          clearTimeout(t1);
          t1 = setTimeout(updateState, timeForProgressBarToReachLimit(direction, lastSwapPosition));
        }
        // Reiniciar t2 
        // clearTimeout(t2); // No estoy seguro
        t2 = setTimeout(checkInteractions, PROGRESS_BAR_TICK_FREQUENCY);
      };

      t1 = setTimeout(updateState, timeForProgressBarToReachLimit(direction, lastSwapPosition));
      t2 = setTimeout(checkInteractions, PROGRESS_BAR_TICK_FREQUENCY);
    },

    // Se llama cada vez que el pez cambia de dirección
    fishSwappedDirection(fishDirection, fishLastSwapAt, fishLastSwapPosition) {
      fishInfo = { direction: fishDirection, lastSwapAt: fishLastSwapAt, lastSwapPosition: fishLastSwapPosition };
    },

    // Se llama cada vez que el swapbar cambia de dirección
    catchBarSwappedDirection(catchBarDirection, catchBarLastSwapAt, catchBarLastSwapPosition) {
      catchBarInfo = { direction: catchBarDirection, lastSwapAt: catchBarLastSwapAt, lastSwapPosition: catchBarLastSwapPosition };
    },


    getInfo() {
      return {
        direction,
        lastSwapAt,
        lastSwapPosition,
        state,
      };
    },
  };
}

export default ProgressBar;