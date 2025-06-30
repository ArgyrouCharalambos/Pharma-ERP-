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
    const startOfMonth = now.setZone('Africa/Lubumbashi').startOf('month').toJSDate()
    const endOfMonth = now.setZone('Africa/Lubumbashi').endOf('month').toJSDate()

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
      .orderBy('created_at', 'desc')
      .where('userid', Number(auth.user?.id))
      .limit(5)

    SALE.forEach((e) => {
      console.log(e.produits)
    })

    const startOfWeek = now.setZone('Africa/Lubumbashi').startOf('week').toJSDate()
    const endOfWeek = now.setZone('Africa/Lubumbashi').endOf('week').toJSDate()

    const venteWeek =
      (
        await Sale.query()
          .sum('total_price as total')
          .where('userid', Number(auth.user?.id))
          .whereBetween('created_at', [startOfWeek, endOfWeek])
          .first()
      )?.$extras.total || 0


      const startOfDay = DateTime.now().setZone('Africa/Lubumbashi').startOf('day').toJSDate()
const endOfDay = DateTime.now().setZone('Africa/Lubumbashi').endOf('day').toJSDate()

    const venteJour = await Sale.query()
      .where('userid', Number(auth.user?.id))
      .whereBetween('created_at', [
        startOfDay,endOfDay
      ])
      .sum('total_price as total')
      .then((result) => Number(result[0]?.$extras.total || 0))

    const transactionDay =
      (
        await Sale.query()
          .count('* as total')
          .where('userid', Number(auth.user?.id))
          .whereBetween('created_at', [
            startOfDay,endOfDay
          ])
          .first()
      )?.$extras.total || 0

    const transactionWeek =
      (
        await Sale.query()
          .count('* as total')
          .where('userid', Number(auth.user?.id))
          .whereBetween('created_at', [startOfWeek, endOfWeek])
          .first()
      )?.$extras.total || 0

    const transactionMonth =
      (
        await Sale.query()
          .count('* as total')
          .where('userid', Number(auth.user?.id))
          .whereBetween('created_at', [startOfMonth, endOfMonth])
          .first()
      )?.$extras.total || 0

      const PanierMoyenDay = venteJour / transactionDay;
      const PanierMoyenWeek = venteWeek / transactionWeek;
      const PanierMoyenMonth = rawTotal / transactionMonth;


      const Panier = await Sale.query().where("userid",Number(auth.user?.id))
      .whereBetween('created_at',  [
        startOfDay,endOfDay
      ])

      let panierMaxDay = -Infinity;
      let panierMinDay = Infinity;

      Panier.forEach(e => {
      let price = Number(e.totalPrice)

        if(panierMaxDay < price){
          panierMaxDay = e.totalPrice;
        }
        if(panierMinDay > price){
          panierMinDay = e.totalPrice;
        }
      });

      const PanierWeek = await Sale.query().where("userid",Number(auth.user?.id))
      .whereBetween('created_at', [startOfWeek, endOfWeek])


      let panierMaxWeek = -Infinity;
      let panierMinWeek = Infinity;

      PanierWeek.forEach(e => {
      let price = Number(e.totalPrice)

        if(panierMaxWeek < price){
          panierMaxWeek = e.totalPrice;
        }
        if(panierMinWeek > price){
          panierMinWeek = e.totalPrice;
        }
      });

      const PanierMonth = await Sale.query().where("userid",Number(auth.user?.id))
      .whereBetween('created_at', [startOfMonth, endOfMonth])

      
      let panierMaxMonth = -Infinity;
      let panierMinMonth = Infinity;

      PanierMonth.forEach(e => {
      let price = Number(e.totalPrice)

        if(panierMaxMonth < price){
          panierMaxMonth = e.totalPrice;
        }
        if(panierMinMonth > price){
          panierMinMonth = e.totalPrice;
        }
      });


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
      venteJour,
      venteMois: rawTotal,
      venteWeek,
      sales: SALE,
      auth,
      saleS,
      ventes,
      transactionDay,
      transactionWeek,
      transactionMonth,
      PanierMoyenDay,
      PanierMoyenWeek,
      PanierMoyenMonth,
      panierMaxDay,
      panierMinDay,
      panierMaxWeek,
      panierMinWeek,
      panierMaxMonth,
      panierMinMonth,
      Alerte:alt
    })
  }
}
