import { CATCH_BAR_INITIAL_POSITION, computeCatchBarCurrentPosition } from './public/globals.js'

function CatchBar(swappedDirectionCallback) {
    // Local variables
    let lastSwapAt;
    let lastSwapPosition;
    let direction;
  
    return {
      // Initializes local variables and calls the callback
      start() {
        lastSwapAt = Date.now();
        lastSwapPosition = CATCH_BAR_INITIAL_POSITION;
        direction = "down";
        swappedDirectionCallback();
      },
  
      // Updates direction, lastSwapAt, and lastSwapPosition
      updateDirection(newDirection) {
        const now = Date.now();
        lastSwapPosition = computeCatchBarCurrentPosition(direction, lastSwapAt, lastSwapPosition);
        direction = newDirection;
        lastSwapAt = now;
        swappedDirectionCallback();
      },
  
      // Returns an object with the current state
      getInfo() {
        return {
          direction,
          lastSwapAt,
          lastSwapPosition,
        };
      },
    };
  }
  export default CatchBar;