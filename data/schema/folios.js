'use strict'

const {getDBInstance} = require('../connection')
const {FOLIOS} = require('../../configs/config')
const CENTURY = 2000

let currentYear = new Date().getFullYear() 
let currentMonth = new Date().getMonth() + 1
console.log(`Current value for 'ejercicio': ${currentYear}`)
console.log(`Current value for 'periodo': ${currentMonth}`)

let tipo = 'Dr', ejercicio=currentYear, periodo = currentMonth

const SQL_FIND_ALL = `SELECT * FROM ${FOLIOS}`
const SQL_FINDBY_TIPO = `SELECT * FROM ${FOLIOS} f WHERE f.tippol = ${tipo}`
const SQL_FINDBY_TIPO_EJERCICIO = `SELECT FIRST 1 * FROM ${FOLIOS} f WHERE f.tippol = ? AND f.ejercicio = ?`
const SQL_FINDBY_EJERCICIO = `SELECT * FROM ${FOLIOS} f WHERE f.ejercicio = ?`


async function getAll(cb) {
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FIND_ALL, (err, data) => {
            if(err){
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            setImmediate(() => cb(null, data))
        })
    }catch(err) {
        console.log('error in query')
        console.log(`===> Error getting data folios.getAll:\n${err}`)
        setImmediate(() => cb(err))
    }
}
async function getByYear(ejercicio, cb) {
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FINDBY_EJERCICIO, [ejercicio], (err, data) => {
            if(err){
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            setImmediate(() => cb(null, data))
        })
    }catch(err) {
        console.log('error in query')
        console.log(`===> Error getting data folios.getAll:\n${err}`)
        setImmediate(() => cb(err))
    }
}

async function getNext_Folio(tipo, ejercicio, periodo, cb) {
    try {
        const dbInstance = await getDBInstance()
        console.log(`query: ${SQL_FINDBY_TIPO_EJERCICIO}`)
        dbInstance.query(SQL_FINDBY_TIPO_EJERCICIO, [tipo, ejercicio], (err, data) => {
            if(err){
                setImmediate(() => cb(err, null))            
            }
            if (Array.isArray(data) && data.length>0){
                if (periodo<10){
                    periodo = '0'+periodo.toString()
                } else {
                    periodo = periodo.toString()
                }
                const field = `FOLIO${periodo}`
                console.log(`data[0].${field} = ` + data[0][field])
                data = parseInt(data[0][field]) + 1
                err = null
            } else {
                data = -1
                err = new Error('No se ha localizado un valor para el ejercicio-periodo especificado.')
            }
            dbInstance.detach()
            setImmediate(() => cb(err, data))
        })
    }catch(err){
        console.log('error in query')
        console.log(`===> Error getting data Folios.getNext_Folio\n${err}`)
        setImmediate(() => cb(err, null))
    }
}

async function setFolio(tipo, ejercicio, periodo, folio, cb) {
    try {
        if (periodo<10){
            periodo = '0'+periodo.toString()
        } else {
            periodo = periodo.toString()
        }
        console.log(`periodo: ${periodo}`)
        const SQL_UPDATE_FOLIO = `UPDATE ${FOLIOS} SET 
            FOLIO${periodo} = ${folio} 
            WHERE TIPPOL = '${tipo}' AND EJERCICIO = ${ejercicio}` // RETURNING TIPPOL, EJERCICIO, FOLIO${periodo}
        console.log('Updating folio with: ', SQL_UPDATE_FOLIO)
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_UPDATE_FOLIO, (err, data) => {
            if(err) {
                console.log(`Error querying data\n===>Error in update at setFolio\n${err}`)
                setImmediate(() => cb(err))
            } else {
                data = {'status':'ok', 'message': `folio updated with value ${folio}`} 
                console.log('data from update:', data)
                //if(data){
                    console.log(`Update successful, result with ${data}`)
                    dbInstance.detach()
                    setImmediate(() => cb(null, data))
                //} else {
                //    setImmediate(() => cb(new Error('Can not update the record, verify input data.')))
                //}
            }
        })
    }catch(err){
        console.log('error in query')
        console.log(`===> Error updating data Folios.update\n${err}`)
        setImmediate(() => cb(err, null))
    }
}

module.exports={
    getAll, getNext_Folio, setFolio, getByYear
}