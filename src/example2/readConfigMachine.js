const { Machine, assign } = require("xstate");
const { readJsonSync } = require("fs-extra");

function isProbablyJSONParseError(err) {
  // Examples:
  // 'Unexpected end of JSON input' - for an empty file
  // 'Unexpected token } in JSON at position 28' - for a trailing comma
  return err.message.includes("Unexpected") && err.message.includes("JSON");
}

function readConfig(configFilePath = "./config.json") {
  try {
    return readJsonSync(configFilePath);
  } catch (err) {
    if (err.code === "ENOENT") {
      return "FileNotFound"; // would like to maybe throw Error here and have it go in parent's `onError`
    } else if (isProbablyJSONParseError(err)) {
      return "JSONParseError"; // would like to maybe throw Error here and have it go in parent's `onError`
    }
  }
}

module.exports = Machine(
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
            { target: "success", cond: "ok" },
            { target: "noFile", cond: "noFile" },
            { target: "parseError", cond: "parseError" }
          ]
        }
      },
      success: {
        // entry: "handleSuccess",
        type: "final",
        data: {
          config: context => context.result
        }
      },
      noFile: {
        // entry: "handleNoFile",
        type: "final",
        data: {
          error: context => context.result
        }
      },
      parseError: {
        // entry: "handleParseError",
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
        result: () => readConfig()
      })
      //   handleSuccess: () => console.log("in readConfigMachine's handleSuccess"),
      //   handleNoFile: (context) => console.log("in readConfigMachine's handleNoFile:", context),
      //   handleParseError: () => console.log("in readConfigMachine's handleParseError"),
    },
    guards: {
      ok: (context, event) => {
        return context.result instanceof Object;
      },
      noFile: context => {
        return context.result === "FileNotFound";
      },
      parseError: context => {
        return context.result === "JSONParseError";
      }
    }
  }
);
