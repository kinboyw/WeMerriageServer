var AV = require('leanengine');
require('dotenv').config()


AV.init({
    appId: process.env.LEANCLOUD_APP_ID || 'OjBtBU2N0wWd0oGqMg4IPwi8-gzGzoHsz',
    appKey: process.env.LEANCLOUD_APP_KEY || 'H0pgz2jBqLXb45E2gsRg3bwx',
    masterKey: process.env.LEANCLOUD_APP_MASTER_KEY || 'YbF2FrxLoH6VuQb5yY92kmcv'
});

class DataTable{
    constructor(options){
        this.tableName = options.resourceName
    }
    fetch(){
        let mod = new AV.Query(this.tableName)
        return mod.find() // promise
    }
    save(object){
        var Mod = AV.Object.extend(this.tableName)
        var mod = new Mod()
        return mod.save(object)
    }
}

module.exports = {
    DataTable
}