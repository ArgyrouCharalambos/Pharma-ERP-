import Sale from '#models/sale'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class DashboardController {
  public async index({ view, auth }: HttpContext) {
    const recentSales = await Sale.query()
      .orderBy('created_at', 'desc')
      .where('userid', Number(auth.user?.id))
      .limit(10)

    const ventes = await Sale.query()
      .preload('produits', (query) => {
        query.preload('product')
      })
      .orderBy('created_at', 'desc')
      .where('userid', Number(auth.user?.id))

    const saleS = recentSales.map((sale) => {
      return {
        date: sale.createdAt.plus({ hours: 2 }).toFormat('dd/MM/yyyy HH:mm'),
        amount: Number(sale.totalPrice),
      }
    })
    const now = DateTime.now()
    const startOfMonth = now.startOf('month').toJSDate()
    const endOfMonth = now.endOf('month').toJSDate()

    const rawTotal =
      (
        await Sale.query()
          .sum('total_price as total')
          .where('userid', Number(auth.user?.id))
          .whereBetween('created_at', [startOfMonth, endOfMonth])
          .first()
      )?.$extras.total || 0

       const SALE = await Sale.query() 
          .preload('produits', (query) => {
            query.preload('product') 
          })
          .orderBy('created_at', 'desc').where('userid', Number(auth.user?.id))
          .limit(10);
      
          SALE.forEach(e => {
            console.log(e.produits)
      
            
          })

    const startOfWeek = now.startOf('week').toJSDate()
    const endOfWeek = now.endOf('week').toJSDate()

    const venteWeek =
      (
        await Sale.query()
          .sum('total_price as total')
          .where('userid', Number(auth.user?.id))
          .whereBetween('created_at', [startOfWeek, endOfWeek])
          .first()
      )?.$extras.total || 0

    const venteJour = await Sale.query()
      .where('userid', auth.user!.id)
      .whereBetween('created_at', [
        DateTime.now().startOf('day').toJSDate(),
        DateTime.now().endOf('day').toJSDate(),
      ])
      .sum('total_price as total')
      .then((result) => Number(result[0]?.$extras.total || 0))

    return view.render('dashboard', {
       venteJour,
      venteMois: rawTotal,
      venteWeek,
      sales: SALE,
      auth,
      saleS,
      ventes,
    })
  }
}
