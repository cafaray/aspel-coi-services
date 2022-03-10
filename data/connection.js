'use strict'
const firebird = require('node-firebird')
const options = require('../config')
const {promisify} = require('util')
const fbDatabase = promisify(firebird.attach)

async function getDBInstance(){
    try{ 
        //console.log(`options: ${options}`)
        const myDbInstance = await fbDatabase(options)                
        console.log(`Connection successful: ${myDbInstance}`)
        return myDbInstance
    } catch(err) {
        console.log('No Database Instance have been created!')
        console.log(`===> Error getting connection:\n${err}`)
        throw err
    }
}

module.exports={getDBInstance}