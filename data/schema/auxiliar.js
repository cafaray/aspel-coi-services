'use strict'
const {getDBInstance} = require('../connection')
const {AUXILIARES, LIMIT} = require('../../configs/config')
const cuentas = require('../schema/cuentas')
const SQL_FIND_ALL = `SELECT ${LIMIT} * FROM ${AUXILIARES} ORDER BY FECHA_POL DESC`
const DELETE_AUXILIARES_POLIZA = `DELETE FROM ${AUXILIARES} WHERE TIPO_POLI = ? AND NUM_POLIZ = ? AND PERIODO = ? AND EJERCICIO = ?;`

const {promisify} = require('util')

const CONTRAPAR = 0, CCOSTOS = 0, CGRUPOS = 0, IDINFADIPAR = -1, IDUUID = -1

const roundNumber = function (amount) {
    if (amount && typeof(amount) == 'number'){
        return Math.round((amount + Number.EPSILON) * 100) / 100
    }
    throw new Error(`Bad format for 'amount', expected number and send ${typeof(amount)} with value ${amount}`)
}

async function formatoCuentaContable(cuentaContable) {
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
        return result
    } else {
        const errorMessage = `Unexpected Format for 'cuenta contable', must to use the format like this ****-****-**** and received ${cuentaContable}.`
        console.log(errorMessage)
        return ''
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

async function deleteAuxiliares(tipo, folio, ejercicio, periodo, cb) {
    try{
        const dbInstance = await getDBInstance()
        console.log('DELETING AUXILIARES:', tipo, folio, periodo, ejercicio)
        dbInstance.query(DELETE_AUXILIARES_POLIZA, [tipo, folio, periodo, ejercicio], (err, data) => {
            if(err){
                console.log('Error deleting auxiliares: ', err)
                setImmediate(() => cb(err))
            } else {
                console.log('It seems everything goes well:', data)
                setImmediate(() => cb(null, data))
            }            
            dbInstance.detach()
        })
    } catch(err) {
        console.log('Some exception ocurrs deleting auxiliares', err)
        setImmediate(() => cb(err))
    }
}

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
        let numeroPoliza = auxiliar['NUM_POLIZ']
        if (numeroPoliza.length < 5) {
            const padded = (numeroPoliza).toString().padStart(5, ' ')
            console.log(`padded value ${padded}`)
            numeroPoliza = padded
        }        

        const dbInstance = await getDBInstance()
        let cuentaContable = await obtieneCuentaContable(auxiliar['NUM_CTA'])
        console.log('found account: ', cuentaContable)
        if (cuentaContable==''){
            cuentaContable = await formatoCuentaContable(auxiliar['NUM_CTA'])
            console.log('formatted account: ', cuentaContable)
        }
        let depto = null
        if (auxiliar['NUMDEPTO']!=''){
            depto = auxiliar['NUMDEPTO']
        }
        const SQL_INSERT = `INSERT INTO ${AUXILIARES} VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) `
        //RETURNING NUM_POLIZ
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
            depto,
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
                    console.log(err)
                    console.log(SQL_INSERT)
                    setImmediate(() => cb(err))
                    return
                }
                setImmediate(() => cb(null, {'NUM_POLIZ':auxiliar['NUM_POLIZ']}))
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
    console.log('searching for: ', cuentaContable)
    await getCuentaContable(cuentaContable)
    .then((data) => {
        console.log(`cuentaContable: ${data}`)
        if (data[0]["NUM_CTA"]){
            cuenta = JSON.parse(data)[0]["NUM_CTA"]
            console.log(`Cuenta contable '${cuenta}' found!`)
        } else {
            console.log(`The accouunt does not exists, evaluating the number ${cuentaContable}.`)
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
    getAll, addAuxiliar, obtieneCuentaContable, formatoCuentaContable, deleteAuxiliares
}