'use strict'
const cuentas = require('../../data/schema/cuentas')
const {promisify} = require('util')

const getAll_Cuentas = promisify(cuentas.getAll)
const getAll_Gastos = promisify(cuentas.getAll_Gastos)
const getBy_NumeroCuenta = promisify(cuentas.getBy_NumeroCuenta)

const cuentasRoutes = async (fastify, opts) => {
    fastify.get('/cuentas', (request, reply) => {
        getAll_Cuentas().then((data) => {
            reply.send(JSON.parse(data))
        }).catch((err) => {
            return reply.send(`Error calling /cuentas:\n${err}`)
        })
    })
    fastify.get('/cuentas/:id', (request, reply) => {
        const {id} = request.params
        console.log(`id: ${id}`)
        if (id){
            let accountNumber = id.toString()
            accountNumber = accountNumber.replace('-', '')        
            console.log(`===> accountNumber ${typeof accountNumber} is ${accountNumber}`)
            getBy_NumeroCuenta(accountNumber).then((data) => {
                reply.send(JSON.parse(data))
            }).catch((err) => {
                return reply.send(`Error calling /cuentas/${id}\n${err}`)
            })
        } else {
            reply.status(400).send('Bad format. Field id is required.')
        }
    })
    fastify.get('/cuentas/gastos', (request, reply) => {        
        getAll_Gastos().then((data) => {
            reply.send(JSON.parse(data))
        }).catch((err) => {
            return reply.send(`Error calling /cuentas/gastos\n${err}`)
        })
    })
}

module.exports=cuentasRoutes