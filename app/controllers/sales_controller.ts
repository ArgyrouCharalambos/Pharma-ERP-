import type { HttpContext } from '@adonisjs/core/http'
import Sale from '#models/sale'
import Product from '#models/product'
import ProduitDeVente from '#models/produit_de_vente'

export default class SalesController {
  public async index({ view, auth }: HttpContext) {

    const sales = await Sale.query()
    .preload('produits', (query) => {
      query.preload('product') // si tu veux aussi les infos du produit lié
    })
    .orderBy('created_at', 'desc').where('userid', Number(auth.user?.id))

    sales.forEach(e => {
      console.log(e.produits)

      
    })

    const produit_de_vente = await ProduitDeVente.query().preload('product').where('userid', Number(auth.user?.id))
    const SALE = await Sale.query()
      .preload('product')
      .orderBy('created_at', 'desc')
      .where('userid', Number(auth.user?.id))
    return view.render('sales/index', { sales, SALE, auth ,produit_de_vente})
  }

  public async create({ view, auth }: HttpContext) {
    const products = await Product.findManyBy('userid', auth.user?.id)

    return view.render('sales/create', { products })
  }

  public async store({ request, response ,auth}: HttpContext) {

    const produits = request.input('produits') // C’est un tableau d’objets : produits[0][...] etc.
    const prixTotal = request.input('prix_total')
    const nombreDeProduit = request.input('nombre_de_produit')


      // 1. Créer la vente
      const vente = await Sale.create({
        nombreDeProduit: nombreDeProduit,
        totalPrice: prixTotal,
        userid:auth.user?.id
      })

      // 2. Créer les produits associés à cette vente
      for (const produit of produits) {
         await ProduitDeVente.create({
          idSale: vente.id,
          userid:auth.user?.id,
          idProduct: produit.id_produit,
          quantity: produit.quantite,
          prixUnitaire: parseFloat(produit.prix_unitaire) 
        })
       
      }
   

    
    return response.redirect('/sales')
      
    }

  public async stats({}: HttpContext) {
  }
}