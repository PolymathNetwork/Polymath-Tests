process.env.TS_NODE_TRANSPILE_ONLY = true;
global['app-path'] = `${__dirname}/..`;
require('app-module-path').addPath(global['app-path']);
let argv = require('yargs').argv;
let exists = require('fs').existsSync;
let dotEnvFile = require('path').resolve(argv.dotenv || `${global['app-path']}/.env`);
if (exists(dotEnvFile)) {
    require('dotenv').config({ path: dotEnvFile });
    console.log(`Dotenv file found ${dotEnvFile}`);
} else console.log(`No dotenv file found, loading defaults`);
let tsconfig = require(`${global['app-path']}/tsconfig.json`);
require('ts-node').register({
    transpileOnly: true,
    compilerOptions: tsconfig.compilerOptions
});
require('tsconfig-paths').register({
    baseUrl: tsconfig.compilerOptions.baseUrl,
    paths: tsconfig.compilerOptions.paths
});
module.exports = opts => {
    let file;
    if (opts instanceof Object) {
        file = opts.file;
    } else file = opts;
    let fn = require(file || './base');
    return fn instanceof Function ? fn(opts) : fn;
}