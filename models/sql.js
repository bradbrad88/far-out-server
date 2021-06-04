const mapValues = data => {
  return `(${data.map(item => item)})`;
};

const mapObject = data => {
  return `(${data.map(item => {
    const key = Object.keys(item);
    return `${item[key]}`;
  })})`;
};

exports.getUserByLocalId = user_id => {
  return {
    text: `
    SELECT 
      user_id
    , given_name
    , family_name
    , email
    , image_url
    , admin
    FROM users
    WHERE user_id = $1`,
    values: [user_id],
  };
};

exports.upsertUserGoogle = user => {
  return {
    text: `
      INSERT INTO users
      (given_name, family_name, email, image_url, google_id, user_state)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (google_id)
        DO UPDATE SET google_id=users.google_id, given_name=EXCLUDED.given_name, family_name=EXCLUDED.family_name, email=EXCLUDED.email, image_url=EXCLUDED.image_url, user_state=EXCLUDED.user_state
      RETURNING user_id, admin`,
    values: [
      user.givenName,
      user.familyName,
      user.email,
      user.imageUrl,
      user.googleId,
      user.state,
    ],
  };
};

exports.gallery = {
  get: () => {
    return `SELECT a.image_id, a.display_order, b.url 
  FROM image_gallery a join image_urls b ON a.image_id = b.image_id 
  WHERE b.resolution = 'thumbnail'`;
  },

  delete: image_ids => {
    return {
      text: `DELETE FROM image_gallery
      WHERE image_id IN ${mapValues(image_ids)};
      ${this.gallery.get()}`,
    };
  },
};
