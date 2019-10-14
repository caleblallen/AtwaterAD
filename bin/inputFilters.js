const validateRequestSchema = (requiredKeys) => {
    return (req, res, next) => {
        //Verify Schema. Check that the key totals are equal and check that all REQUIRED_KEYS are present.
        if (Object.keys(req.body).length !== requiredKeys.length ||
            requiredKeys.filter(key => Object.keys(req.body).includes(key)).length !== requiredKeys.length) {
            return res.status(400).send({
                error: "Improper Request Schema"
            });
        }
        next();
    };
};

module.exports.validateRequestSchema = validateRequestSchema;




