import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sales'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('quantity_sold')
      table.dropColumn('payment_method')
      table.string('nombre_de_produit')
    })
  }

}