"use strict";

// Libraries
const router = require("express").Router();
const token_service = require("../../services/authentication/token");
const festival_service = require("../../services/festival/festival");
const user_profile_service = require("../../services/profile/user_profile");
const authentication_service = require("../../services/authentication/authenticate_user");
const business_service = require("../../services/passport/businessPassport");
const { compareSync } = require("bcrypt");
const { compose } = require("objection");

router.get("/festival/landing-page", async (req, res) => {
  try {
    const current_page = req.query.page || 1;
    const keyword = req.query.keyword || "";

    const filters = {
      nationalities: req.query.nationalities,
      startDate: req.query.startDate,
      startTime: new Date(req.query.startTime).getTime(),
      cityLocation: req.query.cityLocation,
      radius: req.query.radius,
      latitude: req.query.latitude,
      longitude: req.query.longitude,
    };

    const response = await festival_service.getThreeFestivals(
      current_page,
      keyword,
      filters
    );

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET all festivals
router.get("/festival/all", async (req, res) => {
  try {
    const current_page = req.query.page || 1;
    const keyword = req.query.keyword || "";

    const filters = {
      nationalities: req.query.nationalities,
      startDate: req.query.startDate,
      startTime: new Date(req.query.startTime).getTime(),
      cityLocation: req.query.cityLocation,
      radius: req.query.radius,
      latitude: req.query.latitude,
      longitude: req.query.longitude,
      dayOfWeek: req.query.dayOfWeek,
    };

    const response = await festival_service.getAllFestivals(
      current_page,
      keyword,
      filters
    );
    // console.log("filter", filters);
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET all festivals (including expired ones)from a specific user
router.get("/festivals/:user_id", async (req, res) => {
  if (!req.params.user_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }
  try {
    const current_page = req.query.page || 1;
    const keyword = req.query.keyword || "";

    const filters = {
      nationalities: req.query.nationalities,
      startDate: req.query.startDate,
      startTime: new Date(req.query.startTime).getTime(),
      cityLocation: req.query.cityLocation,
      radius: req.query.radius,
      latitude: req.query.latitude,
      longitude: req.query.longitude,
      dayOfWeek: req.query.dayOfWeek,
      user_id: req.query.user_id,
    };

    const response = await festival_service.getAllFestivalList(
      current_page,
      keyword,
      filters
    );
    // console.log("filter", filters);
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET all festivals (including expired ones)from a specific user
router.get("/host-festivals/:user_id", async (req, res) => {
  if (!req.params.user_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }
  try {
    const filters = {
      user_id: req.query.user_id,
    };

    const response = await festival_service.getAllHostFestivalList(filters);
    console.log("response", response);
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

router.get("/festival/allFestival", async (req, res) => {
  try {
    const response = await festival_service.getAllFestivalsPresent();

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET festival list
router.get("/festival-list", async (req, res) => {
  try {
    const response = await festival_service.getFestivalList();

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET specific festival details
router.get("/festival/:festival_id", async (req, res) => {
  if (!req.params.festival_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await festival_service.getFestivalDetails(
      req.params.festival_id
    );

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET attendants in specific festival
router.get("/attendants/festival/:festival_id", async (req, res) => {
  if (!req.params.festival_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const attendants = [];

    const response = await festival_service.getFestivalDetails(
      req.params.festival_id
    );

    for (let item of response.details[0].festival_user_guest_id) {
      const list = await user_profile_service.getUserById(item);

      if (list.user) {
        attendants.push(list.user);
      }
    }

    return res.send(attendants);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET hosts in specific festival
router.get("/hosts/festival/:festival_id", async (req, res) => {
  if (!req.params.festival_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const hosts = [];

    const response = await festival_service.getFestivalDetails(
      req.params.festival_id
    );

    const uniqueHostArray = [...new Set(response.details[0].festival_host_id)];

    for (let item of uniqueHostArray) {
      const list = await user_profile_service.getUserById(item);

      if (list.user) {
        hosts.push(list.user);
      }
    }
    // console.log("hosts from host/festival:", hosts)

    return res.send(hosts);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET vendors in specific festival
router.get("/vendors/festival/:festival_id", async (req, res) => {
  if (!req.params.festival_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const vendors = [];

    const response = await festival_service.getFestivalDetails(
      req.params.festival_id
    );

    const uniqueHostArray = [
      ...new Set(response.details[0].festival_vendor_id),
    ];

    for (let item of uniqueHostArray) {
      const list = await user_profile_service.getUserById(item);

      if (list.user) {
        vendors.push(list.user);
      }
    }
    return res.send(vendors);
  } catch (error) {
    res.send({
      success: false,
      message: "Error",
      response: error.message,
    });
  }
});

// GET sponsors in specific festival
router.get("/sponsors/festival/:festival_id", async (req, res) => {
  if (!req.params.festival_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }
  // console.log("req from the host-sponsor/festivals:", req);

  try {
    const sponsors = [];

    const response = await festival_service.getFestivalDetails(
      req.params.festival_id
    );

    for (let item of response.details[0].festival_business_sponsor_id) {
      const list = await user_profile_service.getUserById(item);

      if (list.user) {
        sponsors.push(list.user);
      }
    }

    return res.send(sponsors);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET partner in specific festival
router.get("/partners/festival/:festival_id", async (req, res) => {
  if (!req.params.festival_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }
  // console.log("req from the host-sponsor/festivals:", req);

  try {
    const sponsors = [];

    const response = await festival_service.getFestivalDetails(
      req.params.festival_id
    );

    for (let item of response.details[0].festival_business_partner_id) {
      const list = await user_profile_service.getUserById(item);

      if (list.user) {
        sponsors.push(list.user);
      }
    }

    return res.send(sponsors);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET sponsors in specific festival
router.get("/hostsponsors/festival/:user_id", async (req, res) => {
  try {
    const sponsors = [];

    const filters = {
      user_id: req.query.user_id,
    };

    const response = await festival_service.getAllHostFestivalList(filters);

    for (let item of response.details) {
      if (
        item.festival_business_sponsor_id &&
        item.festival_business_sponsor_id !== null
      ) {
        for (let sponsor of item.festival_business_sponsor_id) {
          const list = await user_profile_service.getUserById(sponsor);

          if (list.user) {
            sponsors.push(list.user);
          }
        }
      }
    }

    return res.send(sponsors);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET business in specific festival
router.get("/business/festival/:festival_id", async (req, res) => {
  if (!req.params.festival_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const businesses = [];

    const response = await festival_service.getFestivalDetails(
      req.params.festival_id
    );
    for (let item of response.details[0].festival_business_id) {
      const list = await business_service.getBusinessById(item);
      if (list) {
        businesses.push(list.business[0]);
      }
    }
    return res.send(businesses);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});


// GET vendors in specific festival
router.get("/hostvendors/festival/:user_id", async (req, res) => {
  try {
    const vendors = [];

    const filters = {
      user_id: req.query.user_id,
    };

    const response = await festival_service.getAllHostFestivalList(filters);

    for (let item of response.details) {
      if (item.festival_vendor_id && item.festival_vendor_id !== null) {
        for (let vendor of item.festival_vendor_id) {
          const list = await user_profile_service.getUserById(vendor);

          if (list.user) {
            vendors.push(list.user);
          }
        }
      }
    }

    return res.send(vendors);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET restaurants in specific festival
router.get("/hostrestaurants/festival/:user_id", async (req, res) => {
  try {
    const restaurants = [];

    const filters = {
      user_id: req.query.user_id,
    };

    const response = await festival_service.getAllHostFestivalList(filters);

    for (let item of response.details) {
      if (item.festival_restaurant_id && item.festival_restaurant_id !== null) {
        for (let restaurant of item.festival_restaurant_id) {
          const list = await user_profile_service.getUserById(restaurant);

          if (list.user) {
            restaurants.push(list.user);
          }
        }
      }
    }

    return res.send(restaurants);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET guests in specific festival
router.get("/hostguests/festival/:user_id", async (req, res) => {
  try {
    const guests = [];

    const filters = {
      user_id: req.query.user_id,
    };

    const response = await festival_service.getAllHostFestivalList(filters);

    for (let item of response.details) {
      if (item.festival_user_guest_id && item.festival_user_guest_id !== null) {
        for (let guest of item.festival_user_guest_id) {
          const list = await user_profile_service.getUserById(guest);

          if (list.user) {
            guests.push(list.user);
          }
        }
      }
    }

    return res.send(guests);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// POST festival
router.post(
  "/festival/add",
  token_service.authenticateToken,
  async (req, res) => {
    const {
      images,
      festival_name,
      festival_type,
      festival_price,
      festival_city,
      festival_start_date,
      festival_end_date,
      festival_start_time,
      festival_end_time,
      festival_description,
      festival_vendor_price,
      festival_sponsor_price,
      festival_postal_code,
      festival_country,
      festival_province,
      festival_business_file,
    } = req.body;
    console.log(req.body);
    try {
      if (
        !images ||
        !festival_name ||
        !festival_type ||
        !festival_price ||
        !festival_city ||
        !festival_start_date ||
        !festival_end_date ||
        // !festival_start_time ||
        // !festival_end_time ||
        !festival_description
      ) {
        return res.status(403).json({
          success: false,
          message: "Required parameters are not available in request.",
        });
      }

      try {
        const user_details_from_db = await user_profile_service.getUserById(
          req.user.id
        );

        if (!user_details_from_db.success) {
          return res.status(403).json({
            success: false,
            message: user_details_from_db.message,
          });
        }

        const sponsored = req.body.sponsored ? req.body.sponsored : null;
        const festival_details = {
          festival_host_admin_id: [req.user.id],
          festival_vendor_id: [req.user.id],
          festival_name,
          festival_type,
          festival_price,
          festival_vendor_price,
          festival_sponsor_price,
          festival_city,
          festival_postal_code,
          festival_country,
          festival_province,
          festival_start_date: festival_start_date.substring(0, 10),
          festival_end_date: festival_end_date.substring(0, 10),
          festival_start_time,
          festival_end_time,
          festival_description,
          festival_created_at_datetime: new Date(),
          festival_updated_at_datetime: new Date(),
          sponsored,
        };

        // const response = await festival_service.createNewFestival(
        //   festival_details,
        //   images
        // );
        // console.log("response from festival/add:", response);
        // insert the business list into buiness table
        if (festival_participating_business) {
          const business_arr = festival_participating_business.split("|");
          for (let i = 5; i < business_arr.length - 2; i=i+5) {
            const business_response = await business_service.postBusinessThroughFile(
              business_arr[i+1],
              business_arr[i+2],
              business_arr[i+3],
              business_arr[i+4],
            );
            const r = await festival_service.addBusinessInFestival(response.details, business_response.details);
          }
          
        }


        return res.send(response);
      } catch (error) {
        res.send({
          success: false,
          message: "Error.",
          response: error,
        });
      }


    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

// PUT festival
router.put(
  "/festival/update/:festival_id",
  token_service.authenticateToken,
  
  async (req, res) => {
    const {
      images,
      festival_name,
      festival_type,
      festival_price,
      festival_city,
      festival_start_date,
      festival_end_date,
      festival_start_time,
      festival_end_time,
      festival_description,
      festival_vendor_price,
      festival_sponsor_price,
      festival_postal_code,
      festival_country,
      festival_province,
      festival_participating_business,
    } = req.body.festival_update_data;
    const festival_id = req.params.festival_id;
    try {
      if (
        !images ||
        !festival_name ||
        !festival_type ||
        !festival_price ||
        !festival_city ||
        !festival_start_date ||
        !festival_end_date ||
        !festival_start_time ||
        !festival_end_time ||
        !festival_description
      ) {
        return res.status(403).json({
          success: false,
          message: "Required parameters are not available in request.",
        });
      }

      try {
        const user_details_from_db = await user_profile_service.getUserById(
          req.user.id
        );
       
        if (!user_details_from_db.success) {
          return res.status(403).json({
            success: false,
            message: user_details_from_db.message,
          });
        }
        const festival_details = {
          festival_host_admin_id: [req.user.id],
          festival_vendor_id: [req.user.id],
          festival_name,
          festival_type,
          festival_price,
          festival_vendor_price,
          festival_sponsor_price,
          festival_city,
          festival_postal_code,
          festival_country,
          festival_province,
          festival_start_date: festival_start_date.substring(0, 10),
          festival_end_date: festival_end_date.substring(0, 10),
          festival_start_time,
          festival_end_time,
          festival_description,
          festival_created_at_datetime: new Date(),
          festival_updated_at_datetime: new Date(),
          //sponsored,
          festival_id,
        };
        const response = await festival_service.updateFestival(
          festival_details,
          images
        );
        try {
          
        }
        catch (error) {
          console.log(error);
        }

        
        if (festival_participating_business) {
          const business_arr = festival_participating_business.split("|");
          for (let i = 5; i < business_arr.length - 2; i=i+5) {

            const business_response = await business_service.postBusinessThroughFile(
              business_arr[i+1],
              business_arr[i+2],
              business_arr[i+3],
              business_arr[i+4],
            );
            const r = await festival_service.addBusinessInFestival(festival_id, business_response.details);
          }
          
        }

        return res.send(response);
      } catch (error) {
        res.send({
          success: false,
          message: "Error.",
          response: error,
        });
      }
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

// POST host to festival
router.post(
  "/host-festival",
  token_service.authenticateToken,
  async (req, res) => {
    console.log("festival_id from host-festival:", req.body);
    const { festival_id, festival_restaurant_host_id, foodSamplePreference } =
      req.body;

    try {
      const user_details_from_db = await user_profile_service.getUserById(
        req.user.id
      );

      if (!user_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: user_details_from_db.message,
        });
      }

      const db_user = user_details_from_db.user;
      const response = await festival_service.hostToFestival(
        festival_id,
        foodSamplePreference,
        db_user,
        "Host"
      );

      return res.send(response);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

// POST sponsor application on host dashboard
router.post(
  "/sponsor-application",
  token_service.authenticateToken,
  async (req, res) => {
    const { festival_id } = req.body;
    try {
      const user_details_from_db = await user_profile_service.getUserById(
        req.user.id
      );

      if (!user_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: user_details_from_db.message,
        });
      }
      const db_user = user_details_from_db.user;
      // const business_details = await authentication_service.getUserByBusinessDetails(
      //   req.user.id
      // );
      // if (!business_details.success) {
      //   return res.status(403).json({
      //     success: false,
      //     message: business_details.message,
      //   });
      // }

      const response = await festival_service.addSponsorApplication(
        festival_id,
        //business_details.business_details.business_details_id,
        db_user,
        "Sponsor"
      );
      return res.send(response);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

// POST sponsor application on host dashboard
router.post(
  "/sponsor-application/neighbourhood",
  token_service.authenticateToken,
  async (req, res) => {
    const { festival_id } = req.body;
    try {
      const response = await festival_service.addNeighbourhoodSponsor(
        festival_id,
        req.user.id
      );
      return res.send(response);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

// POST restaurant application on host dashboard
router.post(
  "/restaurant-application",
  token_service.authenticateToken,
  async (req, res) => {
    const { festival_id } = req.body;

    try {
      const user_details_from_db = await user_profile_service.getUserById(
        req.user.id
      );

      if (!user_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: user_details_from_db.message,
        });
      }
      const db_user = user_details_from_db.user;
      const business_details =
        await authentication_service.getUserByBusinessDetails(req.user.id);
      if (!business_details.success) {
        return res.status(403).json({
          success: false,
          message: business_details.message,
        });
      }
      const response = await festival_service.addRestaurantApplication(
        festival_id,
        db_user
      );

      return res.send(response);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

router.post(
  "/business/festival/add",
  token_service.authenticateToken,
  async (req, res) => {
    const festival_id = req.body.festival_id;
    const business_details_id = req.body.business_details_id;
    const user_id = req.body.user_id;
    try {
      const response = await festival_service.addBusinessToFestival(
        festival_id,
        user_id
      );
      return res.send(response);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);
router.post(
  "/vendor-festival",
  token_service.authenticateToken,
  async (req, res) => {
    const { festival_id } = req.body;
    try {
      const user_details_from_db = await user_profile_service.getUserById(
        req.user.id
      );

      if (!user_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: user_details_from_db.message,
        });
      }
      const db_user = user_details_from_db.user;
      const business_details =
        await authentication_service.getUserByBusinessDetails(req.user.id);
      if (!business_details.success) {
        return res.status(403).json({
          success: false,
          message: business_details.message,
        });
      }

      const response = await festival_service.hostToFestival(
        festival_id,
        business_details.business_details.business_details_id,
        db_user,
        "Vendor"
      );
      return res.send(response);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

// POST vendor application on host dashboard
router.post(
  "/vendor-application",
  token_service.authenticateToken,
  async (req, res) => {
    const { festival_id } = req.body;
    try {
      const user_details_from_db = await user_profile_service.getUserById(
        req.user.id
      );

      if (!user_details_from_db.success) {
        return res.status(403).json({
          success: false,
          message: user_details_from_db.message,
        });
      }
      const db_user = user_details_from_db.user;
      const business_details =
        await authentication_service.getUserByBusinessDetails(req.user.id);
      if (!business_details.success) {
        return res.status(403).json({
          success: false,
          message: business_details.message,
        });
      }

      const response = await festival_service.addVendorApplication(
        festival_id,
        business_details.business_details.business_details_id,
        db_user,
        "Vendor"
      );
      return res.send(response);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

// GET festival restaurants
router.get("/festival/restaurant/all", async (req, res) => {
  if (!req.query.host_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await festival_service.getFestivalRestaurants(
      req.query.host_id,
      req.query.festival_id
    );

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// remove festival attandence
router.post(
  "/festival/attendance/cancel",
  token_service.authenticateToken,
  async (req, res) => {
    const festival_id = req.body.festival_id;
    const user_id = req.user.id;
    try {
      const response = await festival_service.removeAttendance(
        festival_id,
        user_id
      );
      return res.send(response);
    } catch (error) {
      res.send({
        success: false,
        message: "Error.",
        response: error,
      });
    }
  }
);

router.post(
  "/festival/attendance/join",
  token_service.authenticateToken,
  async (req, res) => {
    const festival_id = req.body.festival_id;
    const user_id = req.user.id;
    try {
      let db_user;

      db_user = await user_profile_service.getUserById(user_id);

      if (!db_user.success) {
        res.send({
          success: false,
          message: "Entered User ID is invalid.",
        });
      }

      let db_festival = await festival_service.getFestivalDetails(festival_id);
      console.log("festival details", db_festival);
      console.log("festival price", db_festival.details[0].festival_price);
      if (!db_festival.success) {
        res.send({
          success: false,
          message: "Entered Festival ID is invalid.",
        });
      } else if (Number(db_festival.details[0].festival_price) > 0) {
        res.send({
          success: false,
          message: "Entered Festival is not free.",
        });
      }

      const response = await festival_service.attendFestival(
        db_user.user.tasttlig_user_id,
        festival_id
      );

      if (response.success) {
        return res.send({
          success: true,
        });
      } else {
        return res.send(response);
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  }
);

// GET festival wih passprot
router.get("/festival-passport/:passport_id", async (req, res) => {
  if (!req.params.passport_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await festival_service.getFestivalByPassport(
      req.params.passport_id
    );
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET festival wih passprots
router.post("/festival-passports", async (req, res) => {
  if (!req.body.passport_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await festival_service.getFestivalByPassports(
      req.body.passport_id
    );

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

router.post("/festival-passport/register", async (req, res) => {
  if (!req.body.user_id || !req.body.festival_ids) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }
  try {
    const response = await festival_service.registerUserToFestivals(
      req.body.user_id,
      req.body.festival_ids
    );

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// add business to a tasttlig-user
router.post("/claim-business", async (req, res) => {
  if (!req.body.user_id || !req.body.business_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }
  try {
    const response = await user_profile_service.claimBusiness(
      req.body.user_id,
      req.body.business_id
    );
    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});

// GET specific business details
router.get("/business/:business_id", async (req, res) => {
  if (!req.params.business_id) {
    return res.status(403).json({
      success: false,
      message: "Required parameters are not available in request.",
    });
  }

  try {
    const response = await business_service.getBusinessById(
      req.params.business_id
    );

    return res.send(response);
  } catch (error) {
    res.send({
      success: false,
      message: "Error.",
      response: error.message,
    });
  }
});



module.exports = router;
