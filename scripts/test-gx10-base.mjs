import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';

const root = path.dirname(new URL(import.meta.url).pathname);
for (const file of ['aks.mjs', 'install-bda-standard.mjs']) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const start = source.indexOf('function envValue(');
  const fn = source.slice(start, source.indexOf('\n}\n', start) + 3);
  const expression = source.match(/^const BDA_GATEWAY_BASE_URL = (.*);$/m)[1];
  for (const [env, expected] of [
    [{}, 'https://api.bdagx10.com/v1'],
    [{BDA_GATEWAY_BASE_URL: 'https://custom.example/v1'}, 'https://custom.example/v1'],
    [{BDA_GATEWAY_BASE_URL: 'https://bda.example/v1', AKS_GATEWAY_BASE_URL: 'https://aks.example/v1'}, 'https://aks.example/v1'],
  ]) {
    const context = {process: {env}};
    vm.runInNewContext(`${fn}\nresult = ${expression}`, context);
    assert.equal(context.result, expected, file);
  }
}
const shell = fs.readFileSync(path.join(root, 'setup-cline-bda.sh'), 'utf8');
const assignment = shell.split('\n').find(line => line.startsWith('BASE_URL='));
for (const [overrides, expected] of [
  [{}, 'https://api.bdagx10.com/v1'],
  [{BDA_AI_ROUTER_BASE_URL: 'https://custom.example/v1'}, 'https://custom.example/v1'],
  [{BDA_AI_ROUTER_BASE_URL: 'https://bda.example/v1', AKS_AI_ROUTER_BASE_URL: 'https://aks.example/v1'}, 'https://aks.example/v1'],
]) {
  const env = {...process.env};
  delete env.BDA_AI_ROUTER_BASE_URL; delete env.AKS_AI_ROUTER_BASE_URL;
  const result = spawnSync('bash', ['-c', `${assignment}\nprintf '%s' "$BASE_URL"`], {env: {...env, ...overrides}, encoding: 'utf8'});
  assert.equal(result.status, 0);
  assert.equal(result.stdout, expected, 'Cline default and explicit override precedence');
}
console.log('9 gateway-default and explicit-override checks PASS; no user files or network touched');
