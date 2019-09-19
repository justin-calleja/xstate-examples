const { Machine, assign, interpret, send } = require("xstate");
const inquirer = require("inquirer");

const askHowToPrintMachine = Machine(
  {
    id: "askHowToPrintMachine",
    initial: "asking",
    context: {
      userInput: undefined,
      error: undefined
    },
    states: {
      asking: {
        invoke: {
          src: "askHowToPrintService",
          onDone: "second"
        }
      },
      second: {}
    }
  },
  {
    services: {
      askHowToPrintService: (context, event) => {
        return askHowToPrint("Please select how to format output:", ['colors', 'list']);
      }
    }
  }
);

const getUserInputMachine = Machine(
  {
    id: "getUserInputMachine",
    initial: "askForCSVInput",
    context: {
      csvInput: undefined,
      error: undefined
    },
    states: {
      askForCSVInput: {
        invoke: {
          id: "askForCSVInput",
          src: "askForCSVInputService",
          onDone: {
            target: "askHowToPrint",
            actions: "handleDone"
          },
          onError: {
            target: "asking",
            actions: "handleError"
          }
        }
      },
      askHowToPrint: {
        invoke: {
          id: "askHowToPrint",
          src: askHowToPrintMachine,
          onDone: {
            target: "displayUserInput",
            actions: "handleDone"
          },
          onError: {
            target: "asking",
            actions: "handleError"
          }
        }
      },
      displayUserInput: {
        type: "final",
        entry: ["printSeparator", "printUserInput"]
      },
      failure: {
        on: {
          RETRY: "asking"
        }
      }
    }
  },
  {
    actions: {
      handleDone: assign({ userInput: (context, event) => event.data }),
      handleError: () => console.log("something went wrong..."),
      printSeparator: () => console.log("\n-------\n"),
      printUserInput: context => {
        const { userInput } = context;
        const parsedUserInput = userInput.split(",").map(l => l.trim());
        console.log(parsedUserInput.map(i => `- ${i}`).join("\n"));
      }
    },
    services: {
      askForCSVInputService: (context, event) => {
        return askForCSV("Input comma separated values:");
      }
    }
  }
);

const mainMachine = Machine({
  id: "mainMachine",
  initial: "asking",
  context: {
    // userInput: undefined,
    // error: undefined
  },
  states: {
    getUserInput: {
      invoke: {
        src: getUserInputMachine,
        onDone: "second"
      }
    },
    second: {}
  }
});

async function askForCSV(message) {
  const { result } = await inquirer.prompt({
    type: "input",
    message,
    name: "result"
  });
  return result.startsWith("fail")
    ? Promise.reject("nope")
    : Promise.resolve(result);
}

const getUserInputService = interpret(getUserInputMachine).start();

getUserInputService.onDone(() => {
  console.log("\nHere we go again...\n");
  interpret(getUserInputMachine).start();
});
