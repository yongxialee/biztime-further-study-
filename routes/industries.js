const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError")
const router = new express.Router();
const db = require("../db");


// Get list of companies
//need help with this route
router.get('/',async (req,res,next)=>{
    try {
        const inResults = await db.query(
              `SELECT *
               FROM industries AS i RIGHT JOIN industries_companies AS ic 
               ON i.in_code = ic.in_code RIGHT JOIN companies AS c 
               ON ic.comp_code=c.code ;
               `
        );
    //     let {industry}=inResults.rows[0]
    //     let companies = inResults.rows.map(r=>r.company)

    
    //     return res.json({"industries": result.rows});

        const compResults = await db.query(
            `SELECT id
             FROM company`
             
      );
  
      
      const {industry} = inResults.rows[0];
      const companies = inResults.rows.map(r=>r.industry);
      
   
    
      
  
      return res.json({ industry,companies});



      }
    
      catch (err) {
        return next(err);
      }
});


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