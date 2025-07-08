import type { HttpContext } from '@adonisjs/core/http'
import Sale from '#models/sale'
import Product from '#models/product'
import ProduitDeVente from '#models/produit_de_vente'
import { DateTime } from 'luxon'
import PdfPrinter from 'pdfmake'

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

                            
    return view.render('sales/index', { sales, SALE, auth ,produit_de_vente,Alerte:alt,DateTime})
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
          userid:auth.user?.id,
          createdAt:DateTime.now().plus({ hours: 2 })
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

     public async exportMonthlySales({ request, response }: HttpContext) {
    const selectedMonth = request.input('month')
    
    // Validation du mois
    if (!selectedMonth || !/^\d{4}-\d{2}$/.test(selectedMonth)) {
      return response.badRequest({ error: 'Format de mois invalide. Utilisez YYYY-MM' })
    }

    try {
      // Calcul des dates de début/fin
      const startDate = DateTime.fromFormat(selectedMonth, 'yyyy-MM').startOf('month')
      const endDate = startDate.endOf('month')

      // Récupération des données (utilisation de toSQL() pour le format compatible avec la BDD)
      const sales = await Sale.query()
        .whereBetween('created_at', [startDate.toJSDate(), endDate.toJSDate()])
        .preload('produits', (query) => {
          query.preload('product')
        })
        .orderBy('created_at', 'desc')

      // Vérification si des données existent
      if (sales.length === 0) {
        return response.badRequest({ error: 'Aucune vente trouvée pour ce mois' })
      }

      // Configuration des polices
      const fonts = {
        Helvetica: {
          normal: 'Helvetica',
          bold: 'Helvetica-Bold',
          italics: 'Helvetica-Oblique',
          bolditalics: 'Helvetica-BoldOblique'
        }
      }

      const printer = new PdfPrinter(fonts)

      // Définition du document
      const docDefinition = {
        content: [
          { text: 'Journal des Ventes Mensuel', style: 'header' },
          { text: `Période: ${startDate.setLocale('fr').toFormat('MMMM yyyy')}`, style: 'subheader' },
          this.generateSalesTable(sales)
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center' as const,
            margin: [0, 0, 0, 20] as [number, number, number, number]
          },
          subheader: {
            fontSize: 14,
            bold: true,
            margin: [0, 0, 0, 10] as [number, number, number, number]
          },
          tableHeader2:{
            fontSize: 9,
            color: 'black',
            margin: [0, 0, 0, 0.5] as [number, number, number, number]
          },
          tableHeader: {
            bold: true,
            fontSize: 10,
            color: 'black',
            margin: [0, 10, 0, 2] as [number, number, number, number]

          }
        },
        defaultStyle: {
          font: 'Helvetica'
        }
      }

      // Création du PDF
      const pdfDoc = printer.createPdfKitDocument(docDefinition)
      
      // Configuration des en-têtes de réponse
      response.type('application/pdf')
      response.header('Content-Disposition', `attachment; filename=ventes_${selectedMonth}.pdf`)
      
      // Gestion correcte du flux PDF
      return new Promise((resolve, reject) => {
        pdfDoc.pipe(response.response)
        pdfDoc.on('end', resolve)
        pdfDoc.on('error', reject)
        pdfDoc.end()
      })

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      return response.status(500).send('Erreur lors de la génération du PDF')
    }
  }

  private generateSalesTable(sales: Sale[]) {
    // Simplification du tableau pour éviter les erreurs de format
    const tableBody = [
      [
        { text: 'Date', style: 'tableHeader' },
        { text: 'Produits', style: 'tableHeader' },
        { text: 'Montant', style: 'tableHeader' }
      ]
    ]

    let vente = 0;
    sales.forEach(sale => {
      tableBody.push([
        { text: sale.createdAt.plus({ hours: 2 }).toFormat('dd/MM/yyyy HH:mm'), style: 'tableHeader' },
        { text: `${sale.nombreDeProduit} Pcs`, style: 'tableHeader' },
        { text: `Total : ${Number(sale.totalPrice).toFixed(0)} Fc`, style: 'tableHeader' }
      ])
      vente = vente + Number(sale.totalPrice)
      
      // Ajout des produits
      sale.produits.forEach(produit => {
        tableBody.push([
          { text: '', style: 'tableHeader' },
          { text: `${produit.product?.name} (x${produit.quantity}) ${produit.prixUnitaire} Fc/Pcs`, style: 'tableHeader2' },
          { text: `${produit.quantity * produit.prixUnitaire} Fc`, style: 'tableHeader2' }
        ])
      })
    })

      tableBody.push([
        { text: "", style: 'tableHeader' },
        { text:"", style: 'tableHeader' },
        { text: `Total Général : ${Number(vente)} Fc`, style: 'tableHeader' }
      ])

    interface TableCell {
      text: string
      style: string
    }

    interface TableLayout {
      hLineWidth: (i: number, node: any) => number
      vLineWidth: (i: number, node: any) => number
      paddingLeft: (i: number, node: any) => number
      paddingRight: (i: number, node: any) => number
    }

    interface TableDefinition {
      widths: string[]
      body: TableCell[][]
    }

    interface TableReturnType {
      table: TableDefinition
      layout: TableLayout
    }

    return {
      table: {
      widths: ['*', '*', 'auto'],
      body: tableBody as TableCell[][]
      },
      layout: {
      hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 1 : 0,
      vLineWidth: () => 0,
      paddingLeft: () => 5,
      paddingRight: () => 5
      }
    } as TableReturnType
  }
  public async stats({}: HttpContext) {
  }
}