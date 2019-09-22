const { Machine, assign } = require("xstate");

const { readConfigMachine } = require("../readConfigMachine");

const withHandleReadConfig = (
  handleReadConfig,
  machine = readConfigMachine
) => {
  return machine.withConfig({
    actions: {
      handleReadConfig
    }
  });
};

const assignResult = result => assign({ result });

const parentMachineFactory = ({ child, onDone }) => {
  return Machine({
    id: "parent",
    initial: "main",
    context: {
      config: null
    },
    states: {
      main: {
        invoke: {
          src: child,
          onDone
        }
      },
      ok: {
        type: "final"
      }
    }
  });
};

module.exports = { parentMachineFactory, withHandleReadConfig, assignResult };
