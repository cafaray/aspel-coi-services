'use strict'
const departamentos = require('../../data/schema/departamentos')
const {promisify} = require('util')

const getAll_Deptos = promisify(departamentos.getAll)

const deptosRoutes = async (fastify, opts) => {
    fastify.get('/deptos', (request, reply) => {
        getAll_Deptos().then((data) => {
            reply.send(JSON.parse(data))
        }).catch((err) => {
            return reply.send(`Error calling /deptos:\n${err}`)
        })
    })
}

module.exports=deptosRoutes