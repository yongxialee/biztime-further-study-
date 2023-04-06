const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError")
const router = new express.Router();
const db = require("../db");


// Get list of industries
//need help with this route
router.get('/',async (req,res,next)=>{
    try {
        const results = await db.query(
            `SELECT * FROM industries ORDER BY in_code`
        );
    
        return res.json({"industries": results.rows});
    }

    catch (err) {
        return next(err);
    }
});
router.get('/:code', async (req, res, next) => {
    let code = req.params.code;
    try {
      const results = await db.query(`
        SELECT industries.in_code, industries.industry, industries_companies.comp_code
        FROM industries
        LEFT JOIN industries_companies 
        ON industries.in_code = industries_companies.in_code
        
        WHERE industries.in_code = $1`, [code])
      if (results.rows.length === 0) {
        throw new ExpressError(`Message not found with id ${code}`, 404)
      }
      const { industry } = results.rows[0];
      const companies_code = results.rows.map(r => r.comp_code);
      return res.json({ code, industry, companies_code })
    } catch (e) {
      return next(e)
    }
  })


router.post('/',async (req,res,next)=>{
    try {
        let {industry} = req.body;
        let in_code = slugify(industry, {lower: true});
    
        const result = await db.query(
              `INSERT INTO industries (in_code, industry) 
               VALUES ($1, $2) 
               RETURNING in_code, industry`,
            [in_code,industry]);
    
        return res.status(201).json({"industry": result.rows[0]});
    }catch(e){
        next(e)
    }
})






module.exports = router;