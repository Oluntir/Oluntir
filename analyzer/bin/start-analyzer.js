#!/usr/bin/env node
require('../app/server.js').start(Number(process.env.PORT)||4177);
