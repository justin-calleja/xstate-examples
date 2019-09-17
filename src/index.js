const { Machine, assign, interpret, send } = require("xstate");
const inquirer = require("inquirer");

const getUserInputMachine = Machine(
  {
    id: "getUserInputMachine",
    initial: "asking",
    context: {
      userInput: undefined,
      error: undefined
    },
    states: {
      asking: {
        invoke: {
          id: "askingService",
          src: "askForUserInputService",
          onDone: {
            target: "displayUserInput",
            actions: "handleDone"
          },
          onError: {
            target: "asking",
            actions: 'handleError'
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
      handleError: () => console.log('something went wrong...'),
      printSeparator: () => console.log("\n-------\n"),
      printUserInput: context => {
        const { userInput } = context;
        const parsedUserInput = userInput.split(",").map(l => l.trim());
        console.log(parsedUserInput.map(i => `- ${i}`).join("\n"));
      },
    },
    services: {
      askForUserInputService: (context, event) => {
        return askForUserInput("Input comma separated values:");
      }
    }
  }
);

async function askForUserInput(message) {
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
