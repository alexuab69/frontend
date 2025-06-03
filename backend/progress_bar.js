import {
  PROGRESS_BAR_INITIAL_POSITION,
  PROGRESS_BAR_TICK_FREQUENCY,
  timeForProgressBarToReachLimit,
  computeCatchBarCurrentPosition,
  computeFishCurrentPosition,
  computeProgressBarCurrentPosition,
  catchBarAndFishTouch,
} from './public/globals.js';

function ProgressBar(fishSpeed, finishCallback, sendWebSocketMessage) {
  let lastSwapPosition;
  let lastSwapAt;
  let direction;
  let state;
  let fishInfo = {};
  let catchBarInfo = {};
  let t1, t2;

  return {
    start() {
      lastSwapPosition = PROGRESS_BAR_INITIAL_POSITION;
      lastSwapAt = Date.now();
      direction = "down";
      state = "in_progress";

      const updateState = () => {
        state = direction === "up" ? "successful" : "failed";
        clearTimeout(t2);
        finishCallback();

        sendWebSocketMessage?.('progressBarInfo', {
          direction,
          lastSwapAt,
          lastSwapPosition,
          state
        });
      };

      const checkInteractions = () => {
        const catchBarPosition = computeCatchBarCurrentPosition(
          catchBarInfo.direction,
          catchBarInfo.lastSwapAt,
          catchBarInfo.lastSwapPosition
        );

        const fishPosition = computeFishCurrentPosition(
          fishInfo.direction,
          fishInfo.lastSwapAt,
          fishInfo.lastSwapPosition,
          fishSpeed
        );

        if (
          (direction === "down" && catchBarAndFishTouch(fishPosition, catchBarPosition)) ||
          (direction === "up" && !catchBarAndFishTouch(fishPosition, catchBarPosition))
        ) {
          lastSwapPosition = computeProgressBarCurrentPosition(direction, lastSwapAt, lastSwapPosition);
          direction = direction === "down" ? "up" : "down";
          lastSwapAt = Date.now();

          sendWebSocketMessage?.('progressBarInfo', {
            direction,
            lastSwapAt,
            lastSwapPosition,
            state
          });

          clearTimeout(t1);
          t1 = setTimeout(updateState, timeForProgressBarToReachLimit(direction, lastSwapPosition));
        }

        t2 = setTimeout(checkInteractions, PROGRESS_BAR_TICK_FREQUENCY);
      };

      t1 = setTimeout(updateState, timeForProgressBarToReachLimit(direction, lastSwapPosition));
      t2 = setTimeout(checkInteractions, PROGRESS_BAR_TICK_FREQUENCY);
    },

    fishSwappedDirection(fishDirection, fishLastSwapAt, fishLastSwapPosition) {
      fishInfo = { direction: fishDirection, lastSwapAt: fishLastSwapAt, lastSwapPosition: fishLastSwapPosition };
    },

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
