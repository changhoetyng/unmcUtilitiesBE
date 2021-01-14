const pool = require("../config/database")

module.exports = {
    createTestName: (data, callBack) => {
        pool.query(
            `Insert into testing(name) values(?)`,
            [
                data.name
            ],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
}