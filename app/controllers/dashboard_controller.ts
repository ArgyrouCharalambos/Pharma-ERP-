import Product from '#models/product'
import Sale from '#models/sale'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class DashboardController {
  public async index({ view, auth }: HttpContext) {
    const recentSales = await Sale.query()
      .orderBy('created_at', 'desc')
      .where('userid', Number(auth.user?.id))
      .limit(5)

       const ventes = await Sale.query()
          .preload('produits', (query) => {
            query.preload('product') // si tu veux aussi les infos du produit lié
          })
          .orderBy('created_at', 'desc').where('userid', Number(auth.user?.id))
      

    const saleS = recentSales.map((sale) => {
      return {
        date: sale.createdAt.plus({ hours: 2 }).toFormat('dd/MM/yyyy HH:mm'),
        amount: Number(sale.totalPrice),
      }
    })

    const total =
      (
        await Product.query()
          .sum('quantity as total')
          .where('userid', Number(auth.user?.id))
          .first()
      )?.$extras.total || 0
    const vente =
      (
        await Sale.query()
          .sum('total_price as total')
          .where('userid', Number(auth.user?.id))
          .first()
      )?.$extras.total || 0
    // const alt =
    //   (
    //     await Product.query()
    //       .where('alert_expired', true)
    //       .where('userid', Number(auth.user?.id))
    //       .count('* as total')
    //   )[0]?.$extras.total || 0
    const SALE = await Sale.query()
      .orderBy('created_at', 'desc')
      .where('userid', Number(auth.user?.id))
      .limit(5)
      .preload('product')

      const critiqueResult = await Product.query().where('userid',Number(auth.user?.id)).where('quantity', '<', 10).count('* as total')
          const Critique = critiqueResult[0]?.$extras.total || 0
          const Expire =
            (
              await Product.query()
                .where('userid',Number(auth.user?.id))
                .where('expiration_date', '<', DateTime.now().toSQLDate())
                .count('* as total')
            )[0]?.$extras.total || 0

            let alt = (Number(Critique) + Number(Expire))


    return view.render('dashboard', {
      totalStock: total,
      venteMois: vente,
      Alerte: alt,
      sales: SALE,
      auth,
      saleS,
      ventes
    })
  }
}
