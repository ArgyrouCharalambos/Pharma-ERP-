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
      .whereBetween('created_at', [startOfDay, endOfDay])
      .sum('total_price as total')
      .then((result) => Number(result[0]?.$extras.total || 0))

    const transactionDay =
      (
        await Sale.query()
          .count('* as total')
          .where('userid', Number(auth.user?.id))
          .whereBetween('created_at', [startOfDay, endOfDay])
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

    const PanierMoyenDay = venteJour / transactionDay
    const PanierMoyenWeek = venteWeek / transactionWeek
    const PanierMoyenMonth = rawTotal / transactionMonth

    const Panier = await Sale.query()
      .where('userid', Number(auth.user?.id))
      .whereBetween('created_at', [startOfDay, endOfDay])

    let panierMaxDay = -Infinity
    let panierMinDay = Infinity

    Panier.forEach((e) => {
      let price = Number(e.totalPrice)

      if (panierMaxDay < price) {
        panierMaxDay = e.totalPrice
      }
      if (panierMinDay > price) {
        panierMinDay = e.totalPrice
      }
    })

    const PanierWeek = await Sale.query()
      .where('userid', Number(auth.user?.id))
      .whereBetween('created_at', [startOfWeek, endOfWeek])

    let panierMaxWeek = -Infinity
    let panierMinWeek = Infinity

    PanierWeek.forEach((e) => {
      let price = Number(e.totalPrice)

      if (panierMaxWeek < price) {
        panierMaxWeek = e.totalPrice
      }
      if (panierMinWeek > price) {
        panierMinWeek = e.totalPrice
      }
    })

    const PanierMonth = await Sale.query()
      .where('userid', Number(auth.user?.id))
      .whereBetween('created_at', [startOfMonth, endOfMonth])

    let panierMaxMonth = -Infinity
    let panierMinMonth = Infinity

    PanierMonth.forEach((e) => {
      let price = Number(e.totalPrice)

      if (panierMaxMonth < price) {
        panierMaxMonth = e.totalPrice
      }
      if (panierMinMonth > price) {
        panierMinMonth = e.totalPrice
      }
    })

    const critiqueResult = await Product.query()
      .where('userid', Number(auth.user?.id))
      .where('quantity', '<', 10)
      .count('* as total')
    const Critique = critiqueResult[0]?.$extras.total || 0
    const Expire =
      (
        await Product.query()
          .where('userid', Number(auth.user?.id))
          .where('expiration_date', '<=', DateTime.now().setZone('Africa/Lubumbashi').toJSDate())
          .count('* as total')
      )[0]?.$extras.total || 0

    let alt = Number(Critique) + Number(Expire)

    const debutHier = DateTime.now()
      .setZone('Africa/Lubumbashi')
      .minus({ days: 1 })
      .startOf('day')
      .toJSDate()
    const finHier = DateTime.now()
      .setZone('Africa/Lubumbashi')
      .minus({ days: 1 })
      .endOf('day')
      .toJSDate()

    const transactionHierDay =
      (
        await Sale.query()
          .count('* as total')
          .where('userid', Number(auth.user?.id))
          .whereBetween('created_at', [debutHier, finHier])
          .first()
      )?.$extras.total || 0

    let augmentationTransactionDay = 0

    if (Number(transactionHierDay) === 0) {
      augmentationTransactionDay = 0
    } else {
      let cacultransactionHierDay = (transactionDay - transactionHierDay) / transactionHierDay
      augmentationTransactionDay = cacultransactionHierDay * 100
    }
    console.log(augmentationTransactionDay)

    let ventesHier = await Sale.query()
      .where('userid', Number(auth.user?.id))
      .whereBetween('created_at', [debutHier, finHier])
      .sum('total_price as total')
      .then((result) => Number(result[0]?.$extras.total || 0))

    let auglantationDay = 0
    if (ventesHier !== 0) {
      let cacul = (venteJour - ventesHier) / ventesHier
      auglantationDay = cacul * 100
    } else {
      auglantationDay = 0
    }

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
          .whereBetween('created_at', [debutSemainePassee, finSemainePassee])
          .first()
      )?.$extras.total || 0

    let cacultransactionHierWeek = (transactionWeek - transactionHierWeek) / transactionHierWeek
    let augmentationTransactionWeek = cacultransactionHierWeek * 100

    const ventesSemainePassee = await Sale.query()
      .where('userid', Number(auth.user?.id))
      .whereBetween('created_at', [debutSemainePassee, finSemainePassee])
      .sum('total_price as total')
      .then((result) => Number(result[0]?.$extras.total || 0))

    let caculWeek = (venteWeek - ventesSemainePassee) / ventesSemainePassee
    let augmentationWeek = caculWeek * 100

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
          .whereBetween('created_at', [debutMoisPasse, finMoisPasse])
          .first()
      )?.$extras.total || 0

    let cacultransactionHierMonth = (transactionMonth - transactionHierMonth) / transactionHierMonth
    let augmentationTransactionMonth = cacultransactionHierMonth * 100

    // Faire la requête pour toutes les ventes du mois précédent
    const ventesMoisPasse = await Sale.query()
      .where('userid', Number(auth.user?.id))
      .whereBetween('created_at', [debutMoisPasse, finMoisPasse])
      .sum('total_price as total')
      .then((result) => Number(result[0]?.$extras.total || 0))

    let caculMonth = (rawTotal - ventesMoisPasse) / ventesMoisPasse
    let augmentationMonth = caculMonth * 100

    const PanierMoyenDayStat = ventesHier / Number(transactionHierDay)
    const PanierMoyenWeekStat = ventesSemainePassee / Number(transactionHierWeek)
    const PanierMoyenMonthStat = Number(ventesMoisPasse) / Number(transactionHierMonth)

    let augmentationTransactionDayStat = null
    let cacultransactionHierDayStat = 0
    if (isNaN(PanierMoyenDayStat)) {
      augmentationTransactionDayStat = 0
    } else {
      cacultransactionHierDayStat = (PanierMoyenDay - PanierMoyenDayStat) / PanierMoyenDayStat
      augmentationTransactionDayStat = cacultransactionHierDayStat * 100
    }

    let cacultransactionHierWeekStat = (PanierMoyenWeek - PanierMoyenWeekStat) / PanierMoyenWeekStat
    let augmentationTransactionWeekStat = cacultransactionHierWeekStat * 100

    let cacultransactionHierMonthStat = 0
    if (isNaN(PanierMoyenMonthStat)) {
      cacultransactionHierMonthStat = 0
    } else {
      cacultransactionHierMonthStat =
        (PanierMoyenMonth - PanierMoyenMonthStat) / PanierMoyenMonthStat
    }

    let augmentationTransactionMonthStat = cacultransactionHierMonthStat * 100

    // 1. Données horaires (0h-24h) pour aujourd'hui
    const salesByHour = Array(24).fill(0) 

    const startOfDay2 = DateTime.now().setZone('Africa/Lubumbashi').startOf('day').toJSDate()
    const endOfDay2 = DateTime.now().setZone('Africa/Lubumbashi').endOf('day').toJSDate()

    const salesToday = await Sale.query()
      .where('userid', Number(auth.user?.id))
      .whereBetween('created_at', [startOfDay2, endOfDay2])

    salesToday.forEach((sale) => {
      const hour = sale.createdAt.setZone('Africa/Lubumbashi').plus({ hours: -1 }).hour
      if (hour >= 0 && hour <= 23) {
        salesByHour[hour - 0] += Number(sale.totalPrice)
      }
    })

    // Données horaires (0h-24h) pour aujourd'hui
    const salesByHourHier = Array(24).fill(0)

    const startOfDay2Hier = DateTime.now()
      .setZone('Africa/Lubumbashi')
      .minus({ days: 1 })
      .startOf('day')
      .toJSDate()
    const endOfDay2Hier = DateTime.now()
      .setZone('Africa/Lubumbashi')
      .minus({ days: 1 })
      .endOf('day')
      .toJSDate()

    const salesTodayHier = await Sale.query()
      .where('userid', Number(auth.user?.id))
      .whereBetween('created_at', [startOfDay2Hier, endOfDay2Hier])

    salesTodayHier.forEach((sale) => {
      const hour = sale.createdAt.setZone('Africa/Lubumbashi').plus({ hours: -1 }).hour
      if (hour >= 0 && hour <= 23) {
        salesByHourHier[hour - 0] += Number(sale.totalPrice)
      }
    })

    // 2. Données hebdomadaires (cette semaine et semaine dernière)
    const currentWeekSales = Array(7).fill(0) // 7 jours
    const lastWeekSales = Array(7).fill(0)

    // Cette semaine
    const salesThisWeek = await Sale.query()
      .where('userid', Number(auth.user?.id))
      .whereBetween('created_at', [startOfWeek, endOfWeek])

    salesThisWeek.forEach((sale) => {
      const dayOfWeek =
        DateTime.fromJSDate(sale.createdAt.toJSDate()).setZone('Africa/Lubumbashi').weekday - 1 // Lundi=0, Dimanche=6
      if (dayOfWeek >= 0 && dayOfWeek < 7) {
        currentWeekSales[dayOfWeek] += Number(sale.totalPrice)
      }
    })

    // Semaine dernière
    const startOfLastWeek = DateTime.now()
      .setZone('Africa/Lubumbashi')
      .startOf('week')
      .minus({ weeks: 1 })
    const endOfLastWeek = startOfLastWeek.endOf('week')

    const salesLastWeek = await Sale.query()
      .where('userid', Number(auth.user?.id))
      .whereBetween('created_at', [startOfLastWeek.toJSDate(), endOfLastWeek.toJSDate()])

    salesLastWeek.forEach((sale) => {
      const dayOfWeek = sale.createdAt.setZone('Africa/Lubumbashi').weekday - 1
      if (dayOfWeek >= 0 && dayOfWeek < 7) {
        lastWeekSales[dayOfWeek] += Number(sale.totalPrice)
      }
    })

    // 3. Données mensuelles (12 mois)
    const salesByMonth = Array(12).fill(0)

    const startOfYear = DateTime.now().setZone('Africa/Lubumbashi').startOf('year')
    const endOfYear = startOfYear.endOf('year')

    const salesThisYear = await Sale.query()
      .where('userid', Number(auth.user?.id))
      .whereBetween('created_at', [startOfYear.toJSDate(), endOfYear.toJSDate()])

    salesThisYear.forEach((sale) => {
      const month =
        DateTime.fromJSDate(sale.createdAt.toJSDate()).setZone('Africa/Lubumbashi').month - 1 // Janvier=0
      if (month >= 0 && month < 12) {
        salesByMonth[month] += Number(sale.totalPrice)
      }
    })

     // 1. Performance du Jour - Top 3 produits
     const today = DateTime.now().toISODate()
     const salesTodayForTopProducts = await Sale.query()
       .where('userid',Number(auth.user?.id))
       .where('created_at', '>=', today)
       .preload('produits', (query) => {
         query.preload('product')
       })
     
     // Calcul du top produits du jour
     const productTotals: Record<string, number> = {}
     salesTodayForTopProducts.forEach(sale => {
       sale.produits.forEach(item => {
         const productName = item.product.name
         const total = item.quantity * item.prixUnitaire
         productTotals[productName] = (productTotals[productName] || 0) + total
       })
     })
     const topProductsToday = Object.entries(productTotals)
       .sort((a, b) => b[1] - a[1])
       .slice(0, 5)
       .map(([name, total]) => ({ name, total }))

       // Top Produit week 

         // 1. Performance du week - Top 3 produits
             const debutWeek = now.startOf('week').toISODate()
    const finWeek = now.endOf('week').toISODate()
     const salesWeekForTopProducts = await Sale.query()
       .where('userid',Number(auth.user?.id))
       .whereBetween('created_at',  [debutWeek, finWeek])
       .preload('produits', (query) => {
         query.preload('product')
       })
     
     // Calcul du top produits du jour
     const productTotalsweek: Record<string, number> = {}
     salesWeekForTopProducts.forEach(sale => {
       sale.produits.forEach(item => {
         const productName = item.product.name
         const total = item.quantity * item.prixUnitaire
         productTotalsweek[productName] = (productTotalsweek[productName] || 0) + total
       })
     })
     const topProductsweek = Object.entries(productTotalsweek)
       .sort((a, b) => b[1] - a[1])
       .slice(0, 5)
       .map(([name, total]) => ({ name, total }))
 
          // Top Produit week 

         // 1. Performance du week - Top 3 produits
             const debutMonth = now.startOf('month').toISODate()
    const finMonth = now.endOf('month').toISODate()
     const salesMonthForTopProducts = await Sale.query()
       .where('userid',Number(auth.user?.id))
       .whereBetween('created_at',  [debutMonth, finMonth])
       .preload('produits', (query) => {
         query.preload('product')
       })
     
     // Calcul du top produits du jour
     const productTotalsMonth: Record<string, number> = {}
     salesMonthForTopProducts.forEach(sale => {
       sale.produits.forEach(item => {
         const productName = item.product.name
         const total = item.quantity * item.prixUnitaire
         productTotalsMonth[productName] = (productTotalsMonth[productName] || 0) + total
       })
     })
     const topProductsMonth = Object.entries(productTotalsMonth)
       .sort((a, b) => b[1] - a[1])
       .slice(0, 5)
       .map(([name, total]) => ({ name, total }))
 
    
    

    return view.render('dashboard', {
      topProductsMonth,
topProductsweek,
      topProductsToday,
      salesByHourHier,
      salesByHour,
      currentWeekSales,
      lastWeekSales,
      salesByMonth,
      augmentationTransactionDayStat: augmentationTransactionDayStat.toFixed(1),
      augmentationTransactionWeekStat: augmentationTransactionWeekStat.toFixed(1),
      augmentationTransactionMonthStat: augmentationTransactionMonthStat.toFixed(1),

      augmentationTransactionMonth: augmentationTransactionMonth.toFixed(1),
      augmentationTransactionWeek: augmentationTransactionWeek.toFixed(1),
      augmentationTransactionDay: augmentationTransactionDay.toFixed(1),

      augmentationMonth: augmentationMonth.toFixed(1),
      augmentationWeek: augmentationWeek.toFixed(1),
      augmentationDay: auglantationDay.toFixed(1),
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
      Alerte: alt,
      DateTime,
    })
  }
  
  }
