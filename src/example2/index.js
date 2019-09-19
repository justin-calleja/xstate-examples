const { Machine, assign, interpret } = require("xstate");
const readConfigMachine = require("./readConfigMachine");
const createConfigMachine = require("./createConfigMachine");

const mainMachine = Machine(
  {
    id: "mainMachine",
    initial: "readConfig",
    context: {
      config: null
    },
    states: {
      readConfig: {
        id: "readConfigMain",
        initial: "main",
        states: {
          main: {
            invoke: {
              src: readConfigMachine,
              onDone: [
                { target: "ok", cond: "ok" },
                { target: "noFile", cond: "noFile" },
                { target: "parseError", cond: "parseError" }
              ]
            }
          },
          ok: {
            entry: "handleOk",
            on: {
              "": "#mainMachine.part2"
            }
          },
          noFile: {
            entry: "handleNoFile",
            on: {
              "": "#mainMachine.createConfig"
            }
          },
          parseError: {
            entry: "handleParseError",
            on: {
              "": "#mainMachine.part2"
            }
          }
        }
      },
      createConfig: {
        id: "createConfig",
        initial: "main",
        states: {
          main: {
            invoke: {
              src: createConfigMachine,
              onDone: {
                target: "#mainMachine.part2",
                actions: "logConfigFileCreated"
              }
            }
          }
        }
      },
      part2: {
        entry: "handlePart2"
      }
    }
  },
  {
    actions: {
      handleOk: assign({
        config: (context, event) => event.data.config
      }),
      handleNoFile: context => {
        console.log("in handleNoFile with context:", context);
      },
      handleParseError: context => {
        console.log("in handleParseError with context:", context);
      },
      handlePart2: (context, event) => {
        console.log("in handlePart2 with context:", context, "event:", event);
      },
      logConfigFileCreated: () => console.log("config file created")
    },
    guards: {
      ok: (context, event) => {
        console.log("in main machine guard ok", context, event);
        return event.data.config instanceof Object;
      },
      noFile: (context, event) => {
        console.log("in main machine guard noFile", context, event);
        return event.data.error === "FileNotFound";
      },
      parseError: (context, event) => {
        console.log("in main machine guard parseError", context, event);
        return event.data.error === "JSONParseError";
      }
    }
  }
);

interpret(mainMachine).start();
