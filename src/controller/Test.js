const {createTestName} = require("../service/Test");

module.exports = {
    postTest: (req,res) => {
        const body = req.body;
        if(body.name === undefined) {
            return res.status(500).json({
                message: "enter name pls"
            })
        }
        createTestName(body, (err, results) => {
            if(err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "error"
                })
            }
            return res.status(200).json({
                success: 1,
                message: results
            })
        })
    }
}