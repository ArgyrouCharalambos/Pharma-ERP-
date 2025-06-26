import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'produit_de_ventes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('userid')
    })
  }

}