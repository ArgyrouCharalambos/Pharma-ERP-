import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany,  } from '@adonisjs/lucid/orm'
import Product from '#models/product'
import ProduitDeVente from '#models/produit_de_vente'
import * as relations  from '@adonisjs/lucid/types/relations'

export default class Sale extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare productId: number

  // @column()
  // declare quantitySold: number

  @column()
  declare nombreDeProduit: number 

  @column()
  declare totalPrice: number

  @column()
  declare userid: number

  // @column()
  // declare paymentMethod: string

  @hasMany(() => ProduitDeVente, { foreignKey: 'idSale', localKey: 'id' })
  declare produits: relations.HasMany<typeof ProduitDeVente>


  @belongsTo(() => Product)
  declare product: relations.BelongsTo<typeof Product>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
  
}