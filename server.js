'use strict'

const fastify = require('fastify')({'logger':true})
const fs = require('fs')
const proc = require('process');
const path = require('path')
const PORT = process.env.PORT || 3000

const rootRoutes = require('./routes/index')
const polizasRoutes = require('./routes/polizas/index')
const cuentasRoutes = require('./routes/cuentas/index')
const deptosRoutes = require('./routes/deptos')
const foliosRoutes = require('./routes/folios')
const periodosRoutes = require('./routes/periodos')

var access = fs.createWriteStream(path.join(__dirname, '/node.access.log'), { flags: 'a' }),
error = fs.createWriteStream(path.join(__dirname, '/node.error.log'), { flags: 'a' });

// redirect stdout / stderr
proc.stdout.pipe(access);
proc.stderr.pipe(error);

fastify.register(rootRoutes)
fastify.register(polizasRoutes)
fastify.register(cuentasRoutes)
fastify.register(deptosRoutes)
fastify.register(foliosRoutes)
fastify.register(periodosRoutes)

fastify.register(require('fastify-multipart'))
fastify.register(require('fastify-formbody'))

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
