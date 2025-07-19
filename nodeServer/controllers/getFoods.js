
const getFoods = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: 'Food uploaded successfully.',
        });    
    } 
    catch (error) {
        return res.status(400).json({
            success: false,
            err: error.message
        })
    }
}
