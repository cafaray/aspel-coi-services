'use strict'

const periodos = require('../../data/schema/periodos')
const {promisify} = require('util')
const { default: fastify } = require('fastify')

const getALL_Periodos = promisify(periodos.getAll)
const getLast = promisify(periodos.getLast)

const periodosRoutes = async (fastify, opts) => {
    fastify.get('/periodos', (request, reply) => {
        getALL_Periodos()
        .then((data) => {
            reply.status(200).send(JSON.parse(data))
        }).catch((err) => {
            return reply.status(500).send(`Error calling /periodos:\n${err}`)
        })
    })
    fastify.get('/periodos/ultimo', (request, reply) => {
        getLast()
        .then((data) => {
            console.log(`getting last period data: ${data}`)
            reply.status(200).send(JSON.parse(data))
        }).catch((err) => {
            return reply.status(500).send(`Error calling /periodos:\n${err}`)
        })
    })
}

module.exports=periodosRoutes