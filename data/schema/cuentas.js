'use strict'
const {getDBInstance} = require('../connection')
const {CUENTAS} = require('../../configs/config')

const SQL_FIND_ALL = `SELECT SUBSTRING(NUM_CTA FROM 1 FOR 10) NUM_CTA, SUBSTRING(NUM_CTA FROM 1 FOR 4)||'-'||SUBSTRING(NUM_CTA FROM 5 FOR 3)||'-'||SUBSTRING(NUM_CTA FROM 7 FOR 3)  NUM_CTA_FORMAT, NUM_CTA NUM_CTA_FULL, STATUS, TIPO, NOMBRE, CTA_RAIZ, CODAGRUP FROM ${CUENTAS}`
const SQL_FIND_GASTOS = `SELECT NUM_CTA, STATUS, TIPO, NOMBRE, CTA_RAIZ, CODAGRUP FROM ${CUENTAS} WHERE NUM_CTA >= '50000000000000000000' AND NUM_CTA <= '69990000000000000000' ORDER BY NUM_CTA`
const SQL_FIND_GASTOS_LIKE = `SELECT NUM_CTA, STATUS, TIPO, NOMBER, CTA_RAIZ, CODAGRUP FROM ${CUENTAS} WHERE NUM_CTA >= '50000000000000000000' AND NUM_CTA <= '69990000000000000000' AND NUM_CTA LIKE (?) ORDER BY NUM_CTA`

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
        console.log('cuenta.indexOf(-)', cuenta.indexOf("-"))
        if (cuenta.indexOf("-")>0){
            while (cuenta.indexOf("-")>0){
                cuenta = cuenta.replace('-', '')
            }
            console.log('nuevo valor en cuenta', cuenta)
        }
        const dbInstance = await getDBInstance()        
        dbInstance.query(`SELECT NUM_CTA, STATUS, TIPO, NOMBRE, CTA_RAIZ, CODAGRUP FROM ${CUENTAS} WHERE NUM_CTA >= '50000000000000000000' AND NUM_CTA <= '69990000000000000000' AND  NUM_CTA LIKE '${cuenta}%' ORDER BY NUM_CTA`, (err, data) => {
            if(err){
                setImmediate(() => cb(err))
            }
            console.log('data from searching cuenta contable', data)
            if (Array.isArray(data)){
                if (data[0]){
                    data = data[0]
                } else {
                    data = []
                }
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