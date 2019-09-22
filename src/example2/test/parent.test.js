const { interpret } = require("xstate");
const { assert } = require("chai");

const { okTransitionCreator } = require("../readConfigMachine");
const {
  parentMachineFactory,
  withHandleReadConfig,
  assignResult
} = require("./utils");

describe("the parent of readConfigMachine", () => {
  it("should have it's context.config populated with the read config when okTransitionCreator is used", done => {
    const testConfig = { version: "0.0.1" };
    const testReadConfigMachine = withHandleReadConfig(
      assignResult(testConfig)
    );

    const machine = parentMachineFactory({
      child: testReadConfigMachine,
      onDone: okTransitionCreator()
    });

    interpret(machine)
      .onTransition(state => {
        if (state.matches("ok")) {
          assert.deepEqual(state.context.config, testConfig);
          done();
        }
      })
      .start();
  });
});
