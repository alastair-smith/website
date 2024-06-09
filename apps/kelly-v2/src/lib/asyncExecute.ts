import { exec } from 'child_process';

const INCREASED_MAX_BUFFER = 1024 * 1024 * 5;

export default (command: string) =>
  new Promise((resolve, reject) =>
    exec(
      command,
      { maxBuffer: INCREASED_MAX_BUFFER },
      (error, stdout, stderr) => (error ? reject(error) : resolve(stdout))
    )
  );
