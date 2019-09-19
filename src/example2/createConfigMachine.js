const { Machine } = require("xstate");
const { ensureFileSync, writeJsonSync } = require("fs-extra");

function createConfigSync(config, configFilePath = "./config.json") {
  // creates any missing dirs:
  ensureFileSync(configFilePath);

  writeJsonSync(configFilePath, config, {
    spaces: 2
  });
}

const defaultConfig = {
    version: '0.0.1',
}

module.exports = Machine(
  {
    id: "createConfig",
    initial: "create",
    context: {
      defaultConfig,
    },
    states: {
      create: {
        entry: "handleCreateConfig",
        type: "final",
        data: {
          config: context => context.defaultConfig
        }
      }
    }
  },
  {
    actions: {
      handleCreateConfig: () => createConfigSync(defaultConfig),
    }
  }
);
