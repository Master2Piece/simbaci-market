import { cwd } from 'node:process'
import { loadEnvConfig } from '@next/env'

import { drizzle } from 'drizzle-orm/node-postgres'
import { Client } from 'pg'

import * as schema from './schema'
import sampleData from '@/lib/sample-data'

loadEnvConfig(cwd())

const main = async () => {
  try {
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    })
    await client.connect()
    const db = drizzle(client)

    await db.delete(schema.products)
    await db.delete(schema.categories)
    await db.delete(schema.accounts)
    await db.delete(schema.users)

    // Insert categories
    const resCategories = await db
      .insert(schema.categories)
      .values(sampleData.categories)
      .returning()
    console.log({ resCategories })

    // Delete existing products

    // Insert products
    const resProducts = await db
      .insert(schema.products)
      .values(sampleData.products)
      .returning()
    console.log({ resProducts })

    // Delete existing data

    const resUsers = await db
      .insert(schema.users)
      .values(sampleData.users)
      .returning()
    console.log({ resUsers, resProducts })

    await client.end()
  } catch (error) {
    console.error(error)
    throw new Error('Failed to seed database')
  }
}

main()
