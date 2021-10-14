
exports.up = function(knex) {
  let deals = [
    {name: '5% off', discount: '0.05'},
    {name: '10% off', discount: '0.10'},
    {name: '15% off', discount: '0.15'},
    {name: '20% off', discount: '0.20'},
    {name: '25% off', discount: '0.25'},
    {name: '30% off', discount: '0.30'},
    {name: '35% off', discount: '0.35'},
    {name: '40% off', discount: '0.40'},
    {name: '45% off', discount: '0.45'},
    {name: '50% off', discount: '0.50'},
    {name: '55% off', discount: '0.55'},
    {name: '60% off', discount: '0.60'},
    {name: '65% off', discount: '0.65'},
    {name: '70% off', discount: '0.70'},
    {name: '75% off', discount: '0.75'},
    {name: '80% off', discount: '0.80'},
    {name: '85% off', discount: '0.85'},
    {name: '90% off', discount: '0.90'},
    {name: '95% off', discount: '0.95'},
    {name: '100% off', discount: '1.00'},
    {name: 'BOGO', discount: '1.00'},
    {name: 'none', discount: '0.00'},
  ]
  return knex('deals').insert(
    deals
  )
};

exports.down = function(knex) {
  return knex.raw('delete from deals;')
};
