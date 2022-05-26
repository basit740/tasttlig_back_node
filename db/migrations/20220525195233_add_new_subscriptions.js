exports.up = async function (knex) {
  // clear old data
  await knex.raw("delete from payments;");
  await knex.raw("delete from user_subscriptions;");
  await knex.raw("delete from subscriptions;");

  await knex.schema.alterTable("subscriptions", (table) => {
    table.string("color");
    table.string("icon");
    table.specificType("features", "text ARRAY");
  });

  // add new data
  return knex("subscriptions").insert([{
    subscription_code: "MD",
    subscription_name: "Diamond",
    color: "#F4F4F4",
    icon: "Diamond(3D)",
    price: "8.99",
    status: "ACTIVE",
    description: "Guest Member Diamond",
    subscription_type: "package",
    validity_in_months: "12",
    trial_period: 30,
    discount_for_members: 5,
    features: [
      "5% discount on Festivals",
      "5% discount on Deals and Specials",
      "5% discount on Experiences"]
  }, {
    subscription_code: "MP",
    subscription_name: "Platinum",
    color: "#747474",
    icon: "Diamond(Square)",
    price: "19.99",
    status: "ACTIVE",
    description: "Guest Member Platinum",
    subscription_type: "package",
    validity_in_months: "12",
    trial_period: 0,
    discount_for_members: 10,
    features: [
      "10% discount on Festivals",
      "10% discount on Deals and Specials",
      "10% discount on Experiences"]
  }, {
    subscription_code: "MA",
    subscription_name: "Ambassador",
    color: "#000000",
    icon: "Crown",
    price: "49.99",
    status: "ACTIVE",
    description: "Guest Member Platinum",
    subscription_type: "package",
    validity_in_months: "12",
    trial_period: 0,
    discount_for_members: 25,
    features: [
      "25% discount on Festivals",
      "25% discount on Deals and Specials",
      "25% discount on Experiences"]
  }, {
    subscription_code: "BMD",
    subscription_name: "Business Diamond",
    color: "#F4F4F4",
    icon: "Diamond(3D)",
    price: "250",
    status: "ACTIVE",
    description: "Business Member Diamond",
    subscription_type: "package",
    validity_in_months: "12",
    trial_period: 30,
    features: [
      "75% revenue from sales of deals and specials",
      "Join a neighborhood directory",
      "Get featured in the neighborhood festival",
      "Be visible as a vendor to experience organizers",
      "Participate in the multicultural festival"]
  }, {
    subscription_code: "BMP",
    subscription_name: "Business Platinum",
    color: "#747474",
    icon: "Diamond(Sqaure)",
    price: "500",
    status: "ACTIVE",
    description: "Business Member Platinum",
    subscription_type: "package",
    validity_in_months: "12",
    trial_period: 0,
    features: [
      "80% revenue from sales of deals and specials",
      "Join a neighborhood directory",
      "Get featured in the neighborhood festival",
      "Be visible as a vendor to experience organizers",
      "Be visible as a vendor to festival organizers",
      "Be visible as a collaborator to artists",
      "Monetize your venue for event and festival organizers",
      "Monetize your commercial kitchen and equipment for home based business",
      "Monetize your patios and rooftops as event space for social gathering",
      "Participate in all businesses and multicultural festivals"]
  }, {
    subscription_code: "BMA",
    subscription_name: "Business Ambassador",
    color: "#000000",
    icon: "Crown",
    price: "1000",
    status: "ACTIVE",
    description: "Business Member Ambassador",
    subscription_type: "package",
    validity_in_months: "12",
    trial_period: 0,
    features: [
      "100% revenue, no commission on sales of deals and specials",
      "Join a neighborhood directory",
      "Get featured in the neighborhood festival",
      "Be visible as a vendor to experience organizers",
      "Be visible as a vendor to festival organizers",
      "Be visible as a collaborator to artists",
      "Monetize your venue for event and festival organizers",
      "Monetize your commercial kitchen and equipment for home based business",
      "Monetize your patios and rooftops as event space for social gathering",
      "Attract exclusive experiences and festivals to your business",
      "Participate in every festival"]
  }])
};

exports.down = function (knex) {
// irreversible migration
};
