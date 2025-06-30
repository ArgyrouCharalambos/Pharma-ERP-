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
                          .where('expiration_date', '<=', DateTime.now().setZone('Africa/Lubumbashi').toJSDate())
                          .count('* as total')
                      )[0]?.$extras.total || 0
          
                      let alt = (Number(Critique) + Number(Expire))




const debutHier = DateTime.now().setZone('Africa/Lubumbashi').minus({ days: 1 }).startOf('day').toJSDate()
const finHier = DateTime.now().setZone('Africa/Lubumbashi').minus({ days: 1 }).endOf('day').toJSDate()

const transactionHierDay =
      (
        await Sale.query()
          .count('* as total')
          .where('userid', Number(auth.user?.id))
          .whereBetween('created_at', [
            debutHier,finHier
          ])
          .first()
      )?.$extras.total || 0

      let cacultransactionHierDay = (transactionDay-transactionHierDay)/transactionDay;
let augmentationTransactionDay = (cacultransactionHierDay*100)

const ventesHier = await Sale.query()
  .where('userid', Number(auth.user?.id))
  .whereBetween('created_at', [debutHier, finHier])
  .sum('total_price as total')
  .then((result) => Number(result[0]?.$extras.total || 0))


let cacul = (venteJour-ventesHier)/ventesHier;
let auglantationDay = (cacul*100)

// Aller au début de la semaine actuelle, puis reculer de 1 semaine
const debutSemainePassee = DateTime.now()
  .setZone('Africa/Lubumbashi')
  .startOf('week')
  .minus({ weeks: 1 })
  .toJSDate()

const finSemainePassee = DateTime.now()
  .setZone('Africa/Lubumbashi')
  .startOf('week')
  .minus({ days: 1 }) // Dimanche dernier (juste avant cette semaine)
  .endOf('day')
  .toJSDate()


  const transactionHierWeek =
      (
        await Sale.query()
          .count('* as total')
          .where('userid', Number(auth.user?.id))
          .whereBetween('created_at', [
            debutSemainePassee,finSemainePassee
          ])
          .first()
      )?.$extras.total || 0

      let cacultransactionHierWeek = (transactionWeek-transactionHierWeek)/transactionWeek;
let augmentationTransactionWeek = (cacultransactionHierWeek*100)

const ventesSemainePassee = await Sale.query()
  .where('userid', Number(auth.user?.id))
  .whereBetween('created_at', [debutSemainePassee, finSemainePassee])
  .sum('total_price as total')
  .then((result) => Number(result[0]?.$extras.total || 0))



let caculWeek = (venteWeek-ventesSemainePassee)/venteWeek;
let augmentationWeek = (caculWeek*100)

// Obtenir le début et la fin du mois précédent
const debutMoisPasse = DateTime.now()
  .setZone('Africa/Lubumbashi')
  .minus({ months: 1 })
  .startOf('month')
  .toJSDate()

const finMoisPasse = DateTime.now()
  .setZone('Africa/Lubumbashi')
  .minus({ months: 1 })
  .endOf('month')
  .toJSDate()


  const transactionHierMonth =
      (
        await Sale.query()
          .count('* as total')
          .where('userid', Number(auth.user?.id))
          .whereBetween('created_at', [
            debutMoisPasse,finMoisPasse
          ])
          .first()
      )?.$extras.total || 0

      let cacultransactionHierMonth = (transactionMonth-transactionHierMonth)/transactionMonth;
let augmentationTransactionMonth = (cacultransactionHierMonth*100)


// Faire la requête pour toutes les ventes du mois précédent
const ventesMoisPasse = await Sale.query()
  .where('userid', Number(auth.user?.id))
  .whereBetween('created_at', [debutMoisPasse, finMoisPasse])
  .sum('total_price as total')
  .then((result) => Number(result[0]?.$extras.total || 0))

  let caculMonth = (rawTotal-ventesMoisPasse)/rawTotal;
  let augmentationMonth = (caculMonth*100)
  


  const PanierMoyenDayStat = ventesHier / Number(transactionHierDay);
const PanierMoyenWeekStat = ventesSemainePassee / Number(transactionHierWeek)
const PanierMoyenMonthStat = Number(ventesMoisPasse) / Number(transactionHierMonth);

let cacultransactionHierDayStat = (PanierMoyenDay-PanierMoyenDayStat)/PanierMoyenDay;
let augmentationTransactionDayStat = (cacultransactionHierDayStat*100)

let cacultransactionHierWeekStat = (PanierMoyenWeek-PanierMoyenWeekStat)/PanierMoyenWeek;
let augmentationTransactionWeekStat = (cacultransactionHierWeekStat*100)

let cacultransactionHierMonthStat = 0;
if(isNaN(PanierMoyenMonthStat)){
  cacultransactionHierMonthStat = PanierMoyenMonth/PanierMoyenMonth;
}
else{
  cacultransactionHierMonthStat = (PanierMoyenMonth-PanierMoyenMonthStat)/PanierMoyenMonth;
}

let augmentationTransactionMonthStat = (cacultransactionHierMonthStat*100)



    return view.render('dashboard', {
      augmentationTransactionDayStat:augmentationTransactionDayStat.toFixed(1),
      augmentationTransactionWeekStat:augmentationTransactionWeekStat.toFixed(1),
      augmentationTransactionMonthStat:augmentationTransactionMonthStat.toFixed(1),

      augmentationTransactionMonth:augmentationTransactionMonth.toFixed(1),
      augmentationTransactionWeek:augmentationTransactionWeek.toFixed(1),
      augmentationTransactionDay:augmentationTransactionDay.toFixed(1),

      augmentationMonth:augmentationMonth.toFixed(1),
      augmentationWeek:augmentationWeek.toFixed(1),
      augmentationDay:auglantationDay.toFixed(1),
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
