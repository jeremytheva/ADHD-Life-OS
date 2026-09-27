#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const failures = []
const schemaPath = path.join(root, 'database/provider-schema.json')
const migrationRoot = path.join(root, 'database/migrations')

let schema
try {
  schema = JSON.parse(await readFile(schemaPath, 'utf8'))
} catch (error) {
  failures.push(`database/provider-schema.json is not valid JSON: ${error.message}`)
}

if (schema) {
  if (!Number.isInteger(schema.schema_version) || schema.schema_version < 1) failures.push('provider schema must have schema_version >= 1')
  if (schema.provider !== 'NoCodeBackend') failures.push('provider schema provider must be NoCodeBackend')
  if (!['UNVERIFIED', 'PARTIAL', 'VERIFIED'].includes(schema.verification_state)) failures.push('provider schema verification_state must be UNVERIFIED, PARTIAL, or VERIFIED')
  if (!schema.collections || typeof schema.collections !== 'object' || Array.isArray(schema.collections)) failures.push('provider schema collections must be an object')

  if (schema.verification_state === 'UNVERIFIED') {
    if (schema.target_instance !== 'UNVERIFIED') failures.push('UNVERIFIED provider schema must not claim a target instance')
    if (schema.verified_at !== null) failures.push('UNVERIFIED provider schema must not have verified_at evidence')
    if (schema.evidence_source !== null) failures.push('UNVERIFIED provider schema must not have evidence_source')
    if (schema.collections && Object.keys(schema.collections).length > 0) failures.push('UNVERIFIED provider schema must not contain claimed provider collections')
  } else {
    if (!schema.target_instance || schema.target_instance === 'UNVERIFIED') failures.push('verified/partial provider schema requires a target_instance')
    if (!schema.verified_at) failures.push('verified/partial provider schema requires verified_at')
    if (!schema.evidence_source) failures.push('verified/partial provider schema requires evidence_source')
  }
}

const providerOperations = await readFile(path.join(root, 'docs/NOCODEBACKEND_OPERATIONS.md'), 'utf8')
const providerContract = await readFile(path.join(root, 'api/ncb/dataProviderContract.js'), 'utf8')
if (schema?.verification_state === 'UNVERIFIED') {
  if (!providerOperations.includes('UNVERIFIED for the target ADHD Life OS instance')) failures.push('provider operation register must agree that target provider schema/operations are unverified')
  if (!providerContract.includes("UNVERIFIED: 'UNVERIFIED'")) failures.push('provider contract must retain an explicit UNVERIFIED state')
}

const requiredMigrationFiles = ['migration-plan.md', 'before.json', 'after.json', 'backfill-plan.md', 'verification.md']
for (const entry of await readdir(migrationRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const names = new Set((await readdir(path.join(migrationRoot, entry.name))).map(String))
  for (const required of requiredMigrationFiles) {
    if (!names.has(required)) failures.push(`migration package ${entry.name} is missing ${required}`)
  }
}

if (failures.length > 0) {
  for (const failure of failures) process.stderr.write(`provider-schema: ${failure}\n`)
  process.exitCode = 1
} else {
  process.stdout.write('Provider schema validation passed.\n')
}
