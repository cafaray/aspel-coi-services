'use strict'

const {PERIODOS} = require('../../configs/config')
const {getDBInstance} = require('../connection')
console.log(`PERIODOS: ${PERIODOS}`)
const SQL_FIND_ALL = `SELECT * FROM ${PERIODOS} p`
const SQL_FIND_LAST = `SELECT FIRST 1 * FROM ${PERIODOS} p ORDER BY p.ejercicio DESC, p.periodo DESC`

async function getAll(cb) { 
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FIND_ALL, (err, data) => {
            if (err){
                setImmediate(() => cb(err))
            }            
            data = JSON.stringify(data)
            dbInstance.detach()
            setImmediate(() => cb(null, data))
        }) 
    } catch (err) {
        console.log('error in query periodos.getAll!')
        console.log(`===> Error getting data:\n${err}`)
        setImmediate(() => cb(err))
    }
}

async function getLast(cb) { 
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FIND_LAST, (err, data) => {
            if (err){
                setImmediate(() => cb(err))
            }            
            data = JSON.stringify(data)
            dbInstance.detach()
            setImmediate(() => cb(null, data))
        }) 
    } catch (err) {
        console.log('error in query periodos.getLast!')
        console.log(`===> Error getting data:\n${err}`)
        setImmediate(() => cb(err))
    }
}

module.exports = {
    getAll,
    getLast
}