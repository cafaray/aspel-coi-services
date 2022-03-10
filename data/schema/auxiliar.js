'use strict'
const {getDBInstance} = require('../connection')
const {AUXILIARES, LIMIT} = require('../../configs/config')
const cuentas = require('../schema/cuentas')
const SQL_FIND_ALL = `SELECT ${LIMIT} * FROM ${AUXILIARES}`


const {promisify} = require('util')

const CONTRAPAR = 0, CCOSTOS = 0, CGRUPOS = 0, IDINFADIPAR = -1, IDUUID = -1

const roundNumber = function (amount) {
    if (amount && typeof(amount) == 'number'){
        return Math.round((amount + Number.EPSILON) * 100) / 100
    }
    throw new Error(`Bad format for 'amount', expected number and send ${typeof(amount)} with value ${amount}`)
}

const formatoCuentaContable = (cuentaContable, cb) => {
    const grupos = cuentaContable.split('-')
    console.log(`grupos: ${grupos}`)
    let dv = 0
    if (grupos.length == 3) {
        const grupo3 = grupos[2];
        let segmento = parseInt(grupo3);
        if (segmento >= 1) {
            dv = 3
        } else if (segmento >= 0) {
            const grupo2 = grupos[1]
            segmento = parseInt(grupo2);
            if (segmento > 0) {
                dv = 2;
            } else {
                dv = 1;
            }
        }
        const result = `${grupos[0]}${grupos[1]}${grupos[2]}0000000000${dv}`
        console.log(`cuenta contable formatted: ${result}`)
        setImmediate(() => cb(null, result))
    } else {
        const errorMessage = `Unexpected Format for 'cuenta contable', must to use the format like this ****-****-**** and received ${cuentaContable}.`
        console.log(errorMessage)
        setImmediate(() => cb(errorMessage))
    }
}

const getCuentaContable = promisify(cuentas.getBy_NumeroCuenta)
//const formatCuentaContable = promisify(formatoCuentaContable)
const CAMPOS_TABLA_AUXILIAR = [
    "TIPO_POLI", 
    "NUM_POLIZ", 
    "NUM_PART", 
    "PERIODO", 
    "EJERCICIO", 
    "NUM_CTA", 
    "FECHA_POL",
    "CONCEP_PO", 
    "DEBE_HABER", 
    "MONTOMOV", 
    "NUMDEPTO", 
    "TIPCAMBIO", 
    "CONTRAPAR", 
    "ORDEN", 
    "CCOSTOS", 
    "CGRUPOS", 
    "IDINFADIPAR", 
    "IDUUID"]

async function getAll(cb) {
    try{
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FIND_ALL, (err, data) => {
            if (err){
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)            
            dbInstance.detach()
            setImmediate(() => cb(null, data))
        })
    }catch(err){
        console.log('error in query')
        console.log('===> Error getting data auxiliar.getAll:\n${err}')
        setImmediate(() => cb(err))
    }
}
async function addAuxiliar(auxiliar, cb) {
    try{
        const dbInstance = await getDBInstance()
        const cuentaContable = await obtieneCuentaContable(auxiliar['NUM_CTA'])
        const SQL_INSERT = `INSERT INTO ${AUXILIARES} VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) RETURNING NUM_POLIZ`
        dbInstance.query(SQL_INSERT, [
            auxiliar['TIPO_POLI'],
            auxiliar['NUM_POLIZ'],
            auxiliar['NUM_PART'],
            auxiliar['PERIODO'],
            auxiliar['EJERCICIO'],
            cuentaContable,
            auxiliar['FECHA_POL'],
            auxiliar['CONCEP_PO'],
            auxiliar['DEBE_HABER'],
            roundNumber(auxiliar['MONTOMOV']),
            auxiliar['NUMDEPTO'],
            auxiliar['TIPOCAMBIO'],
            CONTRAPAR,
            auxiliar['ORDEN'],
            CCOSTOS,
            CGRUPOS,
            IDINFADIPAR,
            IDUUID
            ],
            (err, data) => {
                if(err) {
                    setImmediate(() => cb(err))
                    return
                }
                setImmediate(() => cb(null, data))
                dbInstance.detach()
            })

    } catch(err) {
        console.log('error in insert query!')
        console.log(`===> Error inserting data auxiliar:\n${err}`)
        setImmediate(() => cb(err))
    }
}

async function obtieneCuentaContable(cuentaContable) {
    let cuenta = ''
    await getCuentaContable(cuentaContable)
    .then((data) => {
        console.log(`cuentaContable: ${data}`)
        if (data[0]["NUM_CTA"]){
            cuenta = JSON.parse(data)[0]["NUM_CTA"]
            console.log(`Cuenta contable '${cuenta}' found!`)
        } else {
            console.log(`The accouunt does not exists, verify number ${cuentaContable}.`)
            cuenta = ''
        }
    })
    .catch((err) => {
        console.log('error getting data')
        console.log(`===> Error getting data "obtieneCuentaContable":\n${err}`)
        throw err
    })      
    return cuenta
}

module.exports={
    getAll, addAuxiliar, obtieneCuentaContable, formatoCuentaContable
}