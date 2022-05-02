const {Festivals, Experiences, Services, Products} = require("../../models");

class FestivalRetriever {
  async retrieveItem(id) {
    const festival = await Festivals.query().findById(id);
    if (!festival) return null;

    return {
      amount: festival.festival_price,
      details: festival.festival_name,
      item: festival
    }
  }
}

class ExperienceRetriever {
  async retrieveItem(id) {
    const experience = await Experiences.query().findById(id);
    if (!experience) return null;

    return {
      amount: experience.experience_price,
      details: experience.experience_name,
      item: experience
    }
  }
}

class ProductRetriever {
  async retrieveItem(id) {
    const product = await Products.query().findById(id);
    if (!product) return null;

    return {
      amount: product.price,
      details: product.title,
      item: product
    }
  }
}

class ServiceRetriever {
  async retrieveItem(id) {
    const service = await Services.query().findById(id);
    if (!service) return null;

    return {
      amount: service.service_price,
      details: service.service_name,
      item: service
    }
  }
}

function retriever(itemType) {
  switch (itemType) {
    case 'festival' :
      return new FestivalRetriever()
    case 'experience' :
      return new ExperienceRetriever()
    case 'product' :
      return new ProductRetriever()
    case 'service' :
      return new ServiceRetriever()
    default:
      throw {status: 404, message: `Could not find retriever for itemType:${itemType}`}
  }
}

const retrieveOrderItem = async (itemType, itemId) => {
  const item = await retriever(itemType).retrieveItem(itemId);
  return {...item, itemType, itemId};
}

module.exports = {
  retrieveOrderItem
}