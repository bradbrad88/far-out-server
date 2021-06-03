exports.getUserGoogle = googleId => {
  return {
    text: `
      SELECT *
      FROM users
      WHERE google_id = $1`,
    values: [googleId],
  };
};

exports.newUserGoogle = user => {
  return {
    text: `
      INSERT INTO users
      (given_name, family_name, email, image_url, google_id, user_state)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (google_id)
        DO UPDATE SET google_id=users.google_id, given_name=EXCLUDED.given_name, family_name=EXCLUDED.family_name, email=EXCLUDED.email, image_url=EXCLUDED.image_url, user_state=EXCLUDED.user_state
      RETURNING user_id`,
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
