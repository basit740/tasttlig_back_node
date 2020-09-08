const apply_host_request = (req, res, next) => {
  let banking_info = {}
  switch (req.body.banking) {
    case "Bank":
      banking_info = [
        'bank_number',
        'account_number',
        'institution_number',
        'void_cheque',
      ]
      break;
    case "Online":
      banking_info = [
        'online_email',
      ]
      break;
    case "PayPal":
      banking_info = [
        'paypal_email'
      ]
      break;
    case "Stripe":
      banking_info = [
        'stripe_account'
      ]
      break
  }

  let required_field = [
    'postal_code',
    'business_name',
    'business_type',
    'business_city',
    'culture',
    'state',
    'country',
    'address_line_1',

    'host_selection',
    'host_selection_video',

    'food_handler_certificate',
    'date_of_issue',
    'expiry_date',

    'banking',
  ]

  required_field = required_field.concat(banking_info)

  required_field.forEach(field => {
    if (! req.body[field]) {
      res.status(403).json({
        success: false,
        message: 'Missing ' + field
      });
    }
  })
  next()
}

module.exports = {apply_host_request: apply_host_request}