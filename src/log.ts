// enum LogLevel {
//     ERROR, WARN, INFO, DEBUG
// }

// /**
//  * This is equivalent to:
//  * type LogLevelStrings = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
//  */
// type LogLevelStrings = keyof typeof LogLevel;

// function printImportant(key: LogLevelStrings, message: string) {
//     const num = LogLevel[key];
//     if (num <= LogLevel.WARN) {
//        console.log('Log level key is: ', key);
//        console.log('Log level value is: ', num);
//        console.log('Log level message is: ', message);
//     }
// }
// printImportant('ERROR', 'This is a message');

export enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG"
}

function getLogLevel() {
  for (let lvl in LogLevel) {
    let level = LogLevel[lvl];
    console.log(level);
  }
}

// getLogLevel();

console.log('warn is:', LogLevel['eeWARN'])
