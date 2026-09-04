'use strict';
const { spawn } = require('child_process');

function openBrowser(targetUrl, platform = process.platform) {
  const commands = {
    win32: ['cmd.exe', ['/d', '/s', '/c', 'start', '', targetUrl]],
    darwin: ['open', [targetUrl]],
    linux: ['xdg-open', [targetUrl]]
  };
  const command = commands[platform];
  if (!command) return false;
  const child = spawn(command[0], command[1], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true
  });
  child.unref();
  return true;
}

module.exports = { openBrowser };
