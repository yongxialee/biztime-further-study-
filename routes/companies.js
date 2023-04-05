const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError")
const router = new express.Router();
const db = require("../db");


// Get list of companies
router.get('/',async (req,res,next)=>{
    try {
        const result = await db.query(
              `SELECT code, name 
               FROM companies 
               ORDER BY name`
        );
    
        return res.json({"companies": result.rows});
      }
    
      catch (err) {
        return next(err);
      }
    });
//get companies with single code
router.get('/:code', async (req,res,next) =>{
    try {
        let code = req.params.code;
    
        const compResult = await db.query(
              `SELECT companies.code, companies.name, companies.description, i.industry
               FROM companies LEFT JOIN industries_companies AS ic
               ON companies.code=ic.comp_code 
               LEFT JOIN industries AS i
               ON ic.in_code = i.in_code
               WHERE code = $1`,
            [code]

         );
        
        const invResult = await db.query(
              `SELECT id
               FROM invoices
               WHERE comp_code = $1`,
            [code]
        );
    
        if (compResult.rows.length === 0) {
          throw new ExpressError(`Can't find that: ${code}`, 404)
        }
        console.log(compResult)
        const company = compResult.rows[0];
        const invoices = invResult.rows;
        
        company.industries = compResult.rows.map(r=>r.industry)
      
        company.invoices = invoices.map(inv => inv.id);
    
        return res.json({"company": company});
      }
    
      catch (err) {
        return next(err);
      }
    });
    
//POST /companies
router.post("/", async (req, res, next) => {
    try {
        let {name, description} = req.body;
        let code = slugify(name, {lower: true});
    
        const result = await db.query(
              `INSERT INTO companies (code, name, description) 
               VALUES ($1, $2, $3) 
               RETURNING code, name, description`,
            [code, name, description]);
    
        return res.status(201).json({"company": result.rows[0]});
      }
    
      catch (err) {
        return next(err);
      }
    });
  
  
  /** PUT /[code]
   
   * */
  
  router.put("/:code", async (req, res, next)=>{
    try {
      let {name, description} = req.body;
      let code = req.params.code;
  
      const result = await db.query(
            `UPDATE companies
             SET name=$1, description=$2
             WHERE code = $3
             RETURNING code, name, description`,
          [name, description, code]);
  
      if (result.rows.length === 0) {
        throw new ExpressError(`No such company: ${code}`, 404)
      } else {
        return res.json({"company": result.rows[0]});
      }
    }
  
    catch (err) {
      return next(err);
    }
  
  });
  
  
  /** DELETE /[code] => delete company
  
   */
  
  router.delete("/:code", async function (req, res, next) {
    try {
      let code = req.params.code;
  
      const result = await db.query(
            `DELETE FROM companies
             WHERE code=$1
             RETURNING code`,
          [code]);
  
      if (result.rows.length == 0) {
        throw new ExpressError(`No such company: ${code}`, 404)
      } else {
        return res.json({"status": "deleted"});
      }
    }
  
    catch (err) {
      return next(err);
    }
  });
  
  



module.exports = router;