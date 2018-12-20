process.env.TS_NODE_TRANSPILE_ONLY = true;
require('app-module-path').addPath(`${__dirname}/..`);
let argv = require('yargs').argv;
let exists = require('fs').existsSync;
let dotEnvFile = require('path').resolve(argv.dotenv || `${__dirname}/../.env`);
if (exists(dotEnvFile)) {
    require('dotenv').config({ path: dotEnvFile });
    console.log(`Dotenv file found ${dotEnvFile}`);
} else console.log(`No dotenv file found, loading defaults`);
let tsconfig = require(`${__dirname}/../tsconfig.json`);
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