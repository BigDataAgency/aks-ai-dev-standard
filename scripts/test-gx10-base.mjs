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
const cli = fs.readFileSync(path.join(root, 'aks.mjs'), 'utf8');
const workStart = cli.indexOf('function workEventUrlFromBaseUrl(');
const workFn = cli.slice(workStart, cli.indexOf('\n}\n', workStart) + 3);
for (const [base, expected] of [
  ['https://api.bdagx10.com/v1', 'https://ai-local.scmc.digital/bda/work-events'],
  ['https://custom.example/v1', 'https://custom.example/bda/work-events'],
]) {
  const context = {URL, DEFAULT_URL: 'https://ai-local.scmc.digital/bda/work-events', base};
  vm.runInNewContext(`${workFn}\nresult = workEventUrlFromBaseUrl(base)`, context);
  assert.equal(context.result, expected, 'API migration must retain supported work-event route');
}
const installer = fs.readFileSync(path.join(root, 'install-bda-standard.mjs'), 'utf8');
const normalizeStart = installer.indexOf('function normalizeConfig(');
const normalizeFn = installer.slice(normalizeStart, installer.indexOf('\n}\n', normalizeStart) + 3);
for (const [base, input, expected] of [
  ['https://api.bdagx10.com/v1', {}, 'https://ai-local.scmc.digital/bda/work-events'],
  ['https://custom.example/v1', {}, 'https://custom.example/bda/work-events'],
  ['https://api.bdagx10.com/v1', {work_event_url:'https://events.example/ingest'}, 'https://events.example/ingest'],
]) {
  const context = {BDA_GATEWAY_BASE_URL:base, VERSION:'fixture', input, envValue:(_key,fallback='')=>fallback};
  vm.runInNewContext(`${normalizeFn}\nresult = normalizeConfig(input)`, context);
  assert.equal(context.result.work_event_url, expected, 'Installer keeps supported or explicit work-event endpoint');
}
console.log('14 gateway-default, override and work-event compatibility checks PASS; no user files or network touched');
