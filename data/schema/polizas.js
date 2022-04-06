'use strict'
const firebird = require('node-firebird')
const {getDBInstance} = require('../connection')
var { GDSCode } = require('node-firebird/lib/gdscodes');
const {POLIZAS, AUXILIARES, LIMIT} = require('../../configs/config')
const {getLast} = require('./periodos')
const {promisify} = require('util');
const { ECDH } = require('crypto');

const getPeriodo = promisify(getLast)
let _tipoPoliza, _numeroPoliza, _ejercicio, _periodo
getPeriodo()
.then((data) => {
    _periodo = data
    console.log(`periodo : ${_periodo}`)

})
.catch((err) => {
    _periodo = -1
    console.log(err)        
})

const SQL_FIND_ALL = `SELECT ${LIMIT} 
    TIPO_POLI, NUM_POLIZ NUM_POLIZ, PERIODO, EJERCICIO, 
    SUBSTRING(CAST(FECHA_POL AS VARCHAR(24)) FROM 1 FOR 10) FECHA_POL,
    TRIM(CONCEP_PO) CONCEP_PO, NUM_PART, LOGAUDITA, CONTABILIZ, NUMPARCUA, TIENEDOCUMENTOS, 
    PROCCONTAB, ORIGEN, UUID, COALESCE(ESPOLIZAPRIVADA, '') ESPOLIZAPRIVADA, COALESCE(UUIDOP, '') UUIDOP
    FROM ${POLIZAS} ORDER BY FECHA_POL DESC`
const SQL_FINDBY_ID = `SELECT TIPO_POLI, NUM_POLIZ, PERIODO, EJERCICIO, 
    SUBSTRING(CAST(FECHA_POL AS VARCHAR(24)) FROM 1 FOR 10) FECHA_POL,
    TRIM(CONCEP_PO) CONCEP_PO, NUM_PART, LOGAUDITA, CONTABILIZ, NUMPARCUA, TIENEDOCUMENTOS, 
    PROCCONTAB, ORIGEN, UUID, COALESCE(ESPOLIZAPRIVADA, '') ESPOLIZAPRIVADA, COALESCE(UUIDOP, '') UUIDOP
    FROM ${POLIZAS} 
    WHERE TIPO_POLI = ${firebird.escape(_tipoPoliza)} AND NUM_POLIZ = ${firebird.escape(_numeroPoliza)} 
        AND ejercicio = ${_ejercicio} AND periodo = ${_periodo}`
const SQL_FINDBY_POLIZA = `SELECT TIPO_POLI, NUM_POLIZ, PERIODO, EJERCICIO, 
    SUBSTRING(CAST(FECHA_POL AS VARCHAR(24)) FROM 1 FOR 10) FECHA_POL,
    TRIM(CONCEP_PO) CONCEP_PO, NUM_PART, LOGAUDITA, CONTABILIZ, NUMPARCUA, TIENEDOCUMENTOS, 
    PROCCONTAB, ORIGEN, UUID, COALESCE(ESPOLIZAPRIVADA, '') ESPOLIZAPRIVADA, COALESCE(UUIDOP, '') UUIDOP 
    FROM ${POLIZAS} 
    WHERE NUM_POLIZ = ${firebird.escape(_numeroPoliza)}`
const SQL_REMOVE_POLIZA = `DELETE FROM ${POLIZAS} 
    WHERE TIPO_POLI = ? AND (NUM_POLIZ = ? OR TRIM(NUM_POLIZ) = ?)  AND ejercicio = ? AND periodo = ?`
const SQL_FIND_MATCH = `SELECT A.TIPO_POLI, A.NUM_POLIZ, A.PERIODO, A.EJERCICIO 
    FROM ${POLIZAS} A INNER JOIN ${AUXILIARES} B 
      ON A.TIPO_POLI = B.TIPO_POLI AND A.NUM_POLIZ = B.NUM_POLIZ AND A.PERIODO = B.PERIODO AND A.EJERCICIO = B.EJERCICIO 
      WHERE A.TIPO_POLI= ${firebird.escape(_tipoPoliza)} AND A.NUM_POLIZ= ${firebird.escape(_numeroPoliza)} AND A.PERIODO= ${_periodo} AND A.EJERCICIO= ${_ejercicio}`

console.log(`WORKING WITH TABLE POLIZA = ${POLIZAS}`)


const CAMPOS_TABLA_POLIZA = [
    "TIPO_POLI", 
    "NUM_POLIZ", 
    "PERIODO", 
    "EJERCICIO", 
    "FECHA_POL",
    "CONCEP_PO", 
    "NUM_PART", 
    "LOGAUDITA", 
    "CONTABILIZ", 
    "NUMPARCUA", 
    "TIENEDOCUMENTOS", 
    "PROCCONTAB", 
    "ORIGEN", 
    "UUID", 
    "ESPOLIZAPRIVADA"]

const TIPO_POLIZA = "Dr"
const LOG_AUDITA = "N"
const CONTABILIZ = "S"
const NUMPARCUA = 0
const ORIGEN = "NODE"
const ESPOLIZAPRIVADA = 0
const UUIDOP = null // siempre null en la base de datos

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
        console.log('error in query polizas.getAll!')
        console.log(`===> Error getting data:\n${err}`)
        setImmediate(() => cb(err))
    }
}

