'use strict'
const firebird = require('node-firebird')
const {getDBInstance} = require('../connection')
var { GDSCode } = require('node-firebird/lib/gdscodes');
const {POLIZAS, AUXILIARES, LIMIT} = require('../../configs/config')
const {getLast} = require('./periodos')
const {promisify} = require('util')

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

const SQL_FIND_ALL = `SELECT ${LIMIT} * FROM ${POLIZAS}`
const SQL_FINDBY_ID = `SELECT * FROM ${POLIZAS} WHERE TIPO_POLI = ${firebird.escape(_tipoPoliza)} AND NUM_POLIZ = ${firebird.escape(_numeroPoliza)} AND ejercicio = ${_ejercicio} AND periodo = ${_periodo}`
const SQL_FINDBY_POLIZA = `SELECT * FROM ${POLIZAS} WHERE NUM_POLIZ = ${firebird.escape(_numeroPoliza)}`
const SQL_REMOVE_POLIZA = `DELETE FROM ${POLIZAS} WHERE TIPO_POLI = ${firebird.escape(_tipoPoliza)} AND NUM_POLIZ = ${firebird.escape(_numeroPoliza)} AND ejercicio = ${_ejercicio} AND periodo = ${_periodo}`
const SQL_FIND_MATCH = `SELECT ${LIMIT} A.TIPO_POLI, A.NUM_POLIZ, A.PERIODO, A.EJERCICIO FROM ${POLIZAS} A INNER JOIN ${AUXILIARES} B ON A.TIPO_POLI = B.TIPO_POLI AND A.NUM_POLIZ = B.NUM_POLIZ AND A.PERIODO = B.PERIODO AND A.EJERCICIO = B.EJERCICIO WHERE A.TIPO_POLI= ${firebird.escape(_tipoPoliza)} AND A.NUM_POLIZ= ${firebird.escape(_numeroPoliza)} AND A.PERIODO= ${_periodo} AND A.EJERCICIO= ${_ejercicio};`

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

/*
{
    TIPO_POLI: 'Eg',
    NUM_POLIZ: '  145',
    PERIODO: 11,
    EJERCICIO: 2021,
    FECHA_POL: 2021-11-25T23:00:00.000Z,
    CONCEP_PO: 'TRA-NOM PAGO NÓMINA 13NOV - 26NOV21',
    NUM_PART: 2,
    LOGAUDITA: 'N',
    CONTABILIZ: 'S',
    NUMPARCUA: 0,
    TIENEDOCUMENTOS: 0,
    PROCCONTAB: 34313,
    ORIGEN: 'BANCO',
    UUID: '',
    ESPOLIZAPRIVADA: 0,
    UUIDOP: null
  }
  */
const TIPO_POLIZA = "Dr"
const LOG_AUDITA = "N"
const CONTABILIZ = "S"
const NUMPARCUA = 0
const ORIGEN = "PRORRATEO"
const ESPOLIZAPRIVADA = 0
const UUIDOP = null // siempre null en la base de datos

const formatoNumeroPoliza = (numeroPoliza) => {
    if (numeroPoliza.length < 5) {
        const padded = (numeroPoliza).toString().padStart(5, '0')
        console.log(`padded value ${padded}`)
        return padded
    }
    return numeroPoliza
} 

const prefixPoliza = promisify(formatoNumeroPoliza)

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
async function deletePoliza(tipo, ejercicio, periodo, poliza, cb) {
    try {
        if (!(tipo && ejercicio && periodo && poliza)){
            setImmediate(()=>new Error(`Some parameter is missing: ${tipo}, ${ejercicio}, ${periodo}, ${poliza}`))
        }
        _tipoPoliza = tipo
        _ejercicio = ejercicio
        _periodo = periodo
        _numeroPoliza = prefixPoliza(poliza)
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_REMOVE_POLIZA, (err, data) => {
            if(err){
                setImmediate(()=> cb(err))
            }
            console.log(`removed data: ${data}`)
            setImmediate(()=> data)
        })
    } catch(err) {
        console.log('error in remove!')
        console.log(`===> Error removing data from poliza:\n${err}`)
        setImmediate(()=> cb(err))
    }
}

async function addPoliza(poliza, cb) {
    try{
        const dbInstance = await getDBInstance()
        const SQL_INSERT = `INSERT INTO ${POLIZAS} VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) RETURNING NUM_POLIZ`        
        dbInstance.query(SQL_INSERT, [
            TIPO_POLIZA, // tipo poliza
            prefixPoliza(poliza[CAMPOS_TABLA_POLIZA[1]]), // numero
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
            UUIDOP], // es poliza privada
            (err, data) => {
            if(err){
                if(err.gdscode == GDSCode.UNIQUE_KEY_VIOLATION){
                    console.log('constraint name:'+ err.gdsparams[0]);
                    console.log('table name:'+ err.gdsparams[0]);                    
                }
                setImmediate(()=> cb(err.gdscode))
            }
            dbInstance.detach()
            setImmediate(()=> cb(null, data))
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