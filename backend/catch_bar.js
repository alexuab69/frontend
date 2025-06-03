import { CATCH_BAR_INITIAL_POSITION, computeCatchBarCurrentPosition } from './public/globals.js';

function CatchBar(swappedDirectionCallback, sendWebSocketMessage) {
  let lastSwapAt;
  let lastSwapPosition;
  let direction;

  return {
    start() {
      lastSwapAt = Date.now();
      lastSwapPosition = CATCH_BAR_INITIAL_POSITION;
      direction = "down";
      swappedDirectionCallback();

      sendWebSocketMessage?.('catchBarInfo', {
        direction,
        lastSwapAt,
        lastSwapPosition
      });
    },

    updateDirection(newDirection) {
      const now = Date.now();
      lastSwapPosition = computeCatchBarCurrentPosition(direction, lastSwapAt, lastSwapPosition);
      direction = newDirection;
      lastSwapAt = now;
      swappedDirectionCallback();

      sendWebSocketMessage?.('catchBarInfo', {
        direction,
        lastSwapAt,
        lastSwapPosition
      });
    },

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
