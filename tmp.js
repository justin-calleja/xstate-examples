const inquirer = require("inquirer");

const QUIT = "quit";
const TURN_OFF_VERBOSE = "turn OFF verbose";
const TRUN_ON_VERBOSE = "turn ON verbose";

// https://github.com/SBoudrias/Inquirer.js/issues/293
class SignalRef {
  constructor(signal, handler) {
    this.signal = signal;
    this.handler = handler;

    process.on(this.signal, this.handler);

    // This will run a no-op function every 10 seconds.
    // This is to keep the event loop alive, since a
    // signal handler otherwise does _not_. This is the
    // fundamental difference between using `process.on`
    // directly and using a SignalRef instance.
    this.interval = setInterval(() => {}, 10000);
  }

  unref() {
    clearInterval(this.interval);
    process.removeListener(this.signal, this.handler);
  }
}

async function askForUserInput(message) {
  const { result } = await inquirer.prompt({
    type: "input",
    message,
    name: "result"
  });
  return result;
}

async function askForChoice(message) {
  const { option } = await inquirer.prompt({
    type: "list",
    choices: [TRUN_ON_VERBOSE, TURN_OFF_VERBOSE, QUIT],
    message,
    name: "option"
  });
  return option;
}

let verbose = false;
let userInSigintMenu = false;

const handleSigint = () => {
  if (userInSigintMenu) {
    process.exit(0);
  }

  userInSigintMenu = true;

  (async () => {
    const choice = await askForChoice(
      "What do you want to do? (Press Ctr-C again to quit the program)"
    );
    userInSigintMenu = false;
    if (choice === QUIT) {
      sigintRef.unref();
      process.exit(0);
    } else if (choice === TRUN_ON_VERBOSE && verbose === false) {
      verbose = true;
      console.log("verbose is ON");
    } else if (choice === TURN_OFF_VERBOSE && verbose === true) {
      verbose = false;
      console.log("verbose is OFF");
    }
    main();
  })();
};

async function main() {
  const userInput = await askForUserInput("your input:");
  if (verbose) {
    console.log("your input was:", userInput);
  }
  process.exit(0);
}

const sigintRef = new SignalRef("SIGINT", handleSigint);

main();
