'use strict'

const fastify = require('fastify')({'logger':true})

const PORT = process.env.PORT || 3000

const rootRoutes = require('./routes/index')
const polizasRoutes = require('./routes/polizas/index')
const cuentasRoutes = require('./routes/cuentas/index')
const deptosRoutes = require('./routes/deptos')
const foliosRoutes = require('./routes/folios')
const periodosRoutes = require('./routes/periodos')

fastify.register(rootRoutes)
fastify.register(polizasRoutes)
fastify.register(cuentasRoutes)
fastify.register(deptosRoutes)
fastify.register(foliosRoutes)
fastify.register(periodosRoutes)

// This loads all plugins defined in routes
// define your routes in one of these
/*
fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
})
*/
const start = async () => {
    try {
        fastify.listen(PORT)
    } catch(err){
        console.error(err)
        exit(1)
    }
}

start()