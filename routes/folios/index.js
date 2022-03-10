'use strict'

const folios = require('../../data/schema/folios')
const {promisify} = require('util')
const { request } = require('http')


const getAll_Folios = promisify(folios.getAll)
const updateFolio = promisify(folios.setFolio)
const getByEjercicio = promisify(folios.getByYear)
const nextFolio = promisify(folios.getNext_Folio)

const foliosRoutes = async (fastify, opts) => {
    fastify.put('/folios/:ejercicio', async function (request, reply) {
        try {
            const {ejercicio} = request.params
            console.log(`body: ` + JSON.stringify(request.body))
            const {tipo, periodo, folio} = request.body
            console.log(`ejercicio: ${ejercicio}, tipo: ${tipo}, periodo: ${periodo}, folio: ${folio}`)
            if (ejercicio && tipo && periodo && folio){
                await updateFolio(tipo, ejercicio, periodo, folio)
                .then((data) => {
                    console.log(`${data}`)
                    reply.status(200).send(data)
                })
                .catch((err) => {
                    reply.status(500).send(`Internal server error.\n${err}`)
                })
            } else {
                reply.status(500).send(`Missing one impertaive param, verify the input data: tipo, periodo, folio`)    
            }
        }catch(err){
            reply.status(500).send(`Internal server error: ${err}`)
        }
    })
    fastify.get('/folios', (request, reply) => {
        
        getAll_Folios().then((data) => {
            reply.status(200).send(JSON.parse(data))
        }).catch((err) => {
            return reply.status(500).send(`Error calling /folios:\n${err}`)
        })
        
       
    })
    fastify.get('/folios/:ejercicio', async (request, reply) => {
        try {
            const {ejercicio} = request.params
            await getByEjercicio(ejercicio)
            .then((data) => {
                reply.status(200).send(JSON.parse(data))
            }).catch((err) => {
                return reply.status(500).send(`Error calling /folios:\n${err}`)
            })
        } catch(err) {
            reply.status(500).send(`Internal server error: ${err}`)
        }       
    })
    fastify.get('/folios/:ejercicio/next', async (request, reply) => {
        try {
            const {tipo, periodo} = request.query
            const {ejercicio} = request.params
            if (ejercicio && tipo && periodo) {
                await nextFolio(tipo, ejercicio, periodo, (err, data)=>{
                    if(err){
                        reply.status(500).send(err)
                    }
                    if (data) {
                        const response = {folio:data}
                        reply.send(response)
                    } else {
                        reply.status(404).send('No se localizo información del período')
                    }
                })
            } else {
                reply.status(400).send(`Missing params. Review input data.`)
            }
        }catch(err) {
            reply.status(500).send(`Internal server error: ${err}`)
        }
        /*
        get_NextFolio().then((data) => {
            reply.send(JSON.stringify(data))
        }).catch((err) => {
            return reply.send(`Error calling /folios:\n${err}`)
        })
        */
    })
}
module.exports=foliosRoutes