const environment = process.env.NODE_ENV || "development";
const configuration = require("../../knexfile")[environment];
const db = require("knex")(configuration);
const bcrypt = require("bcrypt");
    require("dotenv").config();
 

/*

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'kodede_back_node_development',
  password: 'kevin1990',
  port: 5432
})

*/


const updateUser = (request, response) => {
// const id = parseInt(request.params.id)
const password=request.body.password_digest;
	const email=request.body.email;
const id=1;
 
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const password_digest = bcrypt.hashSync(password, salt);
	
db('users')
  .where('email', '=', email)
  .update({
    password_digest: password_digest
   // thisKeyIsSkipped: undefined
  }).then(() =>{
      response.status(200).send(`User password modified`)
	  console.log("User password resetted")
  })
    .catch((err) => {
		console.log(err); throw err
		})
    .finally(() => {
        db.destroy();
    });
 

/* pool.query(
    'UPDATE users SET  password_digest=$1 WHERE email=$2',
 [password_digest, email],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`User modified`)
    }
  )
  
  */
}





module.exports = {

  updateUser
  
 
}