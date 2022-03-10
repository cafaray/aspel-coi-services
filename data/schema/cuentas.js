'use strict'
const {getDBInstance} = require('../connection')
const {CUENTAS} = require('../../configs/config')

const SQL_FIND_ALL = `SELECT * FROM ${CUENTAS}`
const SQL_FIND_GASTOS = `SELECT * FROM ${CUENTAS} WHERE NUM_CTA >= '50000000000000000000' AND NUM_CTA <= '69990000000000000000' ORDER BY NUM_CTA`

async function getAll(cb) {
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FIND_ALL, (err, data) => {
            if (err){
                setImmediate(()=>cb(err))
            }            
            data = JSON.stringify(data)
            setImmediate(() => cb(null, data))
            dbInstance.detach()
        }) 
    } catch (err) {
        console.log('error in query!')
        console.log(`===> Error getting data:\n${err}`)
        setImmediate(() => cb(err))
    }
}
async function getAll_Gastos(cb) {
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FIND_GASTOS, (err, data) => {
            if (err){
                setImmediate(() => cb(err))
            }            
            data = JSON.stringify(data)
            setImmediate(() => cb(null, data))
            dbInstance.detach()
        }) 
    } catch (err) {
        console.log('error in query!')
        console.log(`===> Error getting data:\n${err}`)
        setImmediate(() => cb(err))
    }
}

async function getBy_NumeroCuenta(cuenta, cb) {
    try{
        const dbInstance = await getDBInstance()        
        dbInstance.query(`SELECT FIRST 1 * FROM ${CUENTAS} WHERE NUM_CTA LIKE '${cuenta}%' ORDER BY NUM_CTA;`, (err, data) => {
            if(err){
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            setImmediate(() => cb(null, data))
            dbInstance.detach()
        })
    } catch( err) {
        console.log('error in query!')
        console.log(`===> Error getting data:\n${err}`)
        setImmediate(() => cb(err))
    }
}

module.exports={
    getAll, getAll_Gastos, getBy_NumeroCuenta
}