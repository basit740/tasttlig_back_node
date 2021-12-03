exports.up = function (knex) {
  let featuredArtists = [
    {
      avatar:
        "https://shuangtasttlig.s3.ca-central-1.amazonaws.com/featured_artists_avatars/tienna_ly.jpg",
      name: "Tienna Ly",
      biography:
        'Tienna Ly is a grower at Allan Gardens and Centennial Conservatory. She likes to write in her spare time and all her stories are inspired by the many friends and children she meets daily at the conservatory. We are selling her book "Why is the Sky Blue?" for only $2 cash at participating restaurants and retailers at the Taste of Pape Village festival. Learn more about her here:',
      website: "http://www.tandfriends.ca/",
      description: null,
      featured: true,
    },
    {
      avatar:
        "https://shuangtasttlig.s3.ca-central-1.amazonaws.com/featured_artists_avatars/block_party.jpg",
      name: "Block Party Tydia",
      biography:
        "We are a band performing at the the Taste of Pape Village festival",
      website: null,
      description: null,
      featured: false,
    },
  ];
  return knex("featured_artists").insert(featuredArtists);
};

exports.down = function (knex) {
  return knex.raw("delete from featured_artists;");
};
