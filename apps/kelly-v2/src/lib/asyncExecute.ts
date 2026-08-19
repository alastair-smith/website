import { exec } from 'node:child_process';

const INCREASED_MAX_BUFFER = 1024 * 1024 * 10;

export default (command: string): Promise<string> =>
  new Promise((resolve, reject) => {
    exec(
      command,
      { maxBuffer: INCREASED_MAX_BUFFER },
      (error, stdout, _stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      },
    );
  });
