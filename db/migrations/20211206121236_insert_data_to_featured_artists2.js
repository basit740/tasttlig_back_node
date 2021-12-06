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
        "https://shuangtasttlig.s3.ca-central-1.amazonaws.com/featured_artists_avatars/robert.jpg",
      name: "Robert De'mares",
      biography:
        'Robert De\'mares a Local and International singer performs top 40 covers and his New Pop releases Playing different styles of music with fun\
        and classy flair He has been called "A Great Canadian Singer", "Behnam Jahanbeiglou", "The One Magazine", "Victory, Just Sing" and "Time to Come Home."\
        Robert De\'mares new hit single Released for Christmas ...in anticipation of Robert De\'mares new content singles being Released in the New Year New CD,\
        He previously worked with Behnam Jahabeiglou Iranian superstar of The Band Neemaha. Robert and Behnam Jahabeiglou started writing together in the\
        Band Captive Grooves Recording Music with A Canadian sound for Radio and TV, "One Day" is alive with lots of Vocal Guitar flavouring Reminiscent of\
        the Love Songs Upcoming Robert De\'mares singles from Fiercely Cool a Film and TV writing Duo "Time to come home for Christmas". "One Day", one of his past hits,\
        was recorded with Producer Frank Zirone "Zero One One Day" was played recently on CMJR 1320 AM. Robert De\'mares local to Stratford has been dreaming up songs\
        since Sting from the Police. Used his art in Grade 6 for Sting\'s first solo release Sting\'s Dream of Blue Turtles On Global Television,\
        There seemed to be a theme, the songs he writes are fun and freeing. A family sound with themes that inspire, are joyful fun and include the audience.\
        He has performed at venues such as Massey Hall, The Phoenix Concert Theater, Hard Rock Cafe Dundas Square, Mel Lastman Square, Young and Dundas Square,\
        Rivoli and countless live music venues across Ontario and New York City. He sings many styles of music, and is working on a Brand New project called\
        Good Fruit and more songs with Fiercely Cool Film and TV song Productions. There are several venues coming up this year all over Ontario that Robert will be\
        performing at Taste of Pape Village Winter Festival 2021 and many music festivals in Ontario too come. http://www.reverbnation.com/robertdemares,\
        www.youtube.com/user/Robertdemares/feed',
      website: "https://www.facebook.com/Robsnewmusicvibe/",
      description: null,
      featured: true,
    },
    {
      avatar:
        "https://shuangtasttlig.s3.ca-central-1.amazonaws.com/featured_artists_avatars/teria.jpg",
      name: "Teria Morada",
      biography:
        'Teria Morada of Azucar Picante ENT is an accomplished Entertainer! Professional Singer/Lyricist & Dancer/Choreographer. 3x Canadian Latin Music Award recipient,\
        former 2 time Jr. Canadian Rhythmic Gymnastics Champion & National Team Member and multiple time Latin Dance Champion.\
        She started her artistic endeavours and training at the age of 3! Her first solo album "Aries" came out on her birthday 4/6/2021.\
        It includes several collaborations with TJ Habibi, Sensei Musica, William Dinero, Joelle Sahar, BenAnthony LaVoz, Juan de Sedas,\
        SLuv, MM6eatz, El Cata and many more.',
      website: "https://teriamusic.com/teria-morada-bio",
      description: null,
      featured: false,
    },
  ];
  return knex("featured_artists").insert(featuredArtists);
};

exports.down = function (knex) {
  return knex.raw("delete from featured_artists;");
};
