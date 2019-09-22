const { Machine, assign } = require("xstate");
const { readJsonSync } = require("fs-extra");

const FILE_NOT_FOUND = "FileNotFound";
const jSON_PARSE_ERROR = "JSONParseError";

function isProbablyJSONParseError(err) {
  // Examples:
  // 'Unexpected end of JSON input' - for an empty file
  // 'Unexpected token } in JSON at position 28' - for a trailing comma
  return err.message.includes("Unexpected") && err.message.includes("JSON");
}

function readConfigSync(configFilePath = "./config.json") {
  try {
    return readJsonSync(configFilePath);
  } catch (err) {
    if (err.code === "ENOENT") {
      return FILE_NOT_FOUND;
    } else if (isProbablyJSONParseError(err)) {
      return jSON_PARSE_ERROR;
    }
  }
}

const okTransitionCreator = target => ({
  target: "ok",
  actions: [
    assign({
      config: (context, event) => event.data.config
    })
  ],
  cond: (context, event) => {
    return event.data.config instanceof Object;
  }
});

const readConfigMachine = Machine(
  {
    id: "readConfig",
    initial: "read",
    context: {
      result: null
    },
    states: {
      read: {
        entry: "handleReadConfig",
        on: {
          "": [
            { target: "noFile", cond: "noFile" },
            { target: "parseError", cond: "parseError" },
            { target: "unexpectedContent", cond: "isNotObject" },
            // { target: "success" },
            { target: "success", cond: "isObject" }
          ]
        }
      },
      success: {
        type: "final",
        data: {
          config: context => context.result
        }
      },
      noFile: {
        type: "final",
        data: {
          error: context => context.result
        }
      },
      parseError: {
        type: "final",
        data: {
          error: context => context.result
        }
      },
      unexpectedContent: {
        type: "final",
        data: {
          error: context => context.result
        }
      }
    }
  },
  {
    actions: {
      handleReadConfig: assign({
        result: () => readConfigSync()
      })
    },
    guards: {
      isObject: (context, event) => {
        return context.result instanceof Object;
      },
      isNotObject: (context, event) => {
        return !(context.result instanceof Object);
      },
      noFile: (context, event) => {
        return context.result === FILE_NOT_FOUND;
      },
      parseError: context => {
        return context.result === jSON_PARSE_ERROR;
      }
    }
  }
);

module.exports = {
  readConfigMachine,
  readConfigSync,
  FILE_NOT_FOUND,
  jSON_PARSE_ERROR,
  isProbablyJSONParseError,
  okTransitionCreator
};
