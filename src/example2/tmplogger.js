const { Machine, send, assign, spawn, interpret } = require("xstate");
const {
  readConfigMachine,
  okTransitionCreator,
  noFileTransitionCreator
} = require("./readConfigMachine");
const { createConfigMachine } = require("./createConfigMachine");

const loggerMachine = Machine(
  {
    id: "logger",
    initial: "standBy",
    context: {
      verbose: false
    },
    states: {
      standBy: {
        on: {
          LOG: { internal: true, actions: "logMsg" }
        }
      }
    }
  },
  {
    actions: {
      logMsg: (context, event) => {
        console.log("in logMsg with context:", context, "event:", event);
      }
    }
  }
);

const testMachine = Machine({
  id: "testMachine",
  initial: "main",
  context: {
    config: null
  },
  states: {
    main: {
      entry: assign({
        loggerRef: (context, event) => spawn(loggerMachine, loggerMachine.id)
      }),
      invoke: {
        src: readConfigMachine,
        onDone: [okTransitionCreator(), noFileTransitionCreator()]
      }
    },
    ok: {
      //   actions: () => console.log("in testMachine.ok")
      //   type: "final"
    },
    noFile: {
      //   entry: () => console.log("in testMachine.noFile entry"),
      //   entry: (context, event) => console.log("in testMachine.noFile entry, context:", context, event),
      entry: send("LOG", {
        to: context => context.loggerRef
        // to: "logger"
      })
      //   invoke: {
      //     src: createConfigMachine,
      //     // onDone: [okTransitionCreator(), noFileTransitionCreator()]
      //   }
    }
  }
});

interpret(testMachine)
  //   .onTransition(state => {
  //   })
  .start();
