'use strict'
const poliza = require('../../data/schema/polizas')
const auxiliar = require('../../data/schema/auxiliar')
const polizaTipo = require('../../data/schema/polizatipos')
const {promisify} = require('util')

const getAllPolizas = promisify(poliza.getAll)
const getAllPolizaTipos = promisify(polizaTipo.getAll)
const insertPoliza = promisify(poliza.addPoliza)
const getAllAuxiliares = promisify(auxiliar.getAll)
const insertAuxiliar = promisify(auxiliar.addAuxiliar)
const formatCuentaContable = promisify(auxiliar.formatoCuentaContable)
const deletePoliza = promisify(poliza.deletePoliza)
const deleteAuxiliares = promisify(auxiliar.deleteAuxiliares)
//const getCuentaContable = promisify(auxiliar.obtieneCuentaContable)

let poliza_demo = { TIPO_POLI: 'Eg', NUM_POLIZ: 145, PERIODO: 11, EJERCICIO: 2021, FECHA_POL: '2021-11-25', CONCEP_PO: 'TRA-NOM PAGO NÓMINA 13NOV - 26NOV21', NUM_PART: 2, TIENEDOCUMENTOS: 0, PROCCONTAB: 34313, UUID: ''}
let auxiliar_demo = { TIPO_POLI: 'Dr', NUM_POLIZ: '1   6', NUM_PART:2, PERIODO: 11, EJERCICIO: 2021, NUM_CTA:"500000100100000000003", FECHA_POL:"2021-01-03T23:00:00.000Z", CONCEP_PO:"Costo de ventas. Doc. C14716 04/01/2021 RE-0002 NS27047", DEBE_HABER:"D", MONTOMOV:151945.54, NUMDEPTO:9, TIPCAMBIO:1, CONTRAPAR:0, ORDEN:2, CCOSTOS:0, CGRUPOS:0, IDINFADIPAR:0, IDUUID:0}

const polizasRoutes = async (fastify, opts) => {
    fastify.get('/polizas', (request, reply) => {
        getAllPolizas()
        .then((data) => {
            // console.log(`data: ${data}`)
            reply.status(200).send(JSON.parse(data))
        }).catch((err) => {
            return reply.send('Error call:' + err)
        })
    })
    fastify.get('/polizas/tipos', (request, reply) => {
        getAllPolizaTipos()
        .then((data) => {
            reply.send(JSON.parse(data))
        }).catch((err) => {
            return reply.send(`Error call /polizas/tipo:\n${err}`)
        })
    })
    fastify.post('/polizas', async (request, reply) => {
        try{
            //insertPoliza(poliza_demo)        
            const poliza_coi = request.body        
            console.log('poliza coi:', poliza_coi)
            await insertPoliza(poliza_coi)
            .then((data) => {
                console.log(data)
                return reply.status(201).send(data)
            }).catch((err) => {
                console.log(err)
                return reply.status(500).send(err)
            })
        } catch(err) {
            console.log(err)
            return reply.status(500).send(err)
        }
    })
    fastify.delete('/polizas', async (request, reply) => {
        try {
            const {type, number, fiscalYear, period} = request.body
            await deletePoliza(type, number, fiscalYear, period)
            .then((data) => {
                console.log('Everything goes well deleting invoice:', number)
                reply.status(204)
            })
            .catch((err) => {
                console.log('Error deleting invoice:', number)
                reply.status(500).send('Internal server error')
            })
        } catch(err){
            console.log('Exception at X DELETE polizas')
            reply.status(500).send('Internal server error')
        }
    })
    fastify.get('/polizas/auxiliares', (request, reply) => {
        getAllAuxiliares().then((data) => {
            //console.log(`data: ${data}`)
            data= JSON.parse(data)
            reply.status(200).send(data)
        }).catch((err) => {
            console.log(err)
            reply.status(500).send(err) 
        })
    })
    fastify.get('/polizas/auxiliares/cuenta/:cuentaContable', async (request, reply) => {
        const {cuentaContable} = request.params
        try {
            let response
            if (cuentaContable){
                console.log(`===> cuentaContable = ${cuentaContable}`)
                const data = await auxiliar.obtieneCuentaContable(cuentaContable)
                if (data===''){
                    console.log(`cuentaContable '${cuentaContable}' not found!, using current value.`)
                    await formatCuentaContable(cuentaContable)
                    .then((data) => {
                        console.log(`new data is: ${data}`)
                        response = data
                    })
                    .catch((err) => {
                        throw err
                    })
                    /*
                    auxiliar.formatoCuentaContable(cuentaContable, (err, data) => {
                        if(err){
                            throw err
                            //reply.status(500).send(err)
                        }
                        console.log(`formattedAccount: ${data}`)
                        response = data                    
                    })
                    */
                } else {
                    console.log(`data = ${data}`)
                    response = data
                }
                reply.status(200).send({accountNumber: response})    
            } else {
                reply.status(400).send('Bad format. Value for account number is missing!')
            }
        }catch(err){
            reply.status(500).send(err)
        }
    })
    fastify.post('/polizas/auxiliares', (request, reply) => {        
        try {
            console.log('payload auxiliar:', request.body)
            const auxiliar = request.body
            insertAuxiliar(auxiliar)
            .then((data) => {
                console.log(data)
                reply.status(201).send(data)
            }).catch((err) => {
                console.log(err)
                reply.status(500).send(err)
            })
        } catch(err){
            reply.status(500).send(err)
        }
    })
    fastify.delete('/polizas/auxiliares', async (request, reply) => {
        try {
            const {type, number, fiscalYear, period} = request.body
            //console.log(`type: ${type}, number: ${number}, fiscalYear: ${fiscalYear}, period: ${period}`)
            await deleteAuxiliares(type, number, fiscalYear, period)
            .then((data) => {
                console.log('Everything goes well deleting auxiliares:', number)
                reply.status(204)
            })
            .catch((err) => {
                console.log('Error deleting invoice:', number)
                reply.status(500).send('Internal server error')
            })
        } catch(err){
            console.log('Exception at X DELETE polizas')
            reply.status(500).send('Internal server error')
        }
    })
}

module.exports=polizasRoutes