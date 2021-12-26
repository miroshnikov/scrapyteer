#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const { scrape } = require('../dist/index.js');
const { program } = require('commander')

program
  .option('-c, --config <file>', 'configuration file', 'scrapyteer.config.js')
program.parse(process.argv)
const options = program.opts()

const confPath = path.resolve('./', options.config)
if (!fs.existsSync(confPath)) {
  console.error(`ERROR: configuration file '${confPath}' not found\nRun 'scrapyteer --help' for usage info.`)
  process.exit(1)
}

const config = require(confPath)
if (!config.save || typeof config.save === 'string') {
  config.save = path.resolve('./', config.save || 'output.json')
}
scrape(config)

