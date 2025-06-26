import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import Product from '#models/product'
import * as relations from '@adonisjs/lucid/types/relations'


export default class ProduitDeVente extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare idSale: number

  @column()
  declare idProduct: number

  @column()
  declare quantity: number

  @hasOne(() => Product,{
    foreignKey: 'id',
    localKey: 'idProduct'
  })
  declare product: relations.HasOne<typeof Product>

  @column()
  declare userid: number

  @column()
  declare prixUnitaire: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}