const mapValues = data => {
  return `(${data.map(item => item)})`;
};

const mapValueSets = data => {
  console.log("data:", data);
  return `${data.map(item => {
    return `(${item.map(el => {
      return `'${el}'`;
    })})`.toString();
  })}`;
};

const mapSetOfObjects = data => {
  return `${data.map(item => {
    return `(${Object.keys(item).map(key => {
      return `'${item[key]}'`;
    })})`;
  })}`;
  // console.log("test", test);
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
    return `
    SELECT 
      g.image_id,
      image_desc,
      extract(epoch from date_uploaded) as date_uploaded,
      likes,
      url,
      emphasize,
      display_order,
      complete
    FROM image_gallery g INNER JOIN image_urls u ON g.image_id = u.image_id
    INNER JOIN image_display d ON g.image_id = d.image_id
    WHERE u.resolution = 'thumbnail'`;
  },

  delete: image_ids => {
    return {
      text: `DELETE FROM image_gallery
      WHERE image_id IN ${mapValues(image_ids)};`,
    };
  },
  getInactive: () => {
    return `
    SELECT 
      g.image_id,
      image_desc,
      extract(epoch from date_uploaded) as date_uploaded,
      url,
      complete
    FROM image_gallery g LEFT JOIN image_urls u ON g.image_id = u.image_id
    LEFT JOIN image_display d ON g.image_id = d.image_id
    WHERE (u.resolution = 'thumbnail' OR u.resolution IS NULL) AND d.image_id IS NULL
    ORDER BY date_uploaded DESC`;
  },
  setDisplay: displayData => {
    const values = mapSetOfObjects(displayData);
    console.log("mapped values:", values);
    const test = `
    DELETE FROM image_display *;
    INSERT INTO image_display (image_id, emphasize, display_order)
    VALUES ${values}`;
    console.log("test", test);
    return test;
  },
  setComplete: image_id => {
    return {
      text: `
    UPDATE image_gallery
    SET complete = true
    WHERE image_id = $1`,
      values: [image_id],
    };
  },
  newImage: (desc, user) => {
    return {
      text: `INSERT INTO image_gallery (image_desc, uploaded_by) VALUES ($1, $2) RETURNING image_id`,
      values: [desc, user],
    };
  },
  addUrls: data => {
    const values = mapValueSets(data);
    return `
    INSERT INTO image_urls (image_id, url, aws_key, bucket, resolution) 
    VALUES ${values}`;
  },
  getAwsKeys: () => {
    return `
    SELECT aws_key
    FROM image_urls`;
  },
  deleteDisplay: () => {
    return `
    DELETE FROM image_display *`;
  },
  getColumnOptions: () => {
    return `
    SELECT
      gallery_columns
    FROM gallery_settings`;
  },
};

exports.blog = {
  newBlog: blog => {
    return {
      text: `
        INSERT INTO blogs (
          title,
          image,
          blog_desc,
          html)
        VALUES ($1, $2, $3, $4)`,
      values: [blog.title, blog.image, blog.description, blog.body],
    };
  },
};
