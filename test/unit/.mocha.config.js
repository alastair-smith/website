const { assert, expect } = require('chai')
const { createSandbox } = require('sinon')

Object.assign(global, { assert, expect, createSandbox })
