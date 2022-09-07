var options = {};

options.host = '192.168.100.40';
options.port = 3050;
// options.database = '/var/lib/firebird/2.5/data/COI80EMPRE1.FDB';
options.database = 'C:\\Program Files (x86)\\Common Files\\Aspel\\Sistemas Aspel\\COI9.00\\Datos\\Empresa1\\COI90EMPRE1.FDB'
options.user = 'SYSDBA';
options.password = 'masterkey';
options.lowercase_keys = false; // set to true to lowercase keys
options.role = null;            // default
options.pageSize = 4096;        // default when creating database
options.pageSize = 4096;        // default when creating database
options.retryConnectionInterval = 1000; // reconnect interval in case of connection drop

module.exports=options