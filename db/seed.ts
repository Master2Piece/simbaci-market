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

    // Ensure categories exist before inserting products
    await db.delete(schema.categories).execute()

    // Insert categories
    const resCategories = await db
      .insert(schema.categories)
      .values(sampleData.categories)
      .returning()
    console.log({ resCategories })

    // Delete existing products
    await db.delete(schema.products).execute()

    // Insert products
    const resProducts = await db
      .insert(schema.products)
      .values(sampleData.products)
      .returning()
    console.log({ resProducts })

    await client.end()
  } catch (error) {
    console.error(error)
    throw new Error('Failed to seed database')
  }
}

main()
