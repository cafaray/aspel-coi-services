'use strict'
const {getDBInstance} = require('../connection')
const {DEPARTAMENTOS} = require('../../configs/config')

const SQL_FIND_ALL = `SELECT * FROM ${DEPARTAMENTOS}`

async function getAll(cb) {
    try {
        const dbInstance = await getDBInstance()
        dbInstance.query(SQL_FIND_ALL, (err, data) => {
            if (err) {
                setImmediate(() => cb(err))
            }
            data = JSON.stringify(data)
            dbInstance.detach()
            setImmediate(() => cb(null, data))            
        })
    } catch(err){
        console.log('error in query')
        console.log(`===> Error getting data:\n${err}`)
        setImmediate(() => cb(err))
    }
}
module.exports={
    getAll
}