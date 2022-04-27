const {createNewProductClaim} = require("../food_sample_claim/food_sample_claim");
const {retrieveOrderItem} = require("./order_item_retriever");

class FestivalPostProcessor {
  async process(order, orderItem) {
  }
}

class ExperiencePostProcessor {
  async process(order, orderItem) {
    const quantityAfterClaim = 1;
    const product = await retrieveOrderItem(orderItem.item_type, orderItem.item_id);
    await createNewProductClaim(
      order.user,
      product,
      quantityAfterClaim,
      {
        user_claim_email: order.email,
        claim_user_id: order.user ? order.user.tasttlig_user_id : null,
        claimed_product_id: orderItem.item_id,
        current_stamp_status: "Claimed",
        claimed_quantity: orderItem.quantity,
        reserved_on: new Date(),
      })
  }
}

class ProductPostProcessor {
  async process(order, orderItem) {
  }
}

class ServicePostProcessor {
  async process(order, orderItem) {
  }
}

function getPostProcessor(itemType) {
  switch (itemType) {
    case 'festival' :
      return new FestivalPostProcessor()
    case 'experience' :
      return new ExperiencePostProcessor()
    case 'product' :
      return new ProductPostProcessor()
    case 'service' :
      return new ServicePostProcessor()
    default:
      throw new Error(`Could not find order post processor for itemType:${itemType}`);
  }
}

const postProcessOrder = async (order) => {
  const orderItems = order.order_items;
  for (const orderItem of orderItems) {
    await getPostProcessor(orderItem.item_type)
      .process(order, orderItem);
  }
}

module.exports = {
  postProcessOrder
}