import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import { DateTime } from 'luxon'

export default class ProductsController {
  public async index({ view, request, auth }: HttpContext) {
    const sortBy = request.input('sortBy', 'id') 
    const PRODUCT = await Product.query()
      .orderBy(sortBy, 'asc')
      .where('userid', Number(auth.user?.id))
    const products = await Product.findManyBy('userid', auth.user?.id)

     const total =
          (
            await Product.query()
              .sum('quantity as total')
              .where('userid', Number(auth.user?.id))
              .first()
          )?.$extras.total || 0

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

                const Total = Product.findManyBy('userid', auth.user?.id)

                let valeurTotalDuStock = 0;
                
                (await Total).forEach(e => {
                  valeurTotalDuStock = valeurTotalDuStock + (e.quantity * e.price);

                });


    return view.render('products/index', { totalStock: total,products, PRODUCT, auth,Alerte:alt ,valeurTotalDuStock,DateTime})
  }

  public async create({ view }: HttpContext) {
    return view.render('products/create')
  }

  public async store({ request, response, auth }: HttpContext) {
    const data = request.only(['name', 'quantity', 'price', 'expiration_date'])
    await Product.create({
      name: data.name,
      quantity: data.quantity,
      price: data.price,
      expirationDate: data.expiration_date,
      userid: auth.user?.id,
    })
    return response.redirect().toRoute('products.index')
  }

  public async show({ params, view }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    return view.render('products/show', { product })
  }

  public async edit({ params, view }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    return view.render('products/edit', { product })
  }

  public async update({ params, request, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    product.merge(request.only(['name', 'quantity', 'price', 'expiration_date']))
    await product.save()
    return response.redirect().toRoute('products.index')
  }

  public async destroy({ params, response }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    await product.delete()
    return response.redirect().toRoute('products.index')
  }

  public async alerts({ view, auth }: HttpContext) {
    const products = await Product.query()
    const PRODUCTS = await Product.query().where('userid',Number(auth.user?.id)).where('expiration_date', '<', DateTime.now().toSQLDate())
    const critiqueResult = await Product.query().where('userid',Number(auth.user?.id)).where('quantity', '<', 10).count('* as total')
    const Critique = critiqueResult[0]?.$extras.total || 0
    const PRODUCT = await Product.query().where('userid',Number(auth.user?.id)).where('quantity', '<', 10)
    const Expire =
      (
        await Product.query()
          .where('userid',Number(auth.user?.id))
          .where('expiration_date', '<', DateTime.now().toSQLDate())
          .count('* as total')
      )[0]?.$extras.total || 0
               
   let alt = (Number(Critique) + Number(Expire))
    return view.render('products/alerts', { products, auth, Expire, PRODUCTS, Critique, PRODUCT ,Alerte:alt})
  }
}
