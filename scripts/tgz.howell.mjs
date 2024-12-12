import { execSync, spawn, spawnSync } from 'node:child_process';
import { access, accessSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const targetPath = resolve(process.cwd(), 'packages');
try {
  accessSync(resolve(process.cwd(), 'packages', 'howell.tgz'));
  rmSync(resolve(process.cwd(), 'packages', 'howell.tgz'));
} catch (e) {
  console.log('file not exists');
}
spawnSync('cd', [targetPath]);

console.log(execSync('pwd'), {
  encoding: 'utf-8',
});

// const child = spawn(
//   'tar',
//   ['-zcvf', 'howell.tgz', process.cwd(), 'packages', 'howell'],
//   {
//     cwd: process.cwd(),
//   }
// );

// // spawn('tar', ['-zcvf', 'howell.tgz', 'dist'], { cwd: process.cwd() });
// child.stdout.on('data', (data) => {
//   console.log(`stdout: ${data}`);
// });
