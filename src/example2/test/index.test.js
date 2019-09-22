const { interpret } = require("xstate");
const { assert } = require("chai");

const {
  FILE_NOT_FOUND,
  jSON_PARSE_ERROR,
} = require("../readConfigMachine");
const { withHandleReadConfig, assignResult } = require("./utils");

describe("readConfigMachine", () => {
  it('should go to the "noFile" state and context.result should be "FileNotFound" when readConfigSync returns "FileNotFound"', done => {
    const testReadConfigMachine = withHandleReadConfig(
      assignResult(FILE_NOT_FOUND)
    );

    interpret(testReadConfigMachine)
      .onTransition(state => {
        if (state.matches("noFile")) {
          assert(
            state.context.result === FILE_NOT_FOUND,
            `state.context.result should be '${FILE_NOT_FOUND}'`
          );
          done();
        } else {
          assert.fail(`state was ${state.value} - expected "noFile"`);
        }
      })
      .start();
  });

  it('should go to the "parseError" state and context.result should be "JSONParseError" when readConfigSync reutrns "JSONParseError"', done => {
    const testReadConfigMachine = withHandleReadConfig(
      assignResult(jSON_PARSE_ERROR)
    );

    interpret(testReadConfigMachine)
      .onTransition(state => {
        if (state.matches("parseError")) {
          assert(
            state.context.result === jSON_PARSE_ERROR,
            `state.context.result should be '${jSON_PARSE_ERROR}'`
          );
          done();
        } else {
          assert.fail(`state was ${state.value} - expected "parseError"`);
        }
      })
      .start();
  });

  it('should go to the "unexpectedContent" state when readConfigSync returns a non Object', done => {
    const testReadConfigMachine = withHandleReadConfig(
      assignResult("hello world")
    );

    interpret(testReadConfigMachine)
      .onTransition(state => {
        // only works because there is one transition:
        // TODO: fix (could be there's more than on transition and they're not all "unexpectedContent")
        assert(
          state.matches("unexpectedContent"),
          `Expected to be in state "unexpectedContent but was in state ${state.value}`
        );
        done();
      })
      .start();
  });

  it('should go to the "success" state and context.result should be an Object when readConfigSync returns an Object', done => {
    const testReadConfigMachine = withHandleReadConfig(
      assignResult({
        version: "0.0.1"
      })
    );

    interpret(testReadConfigMachine)
      .onTransition(state => {
        if (state.matches("success")) {
          assert.isObject(
            state.context.result,
            `state.context.result should be an object but was '${state.context.result}'`
          );
          done();
        } else {
          assert.fail(`state was ${state.value} - expected "success"`);
        }
      })
      .start();
  });
});
