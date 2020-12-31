const apply_host_request = (req, res, next) => {
  let banking_info = {};

  let required_field = [
    "postal_code",
    "business_name",
    "business_type",
    "business_city",
    "culture",
    "state",
    "country",
    "address_line_1",

    "host_selection",

    "food_handler_certificate",
    "food_handler_certificate_date_of_issue",
    "food_handler_certificate_date_of_expired",

    "banking",
    "bank_number",
    "account_number",
    "institution_number",
    "void_cheque",
  ];

  required_field.forEach((field) => {
    if (!req.body[field]) {
      res.status(403).json({
        success: false,
        message: "Missing " + field,
      });
    }
  });
  next();
};

module.exports = { apply_host_request };