async function getById(tipo, ejercicio, periodo, cb) { 
    try {
        if (!(tipo && ejercicio && periodo)){
            setImmediate(()=>new Error(`Some parameter is missing: ${tipo}, ${ejercicio}, ${periodo}`))
        } 
        _tipoPoliza = tipo
        _ejercicio = ejercicio
        _periodo = periodo
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FINDBY_ID, (err, data) => {
            if (err){
                setImmediate(()=> cb(err))
            }            
            data = JSON.stringify(data)
            dbInstance.detach()
            setImmediate(()=> cb(null, data))
        }) 
    } catch (err) {
        console.log('error in query!')
        console.log(`===> Error getting data:\n${err}`)
        setImmediate(()=> cb(err))
    }
}
async function getByPoliza(poliza, cb) { 
    try {
        if(!poliza){
            setImmediate(()=>new Error(`Some parameter is missing: ${poliza}`))
        }
        _numeroPoliza = prefixPoliza(poliza)

        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FINDBY_POLIZA, (err, data) => {
            if (err){
                setImmediate(()=> cb(err))
            }            
            data = JSON.stringify(data)
            dbInstance.detach()
            setImmediate(()=>cb(null, data))
        }) 
    } catch (err) {
        console.log('error in query!')
        console.log(`===> Error getting data:\n${err}`)
        setImmediate(()=> cb(err))
    }
}
async function deletePoliza(tipo, poliza, ejercicio, periodo, cb) {
    try {
        if (!(tipo && ejercicio && periodo && poliza)){
            setImmediate(()=>new Error(`Some parameter is missing: ${tipo}, ${ejercicio}, ${periodo}, ${poliza}`))
        }
        console.log(`Parameters: ${tipo}, ${ejercicio}, ${periodo}, ${poliza}`)
        const dbInstance = await getDBInstance()        
        dbInstance.query(SQL_REMOVE_POLIZA, [tipo, poliza, poliza, ejercicio, periodo], (err, data) => {
            if(err){
                console.log('Error deleting poliza:', err)
                setImmediate(()=> cb(err))
            } else {
                console.log(`removed data: ${data}`)
                setImmediate(() => cb(null, data))         
            }
            dbInstance.detach()
        })
    } catch(err) {
        console.log('error in remove!')
        console.log(`===> Error removing data from poliza:\n${err}`)
        setImmediate(()=> cb(err))
    }
}

async function addPoliza(poliza, cb) {
    try{
        let numeroPoliza = poliza[CAMPOS_TABLA_POLIZA[1]]
        if (numeroPoliza.length < 5) {
            const padded = (numeroPoliza).toString().padStart(5, ' ')
            console.log(`padded value ${padded}`)
            numeroPoliza = padded
        }        
        const dbInstance = await getDBInstance()
        const SQL_INSERT = `INSERT INTO ${POLIZAS} VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) RETURNING NUM_POLIZ`        
        dbInstance.query(SQL_INSERT, [
            poliza[CAMPOS_TABLA_POLIZA[0]], // tipo poliza
            numeroPoliza, // numero
            poliza[CAMPOS_TABLA_POLIZA[2]], // periodo
            poliza[CAMPOS_TABLA_POLIZA[3]], // ejercicio
            poliza[CAMPOS_TABLA_POLIZA[4]], // fecha
            poliza[CAMPOS_TABLA_POLIZA[5]], // concepto
            poliza[CAMPOS_TABLA_POLIZA[6]], // numero partidas
            LOG_AUDITA, // log audita
            CONTABILIZ, // contabiliza
            NUMPARCUA, // numparcua
            poliza[CAMPOS_TABLA_POLIZA[10]], // tiene documentos
            poliza[CAMPOS_TABLA_POLIZA[11]], // procedimiento contable
            ORIGEN, // origen
            poliza[CAMPOS_TABLA_POLIZA[12]], // uuid
            ESPOLIZAPRIVADA,
            UUIDOP], (err, data) => {
            if(err){
                if(err.gdscode == GDSCode.UNIQUE_KEY_VIOLATION){
                    console.log('constraint name:'+ err.gdsparams[0]);
                    console.log('table name:'+ err.gdsparams[0]);                    
                }
                console.log(`***** Some error happens: ${err}`)
                setImmediate(() => cb(err.gdscode))
            } else {
                
                console.log(`I guess everything goews well, no error reported`)
                setImmediate(() => cb(null, data))
                dbInstance.detach()
            }
        })
    }catch(err) {
        console.log('error in insert query!')
        console.log(`===> Error inserting data poliza:\n${err}`)
        setImmediate(()=> cb(err))
    }
}

async function esPolizaValida(tipo, ejercicio, periodo, poliza, cb) {
    try{
        if (!(ejercicio && periodo && poliza)){
            setImmediate(()=>new Error(`Some parameter is missing: ${tipo}, ${ejercicio}, ${periodo}, ${poliza}`))
        }
        _tipoPoliza = tipo
        _ejercicio = ejercicio
        _periodo = periodo
        _numeroPoliza = prefixPoliza(poliza)
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FIND_MATCH, (err, data) => {
            if(err){
                setImmediate(()=> cb(err))
            }
            console.log(`removed data: ${data}`)
            setImmediate(()=> data)
        })

    } catch(err) {
        console.log('error getting data!')
        console.log(`===>Error getting data from esPolizvalida:\n${err}`)
        setImmediate(()=> cb(err))
    }
}

module.exports={
    getAll,
    getById,
    getByPoliza,
    addPoliza,
    deletePoliza,
    esPolizaValida
}