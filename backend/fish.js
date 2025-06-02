import { FISH_MAX_POS, computeFishCurrentPosition, computeFishTimeToNextSwap } from './public/globals.js';

function Fish(speed, swappedDirectionCallback) {
  // Local variables
  let lastSwapPosition;
  let lastSwapAt;
  let direction;
  let timerId;

  return {
    // Initializes local variables and starts the recursive timer
    start() {
      lastSwapPosition = Math.random() * FISH_MAX_POS;
      lastSwapAt = Date.now();
      direction = "down";
      swappedDirectionCallback();

      const swapDirection = () => {
        // Update the current position
        lastSwapPosition = computeFishCurrentPosition(direction, lastSwapAt, lastSwapPosition, speed);
        lastSwapAt = Date.now();

        // Swap direction
        direction = direction === "down" ? "up" : "down";
        swappedDirectionCallback();

        // Start a new timer
        const nextSwapTime = computeFishTimeToNextSwap(direction, lastSwapPosition, speed);
        timerId = setTimeout(swapDirection, nextSwapTime);
      };

      // Start the first timer
      const initialSwapTime = computeFishTimeToNextSwap(direction, lastSwapPosition, speed);
      timerId = setTimeout(swapDirection, initialSwapTime);
    },

    // Returns an object with the current state
    getInfo() {
      return {
        direction,
        lastSwapAt,
        lastSwapPosition,
      };
    },

    // Stops the recursive timer
    finish() {
      clearTimeout(timerId);
    },
  };
}

export default Fish;