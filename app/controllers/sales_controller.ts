import type { HttpContext } from '@adonisjs/core/http'
import Sale from '#models/sale'
import Product from '#models/product'
import ProduitDeVente from '#models/produit_de_vente'
import { DateTime } from 'luxon'

export default class SalesController {
  public async index({ view, auth }: HttpContext) {

    const sales = await Sale.query()
    .preload('produits', (query) => {
      query.preload('product') 
    })
    .orderBy('created_at', 'desc').where('userid', Number(auth.user?.id))

    const produit_de_vente = await ProduitDeVente.query().preload('product').where('userid', Number(auth.user?.id))
    const SALE = await Sale.query()
      .preload('product')
      .orderBy('created_at', 'desc')
      .where('userid', Number(auth.user?.id))


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

                            
    return view.render('sales/index', { sales, SALE, auth ,produit_de_vente,Alerte:alt})
  }

  public async create({ view, auth }: HttpContext) {
    const products = await Product.findManyBy('userid', auth.user?.id)

    return view.render('sales/create', { products })
  }

  public async store({ request, response ,auth}: HttpContext) {

    const produits = request.input('produits') 
    const prixTotal = request.input('prix_total')
    const nombreDeProduit = request.input('nombre_de_produit')


      // Créer la vente
      if(produits && prixTotal && nombreDeProduit){
        const vente = await Sale.create({
          nombreDeProduit: nombreDeProduit,
          totalPrice: prixTotal,
          userid:auth.user?.id
        })
  
        // Créer les produits associés à cette vente
        for (const produit of produits) {
          const produitSelection = await Product.findOrFail(produit.id_produit);
          produitSelection.quantity -= produit.quantite;
          produitSelection.save();

           await ProduitDeVente.create({
            idSale: vente.id,
            userid:auth.user?.id,
            idProduct: produit.id_produit,
            quantity: produit.quantite,
            prixUnitaire: parseFloat(produit.prix_unitaire) 
          })
         
        }
      }
   

    
    return response.redirect('/sales')
      
    }

  public async stats({}: HttpContext) {
  }
}