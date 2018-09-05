#!/usr/bin/env node

let fs = require('fs');

const parse = function (inputToRegex = process.argv[2]) {
    if (fs.existsSync(inputToRegex)) {
        console.log(`Parsing ${inputToRegex}`);
        inputToRegex = fs.readFileSync(inputToRegex, 'utf8');
    }
    let insert = match => true;
    let obj = {};
    if (inputToRegex.indexOf('----- Polymath Core Contracts -----') !== -1) {
        // 1.4.0
        console.log(`Detected migration version: <= 1.4.0`);
        // 1.4.0 may contain duplicated Oracles, 1st one is Poly and second is ETH
        insert = match => {
            let ins = {};
            ins[process.env.GANACHE_NETWORK] = match[2];
            if (match[1] === 'MockOracle') {
                if (!obj.POLYOracle) obj.POLYOracle = ins;
                else if (!obj.ETHOracle) obj.ETHOracle = ins;
                return false;
            }
            return true;
        }
    }
    else if (inputToRegex.indexOf('--------------------- Polymath Network Smart Contracts: ---------------------') !== -1) {
        // 1.5.0
        console.log(`Detected migration version: >= 1.5.0`);
    }
    else {
        throw `Can't parse migration output: Unrecognized format version.`;
    }
    let regex = /^\s*(\w+)\s*:\s*([0-9a-fx]+)/gm;
    let match;
    do {
        match = regex.exec(inputToRegex);
        if (match) {
            if (match.length !== 3) throw `Unkown entry found: ${JSON.stringify(match)}`;
            let ins = {};
            ins[process.env.GANACHE_NETWORK] = match[2];
            if (insert(match)) obj[match[1]] = ins;
        }
    } while (match)
    if (!Object.keys(obj).length) throw `Migration Parser: Invalid input`;
    return obj;
}

if (process.argv[1] === __filename) console.log(JSON.stringify(parse()));
else module.exports = parse;