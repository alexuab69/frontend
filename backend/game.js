import { FISH_BIT_TIMEOUT_MS, PULL_ROD_TIMEOUT_MS, ATTEMPTS_DIFFICULTY } from './public/globals.js';
import CatchingMinigame from './catching_minigame.js';
function Game(sendWebSocketMessage) {
  let playerState = "standing";
  let attemptNumber = 0;
  // Catching minigame. se inicializa llamando a CatchingMinigame. Su callback se ejecuta cuando minigame termina y devuelve el standing
  let catchingMinigame = CatchingMinigame(() => {
    playerState = "standing";
  }, sendWebSocketMessage);

  // setTimeout que controlan cuando muerde y cuando escapa.
  let fishBiteTimer, fishEscapeTimer;

  //waitForBitePromise, resolveWaitForBite, rejectWaitForBite: Se usan para manejar
  // la interacción con el frontend. El frontend llama al endpoint 
  ///wait_for_bite, y esta promesa se resuelve o rechaza dependiendo de si el pez muerde o no.
  let waitForBitePromise, resolveWaitForBite, rejectWaitForBite;

  return {
    // se llama con el endpoint /cast_line
    // inicia un contador, el pez pica y se muestra el botón de start. Se llama al endpoint /wait_for_bite
    // inicia otro contador para que el pez escape, si escapa se vuelve al estado de standing
    castLine() {
      if (playerState !== "standing") {
        return playerState; // Return error si no esta de pie
      }
      // tira la caña
      playerState = "line_cast";

      // primer contador
      fishBiteTimer = setTimeout(() => {
        playerState = "fish_bit";

        // resuelve la promesa creada en waitForBite notificando al frontend de que ha mordido el pez
        if (resolveWaitForBite) resolveWaitForBite();

        // segundo contador para que el pez escape. Vuelve a estado inicial
        fishEscapeTimer = setTimeout(() => {
          playerState = "standing";
        }, PULL_ROD_TIMEOUT_MS);
      }, FISH_BIT_TIMEOUT_MS);

      return null; // Line successfully cast
    },

    // llamado por el endpoint /wait_for_bite
    waitForBite() {
      if (playerState !== "line_cast") { // Si no esta en line_cast devuelve error
        return Promise.reject(playerState); 
      }

      // Crea la promesa, esta se guarda en waitForBitePromise.
      // También se guardan las funciones resolve... reject... para usarlas más adelante
      waitForBitePromise = new Promise((resolve, reject) => {
        resolveWaitForBite = resolve; // Si pica
        rejectWaitForBite = reject; // Si recoje la caña antes de que pique (reelIN)
      });
      // devuelve la promesa
      return waitForBitePromise;
    },

    // Se llama con el endpoint /reel_in. Frontend lo llama cuando se hace click en start
    reelIn() {
      // Si no ha picado aun
      if (playerState === "line_cast") {
        playerState = "standing";

        // Reject the waitForBite promise
        if (rejectWaitForBite) rejectWaitForBite();

        // Clear the fish bite timer
        clearTimeout(fishBiteTimer);

        // Devuelve el código de error esperado
        return { errorCode: "line_cast" }; //Debe devolver standing pero funciona con line_cast
      }
      // Si ha picado
      if (playerState === "fish_bit") {
        playerState = "playing_minigame";
        // Ejecutar metodo start del objeto catchingMinigame
        const selectedDifficulty = ATTEMPTS_DIFFICULTY[attemptNumber];
        catchingMinigame.start(selectedDifficulty);

        attemptNumber = (attemptNumber + 1) % ATTEMPTS_DIFFICULTY.length; // Ha de volver a 0 cuando se llega al maximo


        // Cancela el segundo contador para que el pez escape. 
        clearTimeout(fishEscapeTimer);

        return { difficulty: selectedDifficulty };

      }

      return { errorCode: playerState }; // fail to startt
    },

    // llamado por el endpoint /move_catch_bar_up y /stop_moving_catch_bar_up
    updateCatchBarDirection(newDirection) {
      catchingMinigame.updateCatchBarDirection(newDirection);
    },

    // llamado por el endpoint /get_mini
    getCatchingMiniGameInfo() {
      return catchingMinigame.getInfo();
    },
  };
}

export default Game;