exports.up = function (knex) {
  return knex.schema
    .createTable("tasttlig_app", (table) => {
      table.increments("id").unsigned().primary();
      table.text("title");
      table.text("content");
      table.text("buttonLabel");
      table.text("buttonLink");
      table.text("photoLink");
      table.text("buttonLabelLoggedIn");
      table.enum("type", [
        "Corporate Social Responsibility",
        "Businesses",
        "Experience Tasttlig",
      ]);
    })
    .then((res) => {
      let apps = [
        {
          content: "Tasttlig Charity",
          title: "Food Festivals",
          buttonLink: "https://tasttlig.org",
          buttonLabel: "Learn More",
          type: "Corporate Social Responsibility",
          buttonLabelLoggedIn: "Join",
          photoLink:
            "https://images.unsplash.com/photo-1565524622405-171b921788ca?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=should-wang-ye5T5R0G-GA-unsplash.jpg&w=640",
        },
        {
          content: "Kodidi",
          title: "Food Marketplace",
          buttonLink: "www.kodidi.com",
          buttonLabel: "Learn More",
          type: "Businesses",
          buttonLabelLoggedIn: "Join",
          photoLink:
            "https://images.unsplash.com/photo-1520066391310-428f06ebd602?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=roosa-kulju-O594WRcWphI-unsplash.jpg&w=640",
        },
        {
          content: "Food Rounds",
          title: "Food Certifications",
          buttonLink: "https://foodrounds.com/",
          buttonLabel: "Learn More",
          type: "Businesses",
          buttonLabelLoggedIn: "Enroll",
          photoLink:
            "https://images.pexels.com/photos/7364189/pexels-photo-7364189.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
        },
        {
          content: "Earthly Hosts",
          title: "Hospitality Services",
          buttonLink: "",
          type: "Businesses",
          buttonLabel: "Learn More",
          buttonLabelLoggedIn: "Contact",
          photoLink:
            "https://images.unsplash.com/photo-1592417817038-d13fd7342605?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=luisa-brimble-aFzg83dvnAI-unsplash.jpg&w=640",
        },
        {
          content: "Tasttlig Rounds",
          title: "Business Services",
          buttonLink: "",
          type: "Businesses",
          buttonLabel: "Learn More",
          buttonLabelLoggedIn: "Contact",
          photoLink:
            "https://images.pexels.com/photos/2553651/pexels-photo-2553651.jpeg?h960&w=640",
        },
        {
          content: "Tasttlig Talent",
          title: "Human Resource Services",
          buttonLink: "",
          type: "Businesses",
          buttonLabel: "Learn More",
          buttonLabelLoggedIn: "Contact",
          photoLink:
            "https://images.pexels.com/photos/2977565/pexels-photo-2977565.jpeg?h=426&w=640",
        },
        {
          content: "Tasttlig Shipping",
          title: "Shipping and Delivery Services",
          buttonLink: "",
          type: "Businesses",
          buttonLabel: "Learn More",
          buttonLabelLoggedIn: "Contact",
          photoLink:
            "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?ixid=MnwxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNjI3NjU5MDU5&ixlib=rb-1.2.1&dpr=1&auto=format&fit=crop&w=500&h=1000&q=60",
        },
        {
          content: "Starbright Innovation",
          title: "Software Consultancy",
          buttonLink: "",
          type: "Businesses",
          buttonLabel: "Learn More",
          buttonLabelLoggedIn: "Contact",
          photoLink:
            "https://images.pexels.com/photos/5935791/pexels-photo-5935791.jpeg?cs=srgb&dl=pexels-sora-shimazaki-5935791.jpg&fm=jpg&w=640",
        },
        {
          content: "Soft Bone Limited",
          title: "Consumer Services",
          buttonLink: "",
          type: "Businesses",
          buttonLabel: "Learn More",
          buttonLabelLoggedIn: "Contact",
          photoLink:
            "https://images.pexels.com/photos/5409662/pexels-photo-5409662.jpeg?cs=srgb&dl=pexels-amina-filkins-5409662.jpg&fm=jpg&w=640",
        },
        {
          content: "Mensah Wealth Management",
          title: "Financial Services",
          type: "Businesses",
          buttonLink: "",
          buttonLabel: "Learn More",
          buttonLabelLoggedIn: "Contact",
          photoLink:
            "https://images.pexels.com/photos/53621/calculator-calculation-insurance-finance-53621.jpeg?cs=srgb&dl=pexels-pixabay-53621.jpg&fm=jpg",
        },
        {
          content: "Media Services",
          title: "Tasttlig Media",
          type: "Businesses",
          buttonLink: "",
          buttonLabel: "Learn More",
          buttonLabelLoggedIn: "Contact",
          photoLink:
            "https://images.pexels.com/photos/2095597/pexels-photo-2095597.jpeg?cs=srgb&dl=pexels-bruno-massao-2095597.jpg&fm=jpg",
        },
        {
          content: "Get Started",
          title: "Connect",
          type: "Experience Tasttlig",
          buttonLink: "/signup",
          buttonLabel: "Create Your Account",
          buttonLabelLoggedIn: "Join",
          photoLink:
            "https://images.pexels.com/photos/5865634/pexels-photo-5865634.jpeg?cs=srgb&dl=pexels-mehmet-turgut-kirkgoz-5865634.jpg&fm=jpg",
        },
      ];
      return knex("tasttlig_app").insert(apps);
    })
    .then((res) => {
      return knex.schema.createTable("business_app_access", (table) => {
        table.increments("id").unsigned().primary();
        table
          .bigInteger("business_details_id")
          .unsigned()
          .index()
          .references("business_details_id")
          .inTable("business_details");
        table
          .bigInteger("app_id")
          .unsigned()
          .references("id")
          .inTable("tasttlig_app");
      });
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable("business_app_access").then((res) => {
    return knex.schema.dropTable("tasttlig_app");
  });
};
