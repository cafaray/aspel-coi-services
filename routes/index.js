'use strict'

const root = async (fastify, opts) => {
    fastify.get('/', (request, reply) => {
        return {message: 'ASPEL-COI interface'}
    })
}

module.exports = root